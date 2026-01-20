import Sidebar from '@/components/Sidebar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-10 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}