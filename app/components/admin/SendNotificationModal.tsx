"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bell, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SendNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
    schoolName: string;
}

export default function SendNotificationModal({ isOpen, onClose, recipientName, schoolName }: SendNotificationModalProps) {
    const [message, setMessage] = useState(`Reminder: Scheduled inspection for ${schoolName} is approaching. Please ensure all documents and facilities are ready for verification.`);
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSend = () => {
        setIsSending(true);
        // Simulate API call
        setTimeout(() => {
            setIsSending(false);
            setIsSent(true);
            setTimeout(() => {
                onClose();
                // Reset state after closing
                setTimeout(() => setIsSent(false), 300);
            }, 2000);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {isSent ? (
                            <div className="p-12 text-center animate-in zoom-in-95 duration-300">
                                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Notification Sent!</h2>
                                <p className="text-sm text-slate-500">The reminder has been successfully delivered to {recipientName}.</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <Bell className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Send Reminder</h2>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">To: {recipientName}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex gap-3">
                                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                            This notification will be sent as an official SMS and Email reminder to the school administration and assigned inspector.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Notification Message</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={4}
                                            className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm bg-slate-50/50 resize-none font-medium leading-relaxed"
                                            placeholder="Type your custom reminder message here..."
                                        />
                                    </div>

                                    <div className="pt-4 flex items-center gap-3">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            disabled={isSending || !message.trim()}
                                            className="flex-[2] px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSending ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Send Notification
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
