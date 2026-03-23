"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    School,
    FileCheck,
    SearchCheck,
    ClipboardCheck,
    ShieldAlert,
    BarChart3,
    Bell,
    Settings,
    History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "School Management", icon: School, href: "/admin/schools" },
    { name: "Applications & Recognition", icon: FileCheck, href: "/admin/applications" },
    { name: "Inspection Management", icon: SearchCheck, href: "/admin/inspections" },
    { name: "Document Verification", icon: ClipboardCheck, href: "/admin/documents" },
    { name: "AI Monitoring", icon: ShieldAlert, href: "/admin/ai-monitoring" },
    { name: "Reports & Analytics", icon: BarChart3, href: "/admin/reports" },
    { name: "Notifications", icon: Bell, href: "/admin/notifications" },
    { name: "System Settings", icon: Settings, href: "/admin/settings" },
    { name: "Audit Logs", icon: History, href: "/admin/audit-logs" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800 shadow-xl overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldAlert className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold leading-tight">E-Manyata</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Admin Portal</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                                        : "hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                                    )} />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="w-1 h-4 bg-blue-500 rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-800">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                        SA
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">Super Admin</p>
                        <p className="text-[10px] text-slate-500 truncate">admin@gov.in</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
