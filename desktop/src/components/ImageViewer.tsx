import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  src: string;
  alt?: string;
}

const ZOOM_STEP = 0.25;

export function ImageViewer({ src, alt }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setScale((s) => Math.min(s + ZOOM_STEP, 5));
  const handleZoomOut = () => setScale((s) => Math.max(s - ZOOM_STEP, 0.25));
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[3rem] text-center tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <Button variant="ghost" size="icon-sm" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button variant="ghost" size="icon-sm" onClick={handleReset} title="Reset">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/20 rounded-lg border border-border/50">
        <img
          src={src}
          alt={alt ?? "Image preview"}
          className="max-w-full max-h-full object-contain transition-transform duration-150"
          style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
          draggable={false}
        />
      </div>
    </div>
  );
}
