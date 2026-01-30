"use client";

export const dynamic = "force-dynamic";

import { PageInfo, FileInfo } from "@/types";

import { useState, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Upload,
  File,
  X,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  GripVertical,
  Trash2,
  Plus,
  Eye,
  RotateCw,
  Combine,
  Undo,
  Redo,
  ArrowUpAZ,
  ArrowDownZA,
  ArrowUpDown,
} from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import { uint8ArrayToBlob } from "@/lib/pdf-utils";
import { PDFPreviewModal } from "@/components/pdf/PDFPreviewModal";
import { useHistory } from "@/context/HistoryContext";
import Image from "next/image";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { EducationalContent } from "@/components/layout/EducationalContent";

export function MergePDFClient() {
  const { addToHistory: recordAction } = useHistory();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewPage, setPreviewPage] = useState(0);
  const [customFileName, setCustomFileName] = useState("merged.pdf");
  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    subject: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  // History for Undo/Redo
  const [undoRedoHistory, setUndoRedoHistory] = useState<FileInfo[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushToUndoRedo = (newFiles: FileInfo[]) => {
    const newHistory = undoRedoHistory.slice(0, historyIndex + 1);
    newHistory.push(newFiles);
    // Limit history size to 20
    if (newHistory.length > 20) newHistory.shift();
    setUndoRedoHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setFiles(newFiles);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setFiles(undoRedoHistory[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < undoRedoHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setFiles(undoRedoHistory[newIndex]);
    }
  };

  const sortFiles = (
    criteria: "name_asc" | "name_desc" | "size_asc" | "size_desc"
  ) => {
    const sorted = [...files].sort((a, b) => {
      if (criteria === "name_asc") return a.name.localeCompare(b.name);
      if (criteria === "name_desc") return b.name.localeCompare(a.name);
      if (criteria === "size_asc") return a.size - b.size;
      if (criteria === "size_desc") return b.size - a.size;
      return 0;
    });
    pushToUndoRedo(sorted);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf"
    );
    if (files.length > 0) {
      await loadFiles(files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await loadFiles(files);
    }
    e.target.value = "";
  };

  const loadFiles = async (newFiles: File[]) => {
    const isFirstLoad = files.length === 0;
    setStatus("loading");
    setErrorMessage("");

    try {
      console.log("Loading pdfjs-dist...");
      const pdfjsLib = await import("pdfjs-dist");
      const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const loadedFiles: FileInfo[] = [];

      for (const file of newFiles) {
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const arrayBuffer = await file.arrayBuffer();
        const originalBuffer = arrayBuffer.slice(0);

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          useWorkerFetch: true,
          isEvalSupported: false,
        });

        const pdfDoc = await loadingTask.promise;
        const numPages = pdfDoc.numPages;
        const filePages: PageInfo[] = [];

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          filePages.push({
            id: `${fileId}-page-${i}`,
            fileId,
            fileName: file.name,
            pageNumber: i,
            image: canvas.toDataURL("image/jpeg", 0.7),
            rotation: 0,
            originalArrayBuffer: originalBuffer,
          });

          (page as { cleanup?: () => void }).cleanup?.();
        }

        loadedFiles.push({
          id: fileId,
          name: file.name,
          size: file.size,
          pages: filePages,
          isExpanded: false,
        });

        await pdfDoc.destroy();
      }

      if (isFirstLoad) {
        pushToUndoRedo(loadedFiles);
        if (loadedFiles.length > 0) {
          const firstFileName = loadedFiles[0].name.replace(".pdf", "");
          setCustomFileName(`${firstFileName}_merged.pdf`);
        }
      } else {
        const combinedFiles = [...files, ...loadedFiles];
        pushToUndoRedo(combinedFiles);
      }
      setStatus("ready");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(`Error loading PDFs: ${message}`);
      setStatus("error");
    }
  };

  const rotatePage = (fileId: string, pageId: string) => {
    const newFiles = files.map((f) => {
      if (f.id === fileId) {
        return {
          ...f,
          pages: f.pages.map((p) => {
            if (p.id === pageId) {
              const newRotation = (((p.rotation ?? 0) + 90) % 360) as
                | 0
                | 90
                | 180
                | 270;
              return { ...p, rotation: newRotation };
            }
            return p;
          }),
        };
      }
      return f;
    });
    pushToUndoRedo(newFiles);
  };

  const removePage = (fileId: string, pageId: string) => {
    const newFiles = files
      .map((f) => {
        if (f.id === fileId) {
          return { ...f, pages: f.pages.filter((p) => p.id !== pageId) };
        }
        return f;
      })
      .filter((f) => f.pages.length > 0);
    pushToUndoRedo(newFiles);
  };

  const toggleFileExpand = (fileId: string) => {
    setFiles(
      files.map((f) =>
        f.id === fileId ? { ...f, isExpanded: !f.isExpanded } : f
      )
    );
  };

  const removeFile = (fileId: string) => {
    const newFiles = files.filter((f) => f.id !== fileId);
    pushToUndoRedo(newFiles);
  };

  const handleRangeSelection = (fileId: string, rangeStr: string) => {
    const newFiles = files.map((f) => {
      if (f.id === fileId) {
        // Parse range: e.g., "1-3, 5, 8-10"
        const visiblePages = new Set<number>();
        const parts = rangeStr.split(",").map((p) => p.trim());

        parts.forEach((part) => {
          if (part.includes("-")) {
            const [start, end] = part.split("-").map(Number);
            if (!isNaN(start) && !isNaN(end)) {
              for (
                let i = Math.min(start, end);
                i <= Math.max(start, end);
                i++
              ) {
                visiblePages.add(i);
              }
            }
          } else {
            const num = Number(part);
            if (!isNaN(num)) visiblePages.add(num);
          }
        });

        return {
          ...f,
          pages: f.pages.map((p) => ({
            ...p,
            isHidden: rangeStr.trim() !== "" && !visiblePages.has(p.pageNumber),
          })),
        };
      }
      return f;
    });
    pushToUndoRedo(newFiles);
  };

  const openPreview = (filePages: PageInfo[], startIndex: number) => {
    setPreviewImages(filePages.filter((p) => !p.isHidden).map((p) => p.image));
    // Need to find the index of the clicked page among visible pages
    const clickedPageId = filePages[startIndex].id;
    const visiblePages = filePages.filter((p) => !p.isHidden);
    const newIndex = visiblePages.findIndex((p) => p.id === clickedPageId);

    setPreviewPage(newIndex !== -1 ? newIndex : 0);
    setPreviewOpen(true);
  };

  const handleMerge = async () => {
    if (files.length === 0) return;

    setStatus("processing");
    setErrorMessage("");

    try {
      const mergedPdf = await PDFDocument.create();

      // Set metadata
      if (metadata.title) mergedPdf.setTitle(metadata.title);
      if (metadata.author) mergedPdf.setAuthor(metadata.author);
      if (metadata.subject) mergedPdf.setSubject(metadata.subject);
      mergedPdf.setProducer("SimplyPDF");
      mergedPdf.setCreator("SimplyPDF");

      // Cache loaded source PDFs to avoid reloading the same file multiple times
      const loadedPdfs = new Map<string, PDFDocument>();

      for (const fileInfo of files) {
        for (const pageInfo of fileInfo.pages) {
          if (pageInfo.isHidden) continue;

          if (
            pageInfo.isHidden ||
            !pageInfo.originalArrayBuffer ||
            !pageInfo.fileId
          )
            continue;

          let sourcePdf = loadedPdfs.get(pageInfo.fileId);
          if (!sourcePdf) {
            sourcePdf = await PDFDocument.load(pageInfo.originalArrayBuffer);
            loadedPdfs.set(pageInfo.fileId, sourcePdf);
          }

          const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [
            pageInfo.pageNumber - 1,
          ]);

          if (pageInfo.rotation) {
            copiedPage.setRotation(degrees(pageInfo.rotation));
          }

          mergedPdf.addPage(copiedPage);
        }
      }

      const pdfBytes = await mergedPdf.save();
      const blob = uint8ArrayToBlob(pdfBytes);
      setResultBlob(blob);
      setStatus("success");

      // Add to history
      recordAction(
        "Merged PDF",
        "merged_SimplyPDF.pdf",
        `${files.length} files merged`
      );
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to merge PDFs. Please try again.");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = customFileName.endsWith(".pdf")
      ? customFileName
      : `${customFileName}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFiles([]);
    setStatus("idle");
    setResultBlob(null);
    setErrorMessage("");
    setCustomFileName("merged.pdf");
    setMetadata({ title: "", author: "", subject: "" });
    setUndoRedoHistory([]);
    setHistoryIndex(-1);
  };

  const previewMerged = () => {
    const allPages = files.flatMap((f) =>
      f.pages.filter((p) => !p.isHidden).map((p) => p.image)
    );
    if (allPages.length > 0) {
      setPreviewImages(allPages);
      setPreviewPage(0);
      setPreviewOpen(true);
    }
  };

  // Total stats
  const totalPages = files.reduce((acc, f) => acc + f.pages.length, 0);

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
                title="Merge PDF"
                description="Combine multiple PDFs into one. Rearrange, rotate, or delete pages before merging."
                icon={Combine}
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">
                    Drop your PDFs here
                  </p>
                  <p className="text-sm text-gray-400">
                    or click to browse • Multiple files supported
                  </p>
                </div>
              </ToolCard>
            </motion.div>
          )}

          {status === "loading" && (
            <ProcessingState
              message="Loading PDFs..."
              description="Generating page previews..."
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
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-black p-3 text-white">
                    <Combine className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Merge PDFs</h2>
                    <p className="text-sm text-gray-500">
                      {files.length} file{files.length !== 1 ? "s" : ""} •{" "}
                      {totalPages} pages total
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={reset}
                    className="btn-outline rounded-xl px-4 py-2 text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleMerge}
                    disabled={files.length === 0}
                    className="btn-primary rounded-xl px-6 py-2 shadow-lg shadow-black/10 disabled:opacity-50"
                  >
                    Merge & Download
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column: Files & Pages */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Toolbar */}
                  <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
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

                      <div className="mx-2 h-6 w-px bg-gray-200" />

                      <div className="group relative">
                        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold tracking-wider uppercase shadow-sm transition-colors hover:border-black">
                          <ArrowUpDown className="h-3 w-3" />
                          Sort
                        </button>
                        <div className="absolute top-full left-0 z-20 mt-2 hidden w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl group-hover:block">
                          <p className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase">
                            Sort Files By
                          </p>
                          <button
                            onClick={() => sortFiles("name_asc")}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-gray-50"
                          >
                            <ArrowUpAZ className="h-4 w-4 text-gray-400" /> Name
                            (A-Z)
                          </button>
                          <button
                            onClick={() => sortFiles("name_desc")}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-gray-50"
                          >
                            <ArrowDownZA className="h-4 w-4 text-gray-400" />{" "}
                            Name (Z-A)
                          </button>
                          <button
                            onClick={() => sortFiles("size_asc")}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-gray-50"
                          >
                            <ArrowUpDown className="h-4 w-4 text-gray-400" />{" "}
                            Size (Smallest)
                          </button>
                          <button
                            onClick={() => sortFiles("size_desc")}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-gray-50"
                          >
                            <ArrowUpDown className="h-4 w-4 text-gray-400" />{" "}
                            Size (Largest)
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={reset}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      Clear All
                    </button>
                  </div>

                  <Reorder.Group
                    axis="y"
                    values={files}
                    onReorder={setFiles}
                    className="space-y-4"
                  >
                    {files.map((file) => (
                      <Reorder.Item
                        key={file.id}
                        value={file}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-center justify-between bg-gray-50/50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="cursor-grab rounded p-1 transition-colors hover:bg-gray-200 active:cursor-grabbing">
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </div>
                            <File className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="max-w-[200px] truncate text-sm font-medium">
                                {file.name}
                              </p>
                              <p className="text-[10px] tracking-wider text-gray-400 uppercase">
                                {file.pages.length} pages •{" "}
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleFileExpand(file.id)}
                              className="rounded-lg p-1.5 transition-colors hover:bg-gray-200"
                              title={
                                file.isExpanded ? "Collapse" : "Manage Pages"
                              }
                            >
                              {file.isExpanded ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                              title="Remove file"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {file.isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-gray-100"
                            >
                              <div className="bg-white p-4">
                                {/* Range Selection Input */}
                                <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:flex-row sm:items-center">
                                  <div className="flex min-w-[120px] items-center gap-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Page Range
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="e.g. 1-5, 8, 10-12"
                                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-black focus:outline-none"
                                    onChange={(e) =>
                                      handleRangeSelection(
                                        file.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <p className="text-[10px] text-gray-400 italic">
                                    Leave empty to include all pages
                                  </p>
                                </div>

                                <Reorder.Group
                                  axis="x"
                                  values={file.pages}
                                  onReorder={(newPages) => {
                                    setFiles(
                                      files.map((f) =>
                                        f.id === file.id
                                          ? { ...f, pages: newPages }
                                          : f
                                      )
                                    );
                                  }}
                                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
                                >
                                  {file.pages.map((page, pIdx) => (
                                    <Reorder.Item
                                      key={page.id}
                                      value={page}
                                      className={`group relative cursor-grab transition-opacity duration-300 active:cursor-grabbing ${page.isHidden ? "pointer-events-none opacity-20 grayscale" : "opacity-100"}`}
                                    >
                                      <div className="relative aspect-3/4 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                        <Image
                                          src={page.image}
                                          alt={`Page ${page.pageNumber}`}
                                          fill
                                          className="h-full w-full object-contain"
                                          style={{
                                            transform: `rotate(${page.rotation}deg)`,
                                          }}
                                          unoptimized
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                          <button
                                            onClick={() =>
                                              openPreview(file.pages, pIdx)
                                            }
                                            className="rounded-lg bg-white p-1.5 shadow-lg transition-transform hover:scale-110"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (page.fileId && page.id)
                                                rotatePage(
                                                  page.fileId,
                                                  page.id
                                                );
                                            }}
                                            className="rounded-lg bg-white p-1.5 shadow-lg transition-transform hover:scale-110"
                                          >
                                            <RotateCw className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (page.fileId && page.id)
                                                removePage(
                                                  page.fileId,
                                                  page.id
                                                );
                                            }}
                                            className="rounded-lg bg-red-500 p-1.5 text-white shadow-lg transition-transform hover:scale-110"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>

                                        <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
                                          Page {page.pageNumber}
                                        </div>
                                      </div>
                                    </Reorder.Item>
                                  ))}
                                </Reorder.Group>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  {/* Add More Files */}
                  <button
                    onClick={() => addMoreInputRef.current?.click()}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 text-gray-400 transition-all hover:border-black hover:text-black"
                  >
                    <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="font-medium">Add More PDF Files</span>
                  </button>
                  <input
                    ref={addMoreInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Right Column: Settings */}
                <div className="space-y-6">
                  <div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                      <Combine className="h-5 w-5" />
                      Merge Settings
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Output Filename
                        </label>
                        <input
                          type="text"
                          value={customFileName}
                          onChange={(e) => setCustomFileName(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-black focus:outline-none"
                          placeholder="merged.pdf"
                        />
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <p className="mb-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
                          Metadata Editor
                        </p>
                        <div className="space-y-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                              PDF Title
                            </label>
                            <input
                              type="text"
                              value={metadata.title}
                              onChange={(e) =>
                                setMetadata({
                                  ...metadata,
                                  title: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-black focus:outline-none"
                              placeholder="Enter title..."
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                              Author
                            </label>
                            <input
                              type="text"
                              value={metadata.author}
                              onChange={(e) =>
                                setMetadata({
                                  ...metadata,
                                  author: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-black focus:outline-none"
                              placeholder="Enter author..."
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                              Subject
                            </label>
                            <input
                              type="text"
                              value={metadata.subject}
                              onChange={(e) =>
                                setMetadata({
                                  ...metadata,
                                  subject: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-black focus:outline-none"
                              placeholder="Enter subject..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-6">
                        <button
                          onClick={previewMerged}
                          disabled={files.length === 0}
                          className="btn-outline flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold"
                        >
                          <Eye className="h-4 w-4" />
                          Preview Result
                        </button>
                        <button
                          onClick={handleMerge}
                          className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 shadow-xl shadow-black/10"
                        >
                          <Combine className="h-5 w-5" />
                          Merge & Save PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {files.length === 0 && (
                <div className="py-16 text-center text-gray-400">
                  <p>All files removed. Add more files or go back to upload.</p>
                </div>
              )}
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Merging your PDFs..."
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
              <h2 className="mb-2 text-3xl font-bold">
                PDFs Merged Successfully!
              </h2>
              <p className="mb-10 text-gray-500">
                Your merged PDF is ready for download.
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
                  Merge Another
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
            title: "How to Merge PDF Files",
            steps: [
              "Upload your PDF files by dragging and dropping them or clicking 'Upload PDFs'.",
              "Arrange the files in your desired order. You can also rotate or remove specific pages.",
              "Click 'Merge & Save PDF' to combine them into a single high-quality document.",
            ],
          }}
          benefits={{
            title: "Why Use Our PDF Merger?",
            items: [
              {
                title: "Completely Private",
                desc: "Your files never leave your browser. We don't upload or store your data on any server.",
              },
              {
                title: "No File Limits",
                desc: "Merge as many PDFs as you need. Our tool is free forever with no hidden costs.",
              },
              {
                title: "High Quality",
                desc: "Our merging process maintains the original quality and formatting of your documents.",
              },
              {
                title: "Page Management",
                desc: "Easily reorder, rotate, or delete individual pages before merging for perfect results.",
              },
            ],
          }}
          faqs={[
            {
              question: "Is there a limit to how many PDFs I can merge?",
              answer:
                "Currently, there is no hard limit on the number of files you can merge. However, performance depends on your device's memory since all processing happens locally in your browser.",
            },
            {
              question: "Will the quality of my PDFs decrease after merging?",
              answer:
                "No, we use advanced PDF processing techniques that preserve the exact quality, fonts, and formatting of your original files.",
            },
            {
              question: "Are my files safe and private?",
              answer:
                "Yes, SimplyPDF is unique because it works entirely in your web browser. Your files are never uploaded to any server, making it the most secure way to merge sensitive documents.",
            },
          ]}
        />
      </div>

      <PDFPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        images={previewImages}
        currentPage={previewPage}
        onPageChange={setPreviewPage}
        onDownload={handleMerge}
        title="Merge PDF Preview"
      />
    </div>
  );
}
