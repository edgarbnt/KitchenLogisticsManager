"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UNITS } from '@/constants/units';
import { Plus, Trash2, ChefHat, X, ChevronRight, AlertCircle, Save } from 'lucide-react';

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
        setSelectedIngredients([]);
        setIsModalOpen(true);
    };

    const openEditModal = (recipe: any) => {
        setEditingRecipe(recipe);
        setNewName(recipe.name);
        setNewInstructions(recipe.instructions || "");
        // Sécurité ici : on vérifie si ingredients existe avant de map
        const ings = (recipe.ingredients || []).map((ri: any) => ({
            name: ri.ingredient?.name || "Inconnu",
            quantity: ri.quantity_required,
            unit: ri.ingredient?.unit || "unit"
        }));
        setSelectedIngredients(ings);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!newName) return;
        setError(null);
        try {
            const payload = {
                name: newName,
                instructions: newInstructions,
                ingredients: selectedIngredients
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
            setError("Erreur lors de l'enregistrement. Le nom est peut-être déjà utilisé.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Recettes</h2>
                <button onClick={openCreateModal} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl">
                    <Plus size={20} /> Nouvelle recette
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        onClick={() => openEditModal(recipe)}
                        className="custom-card p-8 group hover:border-emerald-500 transition-all cursor-pointer bg-white"
                    >
                        <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                            <ChefHat size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{recipe.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2">{recipe.instructions || "Aucune instruction."}</p>
                        <div className="mt-6 flex justify-end">
                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">{editingRecipe ? "Modifier" : "Nouvelle Recette"}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="space-y-6">
                            <input className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none" placeholder="Nom de la recette" value={newName} onChange={(e) => setNewName(e.target.value)} />
                            <textarea className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium outline-none h-32" placeholder="Instructions..." value={newInstructions} onChange={(e) => setNewInstructions(e.target.value)} />
                            <div className="space-y-3">
                                {selectedIngredients.map((item, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none" placeholder="Nom" value={item.name} onChange={(e) => {
                                            const v = [...selectedIngredients]; v[index].name = e.target.value; setSelectedIngredients(v);
                                        }} />
                                        <input type="number" className="w-20 bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none" value={item.quantity} onChange={(e) => {
                                            const v = [...selectedIngredients]; v[index].quantity = e.target.value; setSelectedIngredients(v);
                                        }} />
                                        <select className="w-24 bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none" value={item.unit} onChange={(e) => {
                                            const v = [...selectedIngredients]; v[index].unit = e.target.value; setSelectedIngredients(v);
                                        }}>
                                            {UNITS.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
                                        </select>
                                    </div>
                                ))}
                                <button onClick={() => setSelectedIngredients([...selectedIngredients, { name: "", quantity: 1, unit: "unit" }])} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold">+ Ajouter un ingrédient</button>
                            </div>
                            <button onClick={handleSubmit} className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black shadow-lg">SAUVEGARDER</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}