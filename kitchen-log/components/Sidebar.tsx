"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Box, ChefHat, ShoppingCart, Camera, Layers } from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
    { id: 'dash', icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { id: 'inventory', icon: Box, label: 'Inventaire', href: '/inventory' },
    { id: 'recipes', icon: ChefHat, label: 'Recettes', href: '/recipes' },
    { id: 'shopping', icon: ShoppingCart, label: 'Courses', href: '/shopping' },
    { id: 'scan', icon: Camera, label: 'Scanner Ticket', href: '/scan' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-80 bg-white border-r border-slate-100 p-8 flex flex-col gap-12 h-screen sticky top-0">
            <div className="flex items-center gap-4 px-2">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Layers size={28} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter">KitchenLog</h1>
            </div>

            <nav className="flex flex-col gap-3">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 font-bold text-lg",
                                isActive
                                    ? "bg-emerald-500 text-white shadow-xl shadow-emerald-200 translate-x-2"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            )}
                        >
                            <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serveur Actif</p>
                </div>
                <p className="text-xs text-emerald-600 font-mono font-bold">localhost:8000</p>
            </div>
        </aside>
    );
}