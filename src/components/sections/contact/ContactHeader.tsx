"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export const ContactHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
        <MessageSquare className="h-10 w-10" />
      </div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
        Get in Touch
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-gray-500">
        Have a question, feedback, or just want to say hi? I&apos;d love to hear
        from you.
      </p>
    </motion.div>
  );
};
