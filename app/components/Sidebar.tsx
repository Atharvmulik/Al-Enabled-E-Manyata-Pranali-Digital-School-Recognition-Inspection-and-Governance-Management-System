"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiHome,
    FiUser,
    FiFileText,
    FiActivity,
    FiBell,
    FiClipboard,
    FiAward,
    FiLogOut,
    FiMenu,
    FiX,
} from "react-icons/fi";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: FiHome },
    { label: "Profile Completion", href: "/profile", icon: FiUser },
    { label: "Registration", href: "/registration", icon: FiFileText },
    { label: "Track Status", href: "/status", icon: FiActivity },
    { label: "Notifications", href: "/notifications", icon: FiBell },
    { label: "Inspection Info", href: "/inspection", icon: FiClipboard },
    { label: "Certificates", href: "/certificates", icon: FiAward },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-primary-700 text-white p-2 rounded-lg shadow-lg"
                aria-label="Toggle sidebar"
            >
                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-gradient-to-b from-primary-900 to-primary-800 text-white
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* Logo */}
                <div className="px-6 py-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-lg font-bold">
                            S
                        </div>
                        <div>
                            <h2 className="text-sm font-bold leading-tight">School Recognition</h2>
                            <p className="text-xs text-primary-200">Management System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${isActive
                                                ? "bg-white text-primary-900 shadow-lg shadow-black/10"
                                                : "text-primary-100 hover:bg-white/10 hover:text-white"
                                            }
                    `}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                        {item.label === "Notifications" && (
                                            <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                                3
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="px-3 pb-6">
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-primary-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200">
                        <FiLogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
