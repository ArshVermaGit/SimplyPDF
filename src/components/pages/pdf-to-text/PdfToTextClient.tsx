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

export function PDFToTextClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [textContent, setTextContent] = useState("");
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

  const handleExtract = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");
    setProgress(0);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      });
      const pdf = await loadingTask.promise;

      let fullText = "";
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 100));
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => (item as { str: string }).str)
          .join(" ");
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }

      setTextContent(fullText);
      setStatus("success");
      addToHistory("PDF to Text", file.name, "Extracted text");
      await pdf.destroy();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to extract text from PDF"
      );
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!textContent) return;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      file?.name.replace(/\.pdf$/i, ".txt") || "extracted_text.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setTextContent("");
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
                title="PDF to Text"
                description="Extract plain text from any PDF document instantly and securely."
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
                  <p className="text-sm font-medium text-gray-400">
                    Click to browse or drag and drop
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
                      onClick={handleExtract}
                      className="btn-primary group mt-8 flex items-center gap-3 px-16 py-5 text-xl shadow-2xl shadow-black/10 transition-all hover:scale-[1.02]"
                    >
                      Extract Text
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                )}
              </ToolCard>

              <div className="mt-12 grid grid-cols-1 gap-6 text-center md:grid-cols-3">
                {[
                  {
                    label: "100% Privacy",
                    desc: "No files ever leave your browser",
                  },
                  { label: "Searchable", desc: "Get clean text for searching" },
                  { label: "Universal", desc: "Works on all PDF types" },
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
              title="Extracting Text..."
              description="Analyzing PDF content across all pages..."
              progress={progress}
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex max-w-4xl flex-col items-center justify-center py-12 text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Extraction Complete!</h2>
              <p className="mb-8 text-gray-500">
                Successfully extracted text from all pages.
              </p>

              <div className="mb-8 h-64 w-full overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 text-left">
                <pre className="font-mono text-sm whitespace-pre-wrap text-gray-600">
                  {textContent.substring(0, 2000)}
                  {textContent.length > 2000 &&
                    "\n\n... (text truncated for preview)"}
                </pre>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 px-10 py-4 text-lg"
                >
                  <Download className="h-5 w-5" />
                  Download .TXT
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
              <h2 className="mb-2 text-3xl font-bold">Oops!</h2>
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
            title: "How to Extract Text from PDF",
            steps: [
              "Upload your PDF document to the tool.",
              "Wait a few seconds while our local engine scans the text content.",
              "Preview the text and download it as a clean .txt file.",
            ],
          }}
          benefits={{
            title: "Unlock PDF Content",
            items: [
              {
                title: "No Server Needed",
                desc: "Extraction happens entirely in your browser. Your data stays 100% private.",
              },
              {
                title: "Preserve Order",
                desc: "Text is extracted page-by-page, maintaining the logical flow of thoughts.",
              },
              {
                title: "Lightweight Results",
                desc: "Plain text files are tiny, making them perfect for storage or sending via email.",
              },
              {
                title: "Developer Friendly",
                desc: "Easily get text content for use in other apps, scripts, or AI prompts.",
              },
            ],
          }}
          faqs={[
            {
              question: "Can it extract text from images in the PDF?",
              answer:
                "This tool is for PDFs with selectable text. For scanned images or photos within PDFs, please use our 'OCR PDF' tool.",
            },
            {
              question: "Will the formatting be saved?",
              answer:
                "This tool extracts plain text, focusing on the content rather than fonts or colors. For layout preservation, consider 'PDF to Word'.",
            },
            {
              question: "Is there a page limit?",
              answer:
                "No, you can extract text from documents with hundreds of pages without any issues.",
            },
          ]}
        />
      </div>
    </div>
  );
}
