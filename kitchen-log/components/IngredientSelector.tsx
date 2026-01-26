"use client";
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Search, ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
    value: string;
    onChange: (name: string) => void;
    placeholder?: string;
}

export default function IngredientSelector({ value, onChange, placeholder = "Rechercher un ingrédient..." }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value || "");
    const [masterList, setMasterList] = useState<any[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.getMasterIngredients().then(setMasterList);
    }, []);

    // Fermer si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtrage
    const filtered = query === ""
        ? masterList.slice(0, 10) // Afficher les 10 premiers par défaut
        : masterList.filter(ing =>
            ing.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 20);

    const handleSelect = (name: string) => {
        setQuery(name);
        onChange(name);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                className={clsx(
                    "flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-4 border-2 transition-all",
                    isOpen ? "border-emerald-500 bg-white ring-4 ring-emerald-50" : "border-transparent"
                )}
            >
                <Search size={18} className="text-slate-400" />
                <input
                    className="flex-1 bg-transparent border-none outline-none font-bold text-slate-800 placeholder:text-slate-300"
                    placeholder={placeholder}
                    value={query}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                />
                <ChevronDown size={18} className={clsx("text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {filtered.length > 0 ? (
                            filtered.map((ing, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelect(ing.name)}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-emerald-50 cursor-pointer transition-colors group"
                                >
                                    <span className={clsx(
                                        "font-bold transition-colors",
                                        value === ing.name ? "text-emerald-600" : "text-slate-600 group-hover:text-emerald-700"
                                    )}>
                                        {ing.name}
                                    </span>
                                    {value === ing.name && <Check size={18} className="text-emerald-500" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center text-slate-400 font-medium">
                                Aucun ingrédient trouvé
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}