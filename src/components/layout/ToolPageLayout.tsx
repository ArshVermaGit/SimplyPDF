"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Download,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { FileUploader } from "../pdf/FileUploader";
import { downloadFile } from "@/lib/pdf-utils";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "../ui/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";

interface ToolPageLayoutProps {
  title: string;
  description: string;
  icon?: React.ElementType | React.ReactNode;
  accept?: string;
  multiple?: boolean;
  allowReorder?: boolean;
  actionButtonText: string;
  processingText: string;
  successTitle: string;
  successDescription: string;
  downloadFileName: string;
  onProcess: (files: File[]) => Promise<Blob | null>;
  historyAction?: string; // Optional action name for history

  // Educational content props
  howItWorks?: { title: string; steps: string[] };
  benefits?: { title: string; items: { title: string; desc: string }[] };
  faqs?: { question: string; answer: string }[];
}

// Success particles animation
const SuccessParticles = () => {
  const particles = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {particles.map((i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            x: Math.cos((i * 30 * Math.PI) / 180) * 100,
            y: Math.sin((i * 30 * Math.PI) / 180) * 100 - 50,
          }}
          transition={{
            duration: 1,
            delay: i * 0.05,
            ease: "easeOut",
          }}
          className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-black"
        />
      ))}
    </div>
  );
};

export function ToolPageLayout({
  title,
  description,
  icon,
  accept = ".pdf",
  multiple = false,
  allowReorder = false,
  actionButtonText,
  processingText,
  successTitle,
  successDescription,
  downloadFileName,
  onProcess,
  historyAction,
  howItWorks,
  benefits,
  faqs,
}: ToolPageLayoutProps) {
  const { addToHistory } = useHistory();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showParticles, setShowParticles] = useState(false);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const result = await onProcess(files);
      if (result) {
        setResultBlob(result);
        setStatus("success");
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 1500);

        // Add to history if historyAction is provided
        if (historyAction) {
          const details =
            files.length === 1
              ? "1 file processed"
              : `${files.length} files processed`;
          addToHistory(historyAction, downloadFileName, details);
        }
      } else {
        throw new Error("Processing failed");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (resultBlob) {
      downloadFile(resultBlob, downloadFileName);
    }
  };

  const reset = () => {
    setFiles([]);
    setStatus("idle");
    setResultBlob(null);
    setErrorMessage("");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden pt-24 pb-16">
      <AnimatedBackground />
      <FloatingDecorations />

      <div className="relative z-10 container mx-auto px-4">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}
              className="mx-auto max-w-4xl"
            >
              {/* Header */}
              <ToolHeader title={title} description={description} icon={icon} />

              {/* File Uploader Card */}
              <motion.div variants={itemVariants} className="relative">
                <ToolCard className="p-8 md:p-10">
                  <FileUploader
                    files={files}
                    onFilesChange={handleFilesChange}
                    accept={accept}
                    multiple={multiple}
                    allowReorder={allowReorder}
                  />

                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="mt-8 flex justify-center"
                    >
                      <motion.button
                        onClick={handleProcess}
                        className="group btn-primary relative flex items-center gap-3 px-12 py-4 text-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          {actionButtonText}
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </motion.button>
                    </motion.div>
                  )}
                </ToolCard>
              </motion.div>

              {/* Features */}
              <motion.div
                variants={itemVariants}
                className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3"
              >
                {[
                  {
                    icon: "🔒",
                    label: "100% Private",
                    desc: "Files never leave your device",
                  },
                  {
                    icon: "⚡",
                    label: "Lightning Fast",
                    desc: "Instant local processing",
                  },
                  {
                    icon: "✨",
                    label: "Completely Free",
                    desc: "No hidden fees or limits",
                  },
                ].map((feature) => (
                  <motion.div
                    key={feature.label}
                    className="group relative rounded-2xl border border-gray-100 bg-linear-to-b from-gray-50 to-white p-6 transition-all duration-500 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50"
                    whileHover={{ y: -5 }}
                  >
                    <span className="mb-3 block text-2xl">{feature.icon}</span>
                    <div className="mb-1 text-lg font-semibold">
                      {feature.label}
                    </div>
                    <div className="text-sm text-gray-500">{feature.desc}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              title={processingText}
              description="This won't take long..."
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center"
            >
              {showParticles && <SuccessParticles />}

              <motion.div
                className="relative mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                <motion.div
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-black"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(0,0,0,0.2)",
                      "0 0 0 20px rgba(0,0,0,0)",
                      "0 0 0 0 rgba(0,0,0,0)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </motion.div>
              </motion.div>

              <motion.h2
                className="mb-3 text-3xl font-bold md:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {successTitle}
              </motion.h2>
              <motion.p
                className="mb-10 text-lg text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {successDescription}
              </motion.p>

              <motion.div
                className="flex flex-col gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 px-10 py-4 text-lg"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Download className="h-5 w-5" />
                  Download File
                </motion.button>
                <motion.button
                  onClick={reset}
                  className="btn-outline flex items-center gap-2 px-10 py-4"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <RefreshCw className="h-5 w-5" />
                  Process Another
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center"
            >
              <motion.div
                className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-red-100 to-red-50 text-red-600 shadow-lg shadow-red-100"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <AlertCircle className="h-12 w-12" />
              </motion.div>
              <h2 className="mb-3 text-3xl font-bold">Something went wrong</h2>
              <p className="mb-10 text-lg text-gray-500">{errorMessage}</p>

              <motion.button
                onClick={reset}
                className="btn-primary flex items-center gap-2 px-10 py-4"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <EducationalContent
          howItWorks={howItWorks}
          benefits={benefits}
          faqs={faqs}
        />
      </div>
    </div>
  );
}

import { EducationalContent } from "./EducationalContent";
