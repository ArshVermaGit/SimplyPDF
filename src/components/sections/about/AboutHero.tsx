"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Mail } from "lucide-react";

export const AboutHero = () => {
    return (
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Photo */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative order-2 lg:order-1"
            >
                <div className="relative w-full max-w-md mx-auto aspect-square">
                    {/* Decorative elements */}
                    <div className="absolute -inset-4 bg-linear-to-br from-gray-200 via-gray-100 to-white rounded-5xl -rotate-3" />
                    <div className="absolute -inset-4 bg-linear-to-tr from-gray-100 via-white to-gray-50 rounded-5xl rotate-2 opacity-80" />

                    {/* Main photo container */}
                    <div className="relative rounded-4xl overflow-hidden shadow-2xl border-4 border-white">
                        <Image
                            src="/arsh-verma.jpg"
                            alt="Arsh Verma"
                            width={500}
                            height={500}
                            className="w-full h-full object-cover"
                            priority
                        />
                    </div>

                    {/* Floating badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="absolute -bottom-4 -right-4 bg-black text-white px-5 py-3 rounded-2xl shadow-xl"
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
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium mb-6">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Developer & Creator
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                    Hi, I&apos;m{" "}
                    <span className="animate-text-shimmer">Arsh Verma</span>
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    A <strong>Tech Gaming Technology</strong> student at VIT Bhopal and a
                    full-stack digital creator. My expertise lies in game development with
                    Unity, but I also build dynamic websites and apps.
                </p>

                <p className="text-gray-500 leading-relaxed mb-8">
                    I&apos;ve earned numerous certifications and treat every project as an
                    opportunity to blend creative vision with technical precision. My
                    development philosophy is simple: turn great ideas into polished,
                    engaging digital reality.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="https://arshcreates.vercel.app/"
                        target="_blank"
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        View Portfolio
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                        href="mailto:arshverma.dev@gmail.com"
                        className="btn-secondary inline-flex items-center gap-2"
                    >
                        <Mail className="w-4 h-4" />
                        Get in Touch
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};
