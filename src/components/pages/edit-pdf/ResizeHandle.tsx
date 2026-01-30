interface ResizeHandleProps {
  isSelected: boolean;
  onResizeStart: (handle: string) => void;
  // We rely on parent for actual drag logic via tracking mouse movements after start
  // Or we could use framer motion drag on handles
}

export function ResizeHandle({ isSelected, onResizeStart }: ResizeHandleProps) {
  if (!isSelected) return null;

  const handleStyle =
    "absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full z-20 hover:scale-125 transition-transform shadow-sm";

  return (
    <>
      {/* Corners */}
      <div
        className={`${handleStyle} -top-1.5 -left-1.5 cursor-nwse-resize`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart("nw");
        }}
      />
      <div
        className={`${handleStyle} -top-1.5 -right-1.5 cursor-nesw-resize`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart("ne");
        }}
      />
      <div
        className={`${handleStyle} -bottom-1.5 -left-1.5 cursor-nesw-resize`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart("sw");
        }}
      />
      <div
        className={`${handleStyle} -right-1.5 -bottom-1.5 cursor-nwse-resize`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart("se");
        }}
      />
    </>
  );
}
