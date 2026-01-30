import {
  MousePointer2,
  Type,
  Image as ImageIcon,
  Pencil,
  Square,
  Circle,
  Minus,
  Plus,
  Hand,
  Undo,
  Redo,
  ChevronDown,
  Move,
  PenTool,
  Eraser,
} from "lucide-react";
import { motion } from "framer-motion";

export type Tool =
  | "select"
  | "hand"
  | "text"
  | "image"
  | "draw"
  | "shape"
  | "sign"
  | "eraser"
  | "stamp";
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
  selectedTool,
  setSelectedTool,
  zoom,
  setZoom,
  activeShape,
  setActiveShape,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
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
    <div className="relative z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* Left: Tools */}
      <div className="flex items-center gap-2">
        {tools.map((tool, i) =>
          tool.separator ? (
            <div key={`sep-${i}`} className="mx-2 h-8 w-px bg-gray-200" />
          ) : (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id as Tool)}
              className={`group relative flex flex-col items-center justify-center rounded-xl p-2.5 transition-all ${
                selectedTool === tool.id
                  ? "bg-black text-white shadow-md shadow-black/20"
                  : "text-gray-500 hover:bg-gray-100 hover:text-black"
              }`}
              title={tool.label}
            >
              {tool.icon && <tool.icon className="h-5 w-5" />}
              {selectedTool === tool.id && (
                <motion.span
                  layoutId="activeTool"
                  className="absolute -bottom-2 h-1 w-1 rounded-full bg-black"
                />
              )}
            </button>
          )
        )}

        {/* Shapes Dropdown */}
        <div className="group relative ml-1">
          <button
            onClick={() => setSelectedTool("shape")}
            className={`flex items-center gap-1 rounded-xl p-2.5 transition-all ${
              selectedTool === "shape"
                ? "bg-black text-white shadow-md"
                : "text-gray-500 hover:bg-gray-100 hover:text-black"
            }`}
            title="Shapes"
          >
            {activeShape === "circle" && <Circle className="h-5 w-5" />}
            {activeShape === "rectangle" && <Square className="h-5 w-5" />}
            {activeShape === "line" && <Minus className="h-5 w-5 rotate-45" />}
            {activeShape === "arrow" && <Move className="h-5 w-5" />}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>

          <div className="invisible absolute top-full left-0 z-50 mt-2 min-w-[140px] rounded-xl border border-gray-100 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
            <div className="mb-1 px-2 py-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Shapes
            </div>
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
                className={`flex w-full items-center gap-3 rounded-lg p-2 text-sm transition-colors ${
                  activeShape === shape.id
                    ? "bg-gray-100 font-medium text-black"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <shape.icon
                  className={`h-4 w-4 ${shape.id === "line" ? "rotate-45" : ""}`}
                />
                {shape.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Undo/Redo */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded-md p-1.5 text-gray-600 transition-all hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-5 w-5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded-md p-1.5 text-gray-600 transition-all hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-5 w-5" />
        </button>
      </div>

      {/* Right: Zoom */}
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="rounded-md p-1.5 text-gray-500 transition-all hover:bg-white hover:text-black"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs font-bold text-gray-600 select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            className="rounded-md p-1.5 text-gray-500 transition-all hover:bg-white hover:text-black"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
