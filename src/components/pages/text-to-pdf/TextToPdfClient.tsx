"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { formatFileSize, uint8ArrayToBlob } from "@/lib/pdf-utils";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";
import { EducationalContent } from "@/components/layout/EducationalContent";

export function TextToPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".txt")) {
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

    try {
      const textContent = await file.text();

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const margin = 50;
      const lineHeight = fontSize * 1.4;

      const lines = textContent.split("\n");
      let currentPage = pdfDoc.addPage();
      const { width, height } = currentPage.getSize();
      let y = height - margin;

      for (const line of lines) {
        // Wrap text manually
        const words = line.split(" ");
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth > width - margin * 2) {
            if (y < margin + lineHeight) {
              currentPage = pdfDoc.addPage();
              y = height - margin;
            }
            currentPage.drawText(currentLine, {
              x: margin,
              y,
              size: fontSize,
              font,
            });
            y -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          if (y < margin + lineHeight) {
            currentPage = pdfDoc.addPage();
            y = height - margin;
          }
          currentPage.drawText(currentLine, {
            x: margin,
            y,
            size: fontSize,
            font,
          });
          y -= lineHeight;
        }
      }

      const pdfBytes = await pdfDoc.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");

      addToHistory("Text to PDF", file.name, "Converted to PDF");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to convert text to PDF"
      );
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file?.name.replace(/\.txt$/i, ".pdf") || "document.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResultBlob(null);
    setErrorMessage("");
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
                title="Text to PDF"
                description="Convert simple .txt files to professional PDF documents instantly."
                icon={FileText}
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
                    accept=".txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">
                    Drop your text file here
                  </p>
                  <p className="text-sm font-medium text-gray-400">
                    Supports plain text (.txt) files
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
                        <FileText className="h-6 w-6 text-gray-500" />
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

              {/* Features list... copied from ExcelToPDF for consistency */}
              <div className="mt-12 grid grid-cols-1 gap-6 text-center md:grid-cols-3">
                {[
                  { label: "Instant", desc: "Convert in milliseconds" },
                  { label: "Universal", desc: "Opens on any device" },
                  { label: "Zero Uploads", desc: "Private browser conversion" },
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
              title="Converting Text..."
              description="Generating PDF layout..."
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
              <h2 className="mb-2 text-3xl font-bold">Done!</h2>
              <p className="mb-10 text-lg text-gray-500">
                Your text file is now a PDF.
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
                  New File
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
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-lg shadow-red-100">
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
            title: "How to Convert Text to PDF",
            steps: [
              "Upload your plain text (.txt) file or copy-paste text.",
              "The tool creates a professional layout with standard fonts and margins.",
              "Download your PDF instantly without any watermarks.",
            ],
          }}
          benefits={{
            title: "Why use Text to PDF?",
            items: [
              {
                title: "Permanent Format",
                desc: "PDFs ensure your text looks exactly the same everywhere, unlike .txt files.",
              },
              {
                title: "Browser Based",
                desc: "No software needed. Everything happens right here in your web browser.",
              },
              {
                title: "100% Privacy",
                desc: "We never upload your text to our servers. Your data stays on your machine.",
              },
              {
                title: "Lightning Fast",
                desc: "Convert small or large text files in a fraction of a second.",
              },
            ],
          }}
          faqs={[
            {
              question: "Will it handle emojis?",
              answer:
                "Currently, we support standard alphanumeric characters and common symbols. Emoji support is coming soon!",
            },
            {
              question: "Is there a character limit?",
              answer:
                "There's no hard limit, but extremely large text files (50MB+) might take longer to lay out.",
            },
            {
              question: "Can I use bold text?",
              answer:
                "This tool is for plain text (.txt). If you need formatting, consider using our Word to PDF tool.",
            },
          ]}
        />
      </div>
    </div>
  );
}
