'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useStore } from '@/hooks/useStore';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { showToast } from '@/components/ui/Toast';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Plus, Package, Edit3, Trash2, Eye, EyeOff, Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import type { GlobalProduct } from '@/lib/types';

export default function ProductsPage() {
  const { store } = useStore();
  const { products, loading, createProduct, updateProduct, deleteProduct } = useGlobalProducts(store?.id);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GlobalProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setProdName('');
    setProdPrice('');
    setProdImage(null);
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (product: GlobalProduct) => {
    setEditing(product);
    setProdName(product.name);
    setProdPrice(product.price.toString());
    setProdImage(product.image_url);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!prodName.trim() || !prodPrice) return;
    setSaving(true);

    if (editing) {
      const result = await updateProduct(editing.id, {
        name: prodName.trim(),
        price: parseFloat(prodPrice),
        image_url: prodImage,
      });
      if (result?.error) {
        showToast('แก้ไขสินค้าไม่สำเร็จ', 'error');
      } else {
        showToast('แก้ไขสินค้าเรียบร้อย', 'success');
        setShowModal(false);
        resetForm();
      }
    } else {
      const result = await createProduct({
        name: prodName.trim(),
        price: parseFloat(prodPrice),
        image_url: prodImage || undefined,
      });
      if (result?.error) {
        showToast('เพิ่มสินค้าไม่สำเร็จ', 'error');
      } else {
        showToast('เพิ่มสินค้าเรียบร้อย', 'success');
        setShowModal(false);
        resetForm();
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
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

  const handleToggle = async (product: GlobalProduct) => {
    const result = await updateProduct(product.id, { is_active: !product.is_active });
    if (result?.error) {
      showToast('เปลี่ยนสถานะไม่สำเร็จ', 'error');
    } else {
      showToast(product.is_active ? 'ปิดสินค้าแล้ว' : 'เปิดสินค้าแล้ว', 'success');
    }
  };

  const activeProducts = products.filter(p => p.is_active);
  const inactiveProducts = products.filter(p => !p.is_active);

  return (
    <>
      <Header
        title="สินค้า"
        rightAction={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mint-500 text-white rounded-xl text-sm font-medium hover:bg-mint-600 transition-colors"
          >
            <Plus size={16} />
            <span>เพิ่มสินค้า</span>
          </button>
        }
      />

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-3 border-mint-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
              <Package size={28} className="text-mint-500" />
            </div>
            <p className="text-gray-500 font-medium mb-1">ยังไม่มีสินค้า</p>
            <p className="text-gray-400 text-sm">กดปุ่ม &quot;เพิ่มสินค้า&quot; เพื่อเริ่มสร้างรายการสินค้า</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Products */}
            {activeProducts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-mint-100 overflow-hidden">
                <div className="flex items-center gap-2 p-4 border-b border-mint-50">
                  <Eye size={16} className="text-mint-600" />
                  <h3 className="font-semibold text-gray-800 text-sm">เปิดขาย</h3>
                  <span className="px-2 py-0.5 bg-mint-100 text-mint-700 rounded-full text-xs font-medium">
                    {activeProducts.length}
                  </span>
                </div>
                <div className="divide-y divide-mint-50">
                  {activeProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-3">
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
                        <p className="text-mint-600 text-sm font-semibold">{formatCurrency(product.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggle(product)}
                          className="p-1.5 rounded-lg text-mint-600 hover:bg-mint-50 transition-colors"
                        >
                          <Eye size={16} />
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
              </div>
            )}

            {/* Inactive Products */}
            {inactiveProducts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 p-4 border-b border-gray-50">
                  <EyeOff size={16} className="text-gray-400" />
                  <h3 className="font-semibold text-gray-500 text-sm">ปิดขาย</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                    {inactiveProducts.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {inactiveProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-3 opacity-60">
                      {product.image_url ? (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="48px" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <ImageIcon size={18} className="text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-600 text-sm truncate">{product.name}</p>
                        <p className="text-gray-400 text-sm font-semibold">{formatCurrency(product.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggle(product)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          <EyeOff size={16} />
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
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

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowModal(false); resetForm(); }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={!prodName.trim() || !prodPrice || saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="ลบสินค้า?"
        message="สินค้านี้จะถูกลบถาวรจากรายการสินค้าหลัก"
        confirmText="ลบ"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
