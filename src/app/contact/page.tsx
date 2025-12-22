"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, MessageSquare, Clock, Send, ArrowLeft, Github, Linkedin, Twitter, MapPin } from "lucide-react";
import { useState } from "react";

const contactMethods = [
    {
        icon: Mail,
        title: "Email",
        description: "Best for detailed inquiries",
        value: "Arshverma.dev@gmail.com",
        href: "mailto:Arshverma.dev@gmail.com",
        color: "hover:bg-red-50 hover:border-red-200"
    },
    {
        icon: Twitter,
        title: "X (Twitter)",
        description: "Quick questions & updates",
        value: "@TheArshVerma",
        href: "https://x.com/TheArshVerma",
        color: "hover:bg-gray-100 hover:border-gray-300"
    },
    {
        icon: Linkedin,
        title: "LinkedIn",
        description: "Professional inquiries",
        value: "linkedin.com/in/arshvermadev",
        href: "https://www.linkedin.com/in/arshvermadev/",
        color: "hover:bg-blue-50 hover:border-blue-200"
    },
    {
        icon: Github,
        title: "GitHub",
        description: "Bug reports & contributions",
        value: "github.com/ArshVermaGit",
        href: "https://github.com/ArshVermaGit",
        color: "hover:bg-gray-100 hover:border-gray-300"
    }
];

const faqs = [
    {
        q: "How quickly will I get a response?",
        a: "I typically respond within 24-48 hours for email inquiries. For urgent matters, Twitter/X DMs usually get faster responses."
    },
    {
        q: "Can I request new features?",
        a: "Absolutely! I love hearing feature suggestions. Send them via email or create an issue on GitHub."
    },
    {
        q: "Is SimplyPDF open source?",
        a: "The core functionality uses open-source libraries. For full source access or collaboration opportunities, please reach out directly."
    }
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Create mailto link with form data
        const mailtoLink = `mailto:Arshverma.dev@gmail.com?subject=${encodeURIComponent(formData.subject || "SimplyPDF Contact")}&body=${encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
        )}`;

        window.location.href = mailtoLink;

        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1000);
    };

    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-20 right-10 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-20 left-10 w-72 h-72 bg-gray-50 rounded-full blur-3xl opacity-60" />
            </div>

            <div className="container mx-auto max-w-5xl">
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
                        <MessageSquare className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Have a question, feedback, or just want to say hi? I&apos;d love to hear from you.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Methods */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-2xl font-bold mb-6">Reach Out Directly</h2>
                        <div className="space-y-4">
                            {contactMethods.map((method, index) => (
                                <motion.a
                                    key={method.title}
                                    href={method.href}
                                    target={method.href.startsWith("mailto") ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + index * 0.05 }}
                                    className={`flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 transition-all duration-300 group ${method.color}`}
                                >
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <method.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{method.title}</span>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {method.description}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">{method.value}</p>
                                    </div>
                                </motion.a>
                            ))}
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

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 bg-green-50 rounded-2xl border border-green-200"
                            >
                                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-green-800 mb-2">Email Client Opened!</h3>
                                <p className="text-green-700 mb-6">Please send the email from your mail application.</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-green-700 underline hover:no-underline"
                                >
                                    Send another message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Your Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        placeholder="What's this about?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
                                        placeholder="Tell me what's on your mind..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Opening Email...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20"
                >
                    <h2 className="text-2xl font-bold mb-8 text-center">Common Questions</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 + index * 0.05 }}
                                className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                            >
                                <h3 className="font-semibold mb-3">{faq.q}</h3>
                                <p className="text-gray-500 text-sm">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-16 text-center p-10 bg-black text-white rounded-3xl"
                >
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Need Help with PDF Tools?
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                        Check out our FAQ page for answers to common questions about using SimplyPDF tools.
                    </p>
                    <Link href="/faq" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                        Visit FAQ
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
