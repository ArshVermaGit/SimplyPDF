"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  href,
}: ToolCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group border-border hover:shadow-primary/10 hover:border-primary/30 relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-2xl"
      >
        {/* Gradient overlay on hover */}
        <div className="from-primary/5 pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10">
          <div className="tool-icon mb-5">
            <Icon className="h-7 w-7" />
          </div>
          <h3 className="text-foreground group-hover:text-primary mb-2 text-lg font-bold transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="bg-primary/10 absolute right-4 bottom-4 flex h-8 w-8 translate-x-2 transform items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <svg
            className="text-primary h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </motion.div>
    </Link>
  );
}
