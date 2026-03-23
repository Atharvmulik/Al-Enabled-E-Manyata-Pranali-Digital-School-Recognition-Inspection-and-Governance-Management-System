import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    children: React.ReactNode;
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                "font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                variant === "primary" &&
                    "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 py-3 px-6",
                variant === "secondary" &&
                    "bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm py-3 px-6",
                variant === "outline" &&
                    "bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 py-3 px-6",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
