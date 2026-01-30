"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Mail } from "lucide-react";

export const AboutHero = () => {
  return (
    <div className="mb-20 grid items-center gap-12 lg:grid-cols-2">
      {/* Photo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative order-2 lg:order-1"
      >
        <div className="relative mx-auto aspect-square w-full max-w-md">
          {/* Decorative elements */}
          <div className="rounded-5xl absolute -inset-4 -rotate-3 bg-linear-to-br from-gray-200 via-gray-100 to-white" />
          <div className="rounded-5xl absolute -inset-4 rotate-2 bg-linear-to-tr from-gray-100 via-white to-gray-50 opacity-80" />

          {/* Main photo container */}
          <div className="relative overflow-hidden rounded-4xl border-4 border-white shadow-2xl">
            <Image
              src="/arsh-verma.jpg"
              alt="Arsh Verma"
              width={500}
              height={500}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute -right-4 -bottom-4 rounded-2xl bg-black px-5 py-3 text-white shadow-xl"
          >
            <p className="text-sm font-medium">Full-Stack Creator</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="order-1 lg:order-2"
      >
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Developer & Creator
        </span>

        <h1 className="mb-6 text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Hi, I&apos;m <span className="animate-text-shimmer">Arsh Verma</span>
        </h1>

        <p className="mb-6 text-lg leading-relaxed text-gray-600">
          A <strong>Tech Gaming Technology</strong> student at VIT Bhopal and a
          full-stack digital creator. My expertise lies in game development with
          Unity, but I also build dynamic websites and apps.
        </p>

        <p className="mb-8 leading-relaxed text-gray-500">
          I&apos;ve earned numerous certifications and treat every project as an
          opportunity to blend creative vision with technical precision. My
          development philosophy is simple: turn great ideas into polished,
          engaging digital reality.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="https://arshcreates.vercel.app/"
            target="_blank"
            className="btn-primary inline-flex items-center gap-2"
          >
            View Portfolio
            <ExternalLink className="h-4 w-4" />
          </Link>
          <Link
            href="mailto:arshverma.dev@gmail.com"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Get in Touch
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
