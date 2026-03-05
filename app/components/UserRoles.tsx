import {
    FaSchool,
    FaUserShield,
    FaClipboardCheck,
} from "react-icons/fa";

const roles = [
    {
        icon: FaSchool,
        title: "Schools",
        description: "Apply for recognition and track status.",
        color: "from-blue-600 to-blue-400",
    },
    {
        icon: FaUserShield,
        title: "Administrators",
        description: "Review applications and approve schools.",
        color: "from-indigo-600 to-indigo-400",
    },
    {
        icon: FaClipboardCheck,
        title: "Inspection Officers",
        description: "Conduct inspections and upload reports.",
        color: "from-cyan-600 to-cyan-400",
    },
];

export default function UserRoles() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-semibold tracking-widest text-primary-600 uppercase mb-3">
                    Platform Users
                </p>
                <h2 className="section-title">Who Can Use This Platform</h2>
                <p className="section-subtitle">
                    Designed for every stakeholder in the school recognition ecosystem.
                </p>

                <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {roles.map((role) => (
                        <div
                            key={role.title}
                            className="group text-center p-8 rounded-2xl bg-neutral-50 border border-neutral-200 hover:bg-white hover:border-primary-300 hover:shadow-xl transition-all duration-300"
                        >
                            <div
                                className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-6`}
                            >
                                <role.icon className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                {role.title}
                            </h3>
                            <p className="text-neutral-600 text-sm leading-relaxed">
                                {role.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
