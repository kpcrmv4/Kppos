'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/Modal';
import { useStore } from '@/hooks/useStore';
import { useSessions } from '@/hooks/useSession';
import { showToast } from '@/components/ui/Toast';
import { Plus, ChevronRight, Zap, ZapOff, Trash2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function HistoryPage() {
  const { store } = useStore();
  const { sessions, loading, createSession, toggleActive, deleteSession } = useSessions(store?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createSession(newName.trim());
    setCreating(false);
    if (result?.error) {
      showToast('สร้างรายการไม่สำเร็จ', 'error');
    } else {
      showToast('สร้างรายการขายเรียบร้อย', 'success');
      setNewName('');
      setShowCreate(false);
    }
  };

  const handleToggle = async (sessionId: string, currentActive: boolean) => {
    const result = await toggleActive(sessionId, !currentActive);
    if (result?.error) {
      showToast('เปลี่ยนสถานะไม่สำเร็จ', 'error');
    } else {
      showToast(
        !currentActive ? 'เปิดใช้งานรายการขายแล้ว' : 'ปิดใช้งานรายการขายแล้ว',
        'success'
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteSession(deleteTarget);
    setDeleting(false);
    if (result?.error) {
      showToast('ลบรายการไม่สำเร็จ', 'error');
    } else {
      showToast('ลบรายการขายเรียบร้อย', 'success');
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <Header
        title="ประวัติการขาย"
        rightAction={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mint-500 text-white rounded-xl text-sm font-medium hover:bg-mint-600 transition-colors"
          >
            <Plus size={16} />
            <span>สร้างใหม่</span>
          </button>
        }
      />

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-3 border-mint-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
              <Zap size={28} className="text-mint-500" />
            </div>
            <p className="text-gray-500 font-medium mb-1">ยังไม่มีรายการขาย</p>
            <p className="text-gray-400 text-sm">กดปุ่ม &quot;สร้างใหม่&quot; เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <div
                key={session.id}
                className={cn(
                  'bg-white rounded-2xl shadow-sm border overflow-hidden transition-all',
                  session.is_active ? 'border-mint-400 ring-1 ring-mint-200' : 'border-mint-100'
                )}
              >
                <Link href={`/history/${session.id}`} className="block">
                  <div className="flex items-center p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{session.name}</h3>
                        {session.is_active && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-mint-100 text-mint-700 rounded-full text-xs font-medium">
                            <span className="w-1.5 h-1.5 bg-mint-500 rounded-full animate-pulse" />
                            ใช้งาน
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        สร้างเมื่อ {formatDate(session.created_at)}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 ml-2" />
                  </div>
                </Link>

                <div className="flex border-t border-mint-50">
                  <button
                    onClick={() => handleToggle(session.id, session.is_active)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors',
                      session.is_active
                        ? 'text-amber-600 hover:bg-amber-50'
                        : 'text-mint-600 hover:bg-mint-50'
                    )}
                  >
                    {session.is_active ? <ZapOff size={15} /> : <Zap size={15} />}
                    <span>{session.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</span>
                  </button>
                  <div className="w-px bg-mint-100" />
                  <button
                    onClick={() => setDeleteTarget(session.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                    <span>ลบ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="สร้างรายการขายใหม่" size="sm">
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">ชื่อรายการขาย</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="เช่น ขายวันที่ 1 มี.ค."
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-mint-200 bg-mint-50/50 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-gray-700 placeholder:text-gray-400"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              className="flex-1 px-4 py-2.5 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors disabled:opacity-50"
            >
              {creating ? 'กำลังสร้าง...' : 'สร้าง'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="ลบรายการขาย?"
        message="รายการขายนี้และข้อมูลทั้งหมดจะถูกลบถาวร ไม่สามารถกู้คืนได้"
        confirmText="ลบ"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
