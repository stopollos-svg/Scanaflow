
import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClose: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800">Add Digital Signature</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 bg-white">
          <canvas
            ref={canvasRef}
            width={500}
            height={250}
            className="w-full h-[250px] border-2 border-dashed border-slate-200 rounded-xl cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <div className="p-4 flex gap-3">
          <button 
            onClick={clear}
            className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Clear
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
};
