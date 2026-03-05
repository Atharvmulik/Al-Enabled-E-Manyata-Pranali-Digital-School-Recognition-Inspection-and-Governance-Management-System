import { FaArrowRight } from "react-icons/fa";

export default function CallToAction() {
    return (
        <section className="py-24 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative rounded-3xl bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 p-12 sm:p-16 text-center overflow-hidden">
                    {/* Decorative */}
                    <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />

                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                            Start Your School Registration Today
                        </h2>
                        <p className="text-primary-200 text-lg max-w-xl mx-auto mb-10">
                            Join hundreds of schools already benefiting from our digital
                            recognition system.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-primary-800 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-neutral-50 transition-all duration-300 group"
                            >
                                Register
                                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-300"
                            >
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
