"use client";

import { motion } from "framer-motion";
import { Clock, Mail, Twitter, Linkedin, Github, LucideIcon } from "lucide-react";
import { contactMethods } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
    "Email": Mail,
    "X (Twitter)": Twitter,
    "LinkedIn": Linkedin,
    "GitHub": Github,
};

export const ContactMethods = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
        >
            <h2 className="text-2xl font-bold mb-6">Reach Out Directly</h2>
            <div className="space-y-4">
                {contactMethods.map((method, index) => {
                    const Icon = iconMap[method.name] || Mail;
                    return (
                        <motion.a
                            key={method.name}
                            href={method.href}
                            target={method.href.startsWith("mailto") ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.05 }}
                            className={`flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 transition-all duration-300 group ${method.color}`}
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{method.name}</span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {method.description}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mt-1">{method.value}</p>
                            </div>
                        </motion.a>
                    );
                })}
            </div>

            {/* Response Time Notice */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-5 bg-gray-50 rounded-2xl"
            >
                <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <h3 className="font-semibold mb-1">Response Time</h3>
                        <p className="text-sm text-gray-500">
                            I usually respond within 24-48 hours. For urgent matters,
                            please mention &quot;URGENT&quot; in your subject line.
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
