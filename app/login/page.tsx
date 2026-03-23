"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/app/components/ui/auth-card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

export default function LoginPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Mocking login delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirect to UDISE verification
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 p-4 transition-colors duration-500">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

            <AuthCard
                title="School Login"
                subtitle="Sign in to manage your school profile and applications"
            >
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <Input
                        label="Email Address / UDISE Code"
                        type="text"
                        placeholder="school@example.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        required
                    />

                    <div className="flex justify-end text-sm">
                        <Link href="#" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </Button>
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Don't have an account?{" "}
                            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors underline-offset-4 hover:underline">
                                Register your school
                            </Link>
                        </p>
                    </div>
                </form>
            </AuthCard>
        </div>
    );
}
