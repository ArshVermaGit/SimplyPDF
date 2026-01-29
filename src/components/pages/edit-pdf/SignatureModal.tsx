import { useRef, useState, useEffect } from "react";
import { X, Check, Eraser } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureDataUrl: string) => void;
}

export function SignatureModal({ isOpen, onClose, onSave }: SignatureModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setIsDrawing(true);
        setIsEmpty(false);
        const { x, y } = getCoords(e, canvas);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { x, y } = getCoords(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
             const ctx = canvas.getContext("2d");
             ctx?.closePath();
        }
    };

    const getCoords = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas || isEmpty) return;
        onSave(canvas.toDataURL("image/png"));
        clear();
        onClose();
    };

    // Resize canvas on open
    useEffect(() => {
        if (isOpen && canvasRef.current) {
             // slight delay to allow layout
             setTimeout(() => {
                 if (canvasRef.current) {
                     canvasRef.current.width = canvasRef.current.offsetWidth;
                     canvasRef.current.height = canvasRef.current.offsetHeight;
                 }
             }, 100);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Add Signature</h3>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 h-64 relative touch-none select-none overflow-hidden hover:border-blue-200 transition-colors">
                                <canvas
                                    ref={canvasRef}
                                    className="w-full h-full cursor-crosshair"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                                {isEmpty && (
                                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 font-medium">
                                         Sign here
                                     </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 pt-0 flex items-center justify-between gap-4">
                            <button
                                onClick={clear}
                                className="px-4 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <Eraser className="w-4 h-4" />
                                Clear
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isEmpty}
                                className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:grayscale transition-all"
                            >
                                <Check className="w-5 h-5" />
                                Add Signature
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
