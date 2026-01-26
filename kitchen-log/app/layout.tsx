import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Kitchen Logistics Manager Pro',
  description: 'Gérez votre cuisine intelligemment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 text-slate-900 antialiased flex flex-col md:flex-row min-h-screen pb-20 md:pb-0">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}