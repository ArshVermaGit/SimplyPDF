"use client";

import { useAuth } from "@/context/AuthProvider";
import Link from "next/link";
import { Clock, History, ArrowLeft, Trash2, FileText, Sparkles } from "lucide-react";
import { useHistory, HistoryItem } from "@/context/HistoryContext";
import { motion, AnimatePresence } from "framer-motion";

// Background decoration component
const BackgroundDecoration = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="absolute top-20 right-10 w-[400px] h-[400px] bg-gradient-to-bl from-gray-100 to-transparent rounded-full blur-3xl"
        />
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-gradient-to-tr from-gray-50 to-transparent rounded-full blur-3xl"
        />
    </div>
);

export default function HistoryPage() {
    const { user } = useAuth();
    const { history, clearHistory } = useHistory();

    // Format timestamp to readable string
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // Not logged in state
    if (!user) {
        return (
            <main className="min-h-screen pt-32 pb-20 px-4 relative overflow-hidden">
                <BackgroundDecoration />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container mx-auto max-w-2xl text-center"
                >
                    <motion.div
                        className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gray-200/50"
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        <History className="w-12 h-12 text-gray-400" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Sign in to view your history</h1>
                    <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
                        Sign in with Google to track your PDF actions and access them anytime.
                    </p>
                    <Link
                        href="/"
                        className="btn-primary inline-flex items-center gap-2 text-lg py-4 px-10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go to Home
                    </Link>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-32 pb-20 px-4 relative overflow-hidden">
            <BackgroundDecoration />

            <div className="container mx-auto max-w-3xl relative">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-10"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                                <History className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My History</h1>
                        </div>
                        <p className="text-gray-500 ml-13">Track your PDF actions across sessions</p>
                    </div>
                    {history.length > 0 && (
                        <motion.button
                            onClick={clearHistory}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </motion.button>
                    )}
                </motion.div>

                {/* History List */}
                {history.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-gradient-to-b from-gray-50 to-white rounded-3xl border border-gray-100"
                    >
                        <motion.div
                            className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Clock className="w-10 h-10 text-gray-400" />
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-3">No activity yet</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Your PDF actions will appear here once you start using our tools.
                        </p>
                        <Link
                            href="/"
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Explore Tools
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                    >
                        {/* Timeline line */}
                        <div className="absolute left-8 top-48 bottom-32 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-transparent hidden md:block" />

                        <AnimatePresence>
                            {history.map((item: HistoryItem, index: number) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                                    className="group relative"
                                >
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[3px] top-6 w-2 h-2 bg-black rounded-full hidden md:block group-hover:scale-150 transition-transform" />

                                    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500 group-hover:-translate-y-1">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                                                <FileText className="w-6 h-6" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-semibold text-black">{item.action}</span>
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                                        {formatDate(item.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 font-medium truncate">{item.fileName}</p>
                                                <p className="text-gray-400 text-sm mt-1">{item.details}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Bottom CTA */}
                {history.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-12"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Tools
                        </Link>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
