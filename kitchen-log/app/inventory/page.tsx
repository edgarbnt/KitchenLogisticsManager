"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UNITS } from '@/constants/units';
import { Plus, Trash2, AlertCircle, X } from 'lucide-react';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ÉTATS MANQUANTS AJOUTÉS ICI
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState<number | "">(1);
    const [unit, setUnit] = useState("unit");


    useEffect(() => { refresh(); }, []);

    const refresh = async () => {
        try {
            const pantryData = await api.getInventory();
            setItems(Array.isArray(pantryData) ? pantryData : []);
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        }
    };

    const handleManualAdd = async () => {
        if (!itemName) return;
        try {
            const qty = quantity === "" ? 0 : quantity;
            await api.addToPantry(itemName, qty, unit);
            setIsModalOpen(false);
            setItemName("");
            setQuantity(1);
            refresh();
        } catch (err) {
            setError("Erreur lors de l'ajout au stock.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Inventaire</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                    <Plus size={20} /> Ajouter manuellement
                </button>
            </div>

            {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[2.5rem] flex items-center gap-4 text-red-600">
                    <AlertCircle size={24} />
                    <p className="font-bold text-sm">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-[0.2em] font-black">
                        <tr>
                            <th className="px-12 py-8 text-left">Article</th>
                            <th className="px-12 py-8 text-left">Quantité</th>
                            <th className="px-12 py-8 text-left">Unité</th>
                            <th className="px-12 py-8 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-12 py-8 font-bold text-slate-800 text-lg capitalize">
                                    {item.ingredient?.name || "Sans nom"}
                                </td>
                                <td className="px-12 py-8 font-mono font-black text-emerald-600 text-xl">
                                    {item.quantity_available}
                                </td>
                                <td className="px-12 py-8 text-slate-400 font-bold uppercase text-xs tracking-widest">
                                    {item.ingredient?.unit || "unit"}
                                </td>
                                <td className="px-12 py-8 text-right">
                                    <button className="p-3 text-slate-200 hover:text-red-500 transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Ajouter au stock</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nom</label>
                                <input
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Ex: Tomate"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Quantité</label>
                                    <input
                                        type="number"
                                        className="..."
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setQuantity(val === "" ? "" : parseFloat(val));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Unité</label>
                                    <select
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none appearance-none"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                    >
                                        {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleManualAdd}
                                className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"
                            >
                                CONFIRMER L'AJOUT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}