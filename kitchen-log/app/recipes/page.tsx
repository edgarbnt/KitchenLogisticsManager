"use client";
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UNITS } from '@/constants/units';
import { Plus, Trash2, ChefHat, ChevronRight, AlertCircle, Zap } from 'lucide-react';
import IngredientSelector from '@/components/IngredientSelector';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [newName, setNewName] = useState("");
    const [newInstructions, setNewInstructions] = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);

    useEffect(() => { refresh(); }, []);

    const refresh = async () => {
        try {
            const data = await api.getRecipes();
            setRecipes(Array.isArray(data) ? data : []);
        } catch (e) { setError("Erreur de chargement."); }
    };

    const openCreateModal = () => {
        setEditingRecipe(null);
        setNewName("");
        setNewInstructions("");
        setSelectedIngredients([{ name: "", quantity: 1, unit: "unit" }]);
        setIsModalOpen(true);
    };

    const openEditModal = (recipe: any) => {
        setEditingRecipe(recipe);
        setNewName(recipe.name);
        setNewInstructions(recipe.instructions || "");
        const ings = (recipe.ingredients || []).map((ri: any) => ({
            name: ri.ingredient?.name || "",
            quantity: ri.quantity_required,
            unit: ri.ingredient?.unit || "unit"
        }));
        setSelectedIngredients(ings.length > 0 ? ings : [{ name: "", quantity: 1, unit: "unit" }]);
        setIsModalOpen(true);
    };

    const handleAddToPlan = async (e: React.MouseEvent, recipeId: number) => {
        e.stopPropagation();
        try {
            await api.addToMealPlan(recipeId);
            alert("Recette ajoutée au planning");
        } catch (err) {
            alert("Erreur lors de l'ajout au planning.");
        }
    };

    const handleSubmit = async () => {
        if (!newName) return;
        setError(null);
        try {
            const payload = {
                name: newName,
                instructions: newInstructions,
                ingredients: selectedIngredients.filter(i => i.name !== "")
            };

            if (editingRecipe) {
                await api.updateRecipe(editingRecipe.id, payload);
            } else {
                await api.createRecipe(payload);
            }

            setIsModalOpen(false);
            setEditingRecipe(null);
            refresh();
        } catch (e) {
            setError("Erreur lors de l'enregistrement.");
        }
    };

    return (
        <div className="space-y-10">
            <PageHeader
                title="Recettes"
                description="Votre collection culinaire."
                action={
                    <Button onClick={openCreateModal}>
                        <Plus size={18} className="mr-2" /> Nouvelle Recette
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                    <Card
                        key={recipe.id}
                        onClick={() => openEditModal(recipe)}
                        className="group flex flex-col h-full hover:border-emerald-500 cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                            <ChefHat size={28} />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{recipe.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-3 flex-1">
                            {recipe.instructions || "Aucune instruction."}
                        </p>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                            <button
                                onClick={(e) => handleAddToPlan(e, recipe.id)}
                                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                            >
                                <Zap size={14} fill="currentColor" /> Planifier
                            </button>

                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRecipe ? "Modifier" : "Créer"}>
                <div className="space-y-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <Input label="Nom de la recette" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="ex: Lasagnes" />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructions</label>
                        <textarea className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium outline-none h-32 focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Décrivez les étapes..." value={newInstructions} onChange={(e) => setNewInstructions(e.target.value)} />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ingrédients requis</label>
                        <div className="space-y-3">
                            {selectedIngredients.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center animate-in slide-in-from-left duration-300 border-b border-slate-50 pb-3 sm:border-0 sm:pb-0">
                                    <div className="flex-1 w-full sm:w-auto">
                                        <IngredientSelector
                                            value={item.name}
                                            onChange={(name) => {
                                                const v = [...selectedIngredients];
                                                v[index].name = name;
                                                setSelectedIngredients(v);
                                            }}
                                        />
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <input
                                            type="number"
                                            className="w-20 bg-slate-50 border-none rounded-2xl p-3 font-bold outline-none"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const v = [...selectedIngredients];
                                                v[index].quantity = e.target.value;
                                                setSelectedIngredients(v);
                                            }}
                                        />
                                        <select
                                            className="flex-1 sm:w-28 bg-slate-50 border-none rounded-2xl p-3 font-bold outline-none appearance-none"
                                            value={item.unit}
                                            onChange={(e) => {
                                                const v = [...selectedIngredients];
                                                v[index].unit = e.target.value;
                                                setSelectedIngredients(v);
                                            }}
                                        >
                                            {UNITS.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
                                        </select>
                                        <button
                                            onClick={() => setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index))}
                                            className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" fullWidth onClick={() => setSelectedIngredients([...selectedIngredients, { name: "", quantity: 1, unit: "unit" }])}>
                                + Ajouter un ingrédient
                            </Button>
                        </div>
                    </div>

                    <Button onClick={handleSubmit} fullWidth variant="secondary" size="lg">SAUVEGARDER</Button>
                </div>
            </Modal>
        </div>
    );
}