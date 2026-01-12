import { MousePointer2, Type, Image as ImageIcon, Pencil, Square, Circle, Minus, Plus, Hand, Undo, Redo, ChevronDown, Move, PenTool, Eraser } from "lucide-react";
import { motion } from "framer-motion";

export type Tool = "select" | "hand" | "text" | "image" | "draw" | "shape" | "sign" | "eraser" | "stamp";
export type ShapeType = "rectangle" | "circle" | "line" | "arrow";

interface ToolbarProps {
    selectedTool: Tool;
    setSelectedTool: (tool: Tool) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
    activeShape: ShapeType;
    setActiveShape: (shape: ShapeType) => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

export function Toolbar({ 
    selectedTool, setSelectedTool, 
    zoom, setZoom, 
    activeShape, setActiveShape,
    canUndo, canRedo, onUndo, onRedo
}: ToolbarProps) {
    const tools = [
        { id: "select", icon: MousePointer2, label: "Select (V)" },
        { id: "hand", icon: Hand, label: "Pan (H)" },
        { separator: true },
        { id: "text", icon: Type, label: "Text (T)" },
        { id: "image", icon: ImageIcon, label: "Image (I)" },
        { id: "sign", icon: PenTool, label: "Signature" },
        { id: "draw", icon: Pencil, label: "Draw (P)" },
        { id: "eraser", icon: Eraser, label: "Eraser (E)" },
        // { id: "stamp", icon: Stamp, label: "Stamp" }, // Future
    ];

    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm relative z-30">
            {/* Left: Tools */}
            <div className="flex items-center gap-2">
                {tools.map((tool, i) => (
                    tool.separator ? (
                        <div key={`sep-${i}`} className="w-px h-8 bg-gray-200 mx-2" />
                    ) : (
                        <button
                            key={tool.id}
                            onClick={() => setSelectedTool(tool.id as Tool)}
                            className={`p-2.5 rounded-xl transition-all flex flex-col items-center justify-center relative group ${selectedTool === tool.id
                                ? "bg-black text-white shadow-md shadow-black/20"
                                : "text-gray-500 hover:bg-gray-100 hover:text-black"
                            }`}
                            title={tool.label}
                        >
                            {tool.icon && <tool.icon className="w-5 h-5" />}
                            {selectedTool === tool.id && (
                                <motion.span 
                                    layoutId="activeTool"
                                    className="absolute -bottom-2 w-1 h-1 bg-black rounded-full"
                                />
                            )}
                        </button>
                    )
                ))}

                {/* Shapes Dropdown */}
                <div className="relative group ml-1">
                    <button
                        onClick={() => setSelectedTool("shape")}
                        className={`p-2.5 rounded-xl transition-all flex items-center gap-1 ${selectedTool === "shape"
                            ? "bg-black text-white shadow-md"
                            : "text-gray-500 hover:bg-gray-100 hover:text-black"
                        }`}
                        title="Shapes"
                    >
                        {activeShape === "circle" && <Circle className="w-5 h-5" />}
                        {activeShape === "rectangle" && <Square className="w-5 h-5" />}
                        {activeShape === "line" && <Minus className="w-5 h-5 rotate-45" />}
                        {activeShape === "arrow" && <Move className="w-5 h-5" />}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all min-w-[140px] z-50">
                        <div className="text-xs font-bold text-gray-400 px-2 py-1 uppercase tracking-wider mb-1">Shapes</div>
                        {[
                            { id: "rectangle", icon: Square, label: "Rectangle" },
                            { id: "circle", icon: Circle, label: "Circle" },
                            { id: "line", icon: Minus, label: "Line" },
                            { id: "arrow", icon: Move, label: "Arrow" },
                        ].map((shape) => (
                            <button
                                key={shape.id}
                                onClick={() => {
                                    setActiveShape(shape.id as ShapeType);
                                    setSelectedTool("shape");
                                }}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                                    activeShape === shape.id 
                                    ? "bg-gray-100 text-black font-medium" 
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                <shape.icon className={`w-4 h-4 ${shape.id === "line" ? "rotate-45" : ""}`} />
                                {shape.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Center: Undo/Redo */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={onUndo} disabled={!canUndo}
                    className="p-1.5 hover:bg-white rounded-md text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="w-5 h-5" />
                </button>
                <button 
                    onClick={onRedo} disabled={!canRedo}
                    className="p-1.5 hover:bg-white rounded-md text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    title="Redo (Ctrl+Y)"
                >
                    <Redo className="w-5 h-5" />
                </button>
            </div>

            {/* Right: Zoom */}
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        className="p-1.5 hover:bg-white rounded-md transition-all text-gray-500 hover:text-black"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-gray-600 w-12 text-center select-none">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                        className="p-1.5 hover:bg-white rounded-md transition-all text-gray-500 hover:text-black"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
