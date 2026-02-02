"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin, ArrowUpRight } from "lucide-react";

const product = [
  { title: "Features", href: "/features" },
  { title: "How It Works", href: "/how-it-works" },
];

const legal = [
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms of Service", href: "/terms" },
  { title: "Disclaimer", href: "/disclaimer" },
  { title: "Cookie Policy", href: "/cookie-policy" },
];

const company = [
  { title: "About Us", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Support", href: "/support" },
  { title: "FAQ", href: "/faq" },
  { title: "Changelog", href: "/changelog" },
  { title: "Sitemap", href: "/all-tools" },
];

const socials = [
  { icon: Twitter, href: "https://x.com/TheArshVerma", label: "Twitter" },
  {
    icon: Github,
    href: "https://github.com/ArshVermaGit/SimplyPDF",
    label: "GitHub",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/arshvermadev/",
    label: "LinkedIn",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="group mb-6 flex items-center gap-2">
              <div className="relative h-10 w-10 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Image
                  src="/logo-new.png"
                  alt="SimplyPDF Logo"
                  fill
                  className="rounded-xl bg-white object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Simply<span className="text-gray-400">PDF</span>
              </span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Free online PDF tools for everyone. Process files securely in your
              browser — your files never leave your device.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="mb-6 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Product
            </h4>
            <ul className="space-y-3">
              {product.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1 text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    {item.title}
                    <ArrowUpRight className="h-3 w-3 translate-x-1 -translate-y-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="mb-6 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Legal
            </h4>
            <ul className="space-y-3">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="mb-6 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Company
            </h4>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="mb-3 text-sm font-semibold">Stay Updated</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-l-lg border border-white/10 bg-white/10 px-4 py-2.5 text-sm transition-colors focus:border-white/30 focus:outline-none"
                />
                <button className="rounded-r-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-6 text-sm text-gray-400 md:flex-row md:gap-12">
            {/* Copyright & GitHub */}
            <div className="flex items-center gap-6">
              <span>© {currentYear} SimplyPDF. All rights reserved.</span>
              <a
                href="https://github.com/ArshVermaGit/SimplyPDF"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>

            {/* Signature */}
            <div className="text-center">
              <p className="text-gray-500 text-sm tracking-wide">
                Built with{" "}
                <span className="text-rose-500 inline-block animate-pulse">
                  ❤️
                </span>{" "}
                by{" "}
                <span className="font-black text-white ml-1">Arsh Verma</span>
              </p>
            </div>

            {/* Processing Indicator */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 shadow-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="font-medium text-xs md:text-sm">
                Processing 100% locally in your browser
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
