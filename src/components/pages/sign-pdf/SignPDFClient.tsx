"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  X,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FileSignature,
  Pencil,
  Type,
  Image as ImageIcon,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCcw as Rotate,
} from "lucide-react";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";
import { formatFileSize, uint8ArrayToBlob } from "@/lib/pdf-utils";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { EducationalContent } from "@/components/layout/EducationalContent";
import { useHistory } from "@/context/HistoryContext";

type SignatureMode = "draw" | "type" | "upload";

export function SignPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [signatureText, setSignatureText] = useState("");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "signing" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [drawCounter, setDrawCounter] = useState(0);
  const [customFileName, setCustomFileName] = useState("signed.pdf");
  const [signatureColor, setSignatureColor] = useState("#000000");
  const [signatureOpacity, setSignatureOpacity] = useState(1);
  const [signatureRotation, setSignatureRotation] = useState(0);
  const [targetPages, setTargetPages] = useState<"current" | "all" | "range">(
    "current"
  );
  const [pageRange, setPageRange] = useState("");
  const [showGrid, setShowGrid] = useState(false);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(
    null
  );

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      await loadPdfPreview(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await loadPdfPreview(selectedFile);
    }
  };

  const loadPdfPreview = async (pdfFile: File) => {
    setStatus("loading");
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
      setTotalPages(pdfDoc.numPages);

      const images: string[] = [];
      for (let i = 1; i <= Math.min(pdfDoc.numPages, 10); i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL("image/jpeg", 0.5));
        (page as { cleanup?: () => void }).cleanup?.();
      }
      setPageImages(images);
      setCustomFileName(`signed_${pdfFile.name}`);
      setStatus("signing");
      await pdfDoc.destroy();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Failed to load PDF preview. Local security policy might be blocking some features."
      );
      setStatus("error");
    }
  };

  // Canvas drawing handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Transparent background
    ctx.strokeStyle = signatureColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [signatureMode, signatureColor]);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y =
      "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y =
      "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setDrawCounter((prev) => prev + 1);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureImage(event.target?.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const getSignatureDataUrl = useCallback((): string | null => {
    if (signatureMode === "draw") {
      return canvasRef.current?.toDataURL("image/png") || null;
    } else if (signatureMode === "type" && signatureText) {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 200;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Transparent
      ctx.fillStyle = signatureColor;
      ctx.font = "italic 72px 'Great Vibes', cursive, serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(signatureText, canvas.width / 2, canvas.height / 2);
      return canvas.toDataURL("image/png");
    } else if (signatureMode === "upload" && signatureImage) {
      return signatureImage;
    }
    return null;
  }, [signatureMode, signatureText, signatureImage, signatureColor]);

  useEffect(() => {
    const url = getSignatureDataUrl();
    setSignaturePreviewUrl(url);
  }, [getSignatureDataUrl, hasDrawn, drawCounter]);

  const [signatureSize, setSignatureSize] = useState({
    width: 150,
    height: 60,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleApplySignature = async () => {
    if (!file) return;

    const signatureDataUrl = getSignatureDataUrl();
    if (!signatureDataUrl) {
      setErrorMessage("Please create a signature first");
      return;
    }

    setStatus("processing");
    setErrorMessage("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      const signatureData = signatureDataUrl.split(",")[1];
      const signatureBytes = Uint8Array.from(atob(signatureData), (c) =>
        c.charCodeAt(0)
      );

      const signatureImageEmbed = await pdf.embedPng(signatureBytes);
      const totalPagesInDoc = pdf.getPageCount();

      // Determine target pages
      let targetPageIndices: number[] = [];
      if (targetPages === "current") {
        targetPageIndices = [currentPage];
      } else if (targetPages === "all") {
        targetPageIndices = Array.from(
          { length: totalPagesInDoc },
          (_, i) => i
        );
      } else if (targetPages === "range") {
        targetPageIndices = pageRange
          .split(",")
          .flatMap((part) => {
            if (part.includes("-")) {
              const [start, end] = part
                .split("-")
                .map((n) => parseInt(n.trim()) - 1);
              return Array.from(
                { length: end - start + 1 },
                (_, i) => start + i
              );
            }
            return [parseInt(part.trim()) - 1];
          })
          .filter((n) => !isNaN(n) && n >= 0 && n < totalPagesInDoc);
      }

      if (targetPageIndices.length === 0) {
        throw new Error("No valid pages selected for signing.");
      }

      // Apply to each page
      for (const index of targetPageIndices) {
        const page = pdf.getPage(index);
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Convert UI percentages to PDF points
        const sigWidth =
          (signatureSize.width / (workspaceRef.current?.offsetWidth || 1)) *
          pageWidth;
        const sigHeight =
          (signatureSize.height / (workspaceRef.current?.offsetHeight || 1)) *
          pageHeight;

        const x = (signaturePosition.x / 100) * pageWidth - sigWidth / 2;
        const y = (1 - signaturePosition.y / 100) * pageHeight - sigHeight / 2;

        page.drawImage(signatureImageEmbed, {
          x: Math.max(0, Math.min(x, pageWidth - sigWidth)),
          y: Math.max(0, Math.min(y, pageHeight - sigHeight)),
          width: sigWidth,
          height: sigHeight,
          opacity: signatureOpacity,
          rotate: { type: "degrees", angle: -signatureRotation } as never, // CCW for pdf-lib degrees
        });
      }

      const pdfBytes = await pdf.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");
      addToHistory(
        "Signed PDF",
        file.name,
        `Signature added to ${targetPageIndices.length} page(s)`
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to apply signature."
      );
      setStatus("error");
    }
  };

  const handleWorkspaceMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing && !isRotating) return;
    if (!workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = (signaturePosition.x / 100) * rect.width;
    const centerY = (signaturePosition.y / 100) * rect.height;

    if (isDragging) {
      setSignaturePosition({
        x: Math.max(0, Math.min(100, (mouseX / rect.width) * 100)),
        y: Math.max(0, Math.min(100, (mouseY / rect.height) * 100)),
      });
    } else if (isResizing) {
      const newWidth = Math.max(50, Math.abs(mouseX - centerX) * 2);
      const newHeight = Math.max(20, Math.abs(mouseY - centerY) * 2);
      setSignatureSize({ width: newWidth, height: newHeight });
    } else if (isRotating) {
      const angle =
        Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
      setSignatureRotation(angle + 90);
    }
  };

  const handleWorkspaceMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  };

  const handleWorkspaceTouchMove = (e: React.TouchEvent) => {
    if (!isDragging && !isResizing && !isRotating) return;
    if (!workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    const centerX = (signaturePosition.x / 100) * rect.width;
    const centerY = (signaturePosition.y / 100) * rect.height;

    if (isDragging) {
      setSignaturePosition({
        x: Math.max(0, Math.min(100, (touchX / rect.width) * 100)),
        y: Math.max(0, Math.min(100, (touchY / rect.height) * 100)),
      });
    } else if (isResizing) {
      const newWidth = Math.max(50, Math.abs(touchX - centerX) * 2);
      const newHeight = Math.max(20, Math.abs(touchY - centerY) * 2);
      setSignatureSize({ width: newWidth, height: newHeight });
    } else if (isRotating) {
      const angle =
        Math.atan2(touchY - centerY, touchX - centerX) * (180 / Math.PI);
      setSignatureRotation(angle + 90);
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
    setSignatureMode("draw");
    setSignatureText("");
    setSignatureImage(null);
    setStatus("idle");
    setResultBlob(null);
    setErrorMessage("");
    setCurrentPage(0);
    setPageImages([]);
    setHasDrawn(false);
  };

  const isSignatureReady = () => {
    if (signatureMode === "draw") return hasDrawn;
    if (signatureMode === "type") return signatureText.trim().length > 0;
    if (signatureMode === "upload") return signatureImage !== null;
    return false;
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
                title="Sign PDF"
                description="Securely sign your documents with a professional digital signature."
                icon={FileSignature}
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
              description="Initializing signature workspace..."
            />
          )}

          {status === "signing" && (
            <motion.div
              key="signing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-6xl"
            >
              <div className="grid items-start gap-8 lg:grid-cols-12">
                {/* Configuration Section */}
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
                        onClick={handleApplySignature}
                        disabled={!isSignatureReady()}
                        className="btn-primary group flex flex-2 items-center justify-center gap-2 rounded-2xl px-10 py-4 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 md:flex-none"
                      >
                        <FileSignature className="h-5 w-5 transition-transform group-hover:rotate-12" />
                        <span className="font-bold">Apply & Finish</span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar: Signature Creation */}
                <div className="space-y-6 lg:col-span-5">
                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <h3 className="mb-8 text-xl font-bold text-gray-900">
                      Create Signature
                    </h3>

                    <div className="mb-8 flex rounded-2xl bg-gray-100 p-1">
                      {[
                        { id: "draw", icon: Pencil, label: "Draw" },
                        { id: "type", icon: Type, label: "Type" },
                        { id: "upload", icon: ImageIcon, label: "Upload" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() =>
                            setSignatureMode(mode.id as SignatureMode)
                          }
                          className={`flex flex-1 flex-col items-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                            signatureMode === mode.id
                              ? "bg-white text-black shadow-sm"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          <mode.icon className="h-4 w-4" />
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex min-h-[200px] flex-col">
                      {signatureMode === "draw" && (
                        <div className="flex flex-1 flex-col">
                          <div className="group relative flex-1 overflow-hidden rounded-2xl border-2 border-gray-100 bg-gray-50">
                            <canvas
                              ref={canvasRef}
                              width={400}
                              height={150}
                              className="h-full w-full cursor-crosshair touch-none bg-transparent mix-blend-multiply"
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                            />
                            {!hasDrawn && (
                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-bold tracking-widest text-gray-300 uppercase">
                                Draw here
                              </div>
                            )}
                          </div>
                          <button
                            onClick={clearCanvas}
                            className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" /> Clear Canvas
                          </button>
                        </div>
                      )}

                      {signatureMode === "type" && (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={signatureText}
                            onChange={(e) => setSignatureText(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-6 py-6 font-serif text-3xl italic transition-all focus:border-black"
                          />
                          <p className="text-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            Type to see your cursive signature
                          </p>
                        </div>
                      )}

                      {signatureMode === "upload" && (
                        <div className="flex-1">
                          {signatureImage ? (
                            <div className="group relative aspect-video overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                              <Image
                                src={signatureImage}
                                alt="Uploaded"
                                fill
                                className="object-contain p-4"
                                unoptimized
                              />
                              <button
                                onClick={() => setSignatureImage(null)}
                                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="group flex aspect-video flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 transition-all hover:border-black">
                              <ImageIcon className="mb-2 h-8 w-8 text-gray-300 transition-colors group-hover:text-black" />
                              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase group-hover:text-black">
                                Upload signature image
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleSignatureUpload}
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <h3 className="mb-8 text-xl font-bold text-gray-900">
                      Professional Styling
                    </h3>
                    <div className="space-y-6">
                      {/* Color Selection */}
                      <div className="space-y-3">
                        <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Signature Color
                        </label>
                        <div className="flex gap-3">
                          {[
                            { label: "Onyx Black", color: "#000000" },
                            { label: "Royal Blue", color: "#003399" },
                            { label: "Deep Red", color: "#990000" },
                          ].map((c) => (
                            <button
                              key={c.color}
                              onClick={() => setSignatureColor(c.color)}
                              className={`h-10 w-10 rounded-full border-2 transition-all hover:scale-110 active:scale-90 ${signatureColor === c.color ? "scale-110 border-black ring-4 ring-black/10" : "border-transparent"}`}
                              style={{ backgroundColor: c.color }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Opacity & Rotation */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            Opacity
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={signatureOpacity * 100}
                            onChange={(e) =>
                              setSignatureOpacity(Number(e.target.value) / 100)
                            }
                            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            Rotation
                          </label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={signatureRotation}
                            onChange={(e) =>
                              setSignatureRotation(Number(e.target.value))
                            }
                            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <h3 className="mb-8 text-xl font-bold text-gray-900">
                      Target Pages
                    </h3>
                    <div className="space-y-4">
                      <div className="flex rounded-2xl bg-gray-100 p-1">
                        {[
                          { id: "current", label: "Current" },
                          { id: "all", label: "Apply All" },
                          { id: "range", label: "Range" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() =>
                              setTargetPages(
                                t.id as "current" | "all" | "range"
                              )
                            }
                            className={`flex-1 rounded-xl py-3 text-[10px] font-bold tracking-wider uppercase transition-all ${targetPages === t.id ? "bg-white text-black shadow-sm" : "text-gray-500"}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      {targetPages === "range" && (
                        <input
                          type="text"
                          placeholder="e.g. 1-3, 5"
                          value={pageRange}
                          onChange={(e) => setPageRange(e.target.value)}
                          className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold transition-all focus:border-black"
                        />
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <div className="mb-8 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">
                        Workspace
                      </h3>
                      <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`rounded-xl px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all ${showGrid ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:text-black"}`}
                      >
                        {showGrid ? "Grid On" : "Grid Off"}
                      </button>
                    </div>
                    <p className="mb-6 text-xs leading-relaxed text-gray-500">
                      Signature will be placed at:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          X-Pos
                        </p>
                        <p className="font-bold">
                          {Math.round(signaturePosition.x)}%
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Y-Pos
                        </p>
                        <p className="font-bold">
                          {Math.round(signaturePosition.y)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Workspace: PDF Preview */}
                <div className="lg:col-span-7">
                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <div className="mb-8 flex items-center justify-between">
                      <h3 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Document Workspace
                      </h3>
                      <div className="flex items-center gap-4 rounded-xl bg-gray-100 px-3 py-1.5">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(0, p - 1))
                          }
                          disabled={currentPage === 0}
                          className="rounded-lg p-1 shadow-sm transition-all hover:bg-white disabled:opacity-20"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="min-w-[80px] text-center text-xs font-bold text-gray-900">
                          Page {currentPage + 1} / {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(pageImages.length - 1, p + 1)
                            )
                          }
                          disabled={currentPage >= pageImages.length - 1}
                          className="rounded-lg p-1 shadow-sm transition-all hover:bg-white disabled:opacity-20"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div
                      ref={workspaceRef}
                      onMouseMove={handleWorkspaceMouseMove}
                      onMouseUp={handleWorkspaceMouseUp}
                      onMouseLeave={handleWorkspaceMouseUp}
                      onTouchMove={handleWorkspaceTouchMove}
                      onTouchEnd={handleWorkspaceMouseUp}
                      className="group relative aspect-3/4 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-inner select-none"
                    >
                      {pageImages[currentPage] && (
                        <Image
                          src={pageImages[currentPage]}
                          alt={`Page ${currentPage + 1}`}
                          fill
                          className="pointer-events-none object-contain"
                          unoptimized
                        />
                      )}

                      {/* Industrial Grid Overlay */}
                      {showGrid && (
                        <div
                          className="pointer-events-none absolute inset-0 opacity-10"
                          style={{
                            backgroundImage:
                              "radial-gradient(#000 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                          }}
                        />
                      )}

                      {/* Live Signature Marker */}
                      {isSignatureReady() && (
                        <motion.div
                          layout
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsDragging(true);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            setIsDragging(true);
                          }}
                          className={`absolute flex items-center justify-center overflow-visible border-2 border-dashed shadow-2xl backdrop-blur-[1px] transition-all duration-75 ${isDragging ? "z-50 scale-[1.02] cursor-grabbing bg-white/40" : "cursor-grab bg-white/10 hover:bg-white/20"} ${isRotating || isResizing ? "z-50" : ""}`}
                          style={{
                            width: `${signatureSize.width}px`,
                            height: `${signatureSize.height}px`,
                            left: `${signaturePosition.x}%`,
                            top: `${signaturePosition.y}%`,
                            transform: `translate(-50%, -50%) rotate(${signatureRotation}deg)`,
                            borderColor: signatureColor,
                            opacity: signatureOpacity,
                          }}
                        >
                          <div className="relative flex h-full w-full items-center justify-center p-2">
                            {/* Rotation Handle */}
                            <div
                              className="group/rotate absolute -top-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsRotating(true);
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                setIsRotating(true);
                              }}
                            >
                              <div
                                className="flex h-6 w-6 cursor-alias items-center justify-center rounded-full shadow-lg transition-transform group-hover/rotate:scale-125"
                                style={{ backgroundColor: signatureColor }}
                              >
                                <Rotate className="h-3 w-3 text-white" />
                              </div>
                              <div
                                className="h-6 w-0.5 opacity-40"
                                style={{ backgroundColor: signatureColor }}
                              />
                            </div>

                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden p-2">
                              {signaturePreviewUrl ? (
                                <Image
                                  src={signaturePreviewUrl}
                                  alt="Preview"
                                  fill
                                  className="pointer-events-none object-contain"
                                  unoptimized
                                />
                              ) : (
                                <div
                                  className="pointer-events-none rounded-full px-3 py-1.5 text-[8px] font-bold tracking-widest uppercase shadow-lg transition-transform select-none active:scale-95"
                                  style={{
                                    backgroundColor: signatureColor,
                                    color: "#fff",
                                  }}
                                >
                                  {isDragging
                                    ? "Moving..."
                                    : isRotating
                                      ? "Rotating..."
                                      : isResizing
                                        ? "Scaling..."
                                        : "Signature"}
                                </div>
                              )}
                            </div>

                            {/* Corner Resize Handles */}
                            {[
                              {
                                pos: "-top-1.5 -left-1.5",
                                cursor: "nw-resize",
                              },
                              {
                                pos: "-top-1.5 -right-1.5",
                                cursor: "ne-resize",
                              },
                              {
                                pos: "-bottom-1.5 -left-1.5",
                                cursor: "sw-resize",
                              },
                              {
                                pos: "-bottom-1.5 -right-1.5",
                                cursor: "se-resize",
                              },
                            ].map((handle, i) => (
                              <div
                                key={i}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  setIsResizing(true);
                                }}
                                onTouchStart={(e) => {
                                  e.stopPropagation();
                                  setIsResizing(true);
                                }}
                                className={`absolute ${handle.pos} z-50 h-3 w-3 rounded-full border border-white shadow-md transition-transform hover:scale-150`}
                                style={{
                                  backgroundColor: signatureColor,
                                  cursor: handle.cursor,
                                }}
                              />
                            ))}

                            {/* Center Label during transform */}
                            {(isResizing || isRotating) && (
                              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-[8px] whitespace-nowrap text-white backdrop-blur-sm">
                                {isResizing
                                  ? `${Math.round(signatureSize.width)}x${Math.round(signatureSize.height)}px`
                                  : `${Math.round(signatureRotation)}°`}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="mx-auto mt-8 max-w-sm">
                    <label className="mb-2 block px-1 text-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Output Filename
                    </label>
                    <input
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-center text-sm font-medium shadow-lg transition-all focus:ring-4 focus:ring-black/5 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Embedding signature..."
              description="Finalizing cryptographic verification layers..."
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
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] bg-black text-white shadow-xl shadow-black/20"
                >
                  <FileSignature className="h-10 w-10" />
                </motion.div>
                <h2 className="mb-2 text-4xl font-black text-gray-900">
                  PDF Successfully Signed!
                </h2>
                <p className="text-lg font-medium text-gray-500">
                  Your document is now professionaly signed and ready for
                  sharing.
                </p>
              </div>

              <ToolCard className="mx-auto max-w-2xl p-10 shadow-2xl">
                <div className="flex flex-col items-center gap-8">
                  <div className="flex w-full items-center gap-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        Digital Signature Embedded
                      </p>
                      <p className="text-xs font-medium text-emerald-700">
                        Added to page {currentPage + 1} of your document
                      </p>
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <button
                      onClick={handleDownload}
                      className="btn-primary group flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Download className="h-6 w-6 transition-transform group-hover:translate-y-0.5" />
                      <span className="font-bold">Download Signed PDF</span>
                    </button>
                    <button
                      onClick={reset}
                      className="btn-outline flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Sign New
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
              <h2 className="mb-2 text-3xl font-bold">Signing failed</h2>
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
            title: "How to Sign PDF",
            steps: [
              "Upload your document to our secure browser-side canvas.",
              "Create your signature by drawing, typing your name, or uploading a professional scan.",
              "Position your signature exactly where it needs to be using our live document markers.",
              "Download your perfectly signed PDF. All processing is 100% private and stays in your browser.",
            ],
          }}
          benefits={{
            title: "Enterprise Digital Signatures",
            items: [
              {
                title: "Multiple Modes",
                desc: "Choose your professional style: Draw by hand, type in cursive, or upload a scanned PNG.",
              },
              {
                title: "Privacy Guaranteed",
                desc: "Your document and your signature never leave your device. SimplyPDF is a local tool.",
              },
              {
                title: "Visual Precision",
                desc: "Precisely place your signature anywhere on the document with our live-refresh markers.",
              },
              {
                title: "Universal Compatibility",
                desc: "Our signed PDFs are recognized by all major standard PDF readers like Adobe Acrobat and Chrome.",
              },
            ],
          }}
          faqs={[
            {
              question: "Is this signature legally binding?",
              answer:
                "SimplyPDF provides electronic signatures. Depending on your jurisdiction and the type of document, this may or may not satisfy legal requirements for 'qualified' digital signatures.",
            },
            {
              question: "Does it work on mobile?",
              answer:
                "Yes! You can use your finger or a stylus to draw your signature directly on your phone or tablet.",
            },
            {
              question: "Can I sign multiple pages?",
              answer:
                "Currently, our tool allows you to place one signature on one selected page. For multiple signatures, you can run the finished file through the tool again.",
            },
          ]}
        />
      </div>
    </div>
  );
}
