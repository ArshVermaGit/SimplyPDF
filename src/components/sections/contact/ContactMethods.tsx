"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Mail,
  Twitter,
  Linkedin,
  Github,
  LucideIcon,
} from "lucide-react";
import { contactMethods } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Email: Mail,
  "X (Twitter)": Twitter,
  LinkedIn: Linkedin,
  GitHub: Github,
};

export const ContactMethods = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h2 className="mb-6 text-2xl font-bold">Reach Out Directly</h2>
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
              className={`group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 ${method.color}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{method.name}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                    {method.description}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{method.value}</p>
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
        className="mt-8 rounded-2xl bg-gray-50 p-5"
      >
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
          <div>
            <h3 className="mb-1 font-semibold">Response Time</h3>
            <p className="text-sm text-gray-500">
              I usually respond within 24-48 hours. For urgent matters, please
              mention &quot;URGENT&quot; in your subject line.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
