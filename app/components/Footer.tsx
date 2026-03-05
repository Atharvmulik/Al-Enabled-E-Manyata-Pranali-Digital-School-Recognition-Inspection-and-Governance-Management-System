import { FaSchool } from "react-icons/fa";
import {
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
} from "react-icons/hi";

const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
];

const serviceLinks = [
    "School Registration",
    "Inspection Tracking",
    "Document Upload",
    "Certificate Verification",
];

export default function Footer() {
    return (
        <footer id="contact" className="bg-neutral-900 text-neutral-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
                                <FaSchool className="text-white text-lg" />
                            </div>
                            <span className="text-lg font-bold text-white">SRS</span>
                        </div>
                        <p className="text-sm leading-relaxed text-neutral-400">
                            School Recognition &amp; Inspection Management System —
                            digitizing educational administration for a transparent future.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            {quickLinks.map((l) => (
                                <li key={l.label}>
                                    <a
                                        href={l.href}
                                        className="text-sm text-neutral-400 hover:text-primary-400 transition-colors"
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Services</h4>
                        <ul className="space-y-2">
                            {serviceLinks.map((s) => (
                                <li key={s}>
                                    <span className="text-sm text-neutral-400">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm">
                                <HiOutlineMail className="text-primary-400 text-lg mt-0.5 shrink-0" />
                                <span>support@schoolrecognition.gov.in</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <HiOutlinePhone className="text-primary-400 text-lg mt-0.5 shrink-0" />
                                <span>+91-1234-567890</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <HiOutlineLocationMarker className="text-primary-400 text-lg mt-0.5 shrink-0" />
                                <span>Department of Education, New Delhi, India</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-neutral-500">
                        &copy; {new Date().getFullYear()} School Recognition &amp;
                        Inspection Management System. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-xs text-neutral-500">
                        <a href="#" className="hover:text-primary-400 transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-primary-400 transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
