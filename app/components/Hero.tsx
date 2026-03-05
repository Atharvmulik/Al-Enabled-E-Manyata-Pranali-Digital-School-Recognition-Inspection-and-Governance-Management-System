import { FaArrowRight, FaUserPlus } from "react-icons/fa";
import {
    HiOutlineShieldCheck,
    HiOutlineDocumentText,
    HiOutlineAcademicCap,
} from "react-icons/hi";

export default function Hero() {
    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center pt-16 overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100" />
            <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-primary-200/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent-500/10 blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="animate-slide-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-6">
                            <HiOutlineShieldCheck className="text-lg" />
                            Government Digital Initiative
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-tight text-neutral-900 mb-6">
                            Digital Platform for{" "}
                            <span className="gradient-text">
                                School Recognition &amp; Inspection
                            </span>
                        </h1>

                        <p className="text-lg text-neutral-600 leading-relaxed mb-8 max-w-xl">
                            Streamlining school registration, inspection, and certification
                            through a transparent digital system.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold bg-gradient-to-r from-primary-700 to-primary-500 rounded-xl shadow-lg hover:shadow-xl hover:from-primary-800 hover:to-primary-600 transition-all duration-300 group"
                            >
                                <FaUserPlus />
                                Register School
                                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-primary-700 bg-white border-2 border-primary-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all duration-300"
                            >
                                Login
                            </a>
                        </div>

                        {/* Mini Stats */}
                        <div className="flex gap-8 mt-10 pt-8 border-t border-neutral-200">
                            <div>
                                <p className="text-2xl font-bold text-primary-700">500+</p>
                                <p className="text-sm text-neutral-500">Schools Registered</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary-700">200+</p>
                                <p className="text-sm text-neutral-500">Inspections Done</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary-700">150+</p>
                                <p className="text-sm text-neutral-500">Certificates</p>
                            </div>
                        </div>
                    </div>

                    {/* Right — Illustration */}
                    <div className="hidden lg:flex justify-center items-center animate-slide-right">
                        <div className="relative w-full max-w-lg">
                            {/* Decorative card stack */}
                            <div className="absolute -top-4 -left-4 w-72 h-48 bg-primary-200/40 rounded-2xl rotate-3" />
                            <div className="absolute -bottom-4 -right-4 w-72 h-48 bg-accent-500/20 rounded-2xl -rotate-3" />

                            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-neutral-200">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-lg">
                                        <HiOutlineAcademicCap className="text-white text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900">School Portal</h3>
                                        <p className="text-sm text-neutral-500">
                                            Recognition & Inspection
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: "Registration", pct: "100%" },
                                        { label: "Document Upload", pct: "85%" },
                                        { label: "Inspection", pct: "60%" },
                                        { label: "Approval", pct: "40%" },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-neutral-700 font-medium">
                                                    {item.label}
                                                </span>
                                                <span className="text-primary-600 font-semibold">
                                                    {item.pct}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-1000"
                                                    style={{ width: item.pct }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                                    <HiOutlineDocumentText className="text-green-600 text-xl" />
                                    <div>
                                        <p className="text-sm font-semibold text-green-800">
                                            Application In Progress
                                        </p>
                                        <p className="text-xs text-green-600">
                                            Track every step digitally
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
