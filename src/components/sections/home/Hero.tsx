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
      className="relative min-h-screen flex items-center justify-center px-4"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-gray-100 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-50 rounded-full blur-3xl animate-float" />

      {/* Floating Icons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-32 left-[15%] hidden lg:block"
      >
        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-float">
          <FileText className="w-8 h-8" />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="absolute top-48 right-[12%] hidden lg:block"
      >
        <div className="w-20 h-20 bg-black text-white rounded-2xl shadow-xl flex items-center justify-center animate-float-slow">
          <Merge className="w-10 h-10" />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="absolute bottom-40 left-[20%] hidden lg:block"
      >
        <div className="w-14 h-14 bg-gray-100 rounded-xl shadow-lg flex items-center justify-center animate-float">
          <ImageIcon className="w-7 h-7" />
        </div>
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            100% Free & Privacy First
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[0.95]"
        >
          Every PDF Tool
          <br />
          <span className="animate-text-shimmer">You&apos;ll Ever Need</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10"
        >
          Merge, split, compress, convert — do everything with your PDFs.
          All processing happens in your browser. Your files never leave your device.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/merge-pdf" className="btn-primary text-lg px-10 py-4 inline-flex items-center justify-center gap-2 group">
            Get Started
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="#tools" className="btn-secondary text-lg px-10 py-4 inline-flex items-center justify-center">
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
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-bounce" />
        </div>
      </motion.div>
    </motion.section>
  );
};
