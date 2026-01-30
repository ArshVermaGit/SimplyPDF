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
  Copy,
  Maximize2,
  Undo,
  Redo,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";
import { uint8ArrayToBlob, formatFileSize } from "@/lib/pdf-utils";
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

export function DuplicatePagesClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const [customFileName, setCustomFileName] = useState(
    "duplicated_document.pdf"
  );

  // History for Undo/Redo
  const [undoRedoHistory, setUndoRedoHistory] = useState<
    { pages: PageInfo[] }[]
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushToUndoRedo = (newPages: PageInfo[]) => {
    const newHistory = undoRedoHistory.slice(0, historyIndex + 1);
    newHistory.push({ pages: [...newPages] });
    if (newHistory.length > 20) newHistory.shift();
    setUndoRedoHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPages(undoRedoHistory[newIndex].pages);
    }
  };

  const redo = () => {
    if (historyIndex < undoRedoHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPages(undoRedoHistory[newIndex].pages);
    }
  };

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
      const pageCount = pdfDoc.numPages;

      const pageInfos: PageInfo[] = [];
      for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;

        pageInfos.push({
          id: `page-${i - 1}-${Date.now()}`,
          pageNumber: i, // Original page number for mapping
          selected: true,
          image: canvas.toDataURL("image/jpeg", 0.7),
        });

        (page as { cleanup?: () => void }).cleanup?.();
      }

      setPages(pageInfos);
      setCustomFileName(`${pdfFile.name.replace(".pdf", "")}_duplicated.pdf`);
      pushToUndoRedo(pageInfos);
      setStatus("ready");
      await pdfDoc.destroy();
    } catch (error: unknown) {
      console.error("PDF loading error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(`Failed to load PDF: ${message}`);
      setStatus("error");
    }
  };

  const duplicatePage = (index: number) => {
    const newPages = [...pages];
    const pageToDuplicate = newPages[index];
    const duplicatedPage = {
      ...pageToDuplicate,
      id: `page-dup-${Date.now()}-${Math.random()}`,
    };
    newPages.splice(index + 1, 0, duplicatedPage);
    setPages(newPages);
    pushToUndoRedo(newPages);
  };

  const handleProcess = async () => {
    if (!file || pages.length === 0) return;

    setStatus("processing");
    setErrorMessage("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // The 'pages' array now contains references (original pageNumber) which might be duplicated
      const pageIndices = pages.map((p) => p.pageNumber - 1);
      const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");

      addToHistory(
        "Duplicated Pages",
        file.name,
        `Final document has ${pages.length} pages`
      );
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to duplicate pages";
      setErrorMessage(message);
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
    setPages([]);
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
                title="Duplicate PDF Pages"
                description="Clone and multiply specific pages within your PDF document."
                icon={Copy}
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
              description="Preparing pages for duplication..."
            />
          )}

          {status === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-7xl"
            >
              {/* Toolbar */}
              <div className="mb-8 flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/20 bg-white/50 p-6 shadow-sm backdrop-blur-md md:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
                    <File className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl leading-tight font-bold text-gray-900">
                      {file?.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500">
                      {pages.length} Pages • {formatFileSize(file?.size || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="rounded-lg p-2 transition-colors hover:bg-gray-100 disabled:opacity-30"
                      title="Undo"
                    >
                      <Undo className="h-5 w-5" />
                    </button>
                    <div className="mx-1.5 h-5 w-px bg-gray-200" />
                    <button
                      onClick={redo}
                      disabled={historyIndex >= undoRedoHistory.length - 1}
                      className="rounded-lg p-2 transition-colors hover:bg-gray-100 disabled:opacity-30"
                      title="Redo"
                    >
                      <Redo className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mx-1 h-8 w-px bg-gray-200" />
                  <button
                    onClick={reset}
                    className="rounded-xl p-2.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Reset"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleProcess}
                    className="btn-primary group flex items-center gap-2 rounded-xl px-8 py-3 shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Copy className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="font-bold">Generate PDF</span>
                  </button>
                </div>
              </div>

              {/* Page Grid */}
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {pages.map((page, index) => (
                  <motion.div
                    key={page.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative"
                  >
                    <div className="relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-white p-1 shadow-sm transition-all hover:border-black hover:shadow-xl">
                      <div className="relative aspect-3/4 bg-white">
                        <Image
                          src={page.image}
                          alt={`Page ${index + 1}`}
                          fill
                          className="h-full w-full object-contain"
                          unoptimized
                        />

                        {/* Page Number Overlay */}
                        <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                          Page {index + 1}
                        </div>

                        {/* Actions Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                          <button
                            onClick={() => duplicatePage(index)}
                            className="flex scale-90 transform items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow-xl transition-all group-hover:scale-100 hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => {
                              setPreviewPage(index);
                              setPreviewOpen(true);
                            }}
                            className="rounded-full border border-white/30 bg-white/20 p-2 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
                          >
                            <Maximize2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Generating document..."
              description="Cloning pages and building your new PDF..."
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-xl text-center"
            >
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-black text-white">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Done!</h2>
              <p className="mb-10 text-gray-500">
                Your document with duplicated pages is ready.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 px-10 py-4"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
                <button
                  onClick={reset}
                  className="btn-outline flex items-center gap-2 px-10 py-4"
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
            title: "How to Duplicate PDF Pages",
            steps: [
              "Select the PDF file you want to edit.",
              "Click 'Duplicate' on any page thumbnail to create an exact copy next to it.",
              "Click 'Generate PDF' to finalize your document with the new clones.",
            ],
          }}
          benefits={{
            title: "Why Clone PDF Pages with Simplified PDF?",
            items: [
              {
                title: "Instant Cloning",
                desc: "Create multiple copies of specific pages with a single click.",
              },
              {
                title: "Privacy First",
                desc: "Like all our tools, page duplication happens locally on your machine.",
              },
              {
                title: "Accurate Metadata",
                desc: "Page links and properties are preserved across duplicated copies.",
              },
              {
                title: "Free & Unlimited",
                desc: "Duplicate as many pages as you need without signing up or paying.",
              },
            ],
          }}
          faqs={[
            {
              question: "Why would I need to duplicate a page?",
              answer:
                "It's common for creating forms, repetitive templates, or adding several copies of a cover page.",
            },
            {
              question: "Does it increase the file size significantly?",
              answer:
                "It adds the data of the new pages, but we optimize the output to keep it as small as possible.",
            },
            {
              question: "Can I reorder the duplicated pages?",
              answer:
                "Yes, once duplicated, you can use our Reorder tool to rearrange them as you like.",
            },
          ]}
        />
      </div>

      <PDFPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        images={pages.map((p) => p.image)}
        currentPage={previewPage}
        onPageChange={setPreviewPage}
        title="Page Preview"
      />
    </div>
  );
}
