"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { FileText, Merge, Image as ImageIcon, ArrowRight } from "lucide-react";

export const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <motion.section
      ref={heroRef}
      style={{ opacity: heroOpacity, scale: heroScale }}
      className="relative flex min-h-screen items-center justify-center px-4"
    >
      {/* Background Elements */}
      <div className="grid-pattern absolute inset-0" />
      <div className="animate-float-slow absolute top-20 left-10 h-72 w-72 rounded-full bg-gray-100 blur-3xl" />
      <div className="animate-float absolute right-10 bottom-20 h-96 w-96 rounded-full bg-gray-50 blur-3xl" />

      {/* Floating Icons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-32 left-[15%] hidden lg:block"
      >
        <div className="animate-float flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl">
          <FileText className="h-8 w-8" />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="absolute top-48 right-[12%] hidden lg:block"
      >
        <div className="animate-float-slow flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-white shadow-xl">
          <Merge className="h-10 w-10" />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="absolute bottom-40 left-[20%] hidden lg:block"
      >
        <div className="animate-float flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 shadow-lg">
          <ImageIcon className="h-7 w-7" />
        </div>
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="mb-8 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            100% Free & Privacy First
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6 text-5xl leading-[0.95] font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Every PDF Tool
          <br />
          <span className="animate-text-shimmer">You&apos;ll Ever Need</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-gray-500 md:text-xl"
        >
          Merge, split, compress, convert — do everything with your PDFs. All
          processing happens in your browser. Your files never leave your
          device.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/merge-pdf"
            className="btn-primary group inline-flex items-center justify-center gap-2 px-10 py-4 text-lg"
          >
            Get Started
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#tools"
            className="btn-secondary inline-flex items-center justify-center px-10 py-4 text-lg"
          >
            Explore Tools
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-gray-300 pt-2">
          <div className="h-3 w-1.5 animate-bounce rounded-full bg-gray-400" />
        </div>
      </motion.div>
    </motion.section>
  );
};
