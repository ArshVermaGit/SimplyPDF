"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Linkedin,
  Github,
  Twitter,
  ExternalLink,
  LucideIcon,
} from "lucide-react";
import { aboutSocials } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Email: Mail,
  LinkedIn: Linkedin,
  GitHub: Github,
  "X (Twitter)": Twitter,
};

export const AboutConnect = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <h2 className="mb-8 text-center text-2xl font-bold">
        Let&apos;s Connect
      </h2>
      <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
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
              className={`group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 ${social.color}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 transition-transform group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{social.name}</p>
                <p className="truncate text-sm text-gray-500">{social.label}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-current" />
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
};
