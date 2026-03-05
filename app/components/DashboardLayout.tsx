"use client";

import Sidebar from "./Sidebar";
import { FiUser, FiBell } from "react-icons/fi";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-neutral-50">
            <Sidebar />

            {/* Main area */}
            <div className="lg:ml-64 min-h-screen flex flex-col">
                {/* Top Navbar */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
                    <div className="flex items-center justify-between px-6 py-3 lg:px-8">
                        {/* Left spacer for mobile hamburger */}
                        <div className="lg:hidden w-10" />

                        {/* Title area */}
                        <div className="hidden lg:block">
                            <h1 className="text-lg font-bold text-neutral-800">
                                School Recognition & Inspection Portal
                            </h1>
                        </div>

                        {/* Right section */}
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                                <FiBell size={20} className="text-neutral-600" />
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                                    3
                                </span>
                            </button>

                            <div className="h-8 w-px bg-neutral-200" />

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-neutral-800">
                                        Delhi Public School
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        admin@dps.edu.in
                                    </p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                    <FiUser size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
