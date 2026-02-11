
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface ScannerProps {
  onCapture: (image: string) => void;
  onCancel: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [startCamera]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 overflow-hidden bg-slate-900 flex items-center justify-center">
        {error ? (
          <div className="p-8 text-center text-white">
            <p className="mb-4">{error}</p>
            <button 
              onClick={onCancel}
              className="px-6 py-2 bg-slate-700 rounded-lg"
            >
              Go Back
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlay scanning UI */}
        <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg relative">
             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 flex justify-around items-center">
        <button 
          onClick={onCancel}
          className="text-white hover:bg-slate-800 p-3 rounded-full transition"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button 
          onClick={captureFrame}
          className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 active:scale-95 transition flex items-center justify-center"
        >
          <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-800"></div>
        </button>

        <label className="text-white hover:bg-slate-800 p-3 rounded-full transition cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </label>
      </div>
    </div>
  );
};
