import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanLine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Scanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      setError('Unable to access camera. Please grant camera permissions.');
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center p-4 bg-black/80 z-10">
        <button onClick={() => { stopCamera(); navigate(-1); }} className="text-white p-1">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-white text-lg font-semibold ml-3">Scan Product / Crop</h1>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-6">
            <ScanLine className="h-16 w-16 mx-auto mb-4 text-green-400" />
            <p className="text-sm">{error}</p>
            <Button className="mt-4 bg-green-600" onClick={startCamera}>Try Again</Button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            {/* Scanner overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-green-400 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl" />
                {/* Scanning line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-green-400 animate-pulse top-1/2" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-black/80 text-center">
        <p className="text-white/70 text-sm">Point at a product barcode or crop leaf to scan</p>
      </div>
    </div>
  );
};

export default Scanner;
