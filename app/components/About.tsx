import {
    HiOutlineShieldCheck,
    HiOutlineGlobeAlt,
    HiOutlineLightBulb,
} from "react-icons/hi";

export default function About() {
    return (
        <section id="about" className="py-24 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left — Info */}
                    <div>
                        <p className="text-sm font-semibold tracking-widest text-primary-600 uppercase mb-3">
                            About Us
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-6 leading-tight">
                            About the Platform
                        </h2>
                        <p className="text-neutral-600 leading-relaxed mb-8 text-lg">
                            This platform is designed to digitize the school recognition
                            process by enabling online registration, document submission,
                            inspection tracking, and digital certificate generation. It
                            improves transparency and efficiency in educational
                            administration.
                        </p>

                        <div className="space-y-5">
                            {[
                                {
                                    icon: HiOutlineShieldCheck,
                                    title: "Transparent Process",
                                    desc: "Every step is tracked and auditable.",
                                },
                                {
                                    icon: HiOutlineGlobeAlt,
                                    title: "Accessible Anywhere",
                                    desc: "Cloud-based — access from any device, any location.",
                                },
                                {
                                    icon: HiOutlineLightBulb,
                                    title: "Smart & Efficient",
                                    desc: "Automated workflows reduce turnaround time.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="flex items-start gap-4 group"
                                >
                                    <div className="w-11 h-11 shrink-0 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300">
                                        <item.icon className="text-primary-600 text-xl group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-neutral-900">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-neutral-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Visual */}
                    <div className="hidden lg:block">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-primary-100 to-primary-50 rounded-3xl rotate-2" />
                            <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { val: "99.9%", label: "Uptime", color: "text-green-600" },
                                        { val: "24/7", label: "Available", color: "text-primary-600" },
                                        { val: "100%", label: "Paperless", color: "text-amber-600" },
                                        { val: "Secure", label: "Encrypted", color: "text-purple-600" },
                                    ].map((s) => (
                                        <div
                                            key={s.label}
                                            className="text-center p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition"
                                        >
                                            <p className={`text-2xl font-bold ${s.color}`}>
                                                {s.val}
                                            </p>
                                            <p className="text-sm text-neutral-500 mt-1">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
