import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-6 md:p-8 transition-all duration-300 overflow-hidden",
                onClick && "cursor-pointer hover:border-emerald-500 hover:shadow-md active:scale-[0.98]",
                className
            )}
        >
            {children}
        </div>
    );
};