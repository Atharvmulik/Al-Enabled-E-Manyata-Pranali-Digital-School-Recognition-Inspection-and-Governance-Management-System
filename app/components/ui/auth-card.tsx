import React from "react";

interface AuthCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
    return (
        <div className="w-full max-w-2xl relative z-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-2xl">
                {children}
            </div>
        </div>
    );
}
