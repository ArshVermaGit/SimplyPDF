"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Lock, Eye, Server, Cookie, Mail, ArrowLeft, Users, AlertTriangle } from "lucide-react";

const sections = [
    {
        icon: Eye,
        title: "Information We Collect",
        content: `SimplyPDF is designed with privacy as a core principle. We collect minimal information:

**Automatically Collected:**
- Basic analytics data (page views, browser type, device type) through cookies
- IP addresses for analytics and fraud prevention
- Error logs to improve our service

**What We DON'T Collect:**
- Your PDF files or their contents
- Personal documents or data within your files
- Any file metadata

All PDF processing happens directly in your browser. Your files never leave your device or get uploaded to our servers.`
    },
    {
        icon: Server,
        title: "How We Process Your Files",
        content: `**100% Browser-Based Processing**

Unlike other PDF tools, SimplyPDF processes all files locally in your web browser using JavaScript. This means:

- Your files are NEVER uploaded to any server
- Processing happens entirely on your device
- Files are automatically cleared from browser memory when you close the tab
- No copies of your documents are ever made or stored

This architecture ensures complete privacy and security for sensitive documents like contracts, financial statements, or personal records.`
    },
    {
        icon: Cookie,
        title: "Cookies and Tracking Technologies",
        content: `We and our advertising partners use cookies, web beacons, and similar technologies for:

**Essential Cookies:**
- Session management and user preferences
- Authentication state (if you sign in with Google)

**Analytics Cookies:**
- Google Analytics to understand how visitors use our site
- This helps us improve the user experience

**Advertising Cookies:**
- Google AdSense to display advertisements on our site
- Third parties, including Google, use cookies to serve ads based on your prior visits to this website or other websites
- These cookies enable Google and its partners to serve ads based on your visit to our site and/or other sites on the Internet

**How Google Uses Your Data:**
When you visit our site, third parties including Google may place and read cookies on your browser, or use web beacons to collect information. To learn more about how Google uses data when you use our site, visit: https://policies.google.com/technologies/partner-sites

**Managing Cookie Preferences:**
You can control cookie preferences through your browser settings. You may also opt out of personalized advertising by visiting Google's Ads Settings (https://adssettings.google.com) or by visiting https://www.aboutads.info to opt out of third-party advertising cookies. Disabling cookies may affect some functionality.`
    },
    {
        icon: Shield,
        title: "Third-Party Services & Advertising",
        content: `We integrate with the following third-party services:

**Google AdSense (Advertising):**
- We use Google AdSense to display advertisements
- Google and its partners use cookies to serve ads based on your prior visits to this or other websites
- You may opt out of personalized advertising by visiting Google's Ads Settings
- For more information about how Google collects and uses data, see: https://policies.google.com/technologies/partner-sites

**Google Analytics:**
- Used for website analytics and understanding user behavior
- Google's privacy policy applies to data collected through Analytics
- We use analytics to improve our service, not for advertising purposes

**Google Sign-In:**
- Optional authentication service
- We only receive your name, email, and profile picture when you choose to sign in
- We do not sell, trade, or transfer your personal information

**Interest-Based Advertising:**
We participate in interest-based advertising using Google AdSense. This means ads may be tailored based on your browsing history. You can learn more about this type of advertising and your choices at:
- Digital Advertising Alliance: https://www.aboutads.info
- Network Advertising Initiative: https://www.networkadvertising.org`
    },
    {
        icon: Users,
        title: "Children's Privacy (COPPA Compliance)",
        content: `**Age Restriction:**
SimplyPDF is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.

**COPPA Compliance:**
In compliance with the Children's Online Privacy Protection Act (COPPA):
- We do not target or collect data from users under 13 years of age
- We do not use interest-based advertising to target children under 13
- If we become aware that we have inadvertently collected personal information from a child under 13, we will take steps to delete that information

**Parental Rights:**
If you are a parent or guardian and believe your child has provided us with personal information, please contact us at Arshverma.dev@gmail.com so we can delete the information.

**Note for Parents:**
We recommend parents supervise their children's online activities and consider using parental control tools available from online services and software manufacturers.`
    },
    {
        icon: Lock,
        title: "Data Security",
        content: `We implement security measures to protect your information:

- HTTPS encryption for all data transmission
- No server-side storage of user files
- Regular security audits of our codebase
- Secure authentication through Google OAuth

Since files are processed locally in your browser, the primary security consideration is your own device's security.`
    },
    {
        icon: Mail,
        title: "Your Rights & Choices",
        content: `You have the right to:

**Access:** Request information about data we hold about you
**Deletion:** Request deletion of your account and associated data
**Opt-out:** Disable cookies and tracking through browser settings
**Portability:** Export your history data (if signed in)
**Advertising Opt-out:** Opt out of personalized advertising through Google's Ads Settings

**For EU/EEA Users (GDPR):**
You have additional rights including the right to object to processing, right to rectification, and right to lodge a complaint with a supervisory authority.

**For California Users (CCPA):**
You have the right to know what personal information is collected, request deletion, and opt-out of the sale of personal information (we do not sell personal information).

To exercise any of these rights, contact us at: Arshverma.dev@gmail.com`
    },
    {
        icon: AlertTriangle,
        title: "Policy Updates",
        content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.

You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.

**Contact Us:**
If you have any questions about this Privacy Policy, please contact us at:
- Email: Arshverma.dev@gmail.com
- Website: https://simplypdf.vercel.app/contact`
    }
];

export default function PrivacyPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-20 right-10 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-20 left-10 w-72 h-72 bg-gray-50 rounded-full blur-3xl opacity-60" />
            </div>

            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Your privacy matters to us. Learn how SimplyPDF protects your data and respects your rights.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                        Last updated: December 22, 2024
                    </p>
                </motion.div>

                {/* Key Privacy Highlight */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-12"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center shrink-0">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-green-800 mb-2">
                                Your Files Never Leave Your Device
                            </h3>
                            <p className="text-green-700">
                                All PDF processing happens directly in your browser. We never upload, store, or access your files. This is the core of our privacy-first approach.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Google Data Usage Link - Required by AdSense */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0">
                            <Eye className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-blue-800 mb-2">
                                How Google Uses Your Data
                            </h3>
                            <p className="text-blue-700 mb-3">
                                We use Google AdSense to display ads on our website. Google and its partners may use cookies to serve ads based on your prior visits to this or other websites.
                            </p>
                            <a
                                href="https://policies.google.com/technologies/partner-sites"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                            >
                                Learn how Google uses data when you use our site →
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Sections */}
                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                                    <div className="prose prose-gray max-w-none">
                                        {section.content.split('\n\n').map((paragraph, pIdx) => (
                                            <p key={pIdx} className="text-gray-600 mb-4 last:mb-0 whitespace-pre-line">
                                                {paragraph.split('**').map((part, partIdx) =>
                                                    partIdx % 2 === 1 ? <strong key={partIdx} className="text-black">{part}</strong> : part
                                                )}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center p-8 bg-gray-50 rounded-2xl"
                >
                    <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
                    <p className="text-gray-500 mb-6 max-w-lg mx-auto">
                        If you have any questions or concerns about our privacy practices, please don&apos;t hesitate to reach out.
                    </p>
                    <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Contact Us
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
