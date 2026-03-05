import {
    FaUserPlus,
    FaIdCard,
    FaPaperPlane,
    FaSearchPlus,
    FaCheckCircle,
    FaCertificate,
} from "react-icons/fa";

const steps = [
    {
        icon: FaUserPlus,
        title: "School Registration",
        step: 1,
    },
    {
        icon: FaIdCard,
        title: "Profile Completion",
        step: 2,
    },
    {
        icon: FaPaperPlane,
        title: "Application Submission",
        step: 3,
    },
    {
        icon: FaSearchPlus,
        title: "Inspection",
        step: 4,
    },
    {
        icon: FaCheckCircle,
        title: "Approval",
        step: 5,
    },
    {
        icon: FaCertificate,
        title: "Certificate Generation",
        step: 6,
    },
];

export default function Workflow() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-semibold tracking-widest text-primary-600 uppercase mb-3">
                    The Process
                </p>
                <h2 className="section-title">How It Works</h2>
                <p className="section-subtitle">
                    A simple 6-step journey from registration to certification.
                </p>

                {/* Desktop Timeline */}
                <div className="hidden lg:block relative">
                    {/* Connector line */}
                    <div className="absolute top-12 left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-primary-300 via-primary-500 to-primary-300" />

                    <div className="grid grid-cols-6 gap-4">
                        {steps.map((s) => (
                            <div key={s.step} className="flex flex-col items-center text-center">
                                <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 group cursor-default">
                                    <s.icon className="text-white text-2xl" />
                                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-primary-700 text-xs font-bold flex items-center justify-center shadow border border-primary-200">
                                        {s.step}
                                    </span>
                                </div>
                                <p className="mt-4 text-sm font-semibold text-neutral-800 leading-tight">
                                    {s.title}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile/Tablet Timeline */}
                <div className="lg:hidden relative pl-8">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-400 to-primary-200" />

                    <div className="space-y-8">
                        {steps.map((s) => (
                            <div key={s.step} className="relative flex items-center gap-5">
                                {/* Dot on line */}
                                <div className="absolute -left-8 w-8 flex justify-center">
                                    <div className="w-3 h-3 rounded-full bg-primary-500 ring-4 ring-primary-100" />
                                </div>

                                <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-neutral-200 shadow-sm flex-1 hover:shadow-md transition">
                                    <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center shadow">
                                        <s.icon className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-primary-600">
                                            Step {s.step}
                                        </span>
                                        <p className="text-sm font-semibold text-neutral-800">
                                            {s.title}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
