'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Modal, AlertModal } from '@/components/ui/Modal';
import { CameraUpload } from '@/components/ui/ImageUpload';
import { useStore } from '@/hooks/useStore';
import { useSessions } from '@/hooks/useSession';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { showToast } from '@/components/ui/Toast';
import { formatCurrency, generatePromptPayQR, cn } from '@/lib/utils';
import {
  ShoppingCart, Plus, Minus, Trash2, Package,
  Banknote, CreditCard, QrCode, CheckCircle,
  AlertCircle, ShoppingBag, Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import type { Product, PaymentMethod } from '@/lib/types';

export default function PosPage() {
  const { store } = useStore();
  const { activeSession } = useSessions(store?.id);
  const { products, refetch: refetchProducts } = useProducts(activeSession?.id);
  const { items, addItem, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const { createOrder } = useOrders(activeSession?.id);

  const activeProducts = products.filter(p => p.is_active && p.stock > 0);

  // Modals
  const [quantityModal, setQuantityModal] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = (product: Product) => {
    setQuantityModal(product);
    setQuantity(1);
  };

  const confirmAddToCart = () => {
    if (!quantityModal) return;
    addItem(quantityModal, quantity);
    showToast(`เพิ่ม ${quantityModal.name} x${quantity} แล้ว`, 'success');
    setQuantityModal(null);
  };

  const confirmAndCheckout = () => {
    if (!quantityModal) return;
    addItem(quantityModal, quantity);
    setQuantityModal(null);
    setShowCheckout(true);
    setPaymentMethod(null);
    setPaymentProofUrl(null);
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
    setPaymentMethod(null);
    setPaymentProofUrl(null);
  };

  const handleConfirmPayment = async () => {
    if (!paymentMethod) return;
    setProcessing(true);

    const result = await createOrder(items, total, paymentMethod, paymentProofUrl || undefined);

    setProcessing(false);
    if (result?.error) {
      showToast('ชำระเงินไม่สำเร็จ', 'error');
    } else {
      clearCart();
      setShowCheckout(false);
      setShowSuccess(true);
      refetchProducts();
    }
  };

  // No active session
  if (!activeSession) {
    return (
      <>
        <Header title="POS ขายสินค้า" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-mint-100">
            <AlertCircle size={36} className="text-mint-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่ได้เปิดรายการขาย</h2>
          <p className="text-gray-400 text-sm">
            กรุณาไปที่แท็บ &quot;ประวัติ&quot; เพื่อสร้างและเปิดใช้งานรายการขาย
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="POS ขายสินค้า"
        rightAction={
          <div className="flex items-center gap-2">
            <span className="text-xs text-mint-600 font-medium bg-mint-50 px-2 py-1 rounded-lg truncate max-w-[120px]">
              {activeSession.name}
            </span>
          </div>
        }
      />

      <div className="p-4">
        {activeProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
              <Package size={28} className="text-mint-500" />
            </div>
            <p className="text-gray-500 font-medium mb-1">ไม่มีสินค้าพร้อมขาย</p>
            <p className="text-gray-400 text-sm">เพิ่มสินค้าในรายการขาย &quot;{activeSession.name}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {activeProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="bg-white rounded-2xl shadow-sm border border-mint-100 overflow-hidden hover:shadow-md hover:border-mint-200 transition-all active:scale-[0.97] text-left"
              >
                <div className="relative aspect-square bg-mint-50">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon size={40} className="text-mint-200" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-500">
                    เหลือ {product.stock}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                  <p className="text-mint-600 font-bold text-lg mt-0.5">{formatCurrency(product.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cart FAB Button */}
      {itemCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-20 right-4 z-30 flex items-center gap-2 px-5 py-3.5 bg-mint-500 text-white rounded-2xl shadow-lg shadow-mint-500/40 hover:bg-mint-600 transition-all active:scale-95"
        >
          <ShoppingCart size={20} />
          <span className="font-semibold">{formatCurrency(total)}</span>
          <span className="flex items-center justify-center h-6 w-6 bg-white text-mint-600 rounded-full text-xs font-bold">
            {itemCount}
          </span>
        </button>
      )}

      {/* Quantity Modal */}
      <Modal
        isOpen={!!quantityModal}
        onClose={() => setQuantityModal(null)}
        title="เพิ่มสินค้า"
        size="sm"
      >
        {quantityModal && (
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              {quantityModal.image_url ? (
                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-mint-50 flex-shrink-0">
                  <Image src={quantityModal.image_url} alt={quantityModal.name} fill className="object-cover" sizes="64px" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-xl bg-mint-50 flex items-center justify-center flex-shrink-0">
                  <ImageIcon size={24} className="text-mint-300" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-800">{quantityModal.name}</h3>
                <p className="text-mint-600 font-bold">{formatCurrency(quantityModal.price)}</p>
                <p className="text-xs text-gray-400">คงเหลือ {quantityModal.stock} ชิ้น</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-5">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="flex items-center justify-center h-12 w-12 rounded-xl bg-mint-100 text-mint-700 hover:bg-mint-200 transition-colors"
              >
                <Minus size={20} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={e => {
                  const v = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, v), quantityModal.stock));
                }}
                className="w-20 h-12 text-center text-2xl font-bold text-gray-800 border border-mint-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-400"
              />
              <button
                onClick={() => setQuantity(q => Math.min(q + 1, quantityModal.stock))}
                className="flex items-center justify-center h-12 w-12 rounded-xl bg-mint-100 text-mint-700 hover:bg-mint-200 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="text-center mb-5">
              <span className="text-sm text-gray-500">รวม: </span>
              <span className="text-xl font-bold text-mint-600">
                {formatCurrency(quantityModal.price * quantity)}
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={confirmAddToCart}
                className="w-full flex items-center justify-center gap-2 py-3 bg-mint-500 text-white font-semibold rounded-xl hover:bg-mint-600 transition-colors active:scale-[0.98]"
              >
                <ShoppingCart size={18} />
                <span>เพิ่มลงตะกร้า</span>
              </button>
              <button
                onClick={confirmAndCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors active:scale-[0.98]"
              >
                <Banknote size={18} />
                <span>ชำระเงินเลย</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cart Drawer */}
      <Modal isOpen={showCart} onClose={() => setShowCart(false)} title="ตะกร้าสินค้า" size="lg">
        <div className="p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag size={40} className="mx-auto mb-2 text-mint-200" />
              <p className="text-gray-400">ตะกร้าว่างเปล่า</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 bg-mint-50/50 rounded-xl p-3">
                    {item.product.image_url ? (
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
                        <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" sizes="48px" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                        <ImageIcon size={18} className="text-mint-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.product.name}</p>
                      <p className="text-mint-600 text-sm font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-mint-200 text-mint-600 hover:bg-mint-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => {
                          if (item.quantity < item.product.stock) {
                            updateQuantity(item.product.id, item.quantity + 1);
                          }
                        }}
                        className="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-mint-200 text-mint-600 hover:bg-mint-50 transition-colors disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="flex items-center justify-center h-8 w-8 rounded-lg text-red-400 hover:bg-red-50 transition-colors ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-mint-100 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 font-medium">ยอดรวมทั้งหมด</span>
                  <span className="text-2xl font-bold text-mint-600">{formatCurrency(total)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-mint-500 text-white font-semibold rounded-2xl shadow-lg shadow-mint-500/30 hover:bg-mint-600 transition-all active:scale-[0.98]"
                >
                  <Banknote size={20} />
                  <span>ชำระเงิน</span>
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Checkout Modal */}
      <Modal isOpen={showCheckout} onClose={() => setShowCheckout(false)} title="ชำระเงิน" size="md">
        <div className="p-5">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">ยอดที่ต้องชำระ</p>
            <p className="text-3xl font-bold text-mint-600">{formatCurrency(total)}</p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2 mb-5">
            <p className="text-sm font-medium text-gray-600 mb-2">เลือกช่องทางชำระเงิน</p>
            <button
              onClick={() => { setPaymentMethod('cash'); setPaymentProofUrl(null); }}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                paymentMethod === 'cash'
                  ? 'border-mint-400 bg-mint-50'
                  : 'border-gray-100 hover:border-mint-200'
              )}
            >
              <div className={cn(
                'p-2.5 rounded-xl',
                paymentMethod === 'cash' ? 'bg-mint-200' : 'bg-gray-100'
              )}>
                <Banknote size={22} className={paymentMethod === 'cash' ? 'text-mint-700' : 'text-gray-400'} />
              </div>
              <span className={cn('font-medium', paymentMethod === 'cash' ? 'text-mint-700' : 'text-gray-600')}>
                เงินสด
              </span>
              {paymentMethod === 'cash' && <CheckCircle size={20} className="ml-auto text-mint-500" />}
            </button>

            <button
              onClick={() => { setPaymentMethod('transfer'); setPaymentProofUrl(null); }}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                paymentMethod === 'transfer'
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-100 hover:border-blue-200'
              )}
            >
              <div className={cn(
                'p-2.5 rounded-xl',
                paymentMethod === 'transfer' ? 'bg-blue-200' : 'bg-gray-100'
              )}>
                <CreditCard size={22} className={paymentMethod === 'transfer' ? 'text-blue-700' : 'text-gray-400'} />
              </div>
              <span className={cn('font-medium', paymentMethod === 'transfer' ? 'text-blue-700' : 'text-gray-600')}>
                โอนเงิน
              </span>
              {paymentMethod === 'transfer' && <CheckCircle size={20} className="ml-auto text-blue-500" />}
            </button>

            <button
              onClick={() => { setPaymentMethod('qrcode'); setPaymentProofUrl(null); }}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                paymentMethod === 'qrcode'
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-100 hover:border-purple-200'
              )}
            >
              <div className={cn(
                'p-2.5 rounded-xl',
                paymentMethod === 'qrcode' ? 'bg-purple-200' : 'bg-gray-100'
              )}>
                <QrCode size={22} className={paymentMethod === 'qrcode' ? 'text-purple-700' : 'text-gray-400'} />
              </div>
              <span className={cn('font-medium', paymentMethod === 'qrcode' ? 'text-purple-700' : 'text-gray-600')}>
                QR Code พร้อมเพย์
              </span>
              {paymentMethod === 'qrcode' && <CheckCircle size={20} className="ml-auto text-purple-500" />}
            </button>
          </div>

          {/* Transfer Details */}
          {paymentMethod === 'transfer' && store?.bank_account && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-600 font-medium mb-1">เลขบัญชีธนาคาร</p>
              <p className="text-lg font-bold text-blue-800">{store.bank_account}</p>
            </div>
          )}

          {/* QR Code Display */}
          {paymentMethod === 'qrcode' && store?.promptpay && (
            <div className="mb-4 flex flex-col items-center">
              <div className="p-4 bg-white rounded-xl border border-purple-100 mb-2">
                <Image
                  src={generatePromptPayQR(store.promptpay, total)}
                  alt="PromptPay QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                  unoptimized
                />
              </div>
              <p className="text-sm text-purple-600 font-medium">พร้อมเพย์: {store.promptpay}</p>
            </div>
          )}

          {/* Camera for payment proof (transfer & qrcode) */}
          {(paymentMethod === 'transfer' || paymentMethod === 'qrcode') && (
            <div className="mb-5">
              {paymentProofUrl ? (
                <div className="relative">
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-mint-200">
                    <Image src={paymentProofUrl} alt="หลักฐาน" fill className="object-contain" sizes="400px" />
                  </div>
                  <button
                    onClick={() => setPaymentProofUrl(null)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-md"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <CameraUpload
                  onCapture={url => setPaymentProofUrl(url)}
                  label="ถ่ายรูปหลักฐานการโอน"
                />
              )}
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirmPayment}
            disabled={!paymentMethod || processing}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-mint-500 text-white font-semibold rounded-2xl shadow-lg shadow-mint-500/30 hover:bg-mint-600 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={20} />
                <span>ยืนยันชำระเงิน</span>
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* Success Alert */}
      <AlertModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="ชำระเงินสำเร็จ!"
        message="บันทึกรายการขายเรียบร้อยแล้ว"
        variant="success"
      />
    </>
  );
}
