"use client";
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ChefHat, ShoppingBasket, X, CheckCircle2, Play, BookOpen, AlertCircle, PackageCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

export default function PlanningPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

    // Etats pour le rapport de génération
    const [summaryData, setSummaryData] = useState<{ added: any[], skipped: any[] } | null>(null);

    useEffect(() => { refresh(); }, []);

    const refresh = async () => {
        try {
            const data = await api.getMealPlan();
            setPlans(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const handleGenerateShopping = async () => {
        try {
            const res = await api.generateShoppingList();
            setSummaryData({
                added: res.added || [],
                skipped: res.skipped || []
            });
        } catch (err) {
            alert("Erreur lors de la génération de la liste.");
        }
    };

    const handleCook = async (planId: number) => {
        await api.cookRecipe(planId);
        setSelectedRecipe(null);
        refresh();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <PageHeader
                title="À cuisiner"
                description="Votre sélection actuelle pour les prochains jours."
                action={
                    <Button onClick={handleGenerateShopping}>
                        <ShoppingBasket size={18} className="mr-2" /> Convertir en courses
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className="flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-emerald-500 relative transition-all">
                        {/* Partie Gauche : Info Recette */}
                        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto flex-1 min-w-0">
                            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
                                <ChefHat size={32} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-xl font-black text-slate-900 truncate pr-2">{plan.recipe.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest truncate">En attente</p>
                                </div>
                            </div>
                        </div>

                        {/* Partie Droite : Actions */}
                        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 shrink-0">
                            <Button
                                onClick={() => setSelectedRecipe(plan)}
                                className="flex-1 md:flex-none w-full md:w-auto shadow-none bg-slate-900 text-white"
                            >
                                <Play size={18} fill="currentColor" className="mr-2" /> Cuisiner
                            </Button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    api.removeFromMealPlan(plan.id).then(refresh);
                                }}
                                className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                            >
                                <X size={22} />
                            </button>
                        </div>
                    </Card>
                ))}

                {plans.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-400 font-bold">Aucune recette planifiée.</p>
                    </div>
                )}
            </div>

            {/* Modal de cuisine "Mode Focus" */}
            <Modal isOpen={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} title="Mode Cuisine">
                {selectedRecipe && (
                    <div className="flex flex-col gap-6">
                        <div className="space-y-6">
                            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest border-b pb-2">Ingrédients</h4>
                            <ul className="space-y-4">
                                {selectedRecipe.recipe.ingredients?.map((ri: any, i: number) => (
                                    <li key={i} className="flex justify-between items-center">
                                        <span className="font-bold text-slate-700 capitalize">{ri.ingredient.name}</span>
                                        <span className="bg-slate-50 px-3 py-1 rounded-lg text-sm font-mono font-bold text-slate-500">
                                            {ri.quantity_required} {ri.ingredient.unit}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest border-b pb-2">Instructions</h4>
                            <p className="text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {selectedRecipe.recipe.instructions || "Aucune instruction détaillée."}
                            </p>
                        </div>
                        <div className="pt-4">
                            <Button fullWidth variant="secondary" size="lg" onClick={() => handleCook(selectedRecipe.id)}>
                                <CheckCircle2 size={24} className="mr-2" /> RECETTE TERMINÉE !
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de Résumé de génération de liste */}
            <Modal isOpen={!!summaryData} onClose={() => setSummaryData(null)} title="Rapport de Courses">
                <div className="space-y-8">
                    {/* Section Ajoutés */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <ShoppingBasket className="text-emerald-500" size={20} />
                            <h4 className="font-black text-emerald-900 uppercase text-xs tracking-widest">Ajoutés à la liste</h4>
                        </div>
                        {summaryData?.added.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">Aucun article nécessaire.</p>
                        ) : (
                            <ul className="space-y-3">
                                {summaryData?.added.map((item, i) => (
                                    <li key={i} className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-xl">
                                        <span className="font-bold text-slate-800 capitalize">{item.name}</span>
                                        <div className="text-right">
                                            <span className="font-black text-emerald-600 text-lg block leading-none">{item.added_qty}</span>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">{item.unit}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Section Ignorés (En stock) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <PackageCheck className="text-blue-500" size={20} />
                            <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest">Déjà en stock (Ignorés)</h4>
                        </div>
                        {summaryData?.skipped.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">Rien en stock.</p>
                        ) : (
                            <ul className="space-y-3">
                                {summaryData?.skipped.map((item, i) => (
                                    <li key={i} className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl opacity-75">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 capitalize line-through decoration-slate-300">{item.name}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">Requis: {item.needed} {item.unit}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-blue-500 text-lg block leading-none">{item.stock}</span>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">En stock</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Button fullWidth variant="primary" onClick={() => setSummaryData(null)}>
                        OK, C'EST NOTÉ
                    </Button>
                </div>
            </Modal>
        </div>
    );
}