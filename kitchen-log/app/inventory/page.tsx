"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UNITS } from '@/constants/units';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import IngredientSelector from '@/components/IngredientSelector';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form states
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

    const handleDelete = async (id: number) => {
        if (!confirm("Supprimer cet article du stock ?")) return;
        try {
            await api.deletePantryItem(id);
            refresh();
        } catch (err) {
            setError("Erreur lors de la suppression.");
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
            setUnit("unit");
            refresh();
        } catch (err) {
            setError("Erreur lors de l'ajout au stock.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Inventaire"
                description="Gérez ce que vous avez dans vos placards."
                action={
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} className="mr-2" /> Ajouter
                    </Button>
                }
            />

            {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[2.5rem] flex items-center gap-4 text-red-600">
                    <AlertCircle size={24} />
                    <p className="font-bold text-sm">{error}</p>
                </div>
            )}

            {/* Liste responsive (remplace le tableau) */}
            <div className="space-y-3">
                {items.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <p>Votre garde-manger est vide.</p>
                    </div>
                )}
                {items.map((item, idx) => (
                    <Card key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 sm:gap-0 hover:border-emerald-500">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 text-lg uppercase shrink-0">
                                {item.ingredient?.name?.substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 text-lg capitalize truncate">{item.ingredient?.name || "Sans nom"}</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{item.ingredient?.category || "Divers"}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 border-slate-50 pt-4 sm:pt-0">
                            <div className="text-right">
                                <span className="block font-black text-xl text-emerald-600">{item.quantity_available}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">{item.ingredient?.unit}</span>
                            </div>
                            <button
                                onClick={() => handleDelete(item.ingredient_id)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter au stock">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Rechercher l'article
                        </label>
                        <IngredientSelector
                            value={itemName}
                            onChange={(name) => setItemName(name)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Quantité"
                            type="number"
                            value={quantity}
                            onChange={(e) => {
                                const val = e.target.value;
                                setQuantity(val === "" ? "" : parseFloat(val));
                            }}
                        />
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unité</label>
                            <select
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none appearance-none"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            >
                                {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <Button onClick={handleManualAdd} fullWidth variant="secondary" size="lg">
                        Confirmer l'ajout
                    </Button>
                </div>
            </Modal>
        </div>
    );
}