"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { tools } from "@/lib/constants";
import { motion } from "framer-motion";

export const ToolsGrid = () => {
  const [showAll, setShowAll] = useState(false);
  const featuredTools = tools.filter((t) => t.featured);
  const otherTools = tools.filter((t) => !t.featured);

  const displayedOthers = showAll ? otherTools : otherTools.slice(0, 8);

  return (
    <section id="tools" className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 container mx-auto px-4">
        <div className="scroll-reveal mb-16 text-center">
          <div className="mb-6 inline-block rounded-full bg-gray-100 px-4 py-1.5 text-sm font-bold tracking-wider text-black uppercase">
            All-In-One Solution
          </div>
          <h2 className="mb-6 text-4xl font-black tracking-tight md:text-6xl">
            Powerful <span className="text-gray-400">PDF Tools</span>
          </h2>
          <p className="section-subtitle mx-auto text-xl font-medium italic">
            Everything you need to work with PDF files, completely free and 100%
            private.
          </p>
        </div>

        {/* Featured Bento Grid */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featuredTools.map((tool, index) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`tool-card group flex flex-col ${index === 0 ? "min-h-[400px] lg:col-span-2 lg:row-span-2" : "min-h-[220px]"}`}
            >
              <div
                className={`tool-icon ${index === 0 ? "h-20 w-20" : "h-14 w-14"} mb-6 transition-all duration-500 group-hover:bg-black group-hover:text-white`}
              >
                <tool.icon className={index === 0 ? "h-10 w-10" : "h-7 w-7"} />
              </div>
              <h3
                className={`mb-3 font-black tracking-tight ${index === 0 ? "text-4xl" : "text-xl"}`}
              >
                {tool.title}
              </h3>
              <p
                className={`font-medium text-gray-500 ${index === 0 ? "max-w-sm text-lg leading-relaxed" : "text-sm"}`}
              >
                {tool.description}
              </p>
              <div className="mt-auto flex items-center pt-6 text-sm font-black tracking-widest text-black/20 uppercase transition-colors group-hover:text-black">
                Open Tool{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </div>
            </Link>
          ))}
        </div>

        {/* Others Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayedOthers.map((tool) => (
            <motion.div
              key={tool.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
            >
              <Link
                href={tool.href}
                className="tool-card group flex h-full min-h-[220px] flex-col"
              >
                <div className="tool-icon mb-6 h-14 w-14 transition-all duration-500 group-hover:bg-black group-hover:text-white">
                  <tool.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-black tracking-tight">
                  {tool.title}
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  {tool.description}
                </p>
                <div className="mt-auto flex items-center pt-6 text-xs font-black tracking-widest text-black/10 uppercase transition-colors group-hover:text-black">
                  Open Tool{" "}
                  <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {otherTools.length > 8 && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group inline-flex items-center gap-2 rounded-full bg-black px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              {showAll ? "Show Less Tools" : "Explore All Tools"}
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-500 ${showAll ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
