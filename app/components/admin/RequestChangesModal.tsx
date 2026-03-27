"use client";

import React, { useState, useEffect } from "react";
import { 
    X, 
    FileEdit, 
    Send, 
    CheckCircle2, 
    AlertCircle,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestChangesModalProps {
    isOpen: boolean;
    onClose: () => void;
    schoolName: string;
}

export default function RequestChangesModal({ isOpen, onClose, schoolName }: RequestChangesModalProps) {
    const [instructions, setInstructions] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setInstructions("");
            setSubmitted(false);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!instructions.trim()) return;
        
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setSubmitted(true);
            setTimeout(() => onClose(), 2000);
        }, 1500);
    };

    if (!isOpen) return null;

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <div className="relative bg-white rounded-3xl p-10 max-w-sm w-full text-center animate-in zoom-in-95 fade-in duration-300 shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Request Sent!</h2>
                    <p className="text-sm text-slate-500 font-medium">
                        The school has been notified of the requested changes for <span className="font-bold text-slate-700">{schoolName}</span>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
            
            <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 shadow-2xl border border-slate-200/50">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <FileEdit className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Request Changes</h2>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{schoolName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all group">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                            Please provide detailed instructions on what information needs to be updated or corrected by the school. This will be sent as a notification to the school administrator.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Change Instructions</label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Example: Please re-upload the Land Ownership document as the current one is blurry. Also, update the number of boys' toilets as per the latest audit..."
                            className="w-full h-40 px-5 py-4 rounded-2xl border border-slate-200 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 bg-slate-50/30 resize-none font-medium leading-relaxed"
                        />
                        <div className="flex justify-between items-center px-1">
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider transition-colors",
                                instructions.length > 0 ? "text-slate-400" : "text-rose-400"
                            )}>
                                {instructions.length === 0 ? "Instructions required" : `${instructions.length} characters`}
                            </span>
                            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Markdown supported</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!instructions.trim() || isLoading}
                        className={cn(
                            "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl active:scale-95",
                            instructions.trim() && !isLoading
                                ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        )}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {isLoading ? "Sending..." : "Submit Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}
