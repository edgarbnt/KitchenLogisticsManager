import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    isLoading?: boolean;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    isLoading = false,
    size = 'md',
    fullWidth = false,
    children,
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 whitespace-nowrap";

    const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200",
        secondary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100",
        danger: "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white",
        ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
        outline: "bg-transparent border-2 border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
    };

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base"
    };

    return (
        <button
            className={clsx(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && "w-full",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {children}
        </button>
    );
};