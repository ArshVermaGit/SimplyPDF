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
    delay = 0.5
}: SimpleCTAProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`mt-16 text-center p-10 bg-gray-50 rounded-3xl ${className}`}
        >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {title}
            </h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={primaryBtnLink} className={`${primaryBtnClass} inline-flex items-center gap-2 justify-center`}>
                    {PrimaryIcon && <PrimaryIcon className="w-4 h-4" />}
                    {primaryBtnText}
                </Link>
                {secondaryBtnText && secondaryBtnLink && (
                    <Link href={secondaryBtnLink} className={`${secondaryBtnClass} inline-flex items-center gap-2 justify-center`}>
                        {secondaryBtnText}
                    </Link>
                )}
            </div>
        </motion.div>
    );
};
