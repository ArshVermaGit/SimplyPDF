"use client";

export const dynamic = "force-dynamic";

import { PageInfo } from "@/types";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Download,
  CheckCircle2,
  RefreshCw,
  Plus,
  Undo,
  Redo,
  FilePlus2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";
import { uint8ArrayToBlob } from "@/lib/pdf-utils";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { EducationalContent } from "@/components/layout/EducationalContent";
import { useHistory } from "@/context/HistoryContext";

interface InsertablePage extends PageInfo {
  sourceFile: File;
  sourceIndex: number; // Index in the original PDF it came from
}

export function InsertPagesClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<InsertablePage[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [customFileName, setCustomFileName] = useState("modified_document.pdf");
  const [insertPosition, setInsertPosition] = useState<number | null>(null);

  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // History
  const [undoRedoHistory, setUndoRedoHistory] = useState<
    { pages: InsertablePage[] }[]
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushToUndoRedo = (newPages: InsertablePage[]) => {
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
      await loadInitialPages(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await loadInitialPages(selectedFile);
    }
  };

  const loadInitialPages = async (pdfFile: File) => {
    setStatus("loading");
    try {
      const loadedPages = await extractPagesFromPDF(pdfFile);
      setPages(loadedPages);
      setCustomFileName(`${pdfFile.name.replace(".pdf", "")}_modified.pdf`);
      pushToUndoRedo(loadedPages);
      setStatus("ready");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(`Error: ${message}`);
      setStatus("error");
    }
  };

  const extractPagesFromPDF = async (
    pdfFile: File
  ): Promise<InsertablePage[]> => {
    const pdfjsLib = await import("pdfjs-dist");
    const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    const pageInfos: InsertablePage[] = [];
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.4 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;

      pageInfos.push({
        id: `page-${Date.now()}-${i}-${Math.random()}`,
        pageNumber: i,
        image: canvas.toDataURL("image/jpeg", 0.7),
        selected: true,
        sourceFile: pdfFile,
        sourceIndex: i - 1,
      });
      (page as { cleanup?: () => void }).cleanup?.();
    }
    await pdfDoc.destroy();
    return pageInfos;
  };

  const handleInsertClick = (index: number) => {
    setInsertPosition(index);
    hiddenFileInputRef.current?.click();
  };

  const handleInsertFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && insertPosition !== null) {
      try {
        const newPages = await extractPagesFromPDF(selectedFile);
        const updatedPages = [...pages];
        updatedPages.splice(insertPosition, 0, ...newPages);
        setPages(updatedPages);
        pushToUndoRedo(updatedPages);
        setInsertPosition(null);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Error inserting file: ${message}`);
      }
    }
    e.target.value = ""; // Reset
  };

  const handleProcess = async () => {
    if (pages.length === 0) return;
    setStatus("processing");
    try {
      const newPdf = await PDFDocument.create();

      // Map to hold loaded PDF documents to avoid re-loading same file multiple times
      const loadedDocs = new Map<string, PDFDocument>();

      for (const pageInfo of pages) {
        let sourceDoc = loadedDocs.get(pageInfo.sourceFile.name);
        if (!sourceDoc) {
          const buf = await pageInfo.sourceFile.arrayBuffer();
          sourceDoc = await PDFDocument.load(buf);
          loadedDocs.set(pageInfo.sourceFile.name, sourceDoc);
        }
        const [copiedPage] = await newPdf.copyPages(sourceDoc, [
          pageInfo.sourceIndex,
        ]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");
      addToHistory(
        "Inserted Pages",
        file?.name || "document.pdf",
        "Merged multiple files"
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
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
              className="mx-auto max-w-4xl"
            >
              <ToolHeader
                title="Insert PDF Pages"
                description="Merge pages from other PDFs into specific positions of your document."
                icon={FilePlus2}
              />
              <ToolCard className="p-8">
                <div
                  className={`drop-zone ${dragActive ? "active" : ""}`}
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
                  <p className="mb-2 text-lg font-medium">Drop base PDF here</p>
                  <p className="text-sm text-gray-400">
                    Select the main document you want to add pages to
                  </p>
                </div>
              </ToolCard>
            </motion.div>
          )}

          {status === "loading" && (
            <ProcessingState
              message="Loading base PDF..."
              description="Generating previews..."
            />
          )}

          {status === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-7xl"
            >
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
                      {pages.length} Pages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-30"
                    >
                      <Undo className="h-5 w-5" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= undoRedoHistory.length - 1}
                      className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-30"
                    >
                      <Redo className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={reset}
                    className="rounded-xl p-2.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleProcess}
                    className="btn-primary group flex items-center gap-2 rounded-xl px-8 py-3"
                  >
                    <FilePlus2 className="h-5 w-5" />
                    <span className="font-bold">Generate PDF</span>
                  </button>
                </div>
              </div>

              <div className="space-y-8 pb-12">
                <input
                  type="file"
                  ref={hiddenFileInputRef}
                  className="hidden"
                  accept=".pdf"
                  onChange={handleInsertFile}
                />

                {/* Start Insertion Point */}
                <div className="relative z-20 -mb-4 flex justify-center">
                  <button
                    onClick={() => handleInsertClick(0)}
                    className="group flex items-center gap-2 rounded-full border border-dashed border-gray-300 bg-white px-6 py-2 shadow-sm transition-all hover:border-black hover:bg-black hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-xs font-bold">
                      Insert File at Start
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {pages.map((page, index) => (
                    <div key={page.id} className="group relative">
                      <div className="relative aspect-3/4 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white p-1 shadow-sm transition-all group-hover:shadow-lg">
                        <Image
                          src={page.image}
                          alt="Page"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                        <div className="absolute top-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
                          P.{page.pageNumber}
                        </div>
                      </div>

                      {/* Insertion point after this page */}
                      <div className="absolute right-0 -bottom-10 left-0 z-20 flex justify-center">
                        <button
                          onClick={() => handleInsertClick(index + 1)}
                          className="scale-90 transform rounded-full border border-gray-200 bg-white p-2 shadow-md transition-all group-hover:scale-100 hover:border-black hover:bg-black hover:text-white"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Inserting pages..."
              description="Merging documents and optimizing output..."
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
              <h2 className="mb-2 text-3xl font-bold">Success!</h2>
              <p className="mb-10 text-gray-500">
                Pages have been inserted and your new document is ready.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 px-10 py-4"
                >
                  <Download className="h-5 w-5" /> Download PDF
                </button>
                <button onClick={reset} className="btn-outline px-10 py-4">
                  Insert More
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
            title: "How to Insert PDF Pages",
            steps: [
              "Upload your base PDF document.",
              "Click the '+' button between pages where you want to add new content.",
              "Select another PDF file; its pages will be merged exactly where you chose.",
            ],
          }}
          benefits={{
            title: "Why Insert Pages Locally?",
            items: [
              {
                title: "Precise Placement",
                desc: "Don't just append files—insert them exactly where they belong in the sequence.",
              },
              {
                title: "Multi-File Support",
                desc: "Insert pages from multiple different PDFs into a single target document.",
              },
              {
                title: "Secure Processing",
                desc: "All merging happens locally, keeping your documents confidential.",
              },
              {
                title: "Smart Integration",
                desc: "Existing bookmarks and links are handled carefully for a professional result.",
              },
            ],
          }}
          faqs={[
            {
              question: "Can I insert just one page from another PDF?",
              answer:
                "Currently, it inserts all pages from the chosen file. You can then delete any unwanted pages.",
            },
            {
              question: "Is there a limit to how many files I can insert?",
              answer:
                "No, you can keep adding as many files as you need at different positions.",
            },
            {
              question: "Will the page sizes match?",
              answer:
                "SimplyPDF preserves the original orientation and size of each inserted page.",
            },
          ]}
        />
      </div>
    </div>
  );
}
