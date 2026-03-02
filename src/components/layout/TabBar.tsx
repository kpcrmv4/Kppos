'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/history', label: 'ประวัติ', icon: History },
  { href: '/settings', label: 'ตั้งค่า', icon: Settings },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-mint-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map(tab => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all min-w-[72px]',
                isActive
                  ? 'text-mint-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-colors',
                isActive && 'bg-mint-100'
              )}>
                <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                'text-[11px] font-medium',
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
