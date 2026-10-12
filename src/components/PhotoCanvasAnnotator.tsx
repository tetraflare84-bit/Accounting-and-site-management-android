import React, { useRef, useState, useEffect } from 'react';
import {
  Pen,
  ArrowUpRight,
  Square,
  Circle,
  Type,
  RotateCcw,
  Trash2,
  Check,
  X,
  Palette,
} from 'lucide-react';
import { AnnotationItem } from '../types';

interface PhotoCanvasAnnotatorProps {
  imageSrc: string;
  initialAnnotations?: AnnotationItem[];
  onSave: (annotatedDataUrl: string, annotations: AnnotationItem[]) => void;
  onCancel: () => void;
  title?: string;
}

export const PhotoCanvasAnnotator: React.FC<PhotoCanvasAnnotatorProps> = ({
  imageSrc,
  initialAnnotations = [],
  onSave,
  onCancel,
  title = 'Site Photo Markup & Notes',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTool, setActiveTool] = useState<
    'freehand' | 'arrow' | 'rect' | 'circle' | 'text'
  >('freehand');
  const [activeColor, setActiveColor] = useState<string>('#22c55e');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>(initialAnnotations);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const colors = [
    { label: 'Plant Green', value: '#22c55e' },
    { label: 'Warning Amber', value: '#f59e0b' },
    { label: 'Bright White', value: '#ffffff' },
    { label: 'Alert Red', value: '#ef4444' },
    { label: 'Sky Blue', value: '#0ea5e9' },
  ];

  // Load background image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      redraw();
    };
  }, [imageSrc]);

  // Adjust canvas resolution and redraw
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set fixed internal resolution matching image or standard canvas
    const img = imgRef.current;
    canvas.width = img.naturalWidth || 1200;
    canvas.height = img.naturalHeight || 800;

    // Clear and draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all saved annotations
    annotations.forEach((ann) => renderAnnotation(ctx, ann));

    // Draw current in-progress stroke if drawing
    if (isDrawing && currentPoints.length > 0) {
      renderAnnotation(ctx, {
        id: 'preview',
        type: activeTool,
        color: activeColor,
        strokeWidth,
        points: currentPoints,
      });
    }
  };

  useEffect(() => {
    if (imageLoaded) {
      redraw();
    }
  }, [annotations, isDrawing, currentPoints, imageLoaded]);

  // Render a single annotation on canvas context
  const renderAnnotation = (ctx: CanvasRenderingContext2D, ann: AnnotationItem) => {
    ctx.save();
    ctx.strokeStyle = ann.color;
    ctx.fillStyle = ann.color;
    ctx.lineWidth = ann.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (ann.type === 'freehand' && ann.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(ann.points[0].x, ann.points[0].y);
      for (let i = 1; i < ann.points.length; i++) {
        ctx.lineTo(ann.points[i].x, ann.points[i].y);
      }
      ctx.stroke();
    } else if (ann.type === 'rect' && ann.points.length >= 2) {
      const p1 = ann.points[0];
      const p2 = ann.points[ann.points.length - 1];
      ctx.beginPath();
      ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      ctx.stroke();

      if (ann.text) {
        drawTextBadge(ctx, ann.text, p1.x, p1.y - 12, ann.color);
      }
    } else if (ann.type === 'circle' && ann.points.length >= 2) {
      const p1 = ann.points[0];
      const p2 = ann.points[ann.points.length - 1];
      const radius = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      if (ann.text) {
        drawTextBadge(ctx, ann.text, p1.x, p1.y - radius - 12, ann.color);
      }
    } else if (ann.type === 'arrow' && ann.points.length >= 2) {
      const p1 = ann.points[0];
      const p2 = ann.points[ann.points.length - 1];
      drawArrow(ctx, p1.x, p1.y, p2.x, p2.y, ann.strokeWidth * 3);

      if (ann.text) {
        drawTextBadge(ctx, ann.text, p2.x + 10, p2.y - 10, ann.color);
      }
    } else if (ann.type === 'text' && ann.points.length >= 1 && ann.text) {
      const p = ann.points[0];
      drawTextBadge(ctx, ann.text, p.x, p.y, ann.color);
    }

    ctx.restore();
  };

  // Helper to draw clean arrow
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    headlen = 16
  ) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle - Math.PI / 6),
      toY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headlen * Math.cos(angle + Math.PI / 6),
      toY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  // Helper to draw text badge with dark background for outdoor legibility
  const drawTextBadge = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    accentColor: string
  ) => {
    ctx.save();
    ctx.font = 'bold 20px "DM Sans", sans-serif';
    const textWidth = ctx.measureText(text).width;
    const padding = 8;
    const boxHeight = 32;

    // Background pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(x, y - boxHeight / 2, textWidth + padding * 2 + 6, boxHeight, 6);
    ctx.fill();

    // Accent line
    ctx.fillStyle = accentColor;
    ctx.fillRect(x, y - boxHeight / 2, 4, boxHeight);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + padding + 6, y + 6);
    ctx.restore();
  };

  // Get canvas coordinates from mouse or touch event
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'text') {
      const coords = getCanvasCoords(e);
      setTextInputPos(coords);
      return;
    }

    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setCurrentPoints([coords]);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);

    if (activeTool === 'freehand') {
      setCurrentPoints((prev) => [...prev, coords]);
    } else {
      // For shapes and arrows, point 0 is start, point 1 is current end
      setCurrentPoints((prev) => [prev[0], coords]);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length > 0) {
      const newAnn: AnnotationItem = {
        id: `ann_${Date.now()}`,
        type: activeTool,
        color: activeColor,
        strokeWidth,
        points: currentPoints,
      };
      setAnnotations((prev) => [...prev, newAnn]);
    }
    setCurrentPoints([]);
  };

  const handleAddText = () => {
    if (!textInputPos || !textInputValue.trim()) {
      setTextInputPos(null);
      setTextInputValue('');
      return;
    }

    const newAnn: AnnotationItem = {
      id: `ann_${Date.now()}`,
      type: 'text',
      color: activeColor,
      strokeWidth,
      points: [textInputPos],
      text: textInputValue.trim(),
    };

    setAnnotations((prev) => [...prev, newAnn]);
    setTextInputPos(null);
    setTextInputValue('');
  };

  const handleUndo = () => {
    setAnnotations((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (confirm('Clear all markup and comments from this photo?')) {
      setAnnotations([]);
    }
  };

  const handleFinishSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onSave(dataUrl, annotations);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      {/* Top Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">{title}</h2>
            <p className="text-[11px] text-slate-400">
              Draw garden boundaries, measure arrows & add site notes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={annotations.length === 0}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>
          <button
            onClick={handleClear}
            disabled={annotations.length === 0}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-red-400 transition hover:bg-slate-700 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          <button
            onClick={handleFinishSave}
            className="flex h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-md hover:bg-emerald-500"
          >
            <Check className="h-4 w-4" />
            Save Markup
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden bg-black p-2 sm:p-4"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="max-h-full max-w-full touch-none rounded-lg object-contain shadow-2xl cursor-crosshair"
          style={{ maxHeight: 'calc(100vh - 140px)' }}
        />

        {/* Text Input Modal when clicking with text tool */}
        {textInputPos && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Add Site Note / Comment
              </h4>
              <input
                type="text"
                autoFocus
                placeholder="e.g. 6x Boxwood Hedge or Bed Edging 12ft"
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setTextInputPos(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddText}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Place Text
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tool Bar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-t border-slate-800 bg-slate-900 px-4">
        {/* Tool selector */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-950 p-1">
          <button
            onClick={() => setActiveTool('freehand')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition ${
              activeTool === 'freehand'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Freehand Draw"
          >
            <Pen className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTool('arrow')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition ${
              activeTool === 'arrow'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Directional Arrow"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTool('rect')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition ${
              activeTool === 'rect'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Rectangle Boundary"
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTool('circle')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition ${
              activeTool === 'circle'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Plant Dripline Circle"
          >
            <Circle className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTool('text')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition ${
              activeTool === 'text'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Text Note & Comment"
          >
            <Type className="h-4 w-4" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveColor(c.value)}
              className={`h-7 w-7 rounded-full border-2 transition ${
                activeColor === c.value
                  ? 'scale-110 border-white shadow-lg'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>

        {/* Stroke thickness */}
        <div className="hidden sm:flex items-center gap-1 rounded-lg bg-slate-950 p-1">
          {[2, 4, 8].map((w) => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={`flex h-8 w-8 items-center justify-center rounded text-xs font-semibold transition ${
                strokeWidth === w
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {w}px
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
