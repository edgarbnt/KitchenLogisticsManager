"use client";
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Box, ShoppingCart, ChefHat, AlertCircle, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UNITS } from '@/constants/units';

export default function Dashboard() {
  const [stats, setStats] = useState({ inventory: 0, shopping: 0, recipes: 0 });
  const [error, setError] = useState(false);

  // State pour ajouter un ingrédient
  const [newIngName, setNewIngName] = useState("");
  const [newIngCategory, setNewIngCategory] = useState("Divers");
  const [newIngUnit, setNewIngUnit] = useState("unit");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inv, shop, rec] = await Promise.all([
          api.getInventory(),
          api.getShoppingList(),
          api.getRecipes()
        ]);
        setStats({
          inventory: Array.isArray(inv) ? inv.length : 0,
          shopping: Array.isArray(shop) ? shop.length : 0,
          recipes: Array.isArray(rec) ? rec.length : 0
        });
        setError(false);
      } catch (e) {
        setError(true);
      }
    };
    fetchData();
  }, []);

  const handleCreateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName) return;
    setIsAdding(true);
    try {
      await api.createIngredient(newIngName, newIngCategory, newIngUnit);
      alert("Ingrédient ajouté à la base de données !");
      setNewIngName("");
      setNewIngCategory("Divers");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const cards = [
    { label: 'En stock', value: stats.inventory, icon: Box, color: 'emerald' },
    { label: 'À acheter', value: stats.shopping, icon: ShoppingCart, color: 'blue' },
    { label: 'Recettes', value: stats.recipes, icon: ChefHat, color: 'orange' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageHeader
        title="Tableau de bord"
        description="Aperçu rapide de votre cuisine."
      />

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-[2.5rem] flex items-center gap-4 text-red-600">
          <AlertCircle size={24} />
          <p className="font-bold">Erreur de connexion : Vérifiez que le serveur FastAPI (port 8000) tourne.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((stat, i) => (
          <Card key={i} className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                stat.color === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
              }`}>
              <stat.icon size={32} />
            </div>
            <div className="text-5xl font-black text-slate-900 mb-2">{stat.value}</div>
            <div className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-xl font-black text-slate-900 mb-6">Ajouter un Ingrédient (Master)</h3>
          <form onSubmit={handleCreateIngredient} className="space-y-4">
            <Input
              label="Nom de l'ingrédient"
              placeholder="ex: Riz Basmati"
              value={newIngName}
              onChange={e => setNewIngName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
                <select
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none"
                  value={newIngCategory}
                  onChange={e => setNewIngCategory(e.target.value)}
                >
                  <option value="Frais">Frais</option>
                  <option value="Epicerie">Epicerie</option>
                  <option value="Divers">Divers</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unité par défaut</label>
                <select
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none"
                  value={newIngUnit}
                  onChange={e => setNewIngUnit(e.target.value)}
                >
                  {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <Button fullWidth type="submit" isLoading={isAdding} variant="secondary">
              <Plus size={18} className="mr-2" /> Ajouter à la base
            </Button>
          </form>
        </Card>

        <Card className="flex flex-col justify-center items-center text-center p-10 bg-slate-900 text-white border-none">
          <ChefHat size={48} className="mb-4 text-emerald-400" />
          <h3 className="text-2xl font-black mb-2">Prêt à cuisiner ?</h3>
          <p className="text-slate-400 mb-6">Consultez vos recettes ou scannez un ticket pour mettre à jour votre stock.</p>
        </Card>
      </div>
    </div>
  );
}