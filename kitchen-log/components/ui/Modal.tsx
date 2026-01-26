import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div
                className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 md:p-8 flex justify-between items-center border-b border-slate-50">
                    <h3 className="text-2xl font-black text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <X className="text-slate-400" />
                    </button>
                </div>
                <div className="p-6 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};