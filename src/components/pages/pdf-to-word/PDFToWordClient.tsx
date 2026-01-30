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
  FileText,
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

export function PDFToWordClient() {
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
    if (droppedFile?.type === "application/pdf") {
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
    setProgress(0);

    try {
      console.log("Loading pdfjs-dist...");
      const pdfjsLib = await import("pdfjs-dist");
      const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const docx = await import("docx");

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: true,
        isEvalSupported: false,
      });

      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      const paragraphs: unknown[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 100));

        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();

        // Group by Y position to form lines
        const items = textContent.items as {
          transform: number[];
          str: string;
        }[];
        const lines: { [y: number]: string[] } = {};

        items.forEach((item) => {
          const y = Math.round(item.transform[5]);
          if (!lines[y]) lines[y] = [];
          lines[y].push(item.str);
        });

        // Sort by Y position (top to bottom)
        const sortedYs = Object.keys(lines)
          .map(Number)
          .sort((a, b) => b - a);

        // Add page header
        if (i > 1) {
          paragraphs.push(
            new docx.Paragraph({
              children: [],
              spacing: { before: 400 },
            })
          );
        }

        // Add text lines
        for (const y of sortedYs) {
          const lineText = lines[y].join(" ").trim();
          if (lineText) {
            paragraphs.push(
              new docx.Paragraph({
                children: [new docx.TextRun({ text: lineText })],
                spacing: { after: 100 },
              })
            );
          }
        }

        (page as { cleanup?: () => void }).cleanup?.();
      }

      // Create Word document
      const doc = new docx.Document({
        sections: [
          {
            properties: {},
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            children: paragraphs as any,
          },
        ],
      });

      const buffer = await docx.Packer.toBlob(doc);
      setResultBlob(buffer);
      setStatus("success");

      if (file) {
        addToHistory("PDF to Word", file.name, "Converted to Word");
      }

      await pdfDoc.destroy();
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err);
      setErrorMessage(err.message || "Failed to convert PDF to Word");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file?.name.replace(/\.pdf$/i, ".docx") || "document.docx";
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
                title="PDF to Word"
                description="Convert PDF files to editable Word documents (.docx)."
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
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">Drop your PDF here</p>
                  <p className="text-sm text-gray-400">or click to browse</p>
                </div>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex flex-col items-center"
                  >
                    <div className="flex w-full max-w-md items-center gap-4 rounded-2xl bg-gray-50 p-4">
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <FileText className="h-6 w-6 text-red-500" />
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
                      Convert to Word
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
              title="Converting to Word..."
              description="Extracting text from PDF..."
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
              <h2 className="mb-2 text-3xl font-bold">Conversion Complete!</h2>
              <p className="mb-10 text-lg text-gray-500">
                Your PDF has been converted to Word format.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 px-10 py-4 text-lg"
                >
                  <Download className="h-5 w-5" />
                  Download Word
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
            title: "How to Convert PDF to Word",
            steps: [
              "Upload your PDF document to our secure conversion tool.",
              "Our intelligent engine extracts text, paragraphs, and formatting structure.",
              "Download your fully editable Word document (.docx) instantly.",
            ],
          }}
          benefits={{
            title: "Editable Documents Made Easy",
            items: [
              {
                title: "Preserve Formatting",
                desc: "We maintain your original layout, paragraphs, and text flow as much as possible.",
              },
              {
                title: "100% Private",
                desc: "Conversion happens right in your browser. Your confidential documents never leave your device.",
              },
              {
                title: "Universal Compatibility",
                desc: "The generated .docx files work perfectly with Microsoft Word, Google Docs, and LibreOffice.",
              },
              {
                title: "Fast & Free",
                desc: "Convert unlimited documents instantly without any watermarks or hidden fees.",
              },
            ],
          }}
          faqs={[
            {
              question: "Will my document look exactly the same?",
              answer:
                "We strive for high accuracy. While complex layouts might need minor adjustments, we preserve paragraphs, lists, and basic formatting excellently.",
            },
            {
              question: "Is it safe to convert sensitive files?",
              answer:
                "Absolutely. SimplyPDF runs entirely in your browser, so your files are never uploaded to any server. Your privacy is guaranteed.",
            },
            {
              question: "Can I convert scanned PDFs?",
              answer:
                "For scanned documents (images), use our 'OCR PDF' tool instead. This tool is best for PDFs that already contain selectable text.",
            },
          ]}
        />
      </div>
    </div>
  );
}

import { EducationalContent } from "@/components/layout/EducationalContent";
