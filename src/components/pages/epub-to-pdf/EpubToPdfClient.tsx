"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { formatFileSize } from "@/lib/pdf-utils";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";
import { EducationalContent } from "@/components/layout/EducationalContent";

export function EPUBToPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".epub")) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");
    setProgress(10);

    try {
      const jsPDF = (await import("jspdf")).default;
      const ePub = (await import("epubjs")).default;

      const arrayBuffer = await file.arrayBuffer();
      const book = ePub(arrayBuffer);
      await book.ready;

      const doc = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
      });

      // Iterate through sections (chapters)
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const spine = (book as any).spine;
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const totalSections = (spine as any).length;

      for (let i = 0; i < totalSections; i++) {
        setProgress(Math.round(10 + (i / totalSections) * 80));
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const section = (spine as any).get(i);
        await section.load(book.load.bind(book));
        const content = section.contents as HTMLElement;

        // Temporary render to get HTML content
        const container = document.createElement("div");
        container.style.width = "545pt";
        container.style.padding = "20pt";
        container.innerHTML = content.innerHTML;

        container.style.position = "absolute";
        container.style.left = "-9999px";
        document.body.appendChild(container);

        if (i > 0) doc.addPage();

        // Add title for section if possible
        const titleNode = container.querySelector("h1, h2, h3");
        if (titleNode) {
          doc.setFont("helvetica", "bold");
          doc.text(titleNode.textContent || "", 30, 40);
          doc.setFont("helvetica", "normal");
        }

        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        await (doc as any).html(container, {
          x: 10,
          y: titleNode ? 60 : 10,
          autoPaging: "text",
          width: 545,
          windowWidth: 800,
        });

        document.body.removeChild(container);
        section.unload();
      }

      const blob = doc.output("blob");
      setResultBlob(blob);
      setStatus("success");
      setProgress(100);
      addToHistory("EPUB to PDF", file.name, "Converted eBook");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to convert EPUB to PDF"
      );
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file?.name.replace(/\.epub$/i, ".pdf") || "book.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResultBlob(null);
    setErrorMessage("");
    setProgress(0);
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl"
            >
              <ToolHeader
                title="EPUB to PDF"
                description="Convert your eBooks into professional PDFs for easy reading on any device."
                icon={BookOpen}
              />

              <ToolCard className="p-8">
                <div
                  className={`drop-zone active:border-black ${dragActive ? "active" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".epub"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">
                    Drop your EPUB here
                  </p>
                  <p className="text-sm font-medium text-gray-400">
                    Convert eBooks to portable PDFs
                  </p>
                </div>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex flex-col items-center"
                  >
                    <div className="flex w-full max-w-md items-center gap-4 rounded-2xl bg-gray-50 p-4">
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{file.name}</p>
                        <p className="text-sm font-medium text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleConvert}
                      className="btn-primary group mt-8 flex items-center gap-3 px-16 py-5 text-xl shadow-2xl shadow-black/10 transition-all hover:scale-[1.02]"
                    >
                      Convert to PDF
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                )}
              </ToolCard>

              <div className="mt-12 grid grid-cols-1 gap-6 text-center md:grid-cols-3">
                {[
                  { label: "Universal", desc: "Read on any device" },
                  { label: "Private", desc: "No eBook data is uploaded" },
                  { label: "Clean Layout", desc: "Maintains book structure" },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="rounded-2xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm"
                  >
                    <div className="mb-1 text-lg font-bold">
                      {feature.label}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      {feature.desc}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              title="Converting eBook..."
              description="Parsing chapters and rendering layouts..."
              progress={progress}
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-black text-white">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Book Converted!</h2>
              <p className="mb-10 text-lg text-gray-500">
                Your eBook is now a PDF ready for reading.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 px-10 py-4 text-lg"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
                <button
                  onClick={reset}
                  className="btn-outline flex items-center gap-2 px-10 py-4 text-lg"
                >
                  <RefreshCw className="h-5 w-5" />
                  Convert Another
                </button>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Error</h2>
              <p className="mb-10 text-lg text-gray-500">{errorMessage}</p>

              <button
                onClick={reset}
                className="btn-primary flex items-center gap-2 px-10 py-4 text-lg"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <EducationalContent
          howItWorks={{
            title: "How to Convert EPUB to PDF",
            steps: [
              "Upload your EPUB eBook file to the converter.",
              "Our tool reads the book structure and renders each chapter.",
              "Download your new PDF document for any reading app.",
            ],
          }}
          benefits={{
            title: "Read Anywhere",
            items: [
              {
                title: "No Specific Reader",
                desc: "PDFs can be opened on almost any device without specialized eBook software.",
              },
              {
                title: "Offline Privacy",
                desc: "Conversion happens in your browser. We never see your book collection.",
              },
              {
                title: "Preserve Hierarchy",
                desc: "We attempt to maintain chapter breaks and headings for a natural reading flow.",
              },
              {
                title: "Easy Sharing",
                desc: "PDFs are the standard for sharing documents across different operating systems.",
              },
            ],
          }}
          faqs={[
            {
              question: "Does it support DRM-protected books?",
              answer:
                "No, this tool only works with DRM-free EPUB files. Encrypted books cannot be processed for legal and technical reasons.",
            },
            {
              question: "What about the book cover?",
              answer:
                "We focus on the interior content. The book cover might be included if it's part of the standard book flow.",
            },
            {
              question: "Will links work in the PDF?",
              answer:
                "Internal navigation links (like Table of Contents) work in most PDF readers after conversion.",
            },
          ]}
        />
      </div>
    </div>
  );
}
