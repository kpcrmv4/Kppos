'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { useStore } from '@/hooks/useStore';
import { useReport, type SessionReport } from '@/hooks/useReport';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
  BarChart3, TrendingUp, ShoppingBag, DollarSign,
  ChevronRight, Banknote, CreditCard, QrCode, Calendar
} from 'lucide-react';

const barColors = [
  'bg-gradient-to-r from-mint-400 to-mint-600',
  'bg-gradient-to-r from-blue-400 to-blue-600',
  'bg-gradient-to-r from-purple-400 to-purple-600',
  'bg-gradient-to-r from-amber-400 to-amber-600',
  'bg-gradient-to-r from-pink-400 to-pink-500',
  'bg-gradient-to-r from-cyan-400 to-cyan-600',
  'bg-gradient-to-r from-indigo-400 to-indigo-600',
  'bg-gradient-to-r from-orange-400 to-orange-500',
  'bg-gradient-to-r from-teal-400 to-teal-600',
  'bg-gradient-to-r from-rose-400 to-rose-500',
];

export default function ReportPage() {
  const { store } = useStore();
  const { report, loading } = useReport(store?.id);
  const [selectedSession, setSelectedSession] = useState<SessionReport | null>(null);

  if (loading) {
    return (
      <>
        <Header title="รายงาน" />
        <div className="flex items-center justify-center h-60">
          <div className="w-8 h-8 border-3 border-mint-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!report || report.sessions.length === 0) {
    return (
      <>
        <Header title="รายงาน" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-mint-100">
            <BarChart3 size={36} className="text-mint-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่มีข้อมูล</h2>
          <p className="text-gray-400 text-sm">เริ่มขายสินค้าเพื่อดูรายงานสรุป</p>
        </div>
      </>
    );
  }

  const maxQty = report.top_products.length > 0 ? report.top_products[0].quantity : 1;
  const latestSessions = report.sessions.slice(0, 5);

  return (
    <>
      <Header title="รายงาน" />

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-sm border border-mint-100 p-3 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-mint-100">
              <DollarSign size={20} className="text-mint-600" />
            </div>
            <p className="text-xs text-gray-400 mb-0.5">รายได้รวม</p>
            <p className="text-sm font-bold text-mint-600">{formatCurrency(report.total_revenue)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-400 mb-0.5">ออเดอร์</p>
            <p className="text-sm font-bold text-blue-600">{report.total_orders}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-3 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <p className="text-xs text-gray-400 mb-0.5">ขายได้</p>
            <p className="text-sm font-bold text-purple-600">{report.total_items_sold} ชิ้น</p>
          </div>
        </div>

        {/* Best Sellers Chart */}
        {report.top_products.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-mint-100 overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-mint-50">
              <BarChart3 size={18} className="text-mint-600" />
              <h3 className="font-semibold text-gray-800">สินค้าขายดี</h3>
            </div>
            <div className="p-4 space-y-3">
              {report.top_products.map((product, index) => {
                const pct = Math.max(8, (product.quantity / maxQty) * 100);
                return (
                  <div key={product.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium truncate flex-1 mr-2">
                        {index + 1}. {product.name}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {product.quantity} ชิ้น / {formatCurrency(product.revenue)}
                      </span>
                    </div>
                    <div className="w-full h-6 bg-gray-50 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2',
                          barColors[index % barColors.length]
                        )}
                        style={{ width: `${pct}%` }}
                      >
                        {pct > 20 && (
                          <span className="text-[10px] font-bold text-white">{product.quantity}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Latest Sessions */}
        <div className="bg-white rounded-2xl shadow-sm border border-mint-100 overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-mint-50">
            <Calendar size={18} className="text-mint-600" />
            <h3 className="font-semibold text-gray-800">งานขายล่าสุด</h3>
            <span className="px-2 py-0.5 bg-mint-100 text-mint-700 rounded-full text-xs font-medium">
              {latestSessions.length} งาน
            </span>
          </div>
          <div className="divide-y divide-mint-50">
            {latestSessions.map(session => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="w-full flex items-center p-4 hover:bg-mint-50/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 text-sm truncate">{session.name}</h4>
                    {session.is_active && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-mint-100 text-mint-700 rounded-full text-[10px] font-medium">
                        <span className="w-1 h-1 bg-mint-500 rounded-full animate-pulse" />
                        ใช้งาน
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatDate(session.created_at)}</span>
                    <span>{session.total_orders} ออเดอร์</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm font-bold text-mint-600">{formatCurrency(session.total_revenue)}</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title={selectedSession?.name || 'รายละเอียดงาน'}
        size="lg"
      >
        {selectedSession && (
          <div className="p-4 space-y-4">
            {/* Session Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-mint-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-0.5">รายได้</p>
                <p className="text-lg font-bold text-mint-600">{formatCurrency(selectedSession.total_revenue)}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-0.5">ออเดอร์</p>
                <p className="text-lg font-bold text-blue-600">{selectedSession.total_orders}</p>
              </div>
            </div>

            {/* Product Breakdown */}
            {selectedSession.products.length > 0 && (
              <div className="bg-white rounded-xl border border-mint-100 overflow-hidden">
                <div className="p-3 border-b border-mint-50">
                  <h4 className="font-semibold text-gray-700 text-sm">สินค้าที่ขายได้</h4>
                </div>
                <div className="divide-y divide-mint-50">
                  {selectedSession.products.map(product => (
                    <div key={product.name} className="flex items-center justify-between p-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 text-sm truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">x{product.quantity} ชิ้น</p>
                      </div>
                      <span className="text-sm font-semibold text-mint-600">{formatCurrency(product.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="bg-white rounded-xl border border-mint-100 overflow-hidden">
              <div className="p-3 border-b border-mint-50">
                <h4 className="font-semibold text-gray-700 text-sm">ช่องทางชำระเงิน</h4>
              </div>
              <div className="p-3 space-y-2">
                {selectedSession.payment_methods.cash > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-green-50">
                        <Banknote size={14} className="text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">เงินสด</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{formatCurrency(selectedSession.payment_methods.cash)}</span>
                  </div>
                )}
                {selectedSession.payment_methods.transfer > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-50">
                        <CreditCard size={14} className="text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-600">โอนเงิน</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{formatCurrency(selectedSession.payment_methods.transfer)}</span>
                  </div>
                )}
                {selectedSession.payment_methods.qrcode > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-50">
                        <QrCode size={14} className="text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-600">QR Code</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{formatCurrency(selectedSession.payment_methods.qrcode)}</span>
                  </div>
                )}
                {selectedSession.payment_methods.cash === 0 && selectedSession.payment_methods.transfer === 0 && selectedSession.payment_methods.qrcode === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">ยังไม่มีรายการชำระเงิน</p>
                )}
              </div>
            </div>

            {/* Orders List */}
            {selectedSession.orders.length > 0 && (
              <div className="bg-white rounded-xl border border-mint-100 overflow-hidden">
                <div className="p-3 border-b border-mint-50">
                  <h4 className="font-semibold text-gray-700 text-sm">รายการขาย</h4>
                </div>
                <div className="divide-y divide-mint-50 max-h-60 overflow-y-auto">
                  {selectedSession.orders.map(order => (
                    <div key={order.id} className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                        <span className="text-sm font-semibold text-mint-600">{formatCurrency(order.total)}</span>
                      </div>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-gray-500 truncate flex-1">{item.product_name}</span>
                          <span className="text-gray-400 mx-2">x{item.quantity}</span>
                          <span className="text-gray-600 font-medium">{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
