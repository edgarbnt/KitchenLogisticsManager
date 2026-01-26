import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <input
                className={clsx(
                    "w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300",
                    className
                )}
                {...props}
            />
        </div>
    );
};