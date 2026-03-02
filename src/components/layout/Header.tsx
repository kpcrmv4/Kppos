'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export function Header({ title, showBack = false, rightAction, className }: HeaderProps) {
  const router = useRouter();

  return (
    <header className={cn(
      'sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-mint-100',
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-mint-100 transition-colors"
            >
              <ArrowLeft size={22} className="text-gray-600" />
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-800 truncate">{title}</h1>
        </div>
        {rightAction && <div className="flex items-center">{rightAction}</div>}
      </div>
    </header>
  );
}
