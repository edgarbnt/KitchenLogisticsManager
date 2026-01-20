"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Box, ShoppingCart, ChefHat, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ inventory: 0, shopping: 0, recipes: 0 });
  const [error, setError] = useState(false);

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

  const cards = [
    { label: 'En stock', value: stats.inventory, icon: Box, color: 'emerald' },
    { label: 'À acheter', value: stats.shopping, icon: ShoppingCart, color: 'blue' },
    { label: 'Recettes', value: stats.recipes, icon: ChefHat, color: 'orange' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header>
        <h2 className="text-5xl font-black text-slate-900 tracking-tight">Gérez votre stock intelligemment</h2>
        <p className="text-slate-400 text-xl mt-3 font-medium">Bienvenue dans votre Kitchen Logistics Manager.</p>
      </header>

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-[2.5rem] flex items-center gap-4 text-red-600">
          <AlertCircle size={24} />
          <p className="font-bold">Erreur de connexion : Vérifiez que le serveur FastAPI (port 8000) tourne.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {cards.map((stat, i) => (
          <div key={i} className="custom-card p-12 flex flex-col items-center text-center hover:shadow-xl transition-all">
            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
              stat.color === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
              }`}>
              <stat.icon size={40} />
            </div>
            <div className="text-6xl font-black text-slate-900 mb-2">{stat.value}</div>
            <div className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}