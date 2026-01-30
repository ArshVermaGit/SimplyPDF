"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FileUp,
  FileText,
  ArrowRight,
} from "lucide-react";
import { formatFileSize, uint8ArrayToBlob } from "@/lib/pdf-utils";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";

export function WordToPDFClient() {
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
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".docx") ||
        droppedFile.name.endsWith(".doc") ||
        droppedFile.name.endsWith(".txt"))
    ) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const sanitizeText = (text: string): string => {
    // Map common non-WinAnsi characters to their equivalents
    const charMap: { [key: string]: string } = {
      "→": "->",
      "←": "<-",
      "↔": "<->",
      "↑": "^",
      "↓": "v",
      "™": "(TM)",
      "©": "(c)",
      "®": "(r)",
      "\u2013": "-", // en dash (–)
      "\u2014": "--", // em dash (—)
      "\u2018": "'", // left single quote (‘)
      "\u2019": "'", // right single quote (’)
      "\u201C": '"', // left double quote (“)
      "\u201D": '"', // right double quote (”)
      "\u2022": "*", // bullet (•)
      "\u2026": "...", // ellipsis (…)
      "\u20AC": "EUR", // euro
    };

    return text.replace(
      /[^\x00-\x7F\u00A0-\u00FF]/g,
      (char) => charMap[char] || "?"
    );
  };

  const handleConvert = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      let textContent = "";

      if (file.name.endsWith(".txt")) {
        // Plain text file
        textContent = await file.text();
      } else if (file.name.endsWith(".docx")) {
        // DOCX file - use mammoth
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        textContent = result.value;
      } else {
        throw new Error(
          "Unsupported file format. Please use .docx or .txt files."
        );
      }

      // Sanitize text for PDF encoding
      textContent = sanitizeText(textContent);

      // Create PDF from text
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const margin = 50;
      const lineHeight = fontSize * 1.5;

      // Split text into lines
      const contents: string[] = textContent.split("\n");
      let currentPage = pdf.addPage();
      const { width, height } = currentPage.getSize();
      let y = height - margin;

      for (const line of contents) {
        // Word wrap long lines
        const words = line.split(" ");
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth > width - margin * 2) {
            // Draw current line and start new one
            if (y < margin + lineHeight) {
              currentPage = pdf.addPage();
              y = currentPage.getSize().height - margin;
            }

            currentPage.drawText(currentLine, {
              x: margin,
              y,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });

            y -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        // Draw remaining text
        if (currentLine) {
          if (y < margin + lineHeight) {
            currentPage = pdf.addPage();
            y = currentPage.getSize().height - margin;
          }

          currentPage.drawText(currentLine, {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });

          y -= lineHeight;
        }

        // Empty line spacing
        if (line === "") {
          y -= lineHeight * 0.5;
        }
      }

      const pdfBytes = await pdf.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");

      if (file) {
        addToHistory("Word to PDF", file.name, "Converted to PDF");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to convert document to PDF"
      );
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      file?.name.replace(/\.(docx|doc|txt)$/i, ".pdf") || "document.pdf";
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
                title="Word to PDF"
                description="Convert Word documents (.docx) and text files to PDF format."
                icon={FileUp}
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
                    accept=".docx,.doc,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">
                    Drop your document here
                  </p>
                  <p className="text-sm font-medium text-gray-400">
                    Supports .docx and .txt files
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
                        <FileText className="h-6 w-6 text-blue-500" />
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
                  { label: "100% Free", desc: "No hidden fees" },
                  { label: "Private", desc: "Files stay on device" },
                  { label: "Fast", desc: "Instant processing" },
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
              title="Converting to PDF..."
              description="Generating document structure..."
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
              <h2 className="mb-2 text-3xl font-bold">Conversion Complete!</h2>
              <p className="mb-10 text-lg text-gray-500">
                Your document has been converted to PDF.
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
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-lg shadow-red-100">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Something went wrong</h2>
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
            title: "How to Convert Word to PDF",
            steps: [
              "Upload your Word document (.docx) or text file (.txt).",
              "Our converter instantly transforms it into a professional PDF.",
              "Download your new PDF document, ready for sharing.",
            ],
          }}
          benefits={{
            title: "Professional Documents",
            items: [
              {
                title: "Universal Compatibility",
                desc: "PDFs look the same on every device. No more broken formatting when sending resumes or contracts.",
              },
              {
                title: "Instant Conversion",
                desc: "Get high-quality PDFs in milliseconds. No software installation required.",
              },
              {
                title: "Privacy Guaranteed",
                desc: "Your documents are converted locally. We never see or store your files.",
              },
              {
                title: "Supports .txt & .docx",
                desc: "Easily convert both simple text notes and complex Word documents.",
              },
            ],
          }}
          faqs={[
            {
              question: "Does it preserve fonts?",
              answer:
                "We use standard fonts to ensure your PDF looks professional and clean on any system.",
            },
            {
              question: "Why convert to PDF?",
              answer:
                "PDFs are secure, uneditable by default, and look professional. They are the standard for invoices, resumes, and legal docs.",
            },
            {
              question: "Can I convert back to Word?",
              answer:
                "Yes! If you need to edit the PDF later, simply use our 'PDF to Word' tool.",
            },
          ]}
        />
      </div>
    </div>
  );
}

import { EducationalContent } from "@/components/layout/EducationalContent";
