"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Scale, AlertTriangle, Users, Globe, Gavel, ArrowLeft } from "lucide-react";

const sections = [
    {
        icon: FileText,
        title: "1. Acceptance of Terms",
        content: `By accessing and using SimplyPDF ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.

These terms apply to all visitors, users, and others who access or use the Service. We reserve the right to modify these terms at any time. Continued use of the Service after any changes constitutes acceptance of the new terms.`
    },
    {
        icon: Globe,
        title: "2. Description of Service",
        content: `SimplyPDF provides free online tools for PDF manipulation, including but not limited to:

• Merging multiple PDF files into one document
• Splitting PDF documents into separate files
• Compressing PDF files to reduce size
• Converting between PDF and other formats (JPG, Word, Excel)
• Rotating, organizing, and editing PDF pages
• Adding watermarks and signatures to PDFs
• Password protecting and unlocking PDFs
• Extracting text from scanned documents (OCR)

**Important:** All file processing occurs locally in your web browser. Files are not uploaded to our servers.`
    },
    {
        icon: Users,
        title: "3. User Responsibilities",
        content: `When using SimplyPDF, you agree to:

**Lawful Use:**
• Use the Service only for lawful purposes
• Not process documents that infringe on others' intellectual property rights
• Not use the Service to create, distribute, or process illegal content

**Appropriate Conduct:**
• Not attempt to interfere with or disrupt the Service
• Not attempt to access systems or data you're not authorized to access
• Not use automated systems or software to extract data from the Service

**Your Files:**
• You are solely responsible for the files you process
• You must have the legal right to modify any documents you upload
• We are not responsible for the content of your files`
    },
    {
        icon: Scale,
        title: "4. Intellectual Property",
        content: `**Our Content:**
The SimplyPDF name, logo, and all associated graphics, code, and content are protected by intellectual property laws. You may not copy, modify, or distribute our proprietary content without written permission.

**Your Content:**
You retain all rights to your PDF files and documents. By using our Service, you do not grant us any rights to your content. Since all processing happens in your browser, we never have access to your files.

**Open Source:**
SimplyPDF uses various open-source libraries. These libraries retain their respective licenses and attributions.`
    },
    {
        icon: AlertTriangle,
        title: "5. Disclaimer of Warranties",
        content: `**AS-IS Service:**
SimplyPDF is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:

• Implied warranties of merchantability
• Fitness for a particular purpose
• Non-infringement
• Accuracy or completeness of results

**No Guarantees:**
We do not guarantee that:
• The Service will be uninterrupted or error-free
• Results will meet your specific requirements
• Any errors will be corrected
• The Service will be compatible with all systems

**Backup Responsibility:**
Always keep backup copies of your original files. We are not responsible for any data loss.`
    },
    {
        icon: Gavel,
        title: "6. Limitation of Liability",
        content: `**Maximum Liability:**
To the maximum extent permitted by law, SimplyPDF and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:

• Loss of profits or revenue
• Loss of data or documents
• Business interruption
• Any other intangible losses

This applies regardless of whether we were advised of the possibility of such damages.

**Your Sole Remedy:**
Your sole remedy for dissatisfaction with the Service is to stop using it.`
    },
    {
        icon: FileText,
        title: "7. Modifications to Service",
        content: `We reserve the right to:

• Modify or discontinue any part of the Service at any time
• Update features, tools, or functionality without notice
• Change these Terms of Service with notice posted on this page

We are not liable to you or any third party for any modification, suspension, or discontinuance of the Service.`
    },
    {
        icon: Globe,
        title: "8. Governing Law",
        content: `These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.

Any disputes arising from these terms or your use of the Service shall be resolved in the courts of India.

If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full effect.`
    }
];

export default function TermsPage() {
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
                        <Scale className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Please read these terms carefully before using SimplyPDF.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                        Last updated: December 22, 2024
                    </p>
                </motion.div>

                {/* Quick Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12"
                >
                    <h3 className="font-bold text-lg text-blue-800 mb-3">Quick Summary</h3>
                    <ul className="space-y-2 text-blue-700">
                        <li>• SimplyPDF is a free service for PDF manipulation</li>
                        <li>• All processing happens in your browser - we never access your files</li>
                        <li>• You&apos;re responsible for having rights to the documents you process</li>
                        <li>• The service is provided as-is without warranties</li>
                        <li>• Always keep backups of your original files</li>
                    </ul>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.03 }}
                            className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <section.icon className="w-5 h-5" />
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

                {/* Contact for Questions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center p-8 bg-gray-50 rounded-2xl"
                >
                    <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
                    <p className="text-gray-500 mb-6 max-w-lg mx-auto">
                        If you have any questions about these Terms of Service, please contact us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/contact" className="btn-primary">
                            Contact Us
                        </Link>
                        <Link href="/privacy" className="btn-secondary">
                            Privacy Policy
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
