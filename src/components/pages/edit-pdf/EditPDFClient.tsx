"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MousePointer2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { PDFDocument, rgb, StandardFonts, LineCapStyle } from "pdf-lib";
import { uint8ArrayToBlob } from "@/lib/pdf-utils";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { EducationalContent } from "@/components/layout/EducationalContent"; // Added
import { useHistory } from "@/context/HistoryContext";
import Image from "next/image";
import { Toolbar, Tool, ShapeType } from "./Toolbar";
import { PropertyBar } from "./PropertyBar";
import { SignatureModal } from "./SignatureModal";
import { ResizeHandle } from "./ResizeHandle";

interface Annotation {
  id: string;
  type: "text" | "draw" | "shape" | "image" | "sign";
  shapeType?: ShapeType;
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  opacity?: number;
  strokeWidth?: number;
  fontSize?: number;
  rotation?: number;
  fontFamily?: string;
  path?: { x: number; y: number }[];
  endX?: number; // For lines/arrows
  endY?: number; // For lines/arrows
}

export function EditPDFClient() {
  const { addToHistory } = useHistory();
  // File & PDF State
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "editing" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Preview Management
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [pageDimensions, setPageDimensions] = useState<
    { width: number; height: number }[]
  >([]);

  // Tools
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [activeShape, setActiveShape] = useState<ShapeType>("rectangle");
  const [zoom, setZoom] = useState(1);

  // Data & History
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Selection & Editing
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | null
  >(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(
    null
  );

  // Default Styles
  const [defaults, setDefaults] = useState({
    color: "#000000",
    strokeWidth: 2,
    fontSize: 16,
    fontFamily: "Inter, sans-serif",
    opacity: 1,
  });

  // Refs for interaction
  const workspaceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const interactionStart = useRef<{
    x: number;
    y: number;
    initialAnnotations: Annotation[];
  } | null>(null);
  const activeOperation = useRef<
    "draw" | "create" | "move" | "resize" | "pan" | null
  >(null);
  const resizeHandle = useRef<string | null>(null);

  // Temp drawing path
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
    []
  );

  // --- History Logic ---
  const addToUndo = useCallback(
    (newAnnotations: Annotation[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newAnnotations);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setAnnotations(newAnnotations);
    },
    [history, historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAnnotations(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAnnotations(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Init History on first edit
  useEffect(() => {
    if (history.length === 0 && annotations.length > 0) {
      setHistory([[]]); // Initial empty state
      setHistoryIndex(0);
    }
  }, [annotations.length, history.length]);

  // --- File Handling ---

  const processFile = async (pdfFile: File) => {
    setFile(pdfFile);
    setStatus("processing"); // Show loading instead of bare
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);

      const images: string[] = [];
      const dimensions: { width: number; height: number }[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL("image/jpeg", 0.8));
        dimensions.push({ width: viewport.width, height: viewport.height });
      }
      setPageImages(images);
      setPageDimensions(dimensions);
      setStatus("editing");

      // Start history
      setHistory([[]]);
      setHistoryIndex(0);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load PDF.");
      setStatus("error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const content = re.target?.result as string;
        const annotation: Annotation = {
          id: `image-${Date.now()}`,
          type: "image",
          page: currentPage,
          x: 10,
          y: 10,
          width: 20,
          height: 20,
          content,
          color: "transparent",
          opacity: 1,
        };
        addToUndo([...annotations, annotation]);
        setSelectedAnnotationId(annotation.id);
        setSelectedTool("select");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureSave = (dataUrl: string) => {
    const annotation: Annotation = {
      id: `sign-${Date.now()}`,
      type: "sign",
      page: currentPage,
      x: 10,
      y: 10,
      width: 20,
      height: 10,
      content: dataUrl,
      color: "transparent",
      opacity: 1,
    };
    addToUndo([...annotations, annotation]);
    setSelectedAnnotationId(annotation.id);
    setSelectedTool("select");
  };

  useEffect(() => {
    if (selectedTool === "image") imageInputRef.current?.click();
    if (selectedTool === "sign") setIsSignatureModalOpen(true);
  }, [selectedTool]);

  // --- Interaction ---

  const getRelativeCoords = (e: React.MouseEvent | MouseEvent) => {
    if (!workspaceRef.current) return { x: 0, y: 0 };
    const rect = workspaceRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!workspaceRef.current) return;
    const { x, y } = getRelativeCoords(e);
    startPos.current = { x, y };

    if (selectedTool === "hand") {
      activeOperation.current = "pan";
      return;
    }

    if (selectedTool === "select") {
      setSelectedAnnotationId(null);
      return;
    }

    if (selectedTool === "draw") {
      activeOperation.current = "draw";
      setCurrentPath([{ x, y }]);
      setSelectedAnnotationId(null);
      return;
    }

    if (selectedTool === "text") {
      const newId = `text-${Date.now()}`;
      const annotation: Annotation = {
        id: newId,
        type: "text",
        page: currentPage,
        x,
        y,
        content: "Type here",
        color: defaults.color,
        fontSize: defaults.fontSize,
        fontFamily: defaults.fontFamily,
        opacity: defaults.opacity,
        rotation: 0,
      };
      addToUndo([...annotations, annotation]);
      setSelectedAnnotationId(newId);
      setEditingAnnotationId(newId);
      setSelectedTool("select");
      return;
    }

    if (selectedTool === "shape") {
      activeOperation.current = "create";
      const newId = `shape-${Date.now()}`;
      const annotation: Annotation = {
        id: newId,
        type: "shape",
        shapeType: activeShape,
        page: currentPage,
        x,
        y,
        width: 0,
        height: 0,
        endX: x,
        endY: y,
        color: defaults.color,
        strokeWidth: defaults.strokeWidth,
        opacity: defaults.opacity,
        rotation: 0,
      };
      setAnnotations((prev) => [...prev, annotation]);
      interactionStart.current = { x, y, initialAnnotations: [...annotations] };
      setSelectedAnnotationId(newId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!workspaceRef.current) return;
    const { x, y } = getRelativeCoords(e);

    if (activeOperation.current === "pan" && containerRef.current) {
      containerRef.current.scrollLeft -= e.movementX;
      containerRef.current.scrollTop -= e.movementY;
      return;
    }

    if (activeOperation.current === "draw") {
      setCurrentPath((prev) => [...prev, { x, y }]);
      return;
    }

    if (activeOperation.current === "create" && selectedAnnotationId) {
      setAnnotations((prev) =>
        prev.map((a) => {
          if (a.id === selectedAnnotationId) {
            if (a.shapeType === "line" || a.shapeType === "arrow") {
              return { ...a, endX: x, endY: y };
            }
            return {
              ...a,
              x: Math.min(x, startPos.current.x),
              y: Math.min(y, startPos.current.y),
              width: Math.abs(x - startPos.current.x),
              height: Math.abs(y - startPos.current.y),
            };
          }
          return a;
        })
      );
      return;
    }

    if (activeOperation.current === "move" && selectedAnnotationId) {
      const rect = workspaceRef.current!.getBoundingClientRect();
      const rx = ((e.clientX - rect.left) / rect.width) * 100;
      const ry = ((e.clientY - rect.top) / rect.height) * 100;
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === selectedAnnotationId
            ? {
                ...a,
                x: rx - dragOffset.current.x,
                y: ry - dragOffset.current.y,
              }
            : a
        )
      );
    }

    if (activeOperation.current === "resize" && selectedAnnotationId) {
      setAnnotations((prev) =>
        prev.map((a) => {
          if (a.id === selectedAnnotationId) {
            const { x: ax, y: ay } = a;
            const w = Math.max(1, Math.abs(x - ax));
            const h = Math.max(1, Math.abs(y - ay));
            return { ...a, width: w, height: h };
          }
          return a;
        })
      );
    }
  };

  const handleMouseUp = () => {
    if (activeOperation.current === "draw") {
      if (currentPath.length > 1) {
        const annotation: Annotation = {
          id: `draw-${Date.now()}`,
          type: "draw",
          page: currentPage,
          x: 0,
          y: 0,
          color: defaults.color,
          path: currentPath,
          strokeWidth: defaults.strokeWidth,
          opacity: defaults.opacity,
        };
        addToUndo([...annotations, annotation]);
      }
      setCurrentPath([]);
    } else if (
      activeOperation.current === "create" ||
      activeOperation.current === "move" ||
      activeOperation.current === "resize"
    ) {
      addToUndo(annotations);
    }

    const wasCreating = activeOperation.current === "create";

    activeOperation.current = null;
    resizeHandle.current = null;

    if (wasCreating) setSelectedTool("select");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedAnnotationId && !editingAnnotationId) {
          addToUndo(annotations.filter((a) => a.id !== selectedAnnotationId));
          setSelectedAnnotationId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    annotations,
    selectedAnnotationId,
    editingAnnotationId,
    handleUndo,
    handleRedo,
    addToUndo,
  ]); // Deps for closure

  // --- Annotation Click Handlers ---

  const handleAnnotationMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedTool === "eraser") {
      addToUndo(annotations.filter((a) => a.id !== id));
      return;
    }

    setSelectedAnnotationId(id);
    if (selectedTool === "select") {
      activeOperation.current = "move";
      if (workspaceRef.current) {
        // Calculate offset
        const rect = workspaceRef.current.getBoundingClientRect();
        const rx = ((e.clientX - rect.left) / rect.width) * 100;
        const ry = ((e.clientY - rect.top) / rect.height) * 100;
        const a = annotations.find((ann) => ann.id === id);
        if (a) dragOffset.current = { x: rx - a.x, y: ry - a.y };
      }
    }
  };

  // --- PDF Generation ---
  const handleSave = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.Helvetica);

      for (const anno of annotations) {
        const page = pdf.getPage(anno.page);
        const { width, height } = page.getSize();
        const color =
          anno.color === "transparent"
            ? undefined
            : rgb(
                parseInt(anno.color.slice(1, 3), 16) / 255,
                parseInt(anno.color.slice(3, 5), 16) / 255,
                parseInt(anno.color.slice(5, 7), 16) / 255
              );
        const opacity = anno.opacity ?? 1;

        if (anno.type === "text" && anno.content && color) {
          page.drawText(anno.content, {
            x: (anno.x / 100) * width,
            y: height - (anno.y / 100) * height,
            size: anno.fontSize,
            font,
            color,
            opacity,
          });
        } else if (anno.type === "image" || anno.type === "sign") {
          if (anno.content) {
            const imgBytes = await fetch(anno.content).then((res) =>
              res.arrayBuffer()
            );
            let img;
            if (anno.content.includes("image/png"))
              img = await pdf.embedPng(imgBytes);
            else img = await pdf.embedJpg(imgBytes);

            page.drawImage(img, {
              x: (anno.x / 100) * width,
              y:
                height -
                (anno.y / 100) * height -
                ((anno.height || 0) / 100) * height,
              width: ((anno.width || 0) / 100) * width,
              height: ((anno.height || 0) / 100) * height,
              opacity,
            });
          }
        } else if (anno.type === "shape" && color) {
          if (anno.shapeType === "rectangle") {
            page.drawRectangle({
              x: (anno.x / 100) * width,
              y:
                height -
                (anno.y / 100) * height -
                ((anno.height || 0) / 100) * height,
              width: ((anno.width || 0) / 100) * width,
              height: ((anno.height || 0) / 100) * height,
              color: undefined,
              borderColor: color,
              borderWidth: anno.strokeWidth || 2,
              opacity,
            });
          } else if (
            (anno.shapeType === "line" || anno.shapeType === "arrow") &&
            anno.endX !== undefined
          ) {
            page.drawLine({
              start: {
                x: (anno.x / 100) * width,
                y: height - (anno.y / 100) * height,
              },
              end: {
                x: (anno.endX / 100) * width,
                y: height - (anno.endY! / 100) * height,
              },
              thickness: anno.strokeWidth || 2,
              color,
              opacity,
            });
          }
        } else if (anno.type === "draw" && anno.path && color) {
          for (let i = 0; i < anno.path.length - 1; i++) {
            const p1 = anno.path[i];
            const p2 = anno.path[i + 1];
            page.drawLine({
              start: {
                x: (p1.x / 100) * width,
                y: height - (p1.y / 100) * height,
              },
              end: {
                x: (p2.x / 100) * width,
                y: height - (p2.y / 100) * height,
              },
              thickness: anno.strokeWidth || 2,
              color,
              opacity,
              lineCap: LineCapStyle.Round,
            });
          }
        }
      }

      const pdfBytes = await pdf.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");
      addToHistory("Edited PDF", file.name, "Custom edits applied");
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to save.");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `edited_${file?.name || "document.pdf"}`;
    link.click();
  };

  const reset = () => {
    window.location.reload();
  };

  const selectedAnno = annotations.find((a) => a.id === selectedAnnotationId);

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden pt-24 pb-16">
      <AnimatedBackground />
      <FloatingDecorations />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => {
          setIsSignatureModalOpen(false);
          setSelectedTool("select");
        }}
        onSave={handleSignatureSave}
      />

      <div
        className={`relative z-10 container mx-auto ${status === "editing" ? "h-[calc(100vh-140px)]" : ""}`}
      >
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
                title="Edit PDF"
                description="The professional way to edit documents. Add text, shapes, and signatures with ease."
                icon={MousePointer2}
              />

              <ToolCard className="p-8">
                <div
                  className={`drop-zone active:border-black ${dragActive ? "active" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files[0])
                      processFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                >
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) processFile(e.target.files[0]);
                    }}
                  />
                  <Upload className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">Drop PDF here</p>
                  <p className="text-sm text-gray-400">
                    or click to browse • Free & Private
                  </p>
                </div>
              </ToolCard>

              {/* Educational Content for Landing */}
              <div className="mt-20">
                <EducationalContent
                  howItWorks={{
                    title: "How to Edit PDF Files",
                    steps: [
                      "Upload your PDF file by dragging and dropping it.",
                      "Use the toolbar to add text, images, shapes, signatures, or drawings.",
                      "Click 'Save PDF' to download your perfectly edited document.",
                    ],
                  }}
                  benefits={{
                    title: "Why Use Our PDF Editor?",
                    items: [
                      {
                        title: "Completely Free",
                        desc: "No watermarks, no sign-ups, no hidden costs.",
                      },
                      {
                        title: "Browser Based",
                        desc: "Files are processed locally in your browser for maximum privacy.",
                      },
                      {
                        title: "Rich Tools",
                        desc: "Full suite of editing tools including shapes, drawings, and signatures.",
                      },
                    ],
                  }}
                  faqs={[
                    {
                      question: "Can I edit existing text?",
                      answer:
                        "To ensure document integrity, this tool allows you to add new content (text, shapes, images) to your PDF. It is not designed to reflow existing proprietary text.",
                    },
                    {
                      question: "Is it secure?",
                      answer:
                        "Yes! All processing happens in your browser. Your files are never uploaded to our servers.",
                    },
                  ]}
                />
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Loading PDF..."
              description="Preparing your workspace..."
            />
          )}

          {status === "editing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
            >
              <Toolbar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                zoom={zoom}
                setZoom={setZoom}
                activeShape={activeShape}
                setActiveShape={setActiveShape}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
              <PropertyBar
                selectedAnnotationId={selectedAnnotationId}
                annotationType={selectedAnno?.type}
                properties={{
                  color: selectedAnno?.color || defaults.color,
                  fontSize: selectedAnno?.fontSize || defaults.fontSize,
                  fontFamily: selectedAnno?.fontFamily || defaults.fontFamily,
                  strokeWidth:
                    selectedAnno?.strokeWidth || defaults.strokeWidth,
                  opacity: selectedAnno?.opacity || defaults.opacity,
                }}
                onUpdate={(k, v) => {
                  setDefaults((prev) => ({ ...prev, [k]: v }));
                  if (selectedAnnotationId) {
                    const newAnnos = annotations.map((a) =>
                      a.id === selectedAnnotationId ? { ...a, [k]: v } : a
                    );
                    addToUndo(newAnnos);
                  }
                }}
                onDelete={() => {
                  const newAnnos = annotations.filter(
                    (a) => a.id !== selectedAnnotationId
                  );
                  addToUndo(newAnnos);
                  setSelectedAnnotationId(null);
                }}
              />

              <div
                ref={containerRef}
                className="relative flex-1 overflow-auto bg-gray-100/50"
              >
                <div className="flex min-h-full origin-top flex-col items-center py-10">
                  <div className="sticky top-4 z-50 mb-6 flex items-center gap-4 rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((c) => c - 1)}
                      className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[80px] text-center text-sm font-bold text-gray-700">
                      Page {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages - 1}
                      onClick={() => setCurrentPage((c) => c + 1)}
                      className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="mx-2 h-4 w-px bg-gray-300" />
                    <button
                      onClick={handleSave}
                      className="rounded-full bg-black px-6 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-gray-800"
                    >
                      Save PDF
                    </button>
                  </div>

                  <div
                    ref={workspaceRef}
                    className={`relative bg-white shadow-xl transition-transform duration-75 ${selectedTool === "hand" ? "cursor-grab active:cursor-grabbing" : selectedTool === "text" ? "cursor-text" : selectedTool === "eraser" ? "cursor-not-allowed" : "cursor-crosshair"}`}
                    style={{
                      width: (pageDimensions[currentPage]?.width || 0) * zoom,
                      height: (pageDimensions[currentPage]?.height || 0) * zoom,
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    {pageImages[currentPage] && (
                      <Image
                        src={pageImages[currentPage]}
                        alt="Page"
                        fill
                        className="pointer-events-none object-contain select-none"
                        unoptimized
                      />
                    )}

                    <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full">
                      {annotations
                        .filter(
                          (a) =>
                            a.page === currentPage &&
                            (a.type === "draw" ||
                              a.shapeType === "line" ||
                              a.shapeType === "arrow")
                        )
                        .map((a) => {
                          if (a.type === "draw" && a.path) {
                            return (
                              <polyline
                                key={a.id}
                                points={a.path
                                  .map((p) => `${p.x}% ${p.y}%`)
                                  .join(",")}
                                fill="none"
                                stroke={a.color}
                                strokeWidth={a.strokeWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            );
                          }
                          if (
                            a.shapeType === "line" ||
                            a.shapeType === "arrow"
                          ) {
                            return (
                              <line
                                key={a.id}
                                x1={`${a.x}%`}
                                y1={`${a.y}%`}
                                x2={`${a.endX}%`}
                                y2={`${a.endY}%`}
                                stroke={a.color}
                                strokeWidth={a.strokeWidth}
                              />
                            );
                          }
                          return null;
                        })}
                    </svg>

                    {annotations
                      .filter(
                        (a) =>
                          a.page === currentPage &&
                          a.type !== "draw" &&
                          a.shapeType !== "line" &&
                          a.shapeType !== "arrow"
                      )
                      .map((a) => {
                        const isSelected = selectedAnnotationId === a.id;
                        return (
                          <div
                            key={a.id}
                            onMouseDown={(e) =>
                              handleAnnotationMouseDown(e, a.id)
                            }
                            className={`absolute ${isSelected ? "z-50 border-2 border-blue-500" : "z-10 hover:border hover:border-blue-300"}`}
                            style={{
                              left: `${a.x}%`,
                              top: `${a.y}%`,
                              width: a.width ? `${a.width}%` : "auto",
                              height: a.height ? `${a.height}%` : "auto",
                              borderColor:
                                a.shapeType === "rectangle" ||
                                a.shapeType === "circle"
                                  ? isSelected
                                    ? "blue"
                                    : "transparent"
                                  : undefined,
                            }}
                          >
                            {isSelected &&
                              (a.type === "image" ||
                                a.type === "shape" ||
                                a.type === "sign") && (
                                <ResizeHandle
                                  isSelected={true}
                                  onResizeStart={() =>
                                    (activeOperation.current = "resize")
                                  }
                                />
                              )}

                            {a.type === "text" && (
                              <div
                                style={{
                                  fontSize: `${(a.fontSize || 16) * zoom}px`,
                                  fontFamily: a.fontFamily,
                                  color: a.color,
                                  opacity: a.opacity,
                                }}
                              >
                                {editingAnnotationId === a.id ? (
                                  <input
                                    autoFocus
                                    value={a.content}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setAnnotations((prev) =>
                                        prev.map((ann) =>
                                          ann.id === a.id
                                            ? { ...ann, content: val }
                                            : ann
                                        )
                                      );
                                    }}
                                    onBlur={() => {
                                      setEditingAnnotationId(null);
                                      addToUndo(annotations);
                                    }}
                                    className="border-none bg-transparent text-center outline-none"
                                    style={{
                                      width: `${(a.content?.length || 1) * 1}ch`,
                                      color: a.color,
                                    }}
                                  />
                                ) : (
                                  <span
                                    onDoubleClick={() =>
                                      setEditingAnnotationId(a.id)
                                    }
                                  >
                                    {a.content}
                                  </span>
                                )}
                              </div>
                            )}

                            {a.shapeType === "rectangle" && (
                              <div
                                className="h-full w-full border-2"
                                style={{
                                  borderColor: a.color,
                                  borderWidth: a.strokeWidth,
                                }}
                              />
                            )}
                            {a.shapeType === "circle" && (
                              <div
                                className="h-full w-full rounded-full border-2"
                                style={{
                                  borderColor: a.color,
                                  borderWidth: a.strokeWidth,
                                }}
                              />
                            )}

                            {(a.type === "image" || a.type === "sign") && (
                              <div className="relative h-full w-full">
                                <Image
                                  src={a.content!}
                                  alt="content"
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </motion.div>
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
                PDF Edited Successfully!
              </h2>
              <p className="mb-10 text-gray-500">
                Your document is ready for download.
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
                  Edit Another
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
    </div>
  );
}
