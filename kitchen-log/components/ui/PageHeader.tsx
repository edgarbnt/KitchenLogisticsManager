import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
    return (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
                {description && <p className="text-slate-400 font-medium mt-2">{description}</p>}
            </div>
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </header>
    );
};