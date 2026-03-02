'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useStore } from '@/hooks/useStore';
import { showToast } from '@/components/ui/Toast';
import { Store, CreditCard, QrCode, Building2, Save } from 'lucide-react';
import Image from 'next/image';

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

  return (
    <>
      <Header title="ตั้งค่า" />
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
    </>
  );
}
