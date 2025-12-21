"use client";

import { useAuth } from "@/context/AuthProvider";
import Link from "next/link";
import { Clock, History, LogOut, X } from "lucide-react";
import { useHistory, HistoryItem } from "@/context/HistoryContext";
import { motion, AnimatePresence } from "framer-motion";

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
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    // Not logged in state
    if (!user) {
        return (
            <main className="min-h-screen pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-2xl text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <History className="w-10 h-10 text-gray-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Sign in to view your history</h1>
                    <p className="text-gray-500 mb-8">
                        Sign in with Google to track your PDF actions and access them anytime.
                    </p>
                    <Link href="/" className="btn-primary inline-flex items-center gap-2">
                        Go to Home
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            <div className="container mx-auto max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My History</h1>
                        <p className="text-gray-500">Track your PDF actions across sessions</p>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>

                {/* History List */}
                {history.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
                        <p className="text-gray-500 mb-6">
                            Your PDF actions will appear here once you start using our tools.
                        </p>
                        <Link href="/" className="btn-primary inline-flex items-center gap-2">
                            Explore Tools
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {history.map((item: HistoryItem, index: number) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-black">{item.action}</span>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {formatDate(item.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm">{item.fileName}</p>
                                            <p className="text-gray-400 text-xs mt-1">{item.details}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </main>
    );
}
