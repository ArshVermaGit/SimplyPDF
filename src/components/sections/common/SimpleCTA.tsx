"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

interface SimpleCTAProps {
  title: string;
  description: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  primaryBtnIcon?: typeof ArrowRight | typeof Mail;
  primaryBtnClass?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  secondaryBtnClass?: string;
  className?: string;
  delay?: number;
}

export const SimpleCTA = ({
  title,
  description,
  primaryBtnText,
  primaryBtnLink,
  primaryBtnIcon: PrimaryIcon,
  primaryBtnClass = "btn-primary",
  secondaryBtnText,
  secondaryBtnLink,
  secondaryBtnClass = "btn-secondary",
  className = "",
}: SimpleCTAProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`mt-16 rounded-3xl bg-gray-50 p-10 text-center ${className}`}
    >
      <h2 className="mb-4 text-2xl font-bold md:text-3xl">{title}</h2>
      <p className="mx-auto mb-8 max-w-lg text-gray-500">{description}</p>
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Link
          href={primaryBtnLink}
          className={`${primaryBtnClass} inline-flex items-center justify-center gap-2`}
        >
          {PrimaryIcon && <PrimaryIcon className="h-4 w-4" />}
          {primaryBtnText}
        </Link>
        {secondaryBtnText && secondaryBtnLink && (
          <Link
            href={secondaryBtnLink}
            className={`${secondaryBtnClass} inline-flex items-center justify-center gap-2`}
          >
            {secondaryBtnText}
          </Link>
        )}
      </div>
    </motion.div>
  );
};
