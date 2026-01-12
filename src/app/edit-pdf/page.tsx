"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion"; // Unused
import { Upload, Download, CheckCircle2, ChevronLeft, ChevronRight, MousePointer2 } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, LineCapStyle } from "pdf-lib";
import { uint8ArrayToBlob } from "@/lib/pdf-utils";
import {
    AnimatedBackground,
    // FloatingDecorations,
    ToolHeader,
    ToolCard,
    ProcessingState
} from "@/components/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";
import Image from "next/image";
import { Toolbar, Tool, ShapeType } from "./Toolbar";
import { PropertyBar } from "./PropertyBar";

// Helper to draw arrow head
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
const drawArrowHead = (ctx: any, from: { x: number, y: number }, to: { x: number, y: number }, color: any, size: number) => {
   // Logic handled in pdf-lib usually by drawing a triangle/polygon at the end
   // This will be implemented in the save function
};

interface Annotation {
    id: string;
    type: "text" | "draw" | "shape" | "image";
    shapeType?: ShapeType; // For 'shape' type
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
    isBatch?: boolean;
    endX?: number; // For lines/arrows
    endY?: number; // For lines/arrows
}

export default function EditPDFPage() {
    const { addToHistory } = useHistory();
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "editing" | "processing" | "success" | "error">("idle");
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageImages, setPageImages] = useState<string[]>([]);
    const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }[]>([]);
    
    // Toolkit State
    const [selectedTool, setSelectedTool] = useState<Tool>("select");
    const [activeShape, setActiveShape] = useState<ShapeType>("rectangle");
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    
    // Default Styles
    const [defaults, setDefaults] = useState({
        color: "#000000",
        strokeWidth: 2,
        fontSize: 16,
        fontFamily: "Inter, sans-serif",
        opacity: 1
    });

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
    const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
    
    // Refs
    const workspaceRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); // For scrolling
    const imageInputRef = useRef<HTMLInputElement>(null);
    const startPos = useRef({ x: 0, y: 0 }); // Start position for shapes/drag
    const dragOffset = useRef({ x: 0, y: 0 });
    
    // Operation States
    const [isCreating, setIsCreating] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    // const [isRotating, setIsRotating] = useState(false); // Unused for now
    const [isPanning, setIsPanning] = useState(false);
    
    // Load PDF
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) processFile(selectedFile);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "application/pdf") processFile(droppedFile);
    };

    const processFile = async (pdfFile: File) => {
        setFile(pdfFile);
        try {
            const pdfjsLib = await import("pdfjs-dist");
            const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setTotalPages(pdf.numPages);

            const images: string[] = [];
            const dimensions: { width: number; height: number }[] = [];

            // Render pages
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                images.push(canvas.toDataURL("image/jpeg", 0.8)); // slightly compressed for speed
                dimensions.push({ width: viewport.width, height: viewport.height });
            }
            setPageImages(images);
            setPageDimensions(dimensions);
            setStatus("editing");
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
                    color: "transparent",
                    opacity: 1
                };
                setAnnotations(prev => [...prev, annotation]);
                setSelectedAnnotationId(annotation.id);
                setSelectedTool("select");
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (selectedTool === "image") imageInputRef.current?.click();
    }, [selectedTool]);

    // --- Interaction Handlers ---

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
            setIsPanning(true);
            return;
        }

        if (selectedTool === "select") {
            // If checking selection on blank space, deselect
            // Note: Clicking ON an annotation is handled by its own onMouseDown
            setSelectedAnnotationId(null);
            return;
        }

        if (selectedTool === "draw") {
            setIsDrawing(true);
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
             setAnnotations(prev => [...prev, annotation]);
             setSelectedAnnotationId(newId);
             setEditingAnnotationId(newId); // Immediately focus
             setSelectedTool("select"); // Switch back to select after placement
             return;
        }

        if (selectedTool === "shape") {
            setIsCreating(true);
            const newId = `shape-${Date.now()}`;
            const annotation: Annotation = {
                id: newId,
                type: "shape",
                shapeType: activeShape,
                page: currentPage,
                x, y,
                width: 0, height: 0, // Rect/Circle
                endX: x, endY: y,   // Line/Arrow
                color: defaults.color,
                strokeWidth: defaults.strokeWidth,
                opacity: defaults.opacity,
                rotation: 0
            };
            setAnnotations(prev => [...prev, annotation]);
            setSelectedAnnotationId(newId);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!workspaceRef.current) return;
        const { x, y } = getRelativeCoords(e);

        if (isPanning && containerRef.current) {
            containerRef.current.scrollLeft -= e.movementX;
            containerRef.current.scrollTop -= e.movementY;
            return;
        }

        if (isDrawing) {
            setCurrentPath(prev => [...prev, { x, y }]);
            return;
        }

        if (isCreating && selectedAnnotationId) {
            setAnnotations(prev => prev.map(a => {
                if (a.id === selectedAnnotationId) {
                    if (a.shapeType === "line" || a.shapeType === "arrow") {
                        return { ...a, endX: x, endY: y };
                    } 
                    // Rectangle / Circle
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

        if (isDragging && selectedAnnotationId) {
            setAnnotations(prev => prev.map(a => {
                if (a.id === selectedAnnotationId) {
                    // Logic to move line/arrow as a group? or just start point?
                    // For simplicity, implement box-model dragging for everything currently
                    // Would require delta logic for multi-point shapes
                    // const dx = x - startPos.current.x; // Unused
                    // Let's use simple positioning
                     // Re-calculate based on offset
                    const rect = workspaceRef.current!.getBoundingClientRect();
                    const rx = ((e.clientX - rect.left) / rect.width) * 100;
                    const ry = ((e.clientY - rect.top) / rect.height) * 100;
                    
                    return { 
                        ...a, 
                        x: rx - dragOffset.current.x,
                        y: ry - dragOffset.current.y
                    };
                }
                return a;
            }));
        }

        if (isResizing && selectedAnnotationId) {
             // Basic resizing logic
             setAnnotations(prev => prev.map(a => {
                if (a.id === selectedAnnotationId) {
                    const w = Math.abs(x - a.x);
                    const h = Math.abs(y - a.y);
                    return { ...a, width: w, height: h };
                }
                return a;
            }));
        }
    };

    const handleMouseUp = () => {
        if (isDrawing) {
            if (currentPath.length > 1) {
                const annotation: Annotation = {
                    id: `draw-${Date.now()}`,
                    type: "draw",
                    page: currentPage,
                    x: 0, y: 0, // Path contains coords
                    color: defaults.color,
                    path: currentPath,
                    strokeWidth: defaults.strokeWidth,
                    opacity: defaults.opacity
                };
                setAnnotations(prev => [...prev, annotation]);
            }
            setIsDrawing(false);
            setCurrentPath([]);
        }
        
        setIsCreating(false);
        // setIsRotate(false); // Unused
        setIsResizing(false);
        setIsDragging(false);
        setIsPanning(false);

        // If we just finished creating a shape, switch to select
        if (isCreating) setSelectedTool("select");
    };

    // --- Property Updates ---

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateProperty = (key: string, value: any) => {
        setDefaults(prev => ({ ...prev, [key]: value })); // Update defaults for next item
        if (selectedAnnotationId) {
            setAnnotations(prev => prev.map(a => a.id === selectedAnnotationId ? { ...a, [key]: value } : a));
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
                 
                 const colorHex = anno.color === "transparent" ? "#000000" : anno.color;
                 const r = parseInt(colorHex.slice(1, 3), 16) / 255;
                 const g = parseInt(colorHex.slice(3, 5), 16) / 255;
                 const b = parseInt(colorHex.slice(5, 7), 16) / 255;
                 const color = rgb(r, g, b);
                 const opacity = anno.opacity ?? 1;

                 if (anno.type === "text" && anno.content) {
                     page.drawText(anno.content, {
                         x: (anno.x / 100) * width,
                         y: height - (anno.y / 100) * height,
                         size: anno.fontSize || 14,
                         font,
                         color,
                         opacity
                     });
                 }
                 else if (anno.type === "shape") {
                     if (anno.shapeType === "rectangle") {
                         page.drawRectangle({
                             x: (anno.x / 100) * width,
                             y: height - (anno.y / 100) * height - ((anno.height||0)/100)*height,
                             width: ((anno.width||0)/100)*width,
                             height: ((anno.height||0)/100)*height,
                             color: anno.color === "transparent" ? undefined : color,
                             borderColor: color,
                             borderWidth: anno.strokeWidth || 2,
                             opacity
                         });
                     } else if (anno.shapeType === "line" && anno.endX !== undefined) {
                         page.drawLine({
                             start: { x: (anno.x/100)*width, y: height - (anno.y/100)*height },
                             end: { x: (anno.endX/100)*width, y: height - (anno.endY!/100)*height },
                             thickness: anno.strokeWidth || 2,
                             color,
                             opacity
                         });
                     } else if (anno.shapeType === "arrow" && anno.endX !== undefined) {
                          // Draw line
                          const start = { x: (anno.x/100)*width, y: height - (anno.y/100)*height };
                          const end = { x: (anno.endX/100)*width, y: height - (anno.endY!/100)*height };
                          
                          page.drawLine({
                             start,
                             end,
                             thickness: anno.strokeWidth || 2,
                             color,
                             opacity
                         });
                         
                         // Simple arrowhead math
                         // (Stub for now - a real implementation would calculate vector angle)
                     }
                 }
                 else if (anno.type === "draw" && anno.path) {
                     // Draw path using drawLine segments
                     for(let i=0; i<anno.path.length-1; i++) {
                         const p1 = anno.path[i];
                         const p2 = anno.path[i+1];
                         page.drawLine({
                             start: { x: (p1.x/100)*width, y: height - (p1.y/100)*height },
                             end: { x: (p2.x/100)*width, y: height - (p2.y/100)*height },
                             thickness: anno.strokeWidth || 2,
                             color,
                             opacity,
                             lineCap: LineCapStyle.Round
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
            setErrorMessage("Failed to save PDF");
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

    // Get selected annotation object
    const selectedAnno = annotations.find(a => a.id === selectedAnnotationId);

    return (
        <div className="flex flex-col h-screen pt-20 overflow-hidden bg-gray-50">
             <AnimatedBackground />
             <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
            
             {status === "idle" && (
                <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
                    <ToolHeader
                        title="Edit PDF"
                        description="Add text, images, shapes and signatures to your PDF document."
                        icon={MousePointer2}
                    />
                    <ToolCard className="max-w-xl w-full p-12 text-center">
                        <div 
                            className={`border-3 border-dashed rounded-3xl p-10 transition-colors cursor-pointer ${dragActive ? "border-black bg-blue-50" : "border-gray-200 hover:border-black/30"}`}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("pdf-upload")?.click()}
                        >
                            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                            <p className="text-xl font-bold mb-2">Drop PDF here</p>
                            <p className="text-gray-400">or click to browse</p>
                            <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                        </div>
                    </ToolCard>
                </div>
             )}

             {status === "editing" && (
                 <>
                    <Toolbar 
                        selectedTool={selectedTool} 
                        setSelectedTool={setSelectedTool}
                        zoom={zoom}
                        setZoom={setZoom}
                        activeShape={activeShape}
                        setActiveShape={setActiveShape}
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
                        onUpdate={updateProperty}
                        onDelete={() => {
                            setAnnotations(prev => prev.filter(a => a.id !== selectedAnnotationId));
                            setSelectedAnnotationId(null);
                        }}
                    />

                    <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100/50 relative">
                        <div className="min-h-full flex flex-col items-center py-10 origin-top">
                             {/* Page Controls */}
                             <div className="sticky top-4 z-50 mb-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-4">
                                <button disabled={currentPage===0} onClick={() => setCurrentPage(c => c-1)} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button>
                                <span className="text-sm font-bold text-gray-700 min-w-[80px] text-center">Page {currentPage+1} / {totalPages}</span>
                                <button disabled={currentPage===totalPages-1} onClick={() => setCurrentPage(c => c+1)} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button>
                                <div className="w-px h-4 bg-gray-300 mx-2" />
                                <button onClick={handleSave} className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">Save PDF</button>
                             </div>

                             {/* Workspace */}
                             <div 
                                ref={workspaceRef}
                                className={`relative bg-white shadow-2xl transition-transform duration-75 ${selectedTool === "hand" ? "cursor-grab active:cursor-grabbing" : selectedTool === "text" ? "cursor-text" : "cursor-crosshair"}`}
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
                                        className="object-contain pointer-events-none select-none"
                                        unoptimized
                                    />
                                 )}

                                 <svg className="absolute inset-0 pointer-events-none w-full h-full">
                                    {/* Render Lines / Arrows / Scribbles */}
                                    {annotations.filter(a => a.page === currentPage && (a.type === "draw" || a.shapeType === "line" || a.shapeType === "arrow")).map(a => {
                                         if (a.type === "draw" && a.path) {
                                             return (
                                                 <polyline 
                                                    key={a.id}
                                                    points={a.path.map(p => `${p.x}% ${p.y}%`).join(",")}
                                                    fill="none"
                                                    stroke={a.color}
                                                    strokeWidth={a.strokeWidth}
                                                    strokeOpacity={a.opacity}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                 />
                                             )
                                         }
                                         if (a.shapeType === "line" || a.shapeType === "arrow") {
                                             return (
                                                 <g key={a.id}>
                                                     <line 
                                                        x1={`${a.x}%`} y1={`${a.y}%`}
                                                        x2={`${a.endX}%`} y2={`${a.endY}%`}
                                                        stroke={a.color}
                                                        strokeWidth={a.strokeWidth}
                                                        strokeOpacity={a.opacity}
                                                     />
                                                     {a.shapeType === "arrow" && (
                                                         <circle cx={`${a.endX}%`} cy={`${a.endY}%`} r={a.strokeWidth! * 1.5} fill={a.color} /> 
                                                         // Simple dot for arrow head visual for now
                                                     )}
                                                 </g>
                                             )
                                         }
                                         return null;
                                    })}
                                 </svg>

                                 {/* Render HTML Elements (Text, Rect, Circle, Image) */}
                                 {annotations.filter(a => a.page === currentPage && a.type !== "draw" && a.shapeType !== "line" && a.shapeType !== "arrow").map(a => {
                                     const isSelected = selectedAnnotationId === a.id;
                                     return (
                                         <div
                                            key={a.id}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                if (selectedTool === "select") {
                                                    setSelectedAnnotationId(a.id);
                                                    setIsDragging(true);
                                                    if (workspaceRef.current) {
                                                        const rect = workspaceRef.current.getBoundingClientRect();
                                                        const clientX = e.clientX; 
                                                        const clientY = e.clientY;
                                                        const rx = ((clientX - rect.left) / rect.width) * 100;
                                                        const ry = ((clientY - rect.top) / rect.height) * 100;
                                                        dragOffset.current = { x: rx - a.x, y: ry - a.y };
                                                    }
                                                }
                                            }}
                                            className={`absolute ${isSelected ? "border-2 border-blue-500 z-50" : "z-10 hover:border hover:border-blue-300"}`}
                                            style={{
                                                left: `${a.x}%`, top: `${a.y}%`,
                                                width: a.width ? `${a.width}%` : "auto",
                                                height: a.height ? `${a.height}%` : "auto",
                                                borderColor: a.shapeType === "rectangle" || a.shapeType === "circle" ? (isSelected ? "blue" : "transparent") : undefined,
                                            }}
                                         >
                                             {a.type === "text" && (
                                                 <div style={{ 
                                                     fontSize: `${(a.fontSize||16) * zoom}px`, 
                                                     fontFamily: a.fontFamily, 
                                                     color: a.color,
                                                     opacity: a.opacity
                                                 }}>
                                                     {editingAnnotationId === a.id ? (
                                                         <input 
                                                            autoFocus
                                                            value={a.content}
                                                            onChange={(e) => updateProperty("content", e.target.value)}
                                                            onBlur={() => setEditingAnnotationId(null)}
                                                            className="bg-transparent border-none outline-none text-center"
                                                            style={{ width: `${(a.content?.length||1)*1}ch`, color: a.color }}
                                                         />
                                                     ) : (
                                                         <span onDoubleClick={() => setEditingAnnotationId(a.id)}>{a.content}</span>
                                                     )}
                                                 </div>
                                             )}

                                             {a.shapeType === "rectangle" && (
                                                 <div className="w-full h-full border-2" style={{ borderColor: a.color, borderWidth: a.strokeWidth, opacity: a.opacity }} />
                                             )}

                                             {a.shapeType === "circle" && (
                                                 <div className="w-full h-full border-2 rounded-full" style={{ borderColor: a.color, borderWidth: a.strokeWidth, opacity: a.opacity }} />
                                             )}
                                             
                                             {a.type === "image" && (
                                                 <div className="w-full h-full relative">
                                                     <Image src={a.content!} alt="img" fill className="object-contain" unoptimized />
                                                 </div>
                                             )}
                                         </div>
                                     )
                                 })}
                             </div>
                        </div>
                    </div>
                 </>
             )}

             {status === "success" && (
                 <div className="flex-1 flex items-center justify-center flex-col z-20">
                     <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
                     <h2 className="text-3xl font-bold mb-2">Edits Applied!</h2>
                     <p className="text-gray-500 mb-8">Your document has been updated successfully.</p>
                     <div className="flex gap-4">
                         <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-full font-bold border border-gray-200 hover:bg-gray-50">Edit Another</button>
                         <button onClick={handleDownload} className="px-6 py-3 rounded-full font-bold bg-black text-white hover:bg-gray-800 flex items-center gap-2">
                             <Download className="w-4 h-4" /> Download PDF
                         </button>
                     </div>
                 </div>
             )}
             
             {status === "processing" && <ProcessingState title="Saving Changes..." />}
        </div>
    );
}
