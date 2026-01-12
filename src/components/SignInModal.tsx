"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { X, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function SignInModal() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, login, isLoading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        // Don't do anything if we are still checking auth status
        if (isLoading) return;

        // Check if user has already dismissed the modal
        const hasDismissed = localStorage.getItem("simplypdf_signin_dismissed");
        
        // Show modal after 3 seconds if not logged in and not dismissed
        if (!user && !hasDismissed) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [user, isLoading]);

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem("simplypdf_signin_dismissed", "true");
    };

    // Don't render anything until client-side hydration is complete
    if (!mounted) return null;

    // Don't show if user is logged in
    if (user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-60 transition-opacity"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-70 overflow-hidden border border-white/20"
                    >
                        {/* Decorative Header */}
                        <div className="bg-linear-to-br from-black to-gray-800 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50" />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl"
                            >
                                <Sparkles className="w-8 h-8 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Welcome to SimplyPDF</h2>
                            <p className="text-gray-300 text-sm relative z-10">Unlock the full experience</p>
                            
                            <button 
                                onClick={handleDismiss}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 text-center bg-white">
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Sign in to save your file history, access premium features, and keep your documents organized across devices.
                            </p>

                            <div className="flex justify-center mb-6">
                                <GoogleLogin
                                    onSuccess={login}
                                    onError={() => console.log("Login Failed")}
                                    theme="filled_black"
                                    size="large"
                                    text="continue_with"
                                    shape="pill"
                                    width="100%"
                                />
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
                            >
                                Maybe later
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
