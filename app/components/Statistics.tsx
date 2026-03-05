"use client";

import { useEffect, useRef, useState } from "react";
import {
    FaSchool,
    FaSearch,
    FaCertificate,
    FaClipboardList,
} from "react-icons/fa";

const stats = [
    {
        icon: FaSchool,
        value: 500,
        suffix: "+",
        label: "Schools Registered",
        color: "from-blue-600 to-blue-400",
    },
    {
        icon: FaSearch,
        value: 200,
        suffix: "+",
        label: "Inspections Completed",
        color: "from-indigo-600 to-indigo-400",
    },
    {
        icon: FaCertificate,
        value: 150,
        suffix: "+",
        label: "Certificates Issued",
        color: "from-cyan-600 to-cyan-400",
    },
    {
        icon: FaClipboardList,
        value: 50,
        suffix: "+",
        label: "Active Applications",
        color: "from-emerald-600 to-emerald-400",
    },
];

function Counter({
    target,
    suffix,
    isVisible,
}: {
    target: number;
    suffix: string;
    isVisible: boolean;
}) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) return;
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, 20);
        return () => clearInterval(timer);
    }, [isVisible, target]);

    return (
        <span>
            {count}
            {suffix}
        </span>
    );
}

export default function Statistics() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-accent-500/10 blur-3xl" />

            <div
                ref={ref}
                className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <p className="text-center text-sm font-semibold tracking-widest text-primary-300 uppercase mb-3">
                    Our Impact
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-4">
                    Platform Statistics
                </h2>
                <p className="text-center text-primary-200 max-w-lg mx-auto mb-16">
                    Real numbers that reflect our commitment to digitizing education.
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="group text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/20 transition-all duration-300"
                        >
                            <div
                                className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                            >
                                <s.icon className="text-white text-xl" />
                            </div>
                            <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                                <Counter
                                    target={s.value}
                                    suffix={s.suffix}
                                    isVisible={visible}
                                />
                            </p>
                            <p className="text-sm text-primary-200">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
