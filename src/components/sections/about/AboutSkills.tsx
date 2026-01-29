"use client";

import { motion } from "framer-motion";
import { Gamepad2, Globe, Code2, Sparkles, LucideIcon } from "lucide-react";
import { aboutSkills } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
    "Game Development": Gamepad2,
    "Web Development": Globe,
    "App Development": Code2,
    "Digital Creation": Sparkles,
};

export const AboutSkills = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
        >
            <h2 className="text-2xl font-bold mb-8 text-center">What I Do</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {aboutSkills.map((skill, index) => {
                    const Icon = iconMap[skill.label] || Code2;
                    return (
                        <motion.div
                            key={skill.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-all">
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-1">{skill.label}</h3>
                            <p className="text-sm text-gray-500">{skill.detail}</p>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};
