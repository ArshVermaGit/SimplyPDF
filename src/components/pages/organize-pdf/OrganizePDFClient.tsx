"use client";

export const dynamic = "force-dynamic";

import { PageInfo } from "@/types";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Upload,
  File,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  GripVertical,
  Trash2,
  Layers,
  Eye,
  Check,
  Undo,
  Redo,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { uint8ArrayToBlob } from "@/lib/pdf-utils";
import { PDFPreviewModal } from "@/components/pdf/PDFPreviewModal";
import Image from "next/image";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";

export function OrganizePDFClient() {
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
  const [customFileName, setCustomFileName] = useState("organized.pdf");

  // History for Undo/Redo
  const [undoRedoHistory, setUndoRedoHistory] = useState<PageInfo[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushToUndoRedo = (newPages: PageInfo[]) => {
    const newHistory = undoRedoHistory.slice(0, historyIndex + 1);
    newHistory.push([...newPages]);
    if (newHistory.length > 20) newHistory.shift();
    setUndoRedoHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPages(undoRedoHistory[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < undoRedoHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPages(undoRedoHistory[newIndex]);
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
      console.log("Loading pdfjs-dist...");
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
          id: `page-${i - 1}`,
          pageNumber: i,
          selected: true,
          image: canvas.toDataURL("image/jpeg", 0.7),
        });

        (page as { cleanup?: () => void }).cleanup?.();
      }

      setPages(pageInfos);
      setCustomFileName(`${pdfFile.name.replace(".pdf", "")}_organized.pdf`);
      pushToUndoRedo(pageInfos);
      setStatus("ready");
      await pdfDoc.destroy();
    } catch (error) {
      console.error("PDF loading error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(`Failed to load PDF: ${message}`);
      setStatus("error");
    }
  };

  const togglePage = (id: string) => {
    const newPages = pages.map((p) =>
      p.id === id ? { ...p, selected: !p.selected } : p
    );
    setPages(newPages);
    pushToUndoRedo(newPages);
  };

  const removePage = (id: string) => {
    const newPages = pages.filter((p) => p.id !== id);
    setPages(newPages);
    pushToUndoRedo(newPages);
  };

  const openPreview = (index: number) => {
    setPreviewPage(index);
    setPreviewOpen(true);
  };

  const handleOrganize = async () => {
    if (!file || pages.length === 0) return;

    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0) {
      setErrorMessage("Please select at least one page to keep.");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setErrorMessage("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const pageIndices = selectedPages.map((p) => p.pageNumber - 1);
      const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");

      if (file) {
        addToHistory("Organized PDF", file.name, "Pages reordered/deleted");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to organize PDF. Please try again.");
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
                title="Organize PDF"
                description="Sort, delete, and reorder PDF pages with visual previews."
                icon={Layers}
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
              message="Loading PDF pages..."
              description="Generating previews..."
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
              {/* Header */}
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
                      {pages.length} pages •{" "}
                      {pages.filter((p) => p.selected).length} selected
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
                    onClick={handleOrganize}
                    disabled={pages.filter((p) => p.selected).length === 0}
                    className="btn-primary group flex items-center gap-2 rounded-xl px-8 py-3 shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                  >
                    <Layers className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="font-bold">Apply Changes</span>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6 rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-gray-600">
                  <strong>Drag</strong> to reorder •{" "}
                  <strong>Click checkbox</strong> to select/deselect •{" "}
                  <strong>Click preview</strong> to view full page
                </p>
              </div>

              {/* Page Grid with Reorder */}
              <Reorder.Group
                axis="x"
                values={pages}
                onReorder={(newPages) => {
                  setPages(newPages);
                  pushToUndoRedo(newPages);
                }}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              >
                {pages.map((page, index) => (
                  <Reorder.Item
                    key={page.id}
                    value={page}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                      className="group relative"
                    >
                      {/* Thumbnail */}
                      <div
                        className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                          page.selected
                            ? "border-black shadow-lg"
                            : "border-gray-200 opacity-50"
                        }`}
                      >
                        {/* Drag Handle */}
                        <div className="absolute top-2 left-2 z-10">
                          <div className="rounded-lg bg-white/90 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
                            <GripVertical className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>

                        {/* Image */}
                        <div
                          className="aspect-3/4 cursor-pointer bg-white"
                          onClick={() => openPreview(index)}
                        >
                          <Image
                            src={page.image}
                            alt={`Page ${page.pageNumber}`}
                            fill
                            className="h-full w-full object-contain"
                            unoptimized
                          />
                        </div>

                        {/* Hover Overlay */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                          <div className="opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="rounded-full bg-white p-3 shadow-xl">
                              <Eye className="h-5 w-5" />
                            </div>
                          </div>
                        </div>

                        {/* Page Number */}
                        <div className="absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-xs font-bold text-white">
                          {page.pageNumber}
                        </div>

                        {/* Selection Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (page.id) togglePage(page.id);
                          }}
                          className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                            page.selected
                              ? "border-black bg-black text-white"
                              : "border-gray-300 bg-white hover:border-black"
                          }`}
                        >
                          {page.selected && <Check className="h-3 w-3" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (page.id) removePage(page.id);
                          }}
                          className="absolute right-2 bottom-2 rounded-lg bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Organizing pages..."
              description="This won't take long..."
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
              <h2 className="mb-2 text-3xl font-bold">PDF Organized!</h2>
              <p className="mb-10 text-gray-500">
                Your pages have been reordered successfully.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
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
                  Organize Another
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
      </div>

      {/* Preview Modal */}
      <PDFPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        images={pages.map((p) => p.image)}
        currentPage={previewPage}
        onPageChange={setPreviewPage}
        onDownload={handleOrganize}
        title="Organize PDF Preview"
      />
    </div>
  );
}
