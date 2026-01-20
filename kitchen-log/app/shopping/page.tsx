"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Check } from 'lucide-react';

export default function ShoppingPage() {
    const [list, setList] = useState<any[]>([]);

    useEffect(() => {
        api.getShoppingList().then(setList);
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-slate-900">Liste de Courses</h2>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8">
                {list.map((item) => (
                    <div key={item.id} className="flex items-center gap-6 p-5 border-b last:border-0 border-slate-50 hover:bg-slate-50/50 transition-colors rounded-2xl">
                        <div className="w-7 h-7 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors" />
                        <div className="flex-1">
                            <span className="font-bold text-slate-800 text-lg capitalize">{item.ingredient.name}</span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.source}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-black text-slate-900">{item.quantity_needed}</span>
                            <span className="text-xs font-bold text-slate-400 ml-1 uppercase">{item.ingredient.unit}</span>
                        </div>
                    </div>
                ))}
                {list.length === 0 && <p className="text-center py-10 text-slate-400">Votre liste est vide !</p>}
            </div>
        </div>
    );
}