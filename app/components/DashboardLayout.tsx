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
