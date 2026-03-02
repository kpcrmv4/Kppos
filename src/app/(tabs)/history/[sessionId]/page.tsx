'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useStore } from '@/hooks/useStore';
import { useProducts } from '@/hooks/useProducts';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Settings, Plus, Package, Trash2, Eye, EyeOff, Image as ImageIcon, Check
} from 'lucide-react';
import Image from 'next/image';
import type { SalesSession, Product, GlobalProduct } from '@/lib/types';

export default function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const { store } = useStore();
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<SalesSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct } = useProducts(sessionId);
  const { products: globalProducts, loading: globalLoading } = useGlobalProducts(store?.id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [stockInput, setStockInput] = useState<{ globalProduct: GlobalProduct; stock: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editStock, setEditStock] = useState<{ product: Product; stock: string } | null>(null);

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

  // Map global_product_id -> session product
  const sessionProductMap = new Map<string, Product>();
  products.forEach(p => {
    if (p.global_product_id) {
      sessionProductMap.set(p.global_product_id, p);
    }
  });

  const enabledGlobal = globalProducts.filter(gp => gp.is_active && sessionProductMap.has(gp.id));
  const disabledGlobal = globalProducts.filter(gp => gp.is_active && !sessionProductMap.has(gp.id));

  const handleAddGlobalProduct = async (gp: GlobalProduct, stock: number) => {
    const result = await createProduct({
      name: gp.name,
      price: gp.price,
      image_url: gp.image_url || undefined,
      stock,
      global_product_id: gp.id,
    });
    if (result?.error) {
      showToast('เพิ่มสินค้าไม่สำเร็จ', 'error');
    } else {
      showToast(`เพิ่ม ${gp.name} เรียบร้อย`, 'success');
    }
    setStockInput(null);
  };

  const handleRemoveProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteProduct(deleteTarget);
    setDeleting(false);
    if (result?.error) {
      showToast('ลบสินค้าไม่สำเร็จ', 'error');
    } else {
      showToast('นำสินค้าออกจากงานแล้ว', 'success');
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

  const handleUpdateStock = async () => {
    if (!editStock) return;
    const stock = parseInt(editStock.stock) || 0;
    const result = await updateProduct(editStock.product.id, { stock });
    if (result?.error) {
      showToast('แก้ไขสต๊อกไม่สำเร็จ', 'error');
    } else {
      showToast('แก้ไขสต๊อกเรียบร้อย', 'success');
    }
    setEditStock(null);
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
              <h3 className="font-semibold text-gray-800">สินค้าในงานนี้</h3>
              <span className="px-2 py-0.5 bg-mint-100 text-mint-700 rounded-full text-xs font-medium">
                {products.length} รายการ
              </span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
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
              <p className="text-gray-400 text-sm">ยังไม่มีสินค้าในงานนี้</p>
              <p className="text-gray-300 text-xs mt-1">กดปุ่ม &quot;เพิ่มสินค้า&quot; เพื่อเลือกจากรายการสินค้า</p>
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
                      <button
                        onClick={() => setEditStock({ product, stock: product.stock.toString() })}
                        className="text-mint-600 underline"
                      >
                        คงเหลือ {product.stock}
                      </button>
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
      </div>

      {/* Add Global Products Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="เลือกสินค้า"
        size="lg"
      >
        <div className="p-4">
          {globalLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-mint-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : globalProducts.filter(gp => gp.is_active).length === 0 ? (
            <div className="text-center py-8">
              <Package size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-400 text-sm">ยังไม่มีสินค้าในระบบ</p>
              <p className="text-gray-300 text-xs mt-1">ไปเพิ่มสินค้าที่หน้า &quot;สินค้า&quot; ก่อน</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Already enabled */}
              {enabledGlobal.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={14} className="text-mint-600" />
                    <h4 className="text-sm font-semibold text-gray-600">เปิดขายแล้ว ({enabledGlobal.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {enabledGlobal.map(gp => {
                      const sessionProduct = sessionProductMap.get(gp.id);
                      return (
                        <div key={gp.id} className="flex items-center gap-3 p-3 bg-mint-50/50 rounded-xl border border-mint-100">
                          {gp.image_url ? (
                            <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-white flex-shrink-0">
                              <Image src={gp.image_url} alt={gp.name} fill className="object-cover" sizes="40px" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                              <ImageIcon size={16} className="text-mint-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{gp.name}</p>
                            <p className="text-xs text-gray-400">{formatCurrency(gp.price)} • สต๊อก {sessionProduct?.stock || 0}</p>
                          </div>
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-mint-500 text-white">
                            <Check size={16} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Not yet enabled */}
              {disabledGlobal.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <EyeOff size={14} className="text-gray-400" />
                    <h4 className="text-sm font-semibold text-gray-500">ยังไม่เปิดขาย ({disabledGlobal.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {disabledGlobal.map(gp => (
                      <div key={gp.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                        {gp.image_url ? (
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                            <Image src={gp.image_url} alt={gp.name} fill className="object-cover" sizes="40px" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                            <ImageIcon size={16} className="text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-700 text-sm truncate">{gp.name}</p>
                          <p className="text-xs text-gray-400">{formatCurrency(gp.price)}</p>
                        </div>
                        <button
                          onClick={() => setStockInput({ globalProduct: gp, stock: '10' })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-mint-500 text-white rounded-lg text-xs font-medium hover:bg-mint-600 transition-colors"
                        >
                          <Plus size={12} />
                          เพิ่ม
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Stock Input Modal (for adding global product to session) */}
      <Modal
        isOpen={!!stockInput}
        onClose={() => setStockInput(null)}
        title="กำหนดจำนวนสต๊อก"
        size="sm"
      >
        {stockInput && (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              {stockInput.globalProduct.image_url ? (
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-mint-50 flex-shrink-0">
                  <Image src={stockInput.globalProduct.image_url} alt={stockInput.globalProduct.name} fill className="object-cover" sizes="48px" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-lg bg-mint-50 flex items-center justify-center flex-shrink-0">
                  <ImageIcon size={18} className="text-mint-300" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{stockInput.globalProduct.name}</p>
                <p className="text-sm text-mint-600 font-medium">{formatCurrency(stockInput.globalProduct.price)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">จำนวนสต๊อก</label>
              <input
                type="number"
                value={stockInput.stock}
                onChange={e => setStockInput({ ...stockInput, stock: e.target.value })}
                placeholder="0"
                min="0"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-mint-200 bg-mint-50/50 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-gray-700 placeholder:text-gray-400 text-center text-xl font-bold"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStockInput(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleAddGlobalProduct(stockInput.globalProduct, parseInt(stockInput.stock) || 0)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors"
              >
                เพิ่มสินค้า
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Stock Modal */}
      <Modal
        isOpen={!!editStock}
        onClose={() => setEditStock(null)}
        title="แก้ไขจำนวนสต๊อก"
        size="sm"
      >
        {editStock && (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              {editStock.product.image_url ? (
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-mint-50 flex-shrink-0">
                  <Image src={editStock.product.image_url} alt={editStock.product.name} fill className="object-cover" sizes="48px" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-lg bg-mint-50 flex items-center justify-center flex-shrink-0">
                  <ImageIcon size={18} className="text-mint-300" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{editStock.product.name}</p>
                <p className="text-sm text-mint-600 font-medium">{formatCurrency(editStock.product.price)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">จำนวนสต๊อก</label>
              <input
                type="number"
                value={editStock.stock}
                onChange={e => setEditStock({ ...editStock, stock: e.target.value })}
                placeholder="0"
                min="0"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-mint-200 bg-mint-50/50 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-gray-700 placeholder:text-gray-400 text-center text-xl font-bold"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditStock(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpdateStock}
                className="flex-1 px-4 py-2.5 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors"
              >
                บันทึก
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Product Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleRemoveProduct}
        title="นำสินค้าออก?"
        message="สินค้านี้จะถูกนำออกจากงานนี้"
        confirmText="นำออก"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
