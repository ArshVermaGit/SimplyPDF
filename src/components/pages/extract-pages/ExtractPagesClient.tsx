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
  Scissors,
  Maximize2,
  Check,
  Undo,
  Redo,
} from "lucide-react";
import Image from "next/image";
import { splitPDF, formatFileSize } from "@/lib/pdf-utils";
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

export function ExtractPagesClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "processing" | "success" | "error"
  >("idle");
  const [results, setResults] = useState<{ name: string; data: Uint8Array }[]>(
    []
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const [customFileName, setCustomFileName] = useState("extracted_pages.pdf");
  const [lastSelectedPage, setLastSelectedPage] = useState<number | null>(null);

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
          selected: false,
        });

        (page as { cleanup?: () => void }).cleanup?.();
      }

      setPages(pageInfos);
      setCustomFileName(`${pdfFile.name.replace(".pdf", "")}_extracted.pdf`);
      pushToUndoRedo(pageInfos);
      setStatus("ready");
      await pdfDoc.destroy();
    } catch (error: unknown) {
      console.error("PDF loading error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(`Failed to load PDF pages: ${message}`);
      setStatus("error");
    }
  };

  const handlePageClick = (pageNumber: number, isShiftKey: boolean) => {
    if (isShiftKey && lastSelectedPage !== null) {
      const start = Math.min(lastSelectedPage, pageNumber);
      const end = Math.max(lastSelectedPage, pageNumber);
      const newPages = pages.map((p) =>
        p.pageNumber >= start && p.pageNumber <= end
          ? { ...p, selected: true }
          : p
      );
      setPages(newPages);
      pushToUndoRedo(newPages);
    } else {
      const newPages = pages.map((p) =>
        p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
      );
      setPages(newPages);
      setLastSelectedPage(pageNumber);
      pushToUndoRedo(newPages);
    }
  };

  const selectAll = () => {
    const newPages = pages.map((p) => ({ ...p, selected: true }));
    setPages(newPages);
    pushToUndoRedo(newPages);
  };

  const deselectAll = () => {
    const newPages = pages.map((p) => ({ ...p, selected: false }));
    setPages(newPages);
    pushToUndoRedo(newPages);
  };

  const handleExtract = async () => {
    if (!file) return;
    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0) {
      setErrorMessage("Please select at least one page to extract.");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setErrorMessage("");

    try {
      const selectedRanges = selectedPages
        .map((p) => p.pageNumber.toString())
        .join(",");

      const splitFiles = await splitPDF(
        file,
        "range",
        selectedRanges,
        "{filename}_extracted"
      );
      setResults(splitFiles);
      setStatus("success");

      addToHistory(
        "Extract Pages",
        file.name,
        `Extracted ${selectedPages.length} pages`
      );
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(message || "Failed to extract pages");
      setStatus("error");
    }
  };

  const handleDownloadSingle = (result: { name: string; data: Uint8Array }) => {
    const blob = new Blob([result.data.slice().buffer], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = customFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResults([]);
    setPages([]);
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
                title="Extract PDF Pages"
                description="Select and extract specific pages into a new PDF document."
                icon={Scissors}
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
              description="Generating page previews..."
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
              <div className="flex flex-col items-start gap-8 lg:flex-row">
                {/* Left Column: Page Grid */}
                <div className="w-full flex-1 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-black/10">
                        <File className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="mb-1 leading-none font-bold text-gray-900">
                          {file?.name}
                        </h3>
                        <p className="text-xs font-medium text-gray-500">
                          {pages.length} Pages •{" "}
                          {formatFileSize(file?.size || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                        <button
                          onClick={selectAll}
                          className="rounded-md px-3 py-1.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors hover:bg-gray-50"
                        >
                          Select All
                        </button>
                        <div className="mx-1 h-4 w-px bg-gray-200" />
                        <button
                          onClick={deselectAll}
                          className="rounded-md px-3 py-1.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors hover:bg-gray-50"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                        <button
                          onClick={undo}
                          disabled={historyIndex <= 0}
                          className="rounded-md p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30"
                          title="Undo"
                        >
                          <Undo className="h-4 w-4" />
                        </button>
                        <div className="mx-1 h-4 w-px bg-gray-200" />
                        <button
                          onClick={redo}
                          disabled={historyIndex >= undoRedoHistory.length - 1}
                          className="rounded-md p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30"
                          title="Redo"
                        >
                          <Redo className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="h-6 w-px bg-gray-200" />
                      <button
                        onClick={reset}
                        className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Reset"
                      >
                        <RefreshCw className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="scrollbar-thin scrollbar-thumb-gray-200 max-h-[70vh] overflow-y-auto p-8">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {pages.map((page) => (
                        <div
                          key={page.pageNumber}
                          className="group relative flex flex-col items-center"
                        >
                          <motion.div
                            whileHover={{ y: -4 }}
                            className={`relative aspect-3/4 w-full overflow-hidden rounded-xl border-2 shadow-sm transition-all duration-300 ${
                              page.selected
                                ? "border-black ring-4 ring-black/5"
                                : "border-gray-200 opacity-60 grayscale-[0.5]"
                            }`}
                            onClick={(e) =>
                              handlePageClick(page.pageNumber, e.shiftKey)
                            }
                          >
                            <Image
                              src={page.image}
                              alt={`Page ${page.pageNumber}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                            <div
                              className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                                page.selected
                                  ? "scale-100 border-black bg-black text-white"
                                  : "scale-90 border-gray-300 bg-white/80 opacity-0 backdrop-blur-sm group-hover:opacity-100"
                              }`}
                            >
                              {page.selected && (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <div className="absolute bottom-2 left-2 rounded-lg bg-black/80 px-2 py-1 text-[10px] leading-none font-bold text-white backdrop-blur-md">
                              P.{page.pageNumber}
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewPage(
                                    pages.findIndex(
                                      (p) => p.pageNumber === page.pageNumber
                                    )
                                  );
                                  setPreviewOpen(true);
                                }}
                                className="flex h-10 w-10 scale-75 transform items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-100 hover:bg-white hover:text-black"
                              >
                                <Maximize2 className="h-5 w-5" />
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Sidebar Settings */}
                <div className="w-full space-y-6 lg:sticky lg:top-24 lg:w-[320px]">
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                    <div className="mb-6 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <Scissors className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-gray-900">
                        Extraction Settings
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Output Filename
                        </label>
                        <input
                          type="text"
                          value={customFileName}
                          onChange={(e) => setCustomFileName(e.target.value)}
                          placeholder="Enter filename..."
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-black focus:outline-none"
                        />
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between text-xs font-bold tracking-widest text-gray-400 uppercase">
                          <span>Summary</span>
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Selected pages:</span>
                          <span className="font-bold text-gray-900">
                            {pages.filter((p) => p.selected).length}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleExtract}
                        disabled={pages.filter((p) => p.selected).length === 0}
                        className="btn-primary group flex w-full items-center justify-center gap-2 rounded-2xl py-4 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                      >
                        <Scissors className="h-5 w-5 transition-transform group-hover:rotate-12" />
                        <span className="text-base font-bold">
                          Extract Pages
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Extracting pages..."
              description="Creating your new PDF..."
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
              <h2 className="mb-2 text-3xl font-bold">Extraction Complete!</h2>
              <p className="mb-10 text-gray-500">
                Your new PDF with selected pages is ready.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => handleDownloadSingle(results[0])}
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
            title: "How to Extract PDF Pages",
            steps: [
              "Upload your PDF and wait for the thumbnails to appear.",
              "Select the specific pages you want to keep by clicking on them.",
              "Click 'Extract Pages' to create a new PDF containing only those selected pages.",
            ],
          }}
          benefits={{
            title: "Why Use Our PDF Extractor?",
            items: [
              {
                title: "Completely Private",
                desc: "Your files never leave your browser. We don't upload or store your data on any server.",
              },
              {
                title: "No File Limits",
                desc: "Extract as many pages as you need. Our tool is free forever with no hidden costs.",
              },
              {
                title: "High Quality",
                desc: "Our extraction process maintains the original quality and formatting of your documents.",
              },
              {
                title: "Page Precision",
                desc: "See exactly what you're extracting with our high-resolution page previews.",
              },
            ],
          }}
          faqs={[
            {
              question: "Does extracting pages reduce the quality?",
              answer:
                "No, SimplyPDF ensures that the original quality, fonts, and images are preserved perfectly.",
            },
            {
              question: "Are my files safe?",
              answer:
                "Yes, all processing happens locally in your browser. Your files are never uploaded to any server.",
            },
            {
              question: "Can I extract multiple non-consecutive pages?",
              answer:
                "Yes, you can select any combination of pages from your document.",
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
