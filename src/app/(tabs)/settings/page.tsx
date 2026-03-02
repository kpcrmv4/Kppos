'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useStore } from '@/hooks/useStore';
import { useInstallPWA } from '@/hooks/useInstallPWA';
import { showToast } from '@/components/ui/Toast';
import { Store, CreditCard, QrCode, Building2, Save, Download, CheckCircle, Share, PlusSquare, Smartphone } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

function SettingsForm({ store, updateStore }: {
  store: { id: string; name: string; bank_account: string; promptpay: string; logo_url: string | null };
  updateStore: (updates: Record<string, unknown>) => Promise<{ data: unknown; error: unknown } | undefined>;
}) {
  const [name, setName] = useState(store.name);
  const [bankAccount, setBankAccount] = useState(store.bank_account);
  const [promptpay, setPromptpay] = useState(store.promptpay);
  const [logoUrl, setLogoUrl] = useState<string | null>(store.logo_url);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateStore({
      name,
      bank_account: bankAccount,
      promptpay,
      logo_url: logoUrl,
    });
    setSaving(false);

    if (result?.error) {
      showToast('บันทึกไม่สำเร็จ', 'error');
    } else {
      showToast('บันทึกการตั้งค่าเรียบร้อย', 'success');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Logo Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-mint-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-mint-100 rounded-xl">
            <Store size={20} className="text-mint-600" />
          </div>
          <h3 className="font-semibold text-gray-800">โลโก้ร้าน</h3>
        </div>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <div className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-mint-200">
              <Image src={logoUrl} alt="Logo" fill className="object-cover" sizes="96px" />
            </div>
          ) : null}
          <ImageUpload
            currentUrl={logoUrl}
            onUpload={(url) => setLogoUrl(url)}
            onRemove={() => setLogoUrl(null)}
            folder="logos"
            size="md"
          />
        </div>
      </div>

      {/* Store Name */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-mint-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-mint-100 rounded-xl">
            <Building2 size={20} className="text-mint-600" />
          </div>
          <h3 className="font-semibold text-gray-800">ชื่อร้าน</h3>
        </div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="กรอกชื่อร้านของคุณ"
          className="w-full px-4 py-3 rounded-xl border border-mint-200 bg-mint-50/50 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Bank Account */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-mint-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-mint-100 rounded-xl">
            <CreditCard size={20} className="text-mint-600" />
          </div>
          <h3 className="font-semibold text-gray-800">เลขบัญชีธนาคาร</h3>
        </div>
        <input
          type="text"
          value={bankAccount}
          onChange={e => setBankAccount(e.target.value)}
          placeholder="กรอกเลขบัญชีธนาคาร"
          className="w-full px-4 py-3 rounded-xl border border-mint-200 bg-mint-50/50 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* PromptPay */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-mint-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-mint-100 rounded-xl">
            <QrCode size={20} className="text-mint-600" />
          </div>
          <h3 className="font-semibold text-gray-800">หมายเลขพร้อมเพย์</h3>
        </div>
        <input
          type="text"
          value={promptpay}
          onChange={e => setPromptpay(e.target.value)}
          placeholder="กรอกหมายเลขพร้อมเพย์"
          className="w-full px-4 py-3 rounded-xl border border-mint-200 bg-mint-50/50 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-mint-500 hover:bg-mint-600 text-white font-semibold rounded-2xl shadow-lg shadow-mint-500/30 transition-all disabled:opacity-50 active:scale-[0.98]"
      >
        {saving ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Save size={20} />
            <span>บันทึกการตั้งค่า</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { store, loading, updateStore } = useStore();
  const { isInstalled, platform, canInstall, install } = useInstallPWA();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  const handleInstallClick = () => {
    if (isInstalled) return;
    if (platform === 'ios') {
      setShowIosGuide(true);
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirmInstall = async () => {
    setShowConfirm(false);
    const success = await install();
    if (success) {
      showToast('ติดตั้งแอปเรียบร้อย', 'success');
    }
  };

  return (
    <>
      <Header
        title="ตั้งค่า"
        rightAction={
          <button
            onClick={handleInstallClick}
            disabled={isInstalled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors',
              isInstalled
                ? 'bg-gray-100 text-gray-400 cursor-default'
                : canInstall
                  ? 'bg-mint-500 text-white hover:bg-mint-600'
                  : 'bg-gray-100 text-gray-400 cursor-default'
            )}
          >
            {isInstalled ? (
              <>
                <CheckCircle size={15} />
                <span>ติดตั้งแล้ว</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>ติดตั้ง</span>
              </>
            )}
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="w-8 h-8 border-3 border-mint-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : store ? (
        <SettingsForm key={store.id} store={store} updateStore={updateStore} />
      ) : (
        <div className="flex items-center justify-center h-60 text-gray-400">
          ไม่สามารถโหลดข้อมูลร้านค้าได้
        </div>
      )}

      {/* Android/Desktop Install Confirm */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="ติดตั้งแอป"
        size="sm"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
            <Smartphone size={32} className="text-mint-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">ติดตั้ง KPPOS</h3>
          <p className="text-gray-500 text-sm mb-6">
            ต้องการติดตั้งแอป KPPOS ลงบน{platform === 'android' ? 'มือถือ' : 'เครื่อง'}ของคุณหรือไม่?
            แอปจะสามารถใช้งานได้จากหน้าจอหลัก
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmInstall}
              className="flex-1 px-4 py-2.5 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors"
            >
              ติดตั้ง
            </button>
          </div>
        </div>
      </Modal>

      {/* iOS Install Guide */}
      <Modal
        isOpen={showIosGuide}
        onClose={() => setShowIosGuide(false)}
        title="วิธีติดตั้งบน iPhone"
        size="sm"
      >
        <div className="p-6">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Smartphone size={32} className="text-blue-600" />
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-mint-500 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">กดปุ่ม Share</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Share size={16} className="text-blue-500" />
                  <p className="text-gray-500 text-xs">กดไอคอน Share ที่แถบเมนูด้านล่างของ Safari</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-mint-500 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">เลือก &quot;เพิ่มในหน้าจอโฮม&quot;</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <PlusSquare size={16} className="text-gray-500" />
                  <p className="text-gray-500 text-xs">เลื่อนลงแล้วกด &quot;Add to Home Screen&quot;</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-mint-500 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">กด &quot;เพิ่ม&quot;</p>
                <p className="text-gray-500 text-xs mt-1">กด Add ที่มุมขวาบน เพื่อเพิ่มไอคอนแอปไปที่หน้าจอหลัก</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIosGuide(false)}
            className="w-full px-4 py-2.5 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </Modal>
    </>
  );
}
