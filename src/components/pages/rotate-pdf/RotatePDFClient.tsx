"use client";

export const dynamic = "force-dynamic";

import { PageInfo } from "@/types";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File as FileIcon,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  RotateCw,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { rotatePDF, uint8ArrayToBlob } from "@/lib/pdf-utils";
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

export function RotatePDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [globalRotation, setGlobalRotation] = useState<0 | 90 | 180 | 270>(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const [customFileName, setCustomFileName] = useState("rotated.pdf");

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
      for (let i = 1; i <= numPages; i++) {
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
          rotation: 0,
          selected: true,
        });

        (page as { cleanup?: () => void }).cleanup?.();
      }

      setPages(pageInfos);
      setCustomFileName(`rotated_${pdfFile.name}`);
      setStatus("ready");
      await pdfDoc.destroy();
    } catch (error: unknown) {
      const err = error as Error;
      console.error("PDF loading error:", err);
      setErrorMessage(
        `Failed to load PDF pages: ${err.message || "Unknown error"}`
      );
      setStatus("error");
    }
  };

  const handleRotateIndividual = (index: number, delta: number) => {
    setPages((prev) =>
      prev.map((p, i) => {
        if (i === index) {
          const newRotation = ((((p.rotation ?? 0) + delta) % 360) + 360) % 360;
          return { ...p, rotation: newRotation as 0 | 90 | 180 | 270 };
        }
        return p;
      })
    );
  };

  const handleRotate = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const rotations = pages.map(
        (p) => ((p.rotation ?? 0) + globalRotation) % 360
      );
      const pdfBytes = await rotatePDF(file, rotations);
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");
      addToHistory(
        "Rotated PDF",
        file.name,
        `Custom per-page rotations applied`
      );
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to rotate PDF"
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
    setGlobalRotation(90);
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
                title="Rotate PDF"
                description="Rotate your PDF pages with pixel-perfect visual preview and local processing."
                icon={RotateCw}
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
              description="Generating high-definition previews..."
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
              <div className="flex flex-col gap-8">
                {/* Configuration Toolbar */}
                <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:flex-row">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                      <FileIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="max-w-[200px] truncate font-bold text-gray-900">
                        {file?.name}
                      </p>
                      <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                        {pages.length} Pages
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Global Rotation Offset
                    </p>
                    <div className="flex rounded-2xl bg-gray-100 p-1">
                      {[
                        { value: 0, label: "0°" },
                        { value: 90, label: "90°" },
                        { value: 180, label: "180°" },
                        { value: 270, label: "270°" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            setGlobalRotation(
                              option.value as 0 | 90 | 180 | 270
                            )
                          }
                          className={`rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                            globalRotation === option.value
                              ? "bg-white text-black shadow-sm"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
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
                      onClick={handleRotate}
                      className="btn-primary group flex flex-1 items-center justify-center gap-2 rounded-2xl px-10 py-4 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] md:flex-none"
                    >
                      <RotateCw className="h-5 w-5 transition-transform group-hover:rotate-12" />
                      <span className="font-bold">Apply & Save</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* Preview Grid */}
                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                  <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Visual Layout Preview
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      <span>Click to preview</span>
                      <div className="h-3 w-px bg-gray-200" />
                      <span>Use arrows to rotate individual pages</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {pages.map((page, index) => (
                      <motion.div
                        key={page.pageNumber}
                        layout
                        className="group relative"
                      >
                        <div className="relative aspect-[3/4.2] overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all group-hover:border-black group-hover:shadow-2xl">
                          <div
                            className="h-full w-full origin-center cursor-pointer transition-transform duration-500"
                            onClick={() => {
                              setPreviewPage(index);
                              setPreviewOpen(true);
                            }}
                            style={{
                              transform: `rotate(${((page.rotation ?? 0) + globalRotation) % 360}deg)`,
                            }}
                          >
                            <Image
                              src={page.image}
                              alt={`Page ${page.pageNumber}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>

                          {/* Individual Page Controls */}
                          <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRotateIndividual(index, 90);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/90 text-white shadow-lg transition-colors hover:bg-black"
                              title="Rotate 90° clockwise"
                            >
                              <RotateCw className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />

                          <div className="pointer-events-none absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-lg bg-black/80 text-[10px] font-bold text-white backdrop-blur-md">
                            {page.pageNumber}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mx-auto w-full max-w-md">
                  <label className="mb-2 block px-1 text-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Output Filename
                  </label>
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium shadow-lg transition-all focus:ring-4 focus:ring-black/5 focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Rotating pages..."
              description="Applying orientation fixes locally..."
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
                  PDF Rotated!
                </h2>
                <p className="text-lg font-medium text-gray-500">
                  All pages have been successfully reoriented.
                </p>
              </div>

              <ToolCard className="mx-auto max-w-2xl p-10 shadow-2xl">
                <div className="flex flex-col items-center gap-8">
                  <div className="flex w-full items-center gap-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <RotateCw
                        className="h-6 w-6"
                        style={{ transform: `rotate(${globalRotation}deg)` }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        Orientation Applied
                      </p>
                      <p className="text-xs font-medium text-blue-700">
                        {globalRotation}&deg; rotation applied to all pages
                      </p>
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <button
                      onClick={handleDownload}
                      className="btn-primary group flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Download className="h-6 w-6 transition-transform group-hover:translate-y-0.5" />
                      <span className="font-bold">Download Rotated PDF</span>
                    </button>
                    <button
                      onClick={reset}
                      className="btn-outline flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Rotate New
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
              <h2 className="mb-2 text-3xl font-bold">Something went wrong</h2>
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
            title: "How to Rotate PDF",
            steps: [
              "Upload your PDF and wait for our local engine to generate high-speed previews.",
              "Select your desired rotation angle (90, 180, or 270 degrees) and watch the previews update in real-time.",
              "Download your perfectly oriented PDF. All processing happens locally for maximum privacy.",
            ],
          }}
          benefits={{
            title: "Professional PDF Orientation",
            items: [
              {
                title: "Visual Preview",
                desc: "See exactly how your document will look before you commit the changes.",
              },
              {
                title: "Browser-side Processing",
                desc: "No files are ever uploaded. Your data stays on your machine, 100% private.",
              },
              {
                title: "High Speed",
                desc: "Reorient large documents in milliseconds using our optimized PDF engine.",
              },
              {
                title: "Lossless Rotation",
                desc: "We update the orientation flags without re-encoding, preserving 100% quality.",
              },
            ],
          }}
          faqs={[
            {
              question: "Can I rotate individual pages?",
              answer:
                "Currently, our 'Rotate All' tool applies the rotation to the entire document. For individual page management, try our 'Organize PDF' tool.",
            },
            {
              question: "Does rotation affect image quality?",
              answer:
                "Not at all. We use lossless rotation that simply updates the display metadata within the PDF structure, keeping every pixel exactly as it was.",
            },
            {
              question: "Is there a file size limit?",
              answer:
                "Since processing happens in your browser, the limit is governed by your device's memory. Most files up to 200MB rotate instantly.",
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
        rotation={(pages[previewPage]?.rotation ?? 0) + globalRotation}
        onDownload={handleRotate}
        title="Rotate PDF Preview"
      />
    </div>
  );
}
