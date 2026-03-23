"use client";

import React from "react";
import Link from "next/link";
import { AuthCard } from "@/app/components/ui/auth-card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [otp, setOtp] = React.useState("");
    const [otpSent, setOtpSent] = React.useState(false);
    const [isSending, setIsSending] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const router = useRouter();

    const handleSendOTP = async () => {
        setIsSending(true);
        // Mocking OTP send delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setOtpSent(true);
        setIsSending(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 p-4 transition-colors duration-500">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

            <AuthCard
                title="Create Account"
                subtitle="Join us today and start your journey"
            >
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    router.push("/dashboard");
                }}>
                    <div className="md:col-span-2">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        required
                    />

                    <Input
                        label="Contact Number"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        required
                    />

                    <div className="md:col-span-2">
                        <Input
                            label="School Name"
                            placeholder="Ex: Stanford University"
                            required
                        />
                    </div>

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        required
                    />

                    <div className="md:col-span-2 flex flex-col gap-4">
                        <Button
                            type="button"
                            variant={otpSent ? "outline" : "secondary"}
                            onClick={handleSendOTP}
                            disabled={isSending}
                            className="h-11 w-full text-sm"
                        >
                            {isSending ? "Sending..." : otpSent ? "Resend" : "Get OTP"}
                        </Button>

                        <Input
                            label="Enter OTP"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required={otpSent}
                            disabled={!otpSent}
                            className={!otpSent ? "opacity-50 cursor-not-allowed" : ""}
                        />
                    </div>

                    <div className="md:col-span-2 pt-2">
                        <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                            {isSubmitting ? "Creating Account..." : "Create Account"}
                        </Button>
                    </div>

                    <div className="md:col-span-2 text-center pt-2">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors underline-offset-4 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </AuthCard>
        </div>
    );
}
