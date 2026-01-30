"use client";

import { useAuth } from "@/context/AuthProvider";
import Link from "next/link";
import {
  Clock,
  History,
  ArrowLeft,
  Trash2,
  FileText,
  Sparkles,
} from "lucide-react";
import { useHistory, HistoryItem } from "@/context/HistoryContext";
import { motion, AnimatePresence } from "framer-motion";

// Background decoration component
const BackgroundDecoration = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="grid-pattern absolute inset-0 opacity-30" />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      className="absolute top-20 right-10 h-[400px] w-[400px] rounded-full bg-linear-to-bl from-gray-100 to-transparent blur-3xl"
    />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ delay: 0.2 }}
      className="absolute bottom-20 left-10 h-[300px] w-[300px] rounded-full bg-linear-to-tr from-gray-50 to-transparent blur-3xl"
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
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Not logged in state
  if (!user) {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 pt-32 pb-20">
        <BackgroundDecoration />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto max-w-2xl text-center"
        >
          <motion.div
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-gray-100 to-gray-50 shadow-xl shadow-gray-200/50"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <History className="h-12 w-12 text-gray-400" />
          </motion.div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Sign in to view your history
          </h1>
          <p className="mx-auto mb-10 max-w-md text-lg text-gray-500">
            Sign in with Google to track your PDF actions and access them
            anytime.
          </p>
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Go to Home
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pt-32 pb-20">
      <BackgroundDecoration />

      <div className="relative container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <History className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                My History
              </h1>
            </div>
            <p className="ml-13 text-gray-500">
              Track your PDF actions across sessions
            </p>
          </div>
          {history.length > 0 && (
            <motion.button
              onClick={clearHistory}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-500 transition-all duration-300 hover:bg-red-50 hover:text-red-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </motion.button>
          )}
        </motion.div>

        {/* History List */}
        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-gray-100 bg-linear-to-b from-gray-50 to-white py-20 text-center"
          >
            <motion.div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-gray-100 to-gray-50"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Clock className="h-10 w-10 text-gray-400" />
            </motion.div>
            <h3 className="mb-3 text-2xl font-bold">No activity yet</h3>
            <p className="mx-auto mb-8 max-w-sm text-gray-500">
              Your PDF actions will appear here once you start using our tools.
            </p>
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
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
            <div className="absolute top-48 bottom-32 left-8 hidden w-px bg-linear-to-b from-gray-200 via-gray-300 to-transparent md:block" />

            <AnimatePresence>
              {history.map((item: HistoryItem) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute top-6 -left-[3px] hidden h-2 w-2 rounded-full bg-black transition-transform group-hover:scale-150 md:block" />

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-500 group-hover:-translate-y-1 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 transition-colors duration-300 group-hover:bg-black group-hover:text-white">
                        <FileText className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-3">
                          <span className="font-semibold text-black">
                            {item.action}
                          </span>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-400">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        <p className="truncate font-medium text-gray-700">
                          {item.fileName}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          {item.details}
                        </p>
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
            className="mt-12 text-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
