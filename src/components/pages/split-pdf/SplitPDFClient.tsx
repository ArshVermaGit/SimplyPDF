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
  LayoutGrid,
  Undo,
  Redo,
} from "lucide-react";
import Image from "next/image";
import { splitPDF, downloadAsZip, formatFileSize } from "@/lib/pdf-utils";
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

type SplitMode =
  | "all"
  | "range"
  | "select"
  | "fixed_range"
  | "size_limit"
  | "manual";

interface VisualGroup {
  id: string;
  pages: PageInfo[];
  label: string;
}

export function SplitPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<SplitMode>("all");
  const [ranges, setRanges] = useState("");
  const [fixedRange, setFixedRange] = useState(1);
  const [sizeLimit, setSizeLimit] = useState(1); // MB
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
  const [manualCuts, setManualCuts] = useState<Set<number>>(new Set());
  const [customFileName, setCustomFileName] = useState("split_document.pdf");
  const [splitPattern, setSplitPattern] = useState("{filename}_part_{n}"); // New pattern state
  const [lastSelectedPage, setLastSelectedPage] = useState<number | null>(null); // For Shift+Click

  // History for Undo/Redo
  const [undoRedoHistory, setUndoRedoHistory] = useState<
    { pages: PageInfo[]; manualCuts: Set<number> }[]
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushToUndoRedo = (newPages: PageInfo[], newCuts: Set<number>) => {
    const newHistory = undoRedoHistory.slice(0, historyIndex + 1);
    newHistory.push({ pages: newPages, manualCuts: new Set(newCuts) });
    if (newHistory.length > 20) newHistory.shift();
    setUndoRedoHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPages(undoRedoHistory[newIndex].pages);
      setManualCuts(new Set(undoRedoHistory[newIndex].manualCuts));
    }
  };

  const redo = () => {
    if (historyIndex < undoRedoHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPages(undoRedoHistory[newIndex].pages);
      setManualCuts(new Set(undoRedoHistory[newIndex].manualCuts));
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
          selected: true,
        });

        (page as { cleanup?: () => void }).cleanup?.();
      }

      setPages(pageInfos);
      setCustomFileName(`${pdfFile.name.replace(".pdf", "")}_split.pdf`);
      pushToUndoRedo(pageInfos, new Set());
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

  const handlePageClick = (pageNumber: number, isShiftKey: boolean) => {
    if (mode !== "select") {
      setPreviewOpen(true);
      setPreviewPage(pages.findIndex((p) => p.pageNumber === pageNumber));
      return;
    }

    if (isShiftKey && lastSelectedPage !== null) {
      const start = Math.min(lastSelectedPage, pageNumber);
      const end = Math.max(lastSelectedPage, pageNumber);
      const newPages = pages.map((p) =>
        p.pageNumber >= start && p.pageNumber <= end
          ? { ...p, selected: true }
          : p
      );
      setPages(newPages);
      pushToUndoRedo(newPages, manualCuts);
    } else {
      const newPages = pages.map((p) =>
        p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
      );
      setPages(newPages);
      setLastSelectedPage(pageNumber);
      pushToUndoRedo(newPages, manualCuts);
    }
  };

  // Visual Grouping Engine
  const getVisualGroups = (): VisualGroup[] => {
    if (pages.length === 0) return [];

    if (mode === "all") {
      // Each page is a group
      return pages.map((p) => ({
        id: `page-${p.pageNumber}`,
        pages: [p],
        label: `File ${p.pageNumber}`,
      }));
    }

    if (mode === "select") {
      // One big group of selected pages (visualize unselected as dimmed)
      return [
        {
          id: "selection-group",
          pages: pages,
          label: "Selection Mode",
        },
      ];
    }

    if (mode === "manual") {
      // Groups based on manual cuts
      const groups: VisualGroup[] = [];
      let currentGroup: PageInfo[] = [];
      let groupIndex = 1;

      pages.forEach((page, index) => {
        currentGroup.push(page);
        if (manualCuts.has(page.pageNumber) || index === pages.length - 1) {
          groups.push({
            id: `group-${groupIndex}`,
            pages: [...currentGroup],
            label: `File ${groupIndex}`,
          });
          currentGroup = [];
          groupIndex++;
        }
      });
      return groups;
    }

    if (mode === "fixed_range") {
      const groups: VisualGroup[] = [];
      const chunkSize = Math.max(1, fixedRange);
      for (let i = 0; i < pages.length; i += chunkSize) {
        const chunk = pages.slice(i, i + chunkSize);
        groups.push({
          id: `chunk-${i}`,
          pages: chunk,
          label: `File ${groups.length + 1}`,
        });
      }
      return groups;
    }

    // Fallback for other modes
    return [{ id: "default-group", pages: pages, label: "All Pages" }];
  };

  const selectAll = () => {
    const newPages = pages.map((p) => ({ ...p, selected: true }));
    setPages(newPages);
    pushToUndoRedo(newPages, manualCuts);
  };
  const deselectAll = () => {
    const newPages = pages.map((p) => ({ ...p, selected: false }));
    setPages(newPages);
    pushToUndoRedo(newPages, manualCuts);
  };

  const toggleCut = (index: number) => {
    const newCuts = new Set(manualCuts);
    if (newCuts.has(index)) {
      newCuts.delete(index);
    } else {
      newCuts.add(index);
    }
    setManualCuts(newCuts);
    pushToUndoRedo(pages, newCuts);
  };

  const handleSplit = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      let splitFiles;
      switch (mode) {
        case "select":
          const selectedRanges = pages
            .filter((p) => p.selected)
            .map((p) => p.pageNumber.toString())
            .join(",");
          splitFiles = await splitPDF(
            file,
            "range",
            selectedRanges,
            splitPattern
          );
          break;
        case "manual":
          const sortedCuts = Array.from(manualCuts).sort((a, b) => a - b);
          const manualRanges: string[] = [];
          let lastPage = 0;
          sortedCuts.forEach((cut) => {
            manualRanges.push(`${lastPage + 1}-${cut}`);
            lastPage = cut;
          });
          if (lastPage < pages.length) {
            manualRanges.push(`${lastPage + 1}-${pages.length}`);
          }
          splitFiles = await splitPDF(
            file,
            "range",
            manualRanges.join(","),
            splitPattern
          );
          break;
        case "range":
          splitFiles = await splitPDF(file, "range", ranges, splitPattern);
          break;
        case "fixed_range":
          splitFiles = await splitPDF(
            file,
            "fixed_range",
            Number(fixedRange),
            splitPattern
          );
          break;
        case "size_limit":
          splitFiles = await splitPDF(
            file,
            "size_limit",
            Number(sizeLimit),
            splitPattern
          );
          break;
        default:
          splitFiles = await splitPDF(file, "all", undefined, splitPattern);
      }
      setResults(splitFiles);
      setStatus("success");

      if (file) {
        addToHistory(
          "Split PDF",
          file.name,
          `Split into ${splitFiles.length} files`
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to split PDF"
      );
      setStatus("error");
    }
  };

  const handleDownloadAll = async () => {
    if (results.length === 0) return;
    await downloadAsZip(results, "split-pdfs.zip");
  };

  const handleDownloadSingle = (result: { name: string; data: Uint8Array }) => {
    const blob = new Blob([result.data.slice().buffer], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setMode("all");
    setRanges("");
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
                title="Split PDF"
                description="Extract pages from your PDF with visual selection."
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
                      {mode === "select" && (
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
                      )}
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
                    {/* Visual Groups Render */}
                    <div className="space-y-8">
                      {getVisualGroups().map((group: VisualGroup) => (
                        <div key={group.id} className="relative">
                          {(mode === "manual" ||
                            mode === "fixed_range" ||
                            mode === "all") && (
                            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
                              <LayoutGrid className="h-3 w-3" />
                              {group.label}
                              <div className="h-px flex-1 bg-gray-100" />
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                                {group.pages.length} pages
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {group.pages.map((page, index) => (
                              <div
                                key={page.pageNumber}
                                className="group relative flex flex-col items-center"
                              >
                                <motion.div
                                  whileHover={{ y: -4 }}
                                  className={`relative aspect-3/4 w-full overflow-hidden rounded-xl border-2 shadow-sm transition-all duration-300 ${
                                    mode === "select"
                                      ? page.selected
                                        ? "border-black ring-4 ring-black/5"
                                        : "border-gray-200 opacity-60 grayscale-[0.5]"
                                      : "border-gray-100 hover:border-gray-300"
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

                                  {/* Selection Indicator */}
                                  {mode === "select" && (
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
                                  )}

                                  {/* Page Number Badge */}
                                  <div className="absolute bottom-2 left-2 rounded-lg bg-black/80 px-2 py-1 text-[10px] leading-none font-bold text-white backdrop-blur-md">
                                    P.{page.pageNumber}
                                  </div>

                                  {/* Zoom Action */}
                                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewPage(
                                          pages.findIndex(
                                            (p) =>
                                              p.pageNumber === page.pageNumber
                                          )
                                        );
                                        setPreviewOpen(true);
                                      }}
                                      className="flex h-10 w-10 scale-75 transform items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-100 hover:bg-white hover:text-black"
                                    >
                                      <Maximize2 className="h-5 w-5" />
                                    </button>
                                    <span className="text-[8px] font-bold tracking-tighter text-white uppercase">
                                      View
                                    </span>
                                  </div>
                                </motion.div>

                                {/* Manual Cut Indicator */}
                                {mode === "manual" &&
                                  index < pages.length - 1 && (
                                    <div
                                      className={`absolute top-0 -right-3 bottom-0 z-10 flex w-1 cursor-pointer items-center justify-center transition-all group-last:hidden ${
                                        manualCuts.has(page.pageNumber)
                                          ? "opacity-100"
                                          : "opacity-0 hover:opacity-100"
                                      }`}
                                      onClick={() => toggleCut(page.pageNumber)}
                                    >
                                      <div
                                        className={`h-full w-0.5 ${manualCuts.has(page.pageNumber) ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-gray-300"}`}
                                      />
                                      <div
                                        className={`absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-all ${
                                          manualCuts.has(page.pageNumber)
                                            ? "scale-110 bg-red-500"
                                            : "scale-75 bg-white group-hover:scale-90"
                                        }`}
                                      >
                                        <Scissors
                                          className={`h-3 w-3 ${manualCuts.has(page.pageNumber) ? "rotate-90 text-white" : "text-gray-400"}`}
                                        />
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Sidebar Settings */}
                <div className="w-full space-y-6 lg:sticky lg:top-24 lg:w-[380px]">
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                    <div className="mb-6 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <Scissors className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-gray-900">
                        Split Settings
                      </h4>
                    </div>

                    <div className="space-y-4">
                      {/* Mode Selection */}
                      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-1.5">
                        {[
                          { id: "all", icon: Scissors, label: "All Pages" },
                          { id: "select", icon: CheckCircle2, label: "Select" },
                          { id: "range", icon: File, label: "Range" },
                          { id: "manual", icon: Scissors, label: "Manual" },
                          {
                            id: "fixed_range",
                            icon: RefreshCw,
                            label: "Fixed",
                          },
                          { id: "size_limit", icon: Download, label: "Size" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setMode(opt.id as SplitMode)}
                            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                              mode === opt.id
                                ? "bg-white text-black shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            <opt.icon className="h-3.5 w-3.5" />
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Contextual Options */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={mode}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="pt-2"
                        >
                          {mode === "range" && (
                            <div className="space-y-2">
                              <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                Page Ranges
                              </label>
                              <input
                                type="text"
                                value={ranges}
                                onChange={(e) => setRanges(e.target.value)}
                                placeholder="e.g. 1-3, 5, 8-10"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-black focus:outline-none"
                              />
                            </div>
                          )}
                          {mode === "fixed_range" && (
                            <div className="space-y-2">
                              <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                Split Every X Pages
                              </label>
                              <div className="flex items-center gap-4">
                                <input
                                  type="range"
                                  min="1"
                                  max={pages.length}
                                  value={fixedRange}
                                  onChange={(e) =>
                                    setFixedRange(Number(e.target.value))
                                  }
                                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-100 accent-black"
                                />
                                <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
                                  {fixedRange}
                                </div>
                              </div>
                            </div>
                          )}
                          {mode === "size_limit" && (
                            <div className="space-y-2">
                              <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                Split by File Size (MB)
                              </label>
                              <div className="flex items-center gap-4">
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={sizeLimit}
                                  onChange={(e) =>
                                    setSizeLimit(Number(e.target.value))
                                  }
                                  className="w-24 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold transition-all focus:ring-2 focus:ring-black focus:outline-none"
                                />
                                <span className="text-sm font-medium text-gray-500">
                                  MB per file
                                </span>
                              </div>
                            </div>
                          )}
                          {mode === "manual" && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                              <p className="text-xs leading-relaxed font-medium text-red-600">
                                Click on the <strong>plus icon</strong> between
                                pages to mark where you want to cut the
                                document.
                              </p>
                            </div>
                          )}
                          {mode === "all" && (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                              <p className="text-xs leading-relaxed font-medium text-gray-500">
                                Every page will be extracted as a separate PDF
                                file.
                              </p>
                            </div>
                          )}
                          {mode === "select" && (
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                              <p className="text-xs leading-relaxed font-medium text-blue-600">
                                Only the pages you select will be extracted
                                (merged into a single new PDF).
                              </p>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {/* Divider */}
                      <div className="my-2 h-px bg-gray-50" />

                      {/* Filename Editor & Pattern */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            Output Naming
                          </label>
                          <input
                            type="text"
                            value={customFileName}
                            onChange={(e) => setCustomFileName(e.target.value)}
                            placeholder="Enter base filename..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-black focus:outline-none"
                          />
                        </div>

                        {(mode === "manual" ||
                          mode === "fixed_range" ||
                          mode === "all" ||
                          mode === "size_limit") && (
                          <div className="space-y-2">
                            <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                              Pattern
                            </label>
                            <input
                              type="text"
                              value={splitPattern}
                              onChange={(e) => setSplitPattern(e.target.value)}
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm transition-all focus:ring-2 focus:ring-black focus:outline-none"
                              placeholder="{filename}_part_{n}"
                            />
                            <p className="px-1 text-[10px] text-gray-400">
                              Use <code>{`{n}`}</code> for number,{" "}
                              <code>{`{filename}`}</code> for original name.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between text-xs font-bold tracking-widest text-gray-400 uppercase">
                          <span>Summary</span>
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Output files:</span>
                            <span className="font-bold text-gray-900">
                              {mode === "all"
                                ? pages.length
                                : mode === "manual"
                                  ? manualCuts.size + 1
                                  : mode === "select"
                                    ? 1
                                    : mode === "fixed_range"
                                      ? Math.ceil(pages.length / fixedRange)
                                      : "?"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              Selected mode:
                            </span>
                            <span className="font-bold text-gray-900 capitalize">
                              {mode.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={handleSplit}
                        disabled={
                          (mode === "select" &&
                            pages.filter((p) => p.selected).length === 0) ||
                          (mode === "range" && !ranges.trim())
                        }
                        className="btn-primary group flex w-full items-center justify-center gap-2 rounded-2xl py-4 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                      >
                        <Scissors className="h-5 w-5 transition-transform group-hover:rotate-12" />
                        <span className="text-base font-bold">
                          Process & Split PDF
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
              message="Splitting PDF..."
              description="This won't take long..."
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-4xl"
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-3xl font-bold">
                  PDF Split Successfully!
                </h2>
                <p className="text-gray-500">Created {results.length} files</p>
              </div>

              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <button
                        onClick={() => handleDownloadSingle(result)}
                        className="rounded-lg bg-black px-3 py-1 text-sm text-white hover:bg-gray-800"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleDownloadAll}
                  className="btn-primary flex items-center justify-center gap-2 px-10 py-4"
                >
                  <Download className="h-5 w-5" />
                  Download All (ZIP)
                </button>
                <button
                  onClick={reset}
                  className="btn-outline flex items-center justify-center gap-2 px-10 py-4"
                >
                  <RefreshCw className="h-5 w-5" />
                  Split Another
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
            title: "How to Split PDF Files",
            steps: [
              "Upload your PDF and wait for our visual page generator to load your document.",
              "Choose your split mode: extract all pages, select specific pages, or set page ranges.",
              "Review your split files and download them as a single ZIP archive or individually.",
            ],
          }}
          benefits={{
            title: "Professional PDF Splitting",
            items: [
              {
                title: "Visual Selection",
                desc: "Select the pages you want to extract by clicking on high-quality page previews.",
              },
              {
                title: "Multiple Modes",
                desc: "Split by ranges, every X pages, or by file size. We have a mode for every workflow.",
              },
              {
                title: "ZIP Downloads",
                desc: "Large split jobs are automatically bundled into a clean ZIP file for easy management.",
              },
              {
                title: "Zero Data Risk",
                desc: "Your files never leave your device. All splitting happens locally in your browser.",
              },
            ],
          }}
          faqs={[
            {
              question: "Can I split a PDF into individual pages?",
              answer:
                "Yes! Use the 'All Pages' mode to extract every single page of your PDF into its own separate document.",
            },
            {
              question: "Can I extract only specific pages?",
              answer:
                "Absolutely. Use the 'Select' mode and simply click on the thumbnails of the pages you want to keep. We'll merge them into a new PDF for you.",
            },
            {
              question: "Is there a page limit for splitting?",
              answer:
                "There's no page limit, but documents with hundreds of pages may take longer to generate previews depending on your device's speed.",
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
        onDownload={handleSplit}
        title="Split PDF Preview"
      />
    </div>
  );
}
