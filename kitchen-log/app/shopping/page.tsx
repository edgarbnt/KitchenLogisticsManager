"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Check, Trash2, ShoppingBag, CheckCircle2, Camera, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ShoppingPage() {
    const [list, setList] = useState<any[]>([]);

    useEffect(() => { refresh(); }, []);

    const refresh = async () => {
        const data = await api.getShoppingList();
        const sorted = [...data].sort((a, b) => Number(a.is_checked) - Number(b.is_checked));
        setList(sorted);
    };

    const handleToggle = async (id: string) => {
        await api.toggleShoppingItem(id);
        refresh();
    };

    const handleCheckout = async () => {
        const checkedItems = list.filter(i => i.is_checked);
        if (checkedItems.length === 0) return;
        if (confirm(`Ajouter ces ${checkedItems.length} articles au stock ?`)) {
            await api.checkoutShoppingList();
            refresh();
        }
    };

    const handleClearAll = async () => {
        if (confirm("Vider TOUTE la liste ?")) {
            await api.clearShoppingList();
            refresh();
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <PageHeader
                title="Courses"
                description="Gérez vos achats."
                action={
                    <div className="flex gap-2">
                        <Link href="/scan">
                            <Button variant="secondary" size="sm">
                                <Camera size={18} className="mr-2" /> Scan
                            </Button>
                        </Link>
                        <Button variant="danger" size="sm" onClick={handleClearAll}>
                            <Trash2 size={18} />
                        </Button>
                    </div>
                }
            />

            {list.length > 0 && (
                <div className="sticky top-2 z-30 bg-slate-900 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between text-white shadow-2xl gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <p className="font-bold">Finir les courses</p>
                            <p className="text-slate-400 text-xs">{list.filter(i => i.is_checked).length} articles cochés</p>
                        </div>
                    </div>
                    <Button onClick={handleCheckout} variant="secondary" fullWidth className="sm:w-auto">
                        J'AI FINI <ArrowRight size={18} className="ml-2" />
                    </Button>
                </div>
            )}

            <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
                {list.length === 0 && (
                    <div className="py-24 text-center">
                        <ShoppingBag size={60} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 font-bold">Liste vide.</p>
                    </div>
                )}
                {list.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        className={clsx(
                            "flex items-center gap-4 md:gap-6 p-6 border-b last:border-0 border-slate-50 cursor-pointer transition-all active:bg-slate-100",
                            item.is_checked ? "bg-slate-50/50" : "hover:bg-slate-50"
                        )}
                    >
                        <div className={clsx(
                            "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                            item.is_checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 bg-white text-transparent"
                        )}>
                            <Check size={20} strokeWidth={4} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <span className={clsx(
                                "text-lg md:text-xl font-bold capitalize transition-all block truncate",
                                item.is_checked ? "text-slate-400 line-through" : "text-slate-800"
                            )}>
                                {item.ingredient.name}
                            </span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.source}</p>
                        </div>

                        <div className="text-right shrink-0">
                            <span className={clsx("text-xl md:text-2xl font-black block", item.is_checked ? "text-slate-300" : "text-slate-900")}>
                                {item.quantity_needed}
                            </span>
                            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">{item.ingredient.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}