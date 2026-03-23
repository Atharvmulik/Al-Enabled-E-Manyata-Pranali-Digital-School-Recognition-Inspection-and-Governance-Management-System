"use client";

import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { FaSchool } from "react-icons/fa";

const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <a href="#home" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <FaSchool className="text-white text-lg" />
                        </div>
                        <span className="text-lg font-bold text-primary-900 hidden sm:inline">
                            School Recognition System
                        </span>
                        <span className="text-lg font-bold text-primary-900 sm:hidden">
                            SRS
                        </span>
                    </a>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="px-4 py-2 text-sm font-medium text-neutral-700 rounded-lg hover:text-primary-700 hover:bg-primary-50 transition-all duration-200"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="/login"
                            className="px-5 py-2 text-sm font-semibold text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-all duration-200"
                        >
                            Login
                        </a>
                        <a
                            href="/signup"
                            className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-700 to-primary-500 rounded-lg hover:from-primary-800 hover:to-primary-600 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            Register
                        </a>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-4 pb-4 pt-2 space-y-1 bg-white border-t border-neutral-100">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-4 py-2.5 text-sm font-medium text-neutral-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition"
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="flex gap-3 pt-3">
                        <a
                            href="/login"
                            className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition"
                        >
                            Login
                        </a>
                        <a
                            href="/signup"
                            className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-700 to-primary-500 rounded-lg hover:from-primary-800 hover:to-primary-600 transition"
                        >
                            Register
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
