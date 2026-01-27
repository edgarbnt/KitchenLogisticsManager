import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import './globals.css';
import React from 'react';
import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "KitchenLog",
  description: "Gérez votre cuisine",
  manifest: "/manifest.json", // Généré automatiquement par next
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KitchenLog",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Empêche le zoom sur mobile (sensation app native)
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