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

                <div className="max-w-md w-full ml-8 hidden md:block">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search School / UDISE Code..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 relative transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3 cursor-pointer group px-2 py-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-800 leading-none">Nile Kumar</p>
                        <p className="text-[10px] text-slate-500 mt-1">Super Admin</p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold overflow-hidden shadow-inner">
                        <User className="w-5 h-5" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
            </div>
        </header>
    );
}
