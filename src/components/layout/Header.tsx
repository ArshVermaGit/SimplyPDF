"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Merge,
  Split,
  Minimize2,
  RotateCw,
  Image,
  FileImage,
  Lock,
  Unlock,
  Layers,
  Stamp,
  ChevronDown,
} from "lucide-react";

const tools = [
  { title: "Merge PDF", icon: Merge, href: "/merge-pdf" },
  { title: "Split PDF", icon: Split, href: "/split-pdf" },
  { title: "Compress", icon: Minimize2, href: "/compress-pdf" },
  { title: "Rotate", icon: RotateCw, href: "/rotate-pdf" },
  { title: "JPG to PDF", icon: Image, href: "/jpg-to-pdf" },
  { title: "PDF to JPG", icon: FileImage, href: "/pdf-to-jpg" },
  { title: "Unlock", icon: Unlock, href: "/unlock-pdf" },
  { title: "Protect", icon: Lock, href: "/protect-pdf" },
  { title: "Organize", icon: Layers, href: "/organize-pdf" },
  { title: "Watermark", icon: Stamp, href: "/watermark-pdf" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
        : "bg-transparent"
        }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-110 group-hover:rotate-3">
              S
            </div>
            <span className="text-xl font-bold tracking-tight">
              Simply<span className="text-gray-400">PDF</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowTools(true)}
              onMouseLeave={() => setShowTools(false)}
            >
              <button className="flex items-center gap-1 font-medium text-gray-700 hover:text-black transition-colors underline-hover py-2">
                All Tools
                <ChevronDown className={`w-4 h-4 transition-transform ${showTools ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showTools && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[480px] grid grid-cols-2 gap-2">
                      {tools.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                            <tool.icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-sm">{tool.title}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/merge-pdf" className="font-medium text-gray-700 hover:text-black transition-colors underline-hover">
              Merge
            </Link>
            <Link href="/split-pdf" className="font-medium text-gray-700 hover:text-black transition-colors underline-hover">
              Split
            </Link>
            <Link href="/compress-pdf" className="font-medium text-gray-700 hover:text-black transition-colors underline-hover">
              Compress
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/merge-pdf" className="btn-primary py-2.5 px-6 text-sm">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="relative w-6 h-6">
              <span
                className={`absolute left-0 w-6 h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1"
                  }`}
              />
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
              />
              <span
                className={`absolute left-0 w-6 h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-1"
                  }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 gap-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <tool.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{tool.title}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/merge-pdf"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
