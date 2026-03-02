import type { Metadata, Viewport } from 'next';
import { ToastContainer } from '@/components/ui/Toast';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'KPPOS - ระบบขายหน้าร้าน',
  description: 'ระบบ POS สำหรับร้านค้า',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KPPOS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4ade80',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: 'Kanit, Noto Sans Thai, system-ui, sans-serif' }}>
        <ServiceWorkerRegister />
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
