"use client";

import React from "react";
import { Sidebar } from "@/app/components/admin/sidebar";
import { TopNav } from "@/app/components/admin/top-nav";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            {/* Sidebar */}
            <div className="hidden lg:flex flex-shrink-0">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                <TopNav />
                <main className="flex-1 overflow-y-auto overflow-x-hidden pt-6 pb-12 px-6">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
