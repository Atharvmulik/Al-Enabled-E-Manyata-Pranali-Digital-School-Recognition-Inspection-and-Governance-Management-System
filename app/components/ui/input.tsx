import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider ml-1">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    "w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl py-3 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
                    className
                )}
                {...props}
            />
        </div>
    );
}
