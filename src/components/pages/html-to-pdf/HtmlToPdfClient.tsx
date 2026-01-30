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
  Type,
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

export function HTMLToPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [htmlInput, setHtmlInput] = useState("");
  const [mode, setMode] = useState<"upload" | "paste">("upload");
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
      (droppedFile.name.endsWith(".html") || droppedFile.name.endsWith(".htm"))
    ) {
      setFile(droppedFile);
      setMode("upload");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMode("upload");
    }
  };

  const handleConvert = async () => {
    let content = htmlInput;
    if (mode === "upload" && file) {
      content = await file.text();
    }

    if (!content.trim()) {
      setErrorMessage("Please provide HTML content or upload a file.");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setErrorMessage("");

    try {
      const jsPDF = (await import("jspdf")).default;

      const doc = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
      });

      // Clean input HTML for simple rendering
      const container = document.createElement("div");
      container.style.width = "545pt"; // A4 width minus margins roughly
      container.style.padding = "20pt";
      container.innerHTML = content;

      // Temporary add to body to render
      container.style.position = "absolute";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      await (doc as any).html(container, {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        callback: function (pdf: any) {
          const blob = pdf.output("blob");
          setResultBlob(blob);
          setStatus("success");
          document.body.removeChild(container);
          addToHistory(
            "HTML to PDF",
            file?.name || "Code Snippet",
            "Converted to PDF"
          );
        },
        x: 10,
        y: 10,
        autoPaging: "text",
        width: 545,
        windowWidth: 800,
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to convert HTML to PDF"
      );
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file?.name.replace(/\.html?$/i, ".pdf") || "webpage.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setHtmlInput("");
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
                title="HTML to PDF"
                description="Convert HTML files or code snippets to professional PDF documents."
                icon={Globe}
              />

              <div className="mb-8 flex justify-center gap-4">
                <button
                  onClick={() => setMode("upload")}
                  className={`rounded-full px-6 py-2 font-medium transition-all ${mode === "upload" ? "bg-black text-white shadow-lg" : "border border-gray-100 bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setMode("paste")}
                  className={`rounded-full px-6 py-2 font-medium transition-all ${mode === "paste" ? "bg-black text-white shadow-lg" : "border border-gray-100 bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                  Paste Code
                </button>
              </div>

              <ToolCard className="p-8">
                {mode === "upload" ? (
                  <div
                    className={`drop-zone active:border-black ${dragActive ? "active" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".html,.htm"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Upload className="mb-4 h-12 w-12 text-gray-400" />
                    <p className="mb-2 text-lg font-medium">
                      Drop your HTML file here
                    </p>
                    <p className="text-sm font-medium text-gray-400">
                      Supports .html and .htm files
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                      <Type className="h-4 w-4" />
                      Input HTML Content
                    </div>
                    <textarea
                      value={htmlInput}
                      onChange={(e) => setHtmlInput(e.target.value)}
                      placeholder="<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>"
                      className="h-64 w-full resize-none rounded-2xl border border-gray-100 bg-gray-50/50 p-4 font-mono text-sm transition-all outline-none focus:bg-white focus:ring-4 focus:ring-black/5"
                    />
                  </div>
                )}

                {(file || htmlInput.trim()) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex flex-col items-center"
                  >
                    {file && mode === "upload" && (
                      <div className="mb-6 flex w-full max-w-md items-center gap-4 rounded-2xl bg-gray-50 p-4">
                        <div className="rounded-xl bg-white p-3 shadow-sm">
                          <FileCode className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{file.name}</p>
                          <p className="text-sm font-medium text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleConvert}
                      className="btn-primary group flex items-center gap-3 px-16 py-5 text-xl shadow-2xl shadow-black/10 transition-all hover:scale-[1.02]"
                    >
                      Generate PDF
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                )}
              </ToolCard>

              <div className="mt-12 grid grid-cols-1 gap-6 text-center md:grid-cols-3">
                {[
                  { label: "Accurate", desc: "Preserves layout & styles" },
                  { label: "Private", desc: "Local conversion engine" },
                  { label: "Versatile", desc: "Upload or paste code" },
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
              title="Converting HTML..."
              description="Rendering document structure and styles..."
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
              <h2 className="mb-2 text-3xl font-bold">Success!</h2>
              <p className="mb-10 text-lg text-gray-500">
                Your HTML has been converted to a PDF document.
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
                  Start Over
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
            title: "How to Convert HTML to PDF",
            steps: [
              "Choose between uploading an .html file or pasting code directly.",
              "Our intelligent engine renders the HTML while preserving styles.",
              "Review your generated PDF and download it instantly.",
            ],
          }}
          benefits={{
            title: "Professional Web Printing",
            items: [
              {
                title: "Preserve CSS",
                desc: "We attempt to maintain your inline styles and document structure for accurate rendering.",
              },
              {
                title: "Browser Privacy",
                desc: "Rendering happens entirely in your browser window. We never see your code or documents.",
              },
              {
                title: "Fast Workflow",
                desc: "No more using 'Print to PDF' and fighting browser margins. Get clean PDFs in seconds.",
              },
              {
                title: "Code Snippets",
                desc: "Perfect for documentation! Paste your HTML/CSS snippets to create high-quality PDFs.",
              },
            ],
          }}
          faqs={[
            {
              question: "Does it support external CSS?",
              answer:
                "For best results, use inline styles or <style> tags. External stylesheets might be blocked by browser security policies.",
            },
            {
              question: "Can I convert a live URL?",
              answer:
                "Due to web security (CORS), we can't directly fetch other websites. You should save the webpage first and upload the HTML file.",
            },
            {
              question: "Is Javascript supported?",
              answer:
                "This tool renders static HTML content. Dynamic Javascript-heavy pages should be saved as static HTML before conversion.",
            },
          ]}
        />
      </div>
    </div>
  );
}
