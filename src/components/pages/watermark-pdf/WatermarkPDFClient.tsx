"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Stamp,
  Maximize2,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { formatFileSize, uint8ArrayToBlob } from "@/lib/pdf-utils";
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

export function WatermarkPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(30);
  const [fontSize, setFontSize] = useState(48);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const [customFileName, setCustomFileName] = useState("watermarked.pdf");

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      await loadPreview(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await loadPreview(selectedFile);
    }
  };

  const loadPreview = async (pdfFile: File) => {
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

      const pageImages: string[] = [];
      for (let i = 1; i <= Math.min(numPages, 10); i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        pageImages.push(canvas.toDataURL("image/jpeg", 0.6));
        (page as { cleanup?: () => void }).cleanup?.();
      }

      setPages(pageImages);
      setCustomFileName(`watermarked_${pdfFile.name}`);
      setStatus("ready");
      await pdfDoc.destroy();
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(`Failed to load PDF preview: ${msg}`);
      setStatus("error");
    }
  };

  const handleWatermark = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pagesArray = pdf.getPages();

      for (const page of pagesArray) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

        page.drawText(watermarkText, {
          x: (width - textWidth) / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacity / 100,
          rotate: degrees(-45),
        });
      }

      const pdfBytes = await pdf.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");
      addToHistory("Watermarked PDF", file.name, "Added text watermark");
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage(
        "Failed to add watermark. The document might be protected or corrupted."
      );
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
    setStatus("idle");
    setPages([]);
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
                title="Watermark PDF"
                description="Add a professional text watermark to your PDF documents with real-time positioning."
                icon={Stamp}
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
              description="Generating live workspace..."
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
                {/* Configuration Panel */}
                <div className="lg:col-span-12">
                  <div className="mb-8 flex flex-col items-center justify-between gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:flex-row">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                        <File className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="max-w-[200px] truncate font-bold text-gray-900">
                          {file?.name}
                        </p>
                        <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                          {formatFileSize(file?.size || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full gap-4 md:w-auto">
                      <button
                        onClick={reset}
                        className="btn-outline flex-1 rounded-2xl px-8 py-4 font-bold md:flex-none"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleWatermark}
                        className="btn-primary group flex flex-2 items-center justify-center gap-2 rounded-2xl px-10 py-4 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] md:flex-none"
                      >
                        <Stamp className="h-5 w-5 transition-transform group-hover:rotate-12" />
                        <span className="font-bold">Apply Watermark</span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar: Settings */}
                <div className="space-y-6 lg:col-span-4">
                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <h3 className="mb-8 text-xl font-bold text-gray-900">
                      Watermark Style
                    </h3>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Watermark Text
                        </label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          className="w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm font-medium transition-all focus:border-black"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            Opacity: {opacity}%
                          </label>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          value={opacity}
                          onChange={(e) => setOpacity(Number(e.target.value))}
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-black"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            Font Size: {fontSize}px
                          </label>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="144"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-black"
                        />
                      </div>

                      <div className="space-y-2 pt-4">
                        <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Output Filename
                        </label>
                        <input
                          type="text"
                          value={customFileName}
                          onChange={(e) => setCustomFileName(e.target.value)}
                          className="w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm transition-all focus:border-black"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Workspace: Preview */}
                <div className="lg:col-span-8">
                  <div className="flex min-h-[500px] flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <h3 className="mb-8 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Dynamic Live Preview
                    </h3>

                    <div
                      className="group relative aspect-3/4 flex-1 cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-inner"
                      onClick={() => setPreviewOpen(true)}
                    >
                      {pages[0] && (
                        <>
                          <Image
                            src={pages[0]}
                            alt="Main Preview"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
                            <motion.div
                              animate={{ opacity: opacity / 100 }}
                              className="font-bold whitespace-nowrap text-gray-500"
                              style={{
                                fontSize: `${fontSize * 0.6}px`,
                                transform: "rotate(-45deg)",
                              }}
                            >
                              {watermarkText}
                            </motion.div>
                          </div>
                        </>
                      )}

                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                        <div className="scale-75 transform rounded-full border border-white/30 bg-white/20 p-3 shadow-2xl backdrop-blur-md transition-transform duration-300 group-hover:scale-100">
                          <Maximize2 className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                          Preview Result
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Applying watermark..."
              description="Rendering vector text layers..."
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
                  Watermark Added!
                </h2>
                <p className="text-lg font-medium text-gray-500">
                  Your document has been professionally watermarked.
                </p>
              </div>

              <ToolCard className="mx-auto max-w-2xl p-10 shadow-2xl">
                <div className="flex flex-col items-center gap-8">
                  <div className="flex w-full items-center gap-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <Stamp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        Branding Applied
                      </p>
                      <p className="text-xs font-medium text-emerald-700">
                        &quot;{watermarkText}&quot; added to all {pages.length}{" "}
                        pages
                      </p>
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <button
                      onClick={handleDownload}
                      className="btn-primary group flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Download className="h-6 w-6 transition-transform group-hover:translate-y-0.5" />
                      <span className="font-bold">
                        Download Watermarked PDF
                      </span>
                    </button>
                    <button
                      onClick={reset}
                      className="btn-outline flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Watermark New
                    </button>
                  </div>
                </div>
              </ToolCard>
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
              <h2 className="mb-2 text-3xl font-bold">Watermark failed</h2>
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
            title: "How to Watermark PDF",
            steps: [
              "Upload your PDF and wait for our local workspace to initialize.",
              "Customize your watermark text, opacity, and size. Use our live preview to see exactly how it looks.",
              "Hit 'Apply Watermark' and download your branded PDF instantly. All processing is 100% private.",
            ],
          }}
          benefits={{
            title: "Professional PDF Branding",
            items: [
              {
                title: "Dynamic Preview",
                desc: "Instantly see how your watermark looks with real-time text and opacity updates.",
              },
              {
                title: "Privacy First",
                desc: "All watermarking is done locally in your browser. Your sensitive files never leave your device.",
              },
              {
                title: "Batch Processing",
                desc: "Apply your watermark to every single page in the document automatically.",
              },
              {
                title: "Export Options",
                desc: "Easily download your watermarked document with custom filenames for better organization.",
              },
            ],
          }}
          faqs={[
            {
              question: "Can I add images as watermarks?",
              answer:
                "Currently, we support text-based watermarking. Support for image-based watermarks (logos) is coming soon in a future update.",
            },
            {
              question: "Does this affect the text in my PDF?",
              answer:
                "No, the watermark is added as a semi-transparent layer on top of your existing content, ensuring all original text remains readable.",
            },
            {
              question: "Is the watermark permanent?",
              answer:
                "The watermark is embedded into the PDF structure of the new file we generate. You will always keep your original original document unchanged.",
            },
          ]}
        />
      </div>

      {/* Preview Modal */}
      <PDFPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        images={pages}
        currentPage={previewPage}
        onPageChange={setPreviewPage}
        watermark={{ text: watermarkText, opacity, fontSize }}
        onDownload={handleWatermark}
        title="Watermark PDF Preview"
      />
    </div>
  );
}
