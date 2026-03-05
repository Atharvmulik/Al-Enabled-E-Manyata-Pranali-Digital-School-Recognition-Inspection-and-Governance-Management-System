import {
    FaSchool,
    FaClipboardList,
    FaSearch,
    FaCertificate,
    FaFolderOpen,
    FaUserEdit,
} from "react-icons/fa";

const features = [
    {
        icon: FaSchool,
        title: "School Registration",
        description: "Schools can register and submit applications online.",
        color: "from-blue-600 to-blue-400",
        bg: "bg-blue-50",
    },
    {
        icon: FaUserEdit,
        title: "Profile Completion",
        description: "Schools provide infrastructure and institutional details.",
        color: "from-indigo-600 to-indigo-400",
        bg: "bg-indigo-50",
    },
    {
        icon: FaSearch,
        title: "Inspection Management",
        description: "Authorities conduct and track school inspections.",
        color: "from-cyan-600 to-cyan-400",
        bg: "bg-cyan-50",
    },
    {
        icon: FaClipboardList,
        title: "Application Tracking",
        description: "Schools can track approval status in real time.",
        color: "from-emerald-600 to-emerald-400",
        bg: "bg-emerald-50",
    },
    {
        icon: FaFolderOpen,
        title: "Document Management",
        description: "Secure storage of school documents.",
        color: "from-amber-600 to-amber-400",
        bg: "bg-amber-50",
    },
    {
        icon: FaCertificate,
        title: "Digital Certificates",
        description: "QR-based certificates for authenticity.",
        color: "from-purple-600 to-purple-400",
        bg: "bg-purple-50",
    },
];

export default function Features() {
    return (
        <section id="services" className="py-24 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-semibold tracking-widest text-primary-600 uppercase mb-3">
                    What We Offer
                </p>
                <h2 className="section-title">Our Services</h2>
                <p className="section-subtitle">
                    A comprehensive suite of tools to digitize every step of school
                    recognition.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div
                            key={f.title}
                            className={`group relative bg-white rounded-2xl p-7 border border-neutral-200 hover:border-primary-300 shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in-up opacity-0 delay-${(i + 1) * 100
                                }`}
                        >
                            {/* Icon */}
                            <div
                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                            >
                                <f.icon className="text-white text-xl" />
                            </div>

                            <h3 className="text-lg font-bold text-neutral-900 mb-2">
                                {f.title}
                            </h3>
                            <p className="text-neutral-600 text-sm leading-relaxed">
                                {f.description}
                            </p>

                            {/* Hover accent line */}
                            <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-b-2xl group-hover:w-full transition-all duration-500" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
