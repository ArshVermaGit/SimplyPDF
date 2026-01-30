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
  Trash2,
  X,
  Undo,
  Redo,
} from "lucide-react";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";
import { uint8ArrayToBlob, formatFileSize } from "@/lib/pdf-utils";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { EducationalContent } from "@/components/layout/EducationalContent";
import { useHistory } from "@/context/HistoryContext";

export function DeletePagesClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [customFileName, setCustomFileName] = useState("modified_document.pdf");

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
          selected: true, // true means "keep", false means "delete"
        });

        (page as { cleanup?: () => void }).cleanup?.();
      }

      setPages(pageInfos);
      setCustomFileName(`${pdfFile.name.replace(".pdf", "")}_deleted.pdf`);
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

  const togglePage = (pageNumber: number) => {
    const newPages = pages.map((p) =>
      p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
    );
    setPages(newPages);
    pushToUndoRedo(newPages);
  };

  const handleDelete = async () => {
    if (!file) return;
    const keptPages = pages.filter((p) => p.selected);
    if (keptPages.length === 0) {
      setErrorMessage(
        "You cannot delete all pages. At least one page must remain."
      );
      setStatus("error");
      return;
    }

    setStatus("processing");
    setErrorMessage("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const pageIndices = keptPages.map((p) => p.pageNumber - 1);
      const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");

      addToHistory(
        "Delete Pages",
        file.name,
        `Removed ${pages.length - keptPages.length} pages`
      );
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to delete pages";
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
    setStatus("idle");
    setResultBlob(null);
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
                title="Delete PDF Pages"
                description="Select and remove unwanted pages from your PDF document."
                icon={Trash2}
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
                                ? "border-gray-200"
                                : "border-red-500 opacity-60 ring-4 ring-red-500/10 grayscale-[0.8]"
                            }`}
                            onClick={() => togglePage(page.pageNumber)}
                          >
                            <Image
                              src={page.image}
                              alt={`Page ${page.pageNumber}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            {!page.selected && (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                                <Trash2 className="h-12 w-12 text-red-500" />
                              </div>
                            )}
                            <div
                              className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                                !page.selected
                                  ? "scale-100 border-red-500 bg-red-500 text-white"
                                  : "scale-90 border-gray-300 bg-white/80 opacity-0 backdrop-blur-sm group-hover:opacity-100"
                              }`}
                            >
                              {!page.selected && <X className="h-4 w-4" />}
                              {page.selected && (
                                <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                              )}
                            </div>
                            <div className="absolute bottom-2 left-2 rounded-lg bg-black/80 px-2 py-1 text-[10px] leading-none font-bold text-white backdrop-blur-md">
                              P.{page.pageNumber}
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-gray-900">
                        Delete Settings
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between text-xs font-bold tracking-widest text-gray-400 uppercase">
                          <span>Summary</span>
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total pages:</span>
                            <span className="font-bold text-gray-900">
                              {pages.length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-red-500">To be deleted:</span>
                            <span className="font-bold text-red-600">
                              {pages.filter((p) => !p.selected).length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-500">To be kept:</span>
                            <span className="font-bold text-green-600">
                              {pages.filter((p) => p.selected).length}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleDelete}
                        disabled={pages.filter((p) => p.selected).length === 0}
                        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 py-4 text-white shadow-xl shadow-red-500/20 transition-all hover:scale-[1.02] hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                      >
                        <Trash2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
                        <span className="text-base font-bold">
                          Delete Selected Pages
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
              message="Deleting pages..."
              description="Removing selected pages from your document..."
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-xl text-center"
            >
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Done!</h2>
              <p className="mb-10 text-gray-500">
                Pages have been removed successfully.
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
                  Delete More
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
            title: "How to Delete PDF Pages",
            steps: [
              "Choose the PDF from which you want to remove pages.",
              "Click the 'X' or the trash icon on the pages you wish to delete.",
              "Click 'Generate PDF' to get your trimmed document instantly.",
            ],
          }}
          benefits={{
            title: "Why Delete PDF Pages with Us?",
            items: [
              {
                title: "Completely Private",
                desc: "Processing happens entirely in your browser, ensuring your sensitive data stays with you.",
              },
              {
                title: "Fast & Simple",
                desc: "Remove unwanted pages in seconds with our intuitive, visual interface.",
              },
              {
                title: "No Size Limits",
                desc: "Whether it's a 5-page flyer or a 500-page manual, we handle it with ease.",
              },
              {
                title: "Undo/Redo Support",
                desc: "Made a mistake? Quickly undo your deletions and refine your selection.",
              },
            ],
          }}
          faqs={[
            {
              question: "Will the remaining pages be renumbered?",
              answer:
                "Yes, the final PDF will consist of the remaining pages in their original order.",
            },
            {
              question: "Is there a limit to how many pages I can delete?",
              answer:
                "No, you can delete as many pages as you like, as long as at least one page remains.",
            },
            {
              question: "Can I delete pages from a password-protected PDF?",
              answer:
                "You would need to unlock the PDF first using our 'Unlock PDF' tool.",
            },
          ]}
        />
      </div>
    </div>
  );
}
