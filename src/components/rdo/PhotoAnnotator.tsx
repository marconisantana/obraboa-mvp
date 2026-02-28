import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { X, Undo2, Type, Paintbrush, Eraser } from 'lucide-react';

interface Stroke {
  type: 'brush' | 'eraser';
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface TextAnnotation {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

interface Annotations {
  strokes: Stroke[];
  texts: TextAnnotation[];
}

interface PhotoAnnotatorProps {
  imageUrl: string;
  existingAnnotations: Annotations | null;
  onSave: (annotations: Annotations) => void;
  onClose: () => void;
}

const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#FFFFFF', '#000000'];

export default function PhotoAnnotator({ imageUrl, existingAnnotations, onSave, onClose }: PhotoAnnotatorProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [tool, setTool] = useState<'brush' | 'text' | 'eraser'>('brush');
  const [color, setColor] = useState('#EF4444');
  const [brushWidth, setBrushWidth] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>(existingAnnotations?.strokes || []);
  const [texts, setTexts] = useState<TextAnnotation[]>(existingAnnotations?.texts || []);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [imgLoaded, setImgLoaded] = useState(false);

  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    // Draw strokes
    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.type === 'eraser' ? '#FFFFFF' : stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }

    // Draw current stroke
    if (currentStroke.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      ctx.lineWidth = brushWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }

    // Draw texts
    for (const txt of texts) {
      ctx.font = `${txt.fontSize}px sans-serif`;
      ctx.fillStyle = txt.color;
      ctx.fillText(txt.text, txt.x, txt.y);
    }
  }, [strokes, texts, currentStroke, color, brushWidth, tool, imgLoaded]);

  useEffect(() => { drawAll(); }, [drawAll]);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'text') {
      const pt = getCanvasPoint(e);
      const text = prompt(t('rdo.annotate'));
      if (text) {
        setTexts([...texts, { x: pt.x, y: pt.y, text, fontSize: 24, color }]);
      }
      return;
    }
    setIsDrawing(true);
    setCurrentStroke([getCanvasPoint(e)]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    setCurrentStroke((prev) => [...prev, getCanvasPoint(e)]);
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length >= 2) {
      setStrokes([...strokes, { type: tool === 'eraser' ? 'eraser' : 'brush', points: currentStroke, color, width: brushWidth }]);
    }
    setCurrentStroke([]);
  };

  const undo = () => {
    if (strokes.length > 0) {
      setStrokes(strokes.slice(0, -1));
    } else if (texts.length > 0) {
      setTexts(texts.slice(0, -1));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-background/10">
        <div className="flex items-center gap-2">
          <Button variant={tool === 'brush' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('brush')}>
            <Paintbrush size={16} />
          </Button>
          <Button variant={tool === 'text' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('text')}>
            <Type size={16} />
          </Button>
          <Button variant={tool === 'eraser' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('eraser')}>
            <Eraser size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={undo}>
            <Undo2 size={16} />
          </Button>
          <div className="flex gap-1 ml-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => onSave({ strokes, texts })}>
            {t('common.save')}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} className="text-white" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <img
          ref={imgRef}
          src={imageUrl}
          alt=""
          className="hidden"
          crossOrigin="anonymous"
          onLoad={() => setImgLoaded(true)}
        />
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full touch-none"
          style={{ cursor: tool === 'text' ? 'text' : 'crosshair' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
    </div>
  );
}
