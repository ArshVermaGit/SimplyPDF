import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Trash2, Type, Palette } from "lucide-react";

interface PropertyBarProps {
    selectedAnnotationId: string | null;
    annotationType?: "text" | "draw" | "shape" | "image" | "line" | "arrow" | "sign";
    properties: {
        color: string;
        fontSize?: number;
        fontFamily?: string;
        strokeWidth?: number;
        opacity?: number;
        textAlign?: "left" | "center" | "right";
    };
    onUpdate: (key: string, value: any) => void;
    onDelete: () => void;
}

const COLORS = [
    "#000000", "#FFFFFF", "#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "transparent"
];

const FONTS = [
    { value: "Inter, sans-serif", label: "Inter" },
    { value: "StandardFonts.TimesRoman", label: "Serif" }, 
    { value: "StandardFonts.Courier", label: "Mono" },
    { value: "'Great Vibes', cursive", label: "Cursive" },
];

export function PropertyBar({ selectedAnnotationId, annotationType, properties, onUpdate, onDelete }: PropertyBarProps) {
    if (!selectedAnnotationId) return null;

    return (
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-6 overflow-x-auto shadow-sm relative z-20">
            {/* Color Picker */}
            <div className="flex items-center gap-2 border-r border-gray-200 pr-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Color</span>
                <div className="flex gap-1.5">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => onUpdate("color", c)}
                            className={`w-6 h-6 rounded-full border transition-transform ${
                                properties.color === c ? "scale-110 border-gray-400 ring-2 ring-gray-200" : "border-gray-200 hover:scale-105"
                            }`}
                            style={{ 
                                backgroundColor: c === "transparent" ? "white" : c,
                                backgroundImage: c === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)" : "none",
                                backgroundSize: "8px 8px"
                            }}
                            title={c}
                        />
                    ))}
                    <input 
                        type="color" 
                        value={properties.color === "transparent" ? "#ffffff" : properties.color}
                        onChange={(e) => onUpdate("color", e.target.value)}
                        className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                    />
                </div>
            </div>

            {/* Text Properties */}
            {annotationType === "text" && (
                <div className="flex items-center gap-4 border-r border-gray-200 pr-6">
                    <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-gray-400" />
                        <select
                            value={properties.fontFamily || FONTS[0].value}
                            onChange={(e) => onUpdate("fontFamily", e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                        >
                            {FONTS.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button 
                            onClick={() => onUpdate("fontSize", Math.max(8, (properties.fontSize || 14) - 2))}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded text-sm text-gray-600 transition-colors"
                        >-</button>
                        <span className="w-8 text-center text-sm font-bold text-gray-700">{Math.round(properties.fontSize || 14)}</span>
                        <button 
                            onClick={() => onUpdate("fontSize", Math.min(72, (properties.fontSize || 14) + 2))}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded text-sm text-gray-600 transition-colors"
                        >+</button>
                    </div>
                </div>
            )}

            {/* Stroke Properties (Shapes/Draw) */}
            {(annotationType === "draw" || annotationType === "shape" || annotationType === "line" || annotationType === "arrow") && (
                <div className="flex items-center gap-2 border-r border-gray-200 pr-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thickness</span>
                    <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={properties.strokeWidth || 2}
                        onChange={(e) => onUpdate("strokeWidth", Number(e.target.value))}
                        className="w-24 accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-medium w-6">{properties.strokeWidth}px</span>
                </div>
            )}

            {/* Opacity */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opacity</span>
                <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={(properties.opacity || 1) * 100}
                    onChange={(e) => onUpdate("opacity", Number(e.target.value) / 100)}
                    className="w-24 accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Delete Action */}
            <div className="ml-auto">
                <button 
                    onClick={onDelete}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </div>
    );
}
