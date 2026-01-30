"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export function Loader({ size = "md", className = "", text }: LoaderProps) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-gray-200 border-t-black`}
      />

      {text && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-sm font-medium text-gray-500">
            {text}
          </span>
        </motion.div>
      )}
    </div>
  );
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-white/60 backdrop-blur-3xl">
      {/* Minimalist Background Gradients */}
      <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-50 opacity-50 blur-[120px]" />

      <Loader size="xl" text={text || "Processing Document"} />
    </div>
  );
}
