"use client";
import { useState } from 'react';
import { api } from '@/lib/api';
import { Camera, Loader2, Check, X, ArrowRight, AlertCircle, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extracted, setExtracted] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setPreviewUrl(URL.createObjectURL(file));
        setIsScanning(true);
        setExtracted([]);

        try {
            const items = await api.scanReceipt(file);
            setExtracted(items);
        } catch (err) {
            setError("Erreur lors du scan du ticket. Vérifiez la connexion au serveur.");
        } finally {
            setIsScanning(false);
        }
    };

    const confirmAll = async () => {
        // Note: Logique pour ajouter chaque item détecté au stock
        router.push('/inventory');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Affichage de l'erreur style Image 1/2 */}
            {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600">
                    <AlertCircle size={24} />
                    <p className="font-bold text-sm">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Zone de gauche : Upload/Preview */}
                <div className="space-y-6">
                    {!previewUrl ? (
                        <label className="flex flex-col items-center justify-center h-[600px] border-4 border-dashed border-slate-200 rounded-[3.5rem] bg-white hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer group">
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Camera size={48} />
                            </div>
                            <span className="text-2xl font-black text-slate-800">Scanner le ticket</span>
                            <p className="text-slate-400 mt-2 font-medium">Cliquez pour choisir une photo</p>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                        </label>
                    ) : (
                        <div className="relative h-[600px] rounded-[3.5rem] overflow-hidden border-8 border-white shadow-2xl bg-slate-900">
                            <img src={previewUrl} className="w-full h-full object-contain" alt="Ticket" />
                            {isScanning && (
                                <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-md flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="animate-spin text-white" size={64} />
                                        <span className="text-white font-black tracking-[0.2em] uppercase text-xs">Analyse Gemini...</span>
                                    </div>
                                </div>
                            )}
                            <button onClick={() => { setPreviewUrl(null); setExtracted([]) }} className="absolute top-8 right-8 bg-white/20 hover:bg-white/40 backdrop-blur-xl p-4 rounded-3xl text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Zone de droite : Résultats */}
                <div className="bg-white rounded-[3.5rem] border border-slate-200 p-10 shadow-sm flex flex-col h-[600px]">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Articles Détectés</h3>
                        <span className="bg-slate-100 text-slate-500 px-5 py-2 rounded-full text-xs font-black">{extracted.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {extracted.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 p-6 rounded-[2.5rem] flex items-center justify-between border border-transparent hover:border-emerald-100 transition-all">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg capitalize">{item.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                            {item.unit === 'unit' ? 'Alimentaire' : 'VRAC'}
                                        </span>
                                        <span className="text-xs text-slate-400 font-bold">{item.quantity} {item.unit}</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                                    <Check size={20} strokeWidth={3} />
                                </div>
                            </div>
                        ))}

                        {extracted.length === 0 && !isScanning && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-200 gap-6 opacity-40">
                                <ShoppingCart size={100} strokeWidth={1} />
                                <p className="font-bold text-slate-400 text-center">Prenez une photo pour extraire les produits</p>
                            </div>
                        )}
                    </div>

                    {extracted.length > 0 && (
                        <button
                            onClick={confirmAll}
                            className="mt-8 w-full py-6 bg-emerald-500 text-white rounded-[2.2rem] font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 tracking-widest"
                        >
                            AJOUTER AU STOCK <ArrowRight size={22} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}