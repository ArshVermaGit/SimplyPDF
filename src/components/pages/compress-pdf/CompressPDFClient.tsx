"use client";

export const dynamic = "force-dynamic";

import { PageInfo } from "@/types";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Zap,
  Shield,
  ArrowRight,
  Info,
  Gauge,
  Scissors,
  Maximize2,
} from "lucide-react";
import { compressPDF, formatFileSize, uint8ArrayToBlob } from "@/lib/pdf-utils";
import { PDFPreviewModal } from "@/components/pdf/PDFPreviewModal";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { EducationalContent } from "@/components/layout/EducationalContent";
import { useHistory } from "@/context/HistoryContext";
import Image from "next/image";

type CompressionLevel = "low" | "recommended" | "extreme";

export function CompressPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const [customFileName, setCustomFileName] = useState("compressed.pdf");

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      await loadPages(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await loadPages(selectedFile);
    }
  };

  const loadPages = async (pdfFile: File) => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: true,
        isEvalSupported: false,
      });

      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      const pageInfos: PageInfo[] = [];
      // Generate a few previews (limit to 10 for performance)
      const previewLimit = Math.min(numPages, 10);
      for (let i = 1; i <= previewLimit; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;

        pageInfos.push({
          pageNumber: i,
          image: canvas.toDataURL("image/jpeg", 0.7),
        });
        (page as { cleanup?: () => void }).cleanup?.();
      }

      setPages(pageInfos);
      setCustomFileName(`${pdfFile.name.replace(".pdf", "")}_compressed.pdf`);
      setStatus("ready");
      await pdfDoc.destroy();
    } catch (error: unknown) {
      console.error("PDF loading error:", error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(`Failed to load PDF preview: ${msg}`);
      setStatus("error");
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const compressedBytes = await compressPDF(file, level);
      const blob = uint8ArrayToBlob(compressedBytes);
      setResultBlob(blob);
      setResultSize(compressedBytes.length);
      setStatus("success");

      addToHistory(
        "Compressed PDF",
        file.name,
        `Reduced to ${formatFileSize(compressedBytes.length)}`
      );
    } catch (error: unknown) {
      console.error(error);
      const msg =
        error instanceof Error ? error.message : "Failed to compress PDF";
      setErrorMessage(msg);
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = customFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setLevel("recommended");
    setStatus("idle");
    setResultBlob(null);
    setPages([]);
    setErrorMessage("");
  };

  const levels = [
    {
      id: "low",
      name: "Low Compression",
      desc: "Maximum quality, minimal size reduction",
      icon: Shield,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      id: "recommended",
      name: "Recommended",
      desc: "Best balance between quality and size",
      icon: Zap,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      popular: true,
    },
    {
      id: "extreme",
      name: "Extreme Compression",
      desc: "Maximum size reduction, lower image quality",
      icon: Scissors,
      color: "bg-orange-50 text-orange-600 border-orange-100",
    },
  ];

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
                title="Compress PDF"
                description="Reduce file size while optimizing for maximal PDF quality."
                icon={Gauge}
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
              </ToolCard>
            </motion.div>
          )}

          {status === "loading" && (
            <ProcessingState
              message="Loading PDF..."
              description="Analyzing document structure..."
            />
          )}

          {status === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-6xl"
            >
              <div className="grid items-start gap-8 lg:grid-cols-12">
                {/* Left: Preview & File Info */}
                <div className="space-y-6 lg:col-span-4">
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                    <div className="group relative mb-6 aspect-3/4 overflow-hidden rounded-2xl border border-gray-100">
                      {pages[0] && (
                        <Image
                          src={pages[0].image}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                        <button
                          onClick={() => setPreviewOpen(true)}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black"
                        >
                          <Maximize2 className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                          <File className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-gray-900">
                            {file?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file?.size || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="h-px bg-gray-50" />
                      <button
                        onClick={reset}
                        className="w-full py-3 text-sm font-bold text-gray-400 transition-colors hover:text-red-500"
                      >
                        Select different file
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100/50 bg-blue-50/50 p-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 shrink-0 text-blue-500" />
                      <p className="text-xs leading-relaxed font-medium text-blue-700">
                        We&apos;ll optimize images and remove redundant data
                        while keeping your content clear.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Compression Settings */}
                <div className="space-y-6 lg:col-span-8">
                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <h3 className="mb-8 text-xl font-bold text-gray-900">
                      Compression Level
                    </h3>

                    <div className="grid gap-4">
                      {levels.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => setLevel(l.id as CompressionLevel)}
                          className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                            level === l.id
                              ? "border-black bg-gray-50 shadow-md ring-4 ring-black/5"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-xl ${l.color}`}
                            >
                              <l.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">
                                  {l.name}
                                </span>
                                {l.popular && (
                                  <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-500">
                                {l.desc}
                              </p>
                            </div>
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                                level === l.id
                                  ? "border-black bg-black text-white"
                                  : "border-gray-200"
                              }`}
                            >
                              {level === l.id && (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="space-y-2">
                        <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Output Filename
                        </label>
                        <input
                          type="text"
                          value={customFileName}
                          onChange={(e) => setCustomFileName(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-black focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleCompress}
                        className="btn-primary group flex w-full items-center justify-center gap-2 rounded-2xl py-4 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Gauge className="h-5 w-5 transition-transform group-hover:rotate-12" />
                        <span className="text-base font-bold">
                          Compress PDF Now
                        </span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Optimizing PDF..."
              description="Calculating compression magic..."
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-4xl"
            >
              <div className="mb-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black text-white shadow-xl shadow-black/10"
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.div>
                <h2 className="mb-2 text-4xl font-black text-gray-900">
                  PDF Compressed!
                </h2>
                <p className="text-lg font-medium text-gray-500">
                  Your optimized document is ready for download.
                </p>
              </div>

              <div className="mb-12 grid gap-8 md:grid-cols-2">
                {/* Size Reduction Chart */}
                <div className="flex flex-col justify-center rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                  <h4 className="mb-8 text-center text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Size Comparison
                  </h4>

                  <div className="flex h-40 items-end justify-center gap-12">
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        className="relative w-12 overflow-hidden rounded-t-xl bg-gray-100"
                      >
                        <div className="absolute inset-0 bg-linear-to-t from-gray-200 to-transparent" />
                      </motion.div>
                      <span className="text-[10px] font-bold text-gray-500">
                        ORIGINAL
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatFileSize(file?.size || 0)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{
                          height: `${(resultSize / (file?.size || 1)) * 100}%`,
                        }}
                        className="relative w-12 overflow-hidden rounded-t-xl bg-black"
                      >
                        <div className="absolute inset-0 bg-linear-to-t from-gray-800 to-transparent opacity-20" />
                      </motion.div>
                      <span className="text-[10px] font-bold text-gray-500">
                        COMPRESSED
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatFileSize(resultSize)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-50 pt-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
                      <Zap className="h-4 w-4 fill-emerald-600" />
                      {Math.round((1 - resultSize / (file?.size || 1)) * 100)}%
                      Reduction
                    </div>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="flex flex-col justify-center gap-4 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                  <button
                    onClick={handleDownload}
                    className="btn-primary group flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="h-6 w-6 transition-transform group-hover:translate-y-0.5" />
                    <span className="font-bold">Download Compressed PDF</span>
                  </button>
                  <button
                    onClick={reset}
                    className="btn-outline flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Compress Another
                  </button>
                  <div className="mt-2 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <p className="text-[10px] leading-tight font-medium text-gray-500">
                      All processing happened locally in your browser. Your data
                      never left your device.
                    </p>
                  </div>
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
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Compression failed</h2>
              <p className="mb-10 text-gray-500">{errorMessage}</p>

              <button
                onClick={reset}
                className="btn-primary flex items-center gap-2 px-10 py-4"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <EducationalContent
          howItWorks={{
            title: "How to Compress PDF",
            steps: [
              "Upload your PDF and wait for our local analyzer to generate a preview.",
              "Choose your compression level: Recommended (balanced), Low (max quality), or Extreme (max compression).",
              "Hit &apos;Compress&apos; and download your optimized PDF instantly. All processing is 100% private.",
            ],
          }}
          benefits={{
            title: "Professional PDF Compression",
            items: [
              {
                title: "Browser-side Processing",
                desc: "Your files never touch our servers. We value your privacy above all else.",
              },
              {
                title: "Size Reduction",
                desc: "Reduce up to 90% of your file size by optimizing redundant structures and metadata.",
              },
              {
                title: "Quality Control",
                desc: "Our visual preview lets you verify the document looks perfect before you process it.",
              },
              {
                title: "Universal Compatibility",
                desc: "Compressed files follow standard ISO protocols and work anywhere.",
              },
            ],
          }}
          faqs={[
            {
              question: "How does the compression work?",
              answer:
                "We use sophisticated algorithms to remove redundant PDF objects, compress metadata, and optimize internal streams without altering your visible text or layout.",
            },
            {
              question: "Is &apos;Extreme&apos; compression safe?",
              answer:
                "Yes, it's completely safe. However, in documents with high-resolution images, you might notice some slight softening of details. For standard text documents, it's virtually indistinguishable from the original.",
            },
            {
              question: "Can I undo the compression?",
              answer:
                "Compression is a one-way process that creates a new file. You will always keep your original original file on your computer; we just help you create a smaller version of it.",
            },
          ]}
        />
      </div>

      {/* Preview Modal */}
      <PDFPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        images={pages.map((p) => p.image)}
        currentPage={previewPage}
        onPageChange={setPreviewPage}
        onDownload={handleCompress}
        title="Compress PDF Preview"
      />
    </div>
  );
}
