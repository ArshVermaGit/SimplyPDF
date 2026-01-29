"use client";

import { motion } from "framer-motion";

export const AboutPhilosophy = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-20 py-12 px-8 bg-black text-white rounded-3xl text-center relative overflow-hidden"
        >
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>
            <div className="relative z-10">
                <p className="text-2xl md:text-3xl font-medium leading-relaxed max-w-3xl mx-auto">
                    &ldquo;I love the challenge of coding and design, focusing on creating
                    seamless user experiences across all platforms.&rdquo;
                </p>
                <p className="text-gray-400 mt-6">— My Development Philosophy</p>
            </div>
        </motion.div>
    );
};
