export const dynamic = 'force-dynamic';

import { TabBar } from '@/components/layout/TabBar';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 max-w-lg mx-auto">{children}</main>
      <TabBar />
    </div>
  );
}
