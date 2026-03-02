'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
  Settings, Plus, Package, Edit3, Trash2, Eye, EyeOff,
  ShoppingBag, Banknote, CreditCard, QrCode, Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import type { SalesSession, Product } from '@/lib/types';

export default function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<SalesSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct } = useProducts(sessionId);
  const { orders, loading: ordersLoading } = useOrders(sessionId);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showProofModal, setShowProofModal] = useState<string | null>(null);

  // Product form state
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImage, setProdImage] = useState<string | null>(null);
  const [prodActive, setProdActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const { data } = await supabase
        .from('sales_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (data) setSession(data);
      setSessionLoading(false);
    }
    fetchSession();
  }, [sessionId, supabase]);

  const resetForm = () => {
    setProdName('');
    setProdPrice('');
    setProdStock('');
    setProdImage(null);
    setProdActive(true);
    setEditingProduct(null);
  };

  const openCreate = () => {
    resetForm();
    setShowProductModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(product.price.toString());
    setProdStock(product.stock.toString());
    setProdImage(product.image_url);
    setProdActive(product.is_active);
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!prodName.trim() || !prodPrice) return;
    setSaving(true);

    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, {
        name: prodName.trim(),
        price: parseFloat(prodPrice),
        stock: parseInt(prodStock) || 0,
        image_url: prodImage,
        is_active: prodActive,
      });
      if (result?.error) {
        showToast('แก้ไขสินค้าไม่สำเร็จ', 'error');
      } else {
        showToast('แก้ไขสินค้าเรียบร้อย', 'success');
        setShowProductModal(false);
        resetForm();
      }
    } else {
      const result = await createProduct({
        name: prodName.trim(),
        price: parseFloat(prodPrice),
        stock: parseInt(prodStock) || 0,
        image_url: prodImage || undefined,
      });
      if (result?.error) {
        showToast('เพิ่มสินค้าไม่สำเร็จ', 'error');
      } else {
        showToast('เพิ่มสินค้าเรียบร้อย', 'success');
        setShowProductModal(false);
        resetForm();
      }
    }
    setSaving(false);
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteProduct(deleteTarget);
    setDeleting(false);
    if (result?.error) {
      showToast('ลบสินค้าไม่สำเร็จ', 'error');
    } else {
      showToast('ลบสินค้าเรียบร้อย', 'success');
    }
    setDeleteTarget(null);
  };

  const handleToggleProduct = async (product: Product) => {
    const result = await updateProduct(product.id, { is_active: !product.is_active });
    if (result?.error) {
      showToast('เปลี่ยนสถานะไม่สำเร็จ', 'error');
    } else {
      showToast(product.is_active ? 'ปิดการขายสินค้าแล้ว' : 'เปิดการขายสินค้าแล้ว', 'success');
    }
  };

  const paymentLabel = (method: string) => {
    switch (method) {
      case 'cash': return { text: 'เงินสด', icon: Banknote, color: 'text-green-600 bg-green-50' };
      case 'transfer': return { text: 'โอนเงิน', icon: CreditCard, color: 'text-blue-600 bg-blue-50' };
      case 'qrcode': return { text: 'QR Code', icon: QrCode, color: 'text-purple-600 bg-purple-50' };
      default: return { text: method, icon: Banknote, color: 'text-gray-600 bg-gray-50' };
    }
  };

  if (sessionLoading) {
    return (
      <>
        <Header title="..." showBack />
        <div className="flex items-center justify-center h-60">
          <div className="w-8 h-8 border-3 border-mint-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={session?.name || 'รายละเอียด'}
        showBack
        rightAction={
          session?.is_active && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-mint-100 text-mint-700 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-mint-500 rounded-full animate-pulse" />
              กำลังใช้งาน
            </span>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* Product Settings Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-mint-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-mint-50">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-mint-600" />
              <h3 className="font-semibold text-gray-800">ตั้งค่าสินค้า</h3>
              <span className="px-2 py-0.5 bg-mint-100 text-mint-700 rounded-full text-xs font-medium">
                {products.length} รายการ
              </span>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-mint-500 text-white rounded-xl text-sm font-medium hover:bg-mint-600 transition-colors"
            >
              <Plus size={14} />
              <span>เพิ่มสินค้า</span>
            </button>
          </div>

          {productsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-mint-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package size={32} className="mx-auto mb-2 text-mint-300" />
              <p className="text-gray-400 text-sm">ยังไม่มีสินค้า</p>
            </div>
          ) : (
            <div className="divide-y divide-mint-50">
              {products.map(product => (
                <div key={product.id} className={cn('flex items-center gap-3 p-3', !product.is_active && 'opacity-50')}>
                  {product.image_url ? (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-mint-50 flex-shrink-0">
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="48px" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-mint-50 flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={18} className="text-mint-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatCurrency(product.price)}</span>
                      <span>•</span>
                      <span>คงเหลือ {product.stock}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleProduct(product)}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        product.is_active ? 'text-mint-600 hover:bg-mint-50' : 'text-gray-400 hover:bg-gray-50'
                      )}
                    >
                      {product.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => openEdit(product)}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales History Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-mint-100 overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-mint-50">
            <ShoppingBag size={18} className="text-mint-600" />
            <h3 className="font-semibold text-gray-800">รายการขาย</h3>
            <span className="px-2 py-0.5 bg-mint-100 text-mint-700 rounded-full text-xs font-medium">
              {orders.length} ออร์เดอร์
            </span>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-mint-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag size={32} className="mx-auto mb-2 text-mint-300" />
              <p className="text-gray-400 text-sm">ยังไม่มีรายการขาย</p>
            </div>
          ) : (
            <div className="divide-y divide-mint-50">
              {orders.map(order => {
                const pm = paymentLabel(order.payment_method);
                const PaymentIcon = pm.icon;
                return (
                  <div key={order.id} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', pm.color)}>
                          <PaymentIcon size={12} />
                          {pm.text}
                        </span>
                        {order.payment_proof_url && (
                          <button
                            onClick={() => setShowProofModal(order.payment_proof_url)}
                            className="p-1 rounded-lg text-blue-500 hover:bg-blue-50"
                          >
                            <ImageIcon size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-0.5">
                        <span className="text-gray-600 flex-1 truncate">{item.product_name}</span>
                        <span className="text-gray-400 mx-2">x{item.quantity}</span>
                        <span className="text-gray-700 font-medium">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-mint-50">
                      <span className="text-sm font-medium text-gray-500">ยอดรวม</span>
                      <span className="text-base font-bold text-mint-700">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Create/Edit Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => { setShowProductModal(false); resetForm(); }}
        title={editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
      >
        <div className="p-5 space-y-4">
          <div className="flex justify-center">
            <ImageUpload
              currentUrl={prodImage}
              onUpload={url => setProdImage(url)}
              onRemove={() => setProdImage(null)}
              folder="products"
              size="lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">ชื่อสินค้า</label>
            <input
              type="text"
              value={prodName}
              onChange={e => setProdName(e.target.value)}
              placeholder="ระบุชื่อสินค้า"
              className="w-full px-4 py-3 rounded-xl border border-mint-200 bg-mint-50/50 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">ราคา (บาท)</label>
              <input
                type="number"
                value={prodPrice}
                onChange={e => setProdPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-mint-200 bg-mint-50/50 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-gray-700 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">จำนวนสต๊อก</label>
              <input
                type="number"
                value={prodStock}
                onChange={e => setProdStock(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-mint-200 bg-mint-50/50 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>

          {editingProduct && (
            <div className="flex items-center justify-between p-3 bg-mint-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">เปิดการขาย</span>
              <button
                onClick={() => setProdActive(!prodActive)}
                className={cn(
                  'relative w-12 h-7 rounded-full transition-colors',
                  prodActive ? 'bg-mint-500' : 'bg-gray-300'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                  prodActive && 'translate-x-5'
                )} />
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowProductModal(false); resetForm(); }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={!prodName.trim() || !prodPrice || saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Product Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProduct}
        title="ลบสินค้า?"
        message="สินค้านี้จะถูกลบถาวร"
        confirmText="ลบ"
        variant="danger"
        loading={deleting}
      />

      {/* Payment Proof Image Modal */}
      <Modal
        isOpen={!!showProofModal}
        onClose={() => setShowProofModal(null)}
        title="หลักฐานการชำระเงิน"
      >
        {showProofModal && (
          <div className="p-4">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden">
              <Image src={showProofModal} alt="Payment proof" fill className="object-contain" sizes="400px" />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
