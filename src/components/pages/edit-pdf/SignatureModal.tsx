import { useRef, useState, useEffect } from "react";
import { X, Check, Eraser } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

export function SignatureModal({
  isOpen,
  onClose,
  onSave,
}: SignatureModalProps) {
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

  const getCoords = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
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

  // Scroll Locking Effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

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
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h3 className="text-xl font-bold">Add Signature</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative h-64 touch-none overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors select-none hover:border-blue-200">
                <canvas
                  ref={canvasRef}
                  className="h-full w-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {isEmpty && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-medium text-gray-400">
                    Sign here
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-6 pt-0">
              <button
                onClick={clear}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-gray-500 transition-colors hover:bg-gray-100"
              >
                <Eraser className="h-4 w-4" />
                Clear
              </button>
              <button
                onClick={handleSave}
                disabled={isEmpty}
                className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Check className="h-5 w-5" />
                Add Signature
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
