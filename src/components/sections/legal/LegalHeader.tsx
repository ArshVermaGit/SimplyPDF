"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";

interface LegalHeaderProps {
  title: string;
  description: string;
  lastUpdated?: string;
  icon: LucideIcon;
}

export const LegalHeader = ({
  title,
  description,
  lastUpdated,
  icon: Icon,
}: LegalHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 text-center"
    >
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-black text-white">
        <Icon className="h-10 w-10" />
      </div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-gray-500">{description}</p>
      {lastUpdated && (
        <p className="mt-4 text-sm text-gray-400">
          Last updated: {lastUpdated}
        </p>
      )}
    </motion.div>
  );
};
