"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  HelpCircle,
  ArrowLeft,
  Mail,
  MessageCircle,
  FileQuestion,
  BookOpen,
} from "lucide-react";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

const supportOptions = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help from our team via email.",
    action: "Send Email",
    href: "mailto:arshverma.dev@gmail.com",
  },
  {
    icon: MessageCircle,
    title: "Contact Form",
    description: "Submit a request through our contact form.",
    action: "Open Form",
    href: "/contact",
  },
  {
    icon: FileQuestion,
    title: "FAQs",
    description: "Find answers to commonly asked questions.",
    action: "View FAQs",
    href: "/faq",
  },
];

export default function SupportClient() {
  return (
    <main className="min-h-screen px-4 pt-32 pb-20">
      <BackgroundGradient />

      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-black text-white">
            <HelpCircle className="h-10 w-10" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Support Center
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Need help with SimplyPDF? We&apos;re here to assist you.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {supportOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="rounded-2xl border border-gray-100 bg-white p-8 text-center transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
            >
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <option.icon className="h-7 w-7" />
              </div>
              <h2 className="mb-3 text-xl font-bold">{option.title}</h2>
              <p className="mb-6 text-sm text-gray-500">{option.description}</p>
              <Link
                href={option.href}
                className="inline-flex w-full items-center justify-center rounded-xl bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                {option.action}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mt-12 overflow-hidden rounded-4xl bg-gray-900 p-10 text-center text-white"
        >
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-2xl font-bold">Help Documentation</h2>
            <p className="mx-auto mb-8 max-w-lg text-gray-400">
              Coming soon: Comprehensive guides and tutorials to help you master
              every SimplyPDF tool.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
