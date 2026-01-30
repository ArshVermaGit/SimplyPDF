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
      <h2 className="mb-8 text-center text-2xl font-bold">What I Do</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {aboutSkills.map((skill, index) => {
          const Icon = iconMap[skill.label] || Code2;
          return (
            <motion.div
              key={skill.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 transition-all group-hover:bg-black group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-1 font-semibold">{skill.label}</h3>
              <p className="text-sm text-gray-500">{skill.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
