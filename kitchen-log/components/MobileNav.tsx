"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Box, ChefHat, Zap, ShoppingCart, Camera } from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
    { id: 'dash', icon: LayoutDashboard, href: '/' },
    { id: 'inventory', icon: Box, href: '/inventory' },
    { id: 'planning', icon: Zap, href: '/planning' },
    { id: 'recipes', icon: ChefHat, href: '/recipes' },
    { id: 'shopping', icon: ShoppingCart, href: '/shopping' },
    { id: 'scan', icon: Camera, href: '/scan' },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 md:hidden z-50 pb-safe">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                                isActive ? "text-emerald-500 bg-emerald-50" : "text-slate-300"
                            )}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 3 : 2} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}