"use client";

import { motion } from "framer-motion";
import { Mail, Linkedin, Github, Twitter, ExternalLink, LucideIcon } from "lucide-react";
import { aboutSocials } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
    "Email": Mail,
    "LinkedIn": Linkedin,
    "GitHub": Github,
    "X (Twitter)": Twitter,
};

export const AboutConnect = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
        >
            <h2 className="text-2xl font-bold mb-8 text-center">Let&apos;s Connect</h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {aboutSocials.map((social, index) => {
                    const Icon = iconMap[social.name] || ExternalLink;
                    return (
                        <motion.a
                            key={social.name}
                            href={social.href}
                            target={social.href.startsWith("mailto") ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className={`flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white transition-all duration-300 group ${social.color}`}
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium">{social.name}</p>
                                <p className="text-sm text-gray-500 truncate">{social.label}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-current" />
                        </motion.a>
                    );
                })}
            </div>
        </motion.div>
    );
};
