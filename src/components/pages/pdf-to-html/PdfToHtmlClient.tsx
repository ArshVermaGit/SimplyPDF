"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FileCode,
  ArrowRight,
  Globe,
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

export function PDFToHTMLClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [htmlContent, setHtmlContent] = useState("");
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
      const pdfjsLib = await import("pdfjs-dist");
      const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      });
      const pdf = await loadingTask.promise;

      let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${file.name}</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
        .page { background: white; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .page-num { color: #999; font-size: 0.8em; margin-bottom: 10px; }
        p { margin-bottom: 1em; }
    </style>
</head>
<body>\n`;

      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 100));
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        html += `    <div class="page">\n        <div class="page-num">Page ${i}</div>\n`;

        // Group items by Y coordinate to form paragraphs (basic approach)
        let currentY = -1;
        let currentPara = "";

        for (const item of content.items as {
          transform: number[];
          str: string;
        }[]) {
          if (Math.abs(item.transform[5] - currentY) > 5 && currentPara) {
            html += `        <p>${currentPara.trim()}</p>\n`;
            currentPara = "";
          }
          currentPara += item.str + " ";
          currentY = item.transform[5];
        }

        if (currentPara) {
          html += `        <p>${currentPara.trim()}</p>\n`;
        }

        html += `    </div>\n`;
      }

      html += `</body>\n</html>`;

      setHtmlContent(html);
      setStatus("success");
      addToHistory("PDF to HTML", file.name, "Converted to HTML");
      await pdf.destroy();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to convert PDF to HTML"
      );
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file?.name.replace(/\.pdf$/i, ".html") || "document.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setHtmlContent("");
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
                title="PDF to HTML"
                description="Convert your PDF documents into clean, semantic HTML code instantly."
                icon={FileCode}
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
                    Convert to developer-friendly HTML
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
                        <Globe className="h-6 w-6 text-blue-500" />
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
                      Convert to HTML
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                )}
              </ToolCard>

              <div className="mt-12 grid grid-cols-1 gap-6 text-center md:grid-cols-3">
                {[
                  { label: "Semantic", desc: "Generates clean p & div tags" },
                  {
                    label: "Developer Ready",
                    desc: "Easy to paste into websites",
                  },
                  { label: "Secure", desc: "Processed locally on your device" },
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
              title="Converting to HTML..."
              description="Structuring content into semantic markup..."
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
              <h2 className="mb-2 text-3xl font-bold">HTML Ready!</h2>
              <p className="mb-8 text-gray-500">
                Your PDF has been successfully converted to structural HTML.
              </p>

              <div className="mb-8 h-64 w-full overflow-y-auto rounded-2xl border border-gray-800 bg-slate-900 p-6 text-left">
                <pre className="font-mono text-sm whitespace-pre-wrap text-blue-400">
                  {htmlContent.substring(0, 2000)}
                  {htmlContent.length > 2000 &&
                    "\n\n<!-- code truncated for preview -->"}
                </pre>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 px-10 py-4 text-lg"
                >
                  <Download className="h-5 w-5" />
                  Download .HTML
                </button>
                <button
                  onClick={reset}
                  className="btn-outline flex items-center gap-2 px-10 py-4 text-lg"
                >
                  <RefreshCw className="h-5 w-5" />
                  New Conversion
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
            title: "How to Convert PDF to HTML",
            steps: [
              "Upload your PDF file to the converter.",
              "Our engine scans the text and identifies paragraph structures.",
              "Download the resulting HTML file with clean, responsive markup.",
            ],
          }}
          benefits={{
            title: "Web-Ready Documentation",
            items: [
              {
                title: "SEO Friendly",
                desc: "Text is extracted as readable HTML, making it easier for search engines to index your content.",
              },
              {
                title: "No Dependencies",
                desc: "The generated HTML is self-contained and doesn't require complex CSS frameworks to display correctly.",
              },
              {
                title: "Private & Fast",
                desc: "Since everything happens on your device, it's significantly faster than online converters.",
              },
              {
                title: "Structural Integrity",
                desc: "We attempt to group text into logical paragraphs to make the content easier to style.",
              },
            ],
          }}
          faqs={[
            {
              question: "Does it convert images?",
              answer:
                "This version focuses on text and structure. Images are currently skipped to maintain a lightweight, clean HTML output.",
            },
            {
              question: "Is the HTML editable?",
              answer:
                "Yes, you can open the resulting file in any code editor (like VS Code) and modify the content as needed.",
            },
            {
              question: "Will it look exactly like the PDF?",
              answer:
                "PDF to HTML focuses on content and semantics rather than pixel-perfect styling. It's intended for migrating content to the web.",
            },
          ]}
        />
      </div>
    </div>
  );
}
