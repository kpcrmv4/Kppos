'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Store, ShoppingCart, Package, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/report', label: 'รายงาน', icon: BarChart3 },
  { href: '/history', label: 'งานที่ขาย', icon: Store },
  { href: '/pos', label: 'POS', icon: ShoppingCart, isCenter: true },
  { href: '/products', label: 'สินค้า', icon: Package },
  { href: '/settings', label: 'ตั้งค่า', icon: Settings },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-mint-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] safe-area-bottom">
      <div className="flex items-end justify-around max-w-lg mx-auto h-16 relative">
        {tabs.map(tab => {
          const isActive = pathname.startsWith(tab.href);

          if (tab.isCenter) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center -mt-5 relative z-10"
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all',
                    isActive
                      ? 'bg-mint-500 shadow-mint-500/40 scale-105'
                      : 'bg-mint-400 shadow-mint-400/30 hover:bg-mint-500'
                  )}
                >
                  <tab.icon size={26} strokeWidth={2.5} className="text-white" />
                </div>
                <span className={cn(
                  'text-[10px] font-semibold mt-0.5',
                  isActive ? 'text-mint-600' : 'text-gray-400'
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[56px]',
                isActive
                  ? 'text-mint-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-colors',
                isActive && 'bg-mint-100'
              )}>
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                'text-[10px] font-medium',
                isActive && 'font-semibold'
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
