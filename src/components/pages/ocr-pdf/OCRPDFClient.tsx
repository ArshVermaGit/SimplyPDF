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
  ScanLine,
  FileText,
  Copy,
} from "lucide-react";
import { formatFileSize } from "@/lib/pdf-utils";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { EducationalContent } from "@/components/layout/EducationalContent";
import { useHistory } from "@/context/HistoryContext";

export function OCRPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [extractedText, setExtractedText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [customFileName, setCustomFileName] = useState("extracted-text.txt");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setCustomFileName(droppedFile.name.replace(".pdf", "-text.txt"));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCustomFileName(selectedFile.name.replace(".pdf", "-text.txt"));
    }
  };

  const handleOCR = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");
    setProgress(0);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      // Use the same worker version as the library
      const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const Tesseract = await import("tesseract.js");

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      });

      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      let fullText = "";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);

        // First try to get existing text
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ("str" in item ? (item as { str: string }).str : ""))
          .join(" ");

        if (pageText.trim().length > 50) {
          fullText += `\n--- Page ${i} ---\n${pageText}\n`;
          setProgress(Math.round((i / numPages) * 100));
        } else {
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;

          const imageData = canvas.toDataURL("image/png");

          const result = await Tesseract.recognize(imageData, "eng", {
            logger: (m: { status: string; progress: number }) => {
              if (m.status === "recognizing text") {
                setProgress(
                  Math.round(((i - 1) / numPages + m.progress / numPages) * 100)
                );
              }
            },
          });

          fullText += `\n--- Page ${i} (OCR) ---\n${result.data.text}\n`;
          (page as { cleanup?: () => void }).cleanup?.();
        }
      }

      setExtractedText(fullText.trim());
      setStatus("success");

      if (file) {
        addToHistory("OCR PDF", file.name, "Text extracted from PDF");
      }

      await pdfDoc.destroy();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to process PDF with OCR"
      );
      setStatus("error");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = customFileName || "extracted-text.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setExtractedText("");
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
                title="OCR PDF"
                description="AI-powered text extraction from scanned PDFs and images."
                icon={ScanLine}
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
                  <Upload className="mb-6 h-16 w-16 text-gray-300" />
                  <p className="mb-2 text-xl font-semibold">
                    Drop your PDF here
                  </p>
                  <p className="text-gray-400">
                    or click to browse from your computer
                  </p>
                </div>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex flex-col items-center"
                  >
                    <div className="flex w-full max-w-md items-center gap-4 rounded-[28px] border border-gray-100 bg-gray-50 p-5">
                      <div className="rounded-2xl bg-white p-3.5 shadow-sm">
                        <FileText className="h-7 w-7 text-black" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleOCR}
                      className="btn-primary group mt-8 flex items-center gap-3 px-20 py-5 text-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ScanLine className="h-6 w-6 transition-transform group-hover:rotate-12" />
                      Extract Text
                    </button>
                  </motion.div>
                )}
              </ToolCard>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Analyzing content..."
              description="Running AI recognition on your document pages..."
              progress={progress}
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-5xl py-12"
            >
              <div className="mb-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[40px] bg-black text-white shadow-2xl shadow-black/20"
                >
                  <CheckCircle2 className="h-12 w-12" />
                </motion.div>
                <h2 className="mb-2 text-5xl font-black tracking-tight text-gray-900">
                  Text Extracted!
                </h2>
                <p className="text-lg font-medium text-gray-500">
                  We successfully analyzed all pages and extracted the text
                  below.
                </p>
              </div>

              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <ToolCard className="overflow-hidden border-none bg-white/40 p-10 shadow-2xl backdrop-blur-md">
                    <div className="mb-8 flex items-center justify-between">
                      <h3 className="flex items-center gap-3 text-xl font-black tracking-wider uppercase">
                        <FileText className="h-6 w-6" />
                        Text Preview
                      </h3>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                          copied
                            ? "bg-green-500 text-white"
                            : "border border-gray-100 bg-white shadow-sm hover:border-black"
                        }`}
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? "Copied!" : "Copy Text"}
                      </button>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto rounded-[32px] border border-white bg-white/60 p-8 shadow-inner">
                      <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                        {extractedText ||
                          "No text could be extracted from this document."}
                      </pre>
                    </div>
                  </ToolCard>
                </div>

                <div className="space-y-6">
                  <ToolCard className="p-8 shadow-xl">
                    <h4 className="mb-6 text-sm font-bold tracking-widest text-gray-400 uppercase">
                      Download Settings
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold text-gray-500 uppercase">
                          Filename
                        </label>
                        <input
                          type="text"
                          value={customFileName}
                          onChange={(e) => setCustomFileName(e.target.value)}
                          className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-black focus:outline-none"
                          placeholder="filename.txt"
                        />
                      </div>
                      <button
                        onClick={handleDownloadText}
                        className="btn-primary group flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold"
                      >
                        <Download className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
                        Download .txt
                      </button>
                    </div>
                  </ToolCard>

                  <button
                    onClick={reset}
                    className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-gray-200 py-4 font-bold text-gray-400 transition-all hover:border-black hover:text-black"
                  >
                    <RefreshCw className="h-5 w-5" />
                    OCR Another
                  </button>
                </div>
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
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[40px] bg-red-100 text-red-600 shadow-xl shadow-red-100">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h2 className="mb-4 text-4xl font-black tracking-tight">
                OCR Failed
              </h2>
              <p className="mb-12 text-lg leading-relaxed font-medium text-gray-500">
                {errorMessage}
              </p>

              <button
                onClick={reset}
                className="btn-primary group flex items-center justify-center gap-3 rounded-2xl px-16 py-5 text-lg font-bold"
              >
                <RefreshCw className="h-6 w-6 transition-transform duration-500 group-hover:rotate-180" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="container mx-auto mt-24 px-4">
        <EducationalContent
          howItWorks={{
            title: "How OCR Works",
            steps: [
              "Upload your scanned PDF or image document.",
              "Our AI engine analyzes each page for text patterns and structure.",
              "Optical Character Recognition converts pixels into editable text.",
              "Preview the results and download your editable .txt file.",
            ],
          }}
          benefits={{
            title: "Hyper-Premium Extraction",
            items: [
              {
                title: "Universal Detection",
                desc: "Recognizes text from scans, photos, and non-selectable PDFs effortlessly.",
              },
              {
                title: "Browser Privacy",
                desc: "All AI recognition happens in your browser. Your sensitive data never leaves your device.",
              },
              {
                title: "High Accuracy",
                desc: "Powered by Tesseract.js, the most accurate open-source OCR engine available today.",
              },
              {
                title: "One-Click Export",
                desc: "Instantly copy text or download a clean text file with one click.",
              },
            ],
          }}
          faqs={[
            {
              question: "What languages are supported?",
              answer:
                "Our current implementation is optimized for English, but it can recognize most Latin-based characters with high accuracy.",
            },
            {
              question: "Does it handle handwriting?",
              answer:
                "OCR works best with printed text. While it can detect some clear handwriting, specialized handwriting AI is usually required for messy scripts.",
            },
            {
              question: "Is there a page limit?",
              answer:
                "There's no hard limit, but large documents (50+ pages) may take several minutes as all processing is done locally on your CPU.",
            },
          ]}
        />
      </div>
    </div>
  );
}
