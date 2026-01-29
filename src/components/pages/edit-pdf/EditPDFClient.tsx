"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, CheckCircle2, ChevronLeft, ChevronRight, MousePointer2, RefreshCw, AlertCircle } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, LineCapStyle } from "pdf-lib";
import { uint8ArrayToBlob } from "@/lib/pdf-utils";
import {
    AnimatedBackground,
    FloatingDecorations,
    ToolHeader,
    ToolCard,
    ProcessingState
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
    const [status, setStatus] = useState<"idle" | "editing" | "processing" | "success" | "error">("idle");
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    
    // Preview Management
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageImages, setPageImages] = useState<string[]>([]);
    const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }[]>([]);
    
    // Tools
    const [selectedTool, setSelectedTool] = useState<Tool>("select");
    const [activeShape, setActiveShape] = useState<ShapeType>("rectangle");
    const [zoom, setZoom] = useState(1);
    
    // Data & History
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [history, setHistory] = useState<Annotation[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    // Selection & Editing
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);

    // Default Styles
    const [defaults, setDefaults] = useState({
        color: "#000000",
        strokeWidth: 2,
        fontSize: 16,
        fontFamily: "Inter, sans-serif",
        opacity: 1
    });

    // Refs for interaction
    const workspaceRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const dragOffset = useRef({ x: 0, y: 0 });
    const interactionStart = useRef<{x: number, y: number, initialAnnotations: Annotation[]} | null>(null);
    const activeOperation = useRef<"draw" | "create" | "move" | "resize" | "pan" | null>(null);
    const resizeHandle = useRef<string | null>(null);

    // Temp drawing path
    const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

    // --- History Logic ---
    const addToUndo = useCallback((newAnnotations: Annotation[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newAnnotations);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setAnnotations(newAnnotations);
    }, [history, historyIndex]);

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
                    x: 10, y: 10, width: 20, height: 20,
                    content,
                    color: "transparent", opacity: 1
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
            x: 10, y: 10, width: 20, height: 10,
            content: dataUrl,
            color: "transparent", opacity: 1
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
            y: ((e.clientY - rect.top) / rect.height) * 100
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
                x, y,
                content: "Type here",
                color: defaults.color,
                fontSize: defaults.fontSize,
                fontFamily: defaults.fontFamily,
                opacity: defaults.opacity,
                rotation: 0
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
                x, y,
                width: 0, height: 0,
                endX: x, endY: y,
                color: defaults.color,
                strokeWidth: defaults.strokeWidth,
                opacity: defaults.opacity,
                rotation: 0
            };
            setAnnotations(prev => [...prev, annotation]); 
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
            setCurrentPath(prev => [...prev, { x, y }]);
            return;
        }

        if (activeOperation.current === "create" && selectedAnnotationId) {
            setAnnotations(prev => prev.map(a => {
                if (a.id === selectedAnnotationId) {
                    if (a.shapeType === "line" || a.shapeType === "arrow") {
                        return { ...a, endX: x, endY: y };
                    }
                    return {
                        ...a,
                        x: Math.min(x, startPos.current.x),
                        y: Math.min(y, startPos.current.y),
                        width: Math.abs(x - startPos.current.x),
                        height: Math.abs(y - startPos.current.y)
                    };
                }
                return a;
            }));
            return;
        }

        if (activeOperation.current === "move" && selectedAnnotationId) {
             const rect = workspaceRef.current!.getBoundingClientRect();
             const rx = ((e.clientX - rect.left) / rect.width) * 100;
             const ry = ((e.clientY - rect.top) / rect.height) * 100;
             setAnnotations(prev => prev.map(a => a.id === selectedAnnotationId ? { ...a, x: rx - dragOffset.current.x, y: ry - dragOffset.current.y } : a));
        }
        
        if (activeOperation.current === "resize" && selectedAnnotationId) {
            setAnnotations(prev => prev.map(a => {
                if (a.id === selectedAnnotationId) {
                    const { x: ax, y: ay } = a;
                    const w = Math.max(1, Math.abs(x - ax));
                    const h = Math.max(1, Math.abs(y - ay));
                    return { ...a, width: w, height: h };
                }
                return a;
            }));
        }
    };

    const handleMouseUp = () => {
        if (activeOperation.current === "draw") {
            if (currentPath.length > 1) {
                const annotation: Annotation = {
                    id: `draw-${Date.now()}`,
                    type: "draw",
                    page: currentPage,
                    x: 0, y: 0,
                    color: defaults.color,
                    path: currentPath,
                    strokeWidth: defaults.strokeWidth,
                    opacity: defaults.opacity
                };
                addToUndo([...annotations, annotation]);
            }
            setCurrentPath([]);
        } else if (activeOperation.current === "create" || activeOperation.current === "move" || activeOperation.current === "resize") {
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
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
            if (e.key === 'Backspace' || e.key === 'Delete') {
                if (selectedAnnotationId && !editingAnnotationId) {
                    addToUndo(annotations.filter(a => a.id !== selectedAnnotationId));
                    setSelectedAnnotationId(null);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [annotations, selectedAnnotationId, editingAnnotationId, handleUndo, handleRedo, addToUndo]); // Deps for closure

    // --- Annotation Click Handlers ---
    
    const handleAnnotationMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (selectedTool === "eraser") {
            addToUndo(annotations.filter(a => a.id !== id));
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
                const a = annotations.find(ann => ann.id === id);
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
                 const color = anno.color === "transparent" ? undefined : rgb(
                    parseInt(anno.color.slice(1, 3), 16) / 255,
                    parseInt(anno.color.slice(3, 5), 16) / 255,
                    parseInt(anno.color.slice(5, 7), 16) / 255
                 );
                 const opacity = anno.opacity ?? 1;

                 if (anno.type === "text" && anno.content && color) {
                     page.drawText(anno.content, {
                         x: (anno.x/100)*width, y: height - (anno.y/100)*height,
                         size: anno.fontSize, font, color, opacity
                     });
                 } else if (anno.type === "image" || anno.type === "sign") {
                     if (anno.content) {
                         const imgBytes = await fetch(anno.content).then(res => res.arrayBuffer());
                         let img;
                         if (anno.content.includes("image/png")) img = await pdf.embedPng(imgBytes);
                         else img = await pdf.embedJpg(imgBytes);
                         
                         page.drawImage(img, {
                             x: (anno.x/100)*width,
                             y: height - (anno.y/100)*height - ((anno.height||0)/100)*height,
                             width: ((anno.width||0)/100)*width,
                             height: ((anno.height||0)/100)*height,
                             opacity
                         });
                     }
                 } else if (anno.type === "shape" && color) {
                    if (anno.shapeType === "rectangle") {
                         page.drawRectangle({
                             x: (anno.x / 100) * width,
                             y: height - (anno.y / 100) * height - ((anno.height||0)/100)*height,
                             width: ((anno.width||0)/100)*width,
                             height: ((anno.height||0)/100)*height,
                             color: undefined,
                             borderColor: color,
                             borderWidth: anno.strokeWidth || 2,
                             opacity
                         });
                     } else if ((anno.shapeType === "line" || anno.shapeType === "arrow") && anno.endX !== undefined) {
                         page.drawLine({
                             start: { x: (anno.x/100)*width, y: height - (anno.y/100)*height },
                             end: { x: (anno.endX/100)*width, y: height - (anno.endY!/100)*height },
                             thickness: anno.strokeWidth || 2, color, opacity
                         });
                     }
                 } else if (anno.type === "draw" && anno.path && color) {
                     for(let i=0; i<anno.path.length-1; i++) {
                         const p1 = anno.path[i];
                         const p2 = anno.path[i+1];
                         page.drawLine({
                             start: { x: (p1.x/100)*width, y: height - (p1.y/100)*height },
                             end: { x: (p2.x/100)*width, y: height - (p2.y/100)*height },
                             thickness: anno.strokeWidth || 2, color, opacity, lineCap: LineCapStyle.Round
                         });
                     }
                 }
             }

             const pdfBytes = await pdf.save();
             setResultBlob(uint8ArrayToBlob(pdfBytes));
             setStatus("success");
             addToHistory("Edited PDF", file.name, "Custom edits applied");
         } catch(e) { 
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


    const selectedAnno = annotations.find(a => a.id === selectedAnnotationId);

    return (
        <div className="relative min-h-[calc(100vh-80px)] pt-24 pb-16 overflow-hidden">
             <AnimatedBackground />
             <FloatingDecorations />
             <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
             <SignatureModal 
                isOpen={isSignatureModalOpen} 
                onClose={() => { setIsSignatureModalOpen(false); setSelectedTool("select"); }} 
                onSave={handleSignatureSave}
            />

            <div className={`container mx-auto relative z-10 ${status === "editing" ? "h-[calc(100vh-140px)]" : ""}`}>
             <AnimatePresence mode="wait">
                 {status === "idle" && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-4xl mx-auto"
                    >
                        <ToolHeader
                            title="Edit PDF"
                            description="The professional way to edit documents. Add text, shapes, and signatures with ease."
                            icon={MousePointer2}
                        />

                        <ToolCard className="p-8">
                            <div
                                className={`drop-zone active:border-black ${dragActive ? "active" : ""}`}
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={(e) => { e.preventDefault(); setDragActive(false); if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
                                onClick={() => document.getElementById("pdf-upload")?.click()}
                            >
                                <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={(e) => { if(e.target.files?.[0]) processFile(e.target.files[0]); }} />
                                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-lg font-medium mb-2">Drop PDF here</p>
                                <p className="text-gray-400 text-sm">or click to browse • Free & Private</p>
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
                                        "Click 'Save PDF' to download your perfectly edited document."
                                    ]
                                }}
                                benefits={{
                                    title: "Why Use Our PDF Editor?",
                                    items: [
                                        { title: "Completely Free", desc: "No watermarks, no sign-ups, no hidden costs." },
                                        { title: "Browser Based", desc: "Files are processed locally in your browser for maximum privacy." },
                                        { title: "Rich Tools", desc: "Full suite of editing tools including shapes, drawings, and signatures." }
                                    ]
                                }}
                                faqs={[
                                    { question: "Can I edit existing text?", answer: "To ensure document integrity, this tool allows you to add new content (text, shapes, images) to your PDF. It is not designed to reflow existing proprietary text." },
                                    { question: "Is it secure?", answer: "Yes! All processing happens in your browser. Your files are never uploaded to our servers." }
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
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col h-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
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
                                strokeWidth: selectedAnno?.strokeWidth || defaults.strokeWidth,
                                opacity: selectedAnno?.opacity || defaults.opacity,
                            }}
                            onUpdate={(k, v) => {
                                setDefaults(prev => ({...prev, [k]: v}));
                                if(selectedAnnotationId) {
                                    const newAnnos = annotations.map(a => a.id === selectedAnnotationId ? {...a, [k]:v} : a);
                                    addToUndo(newAnnos);
                                }
                            }}
                            onDelete={() => {
                                const newAnnos = annotations.filter(a => a.id !== selectedAnnotationId);
                                addToUndo(newAnnos);
                                setSelectedAnnotationId(null);
                            }}
                        />

                        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100/50 relative">
                            <div className="min-h-full flex flex-col items-center py-10 origin-top">
                                <div className="sticky top-4 z-50 mb-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-4">
                                    <button disabled={currentPage===0} onClick={() => setCurrentPage(c => c-1)} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button>
                                    <span className="text-sm font-bold text-gray-700 min-w-[80px] text-center">Page {currentPage+1} / {totalPages}</span>
                                    <button disabled={currentPage===totalPages-1} onClick={() => setCurrentPage(c => c+1)} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button>
                                    <div className="w-px h-4 bg-gray-300 mx-2" />
                                    <button onClick={handleSave} className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-md">Save PDF</button>
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
                                         <Image src={pageImages[currentPage]} alt="Page" fill className="object-contain pointer-events-none select-none" unoptimized />
                                     )}

                                     <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
                                        {annotations.filter(a => a.page === currentPage && (a.type === "draw" || a.shapeType === "line" || a.shapeType === "arrow")).map(a => {
                                             if (a.type === "draw" && a.path) {
                                                 return <polyline key={a.id} points={a.path.map(p => `${p.x}% ${p.y}%`).join(",")} fill="none" stroke={a.color} strokeWidth={a.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                                             }
                                             if (a.shapeType === "line" || a.shapeType === "arrow") {
                                                 return <line key={a.id} x1={`${a.x}%`} y1={`${a.y}%`} x2={`${a.endX}%`} y2={`${a.endY}%`} stroke={a.color} strokeWidth={a.strokeWidth} />
                                             }
                                             return null;
                                        })}
                                     </svg>

                                     {annotations.filter(a => a.page === currentPage && a.type !== "draw" && a.shapeType !== "line" && a.shapeType !== "arrow").map(a => {
                                         const isSelected = selectedAnnotationId === a.id;
                                         return (
                                             <div
                                                key={a.id}
                                                onMouseDown={(e) => handleAnnotationMouseDown(e, a.id)}
                                                className={`absolute ${isSelected ? "border-2 border-blue-500 z-50" : "z-10 hover:border hover:border-blue-300"}`}
                                                style={{
                                                    left: `${a.x}%`, top: `${a.y}%`,
                                                    width: a.width ? `${a.width}%` : "auto",
                                                    height: a.height ? `${a.height}%` : "auto",
                                                    borderColor: a.shapeType === "rectangle" || a.shapeType === "circle" ? (isSelected ? "blue" : "transparent") : undefined,
                                                }}
                                             >
                                                 {isSelected && (a.type === "image" || a.type === "shape" || a.type === "sign") && (
                                                     <ResizeHandle isSelected={true} onResizeStart={() => activeOperation.current = "resize"} />
                                                 )}

                                                 {a.type === "text" && (
                                                     <div style={{ fontSize: `${(a.fontSize||16) * zoom}px`, fontFamily: a.fontFamily, color: a.color, opacity: a.opacity }}>
                                                         {editingAnnotationId === a.id ? (
                                                             <input 
                                                                autoFocus value={a.content}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setAnnotations(prev => prev.map(ann => ann.id===a.id ? {...ann, content: val} : ann));
                                                                }}
                                                                onBlur={() => { setEditingAnnotationId(null); addToUndo(annotations); }}
                                                                className="bg-transparent border-none outline-none text-center"
                                                                style={{ width: `${(a.content?.length||1)*1}ch`, color: a.color }}
                                                             />
                                                         ) : (
                                                             <span onDoubleClick={() => setEditingAnnotationId(a.id)}>{a.content}</span>
                                                         )}
                                                     </div>
                                                 )}
                                                 
                                                 {a.shapeType === "rectangle" && <div className="w-full h-full border-2" style={{ borderColor: a.color, borderWidth: a.strokeWidth }} />}
                                                 {a.shapeType === "circle" && <div className="w-full h-full border-2 rounded-full" style={{ borderColor: a.color, borderWidth: a.strokeWidth }} />}
                                                 
                                                 {(a.type === "image" || a.type === "sign") && (
                                                     <div className="w-full h-full relative">
                                                         <Image src={a.content!} alt="content" fill className="object-contain" unoptimized />
                                                     </div>
                                                 )}
                                             </div>
                                         )
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
                        className="flex flex-col items-center justify-center py-24 max-w-lg mx-auto text-center"
                    >
                        <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mb-8">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">PDF Edited Successfully!</h2>
                        <p className="text-gray-500 mb-10">Your document is ready for download.</p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={handleDownload} className="btn-primary py-4 px-10 flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                Download PDF
                            </button>
                            <button onClick={reset} className="btn-outline py-4 px-10 flex items-center gap-2">
                                <RefreshCw className="w-5 h-5" />
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
                        className="flex flex-col items-center justify-center py-24 max-w-lg mx-auto text-center"
                    >
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-8">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-10">{errorMessage}</p>

                        <button onClick={reset} className="btn-primary py-4 px-10 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                    </motion.div>
                 )}
             </AnimatePresence>
             </div>
        </div>
    );
}
