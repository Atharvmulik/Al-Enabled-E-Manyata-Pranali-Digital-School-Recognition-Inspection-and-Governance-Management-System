"use client";

import React from "react";
import {
    Search,
    Bell,
    User,
    ChevronDown,
    Menu
} from "lucide-react";

export function TopNav() {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                    <Menu className="w-5 h-5" />
                </button>

                <div className="hidden lg:block">
                    <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                        AI-Enabled E-Manyata Pranali
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                        Integrated School Recognition & Governance System
                    </p>
                </div>

                
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    
                </div>

                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            </div>
        </header>
    );
}
