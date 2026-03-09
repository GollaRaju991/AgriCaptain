import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanLine, Camera, Loader2, Upload, X, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Scanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setError(null);
    setCapturedImage(null);
    setAnalysisResult(null);
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
      setError('Unable to access camera. Please grant camera permissions or upload an image.');
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    stopCamera();
    analyzeImage(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageDataUrl: string) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('crop-diagnosis', {
        body: { image: imageDataUrl },
      });

      if (fnError) throw fnError;

      if (data?.error) {
        toast({ title: 'Analysis Error', description: data.error, variant: 'destructive' });
        setAnalysisResult(null);
      } else {
        setAnalysisResult(data.analysis);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      toast({ title: 'Error', description: 'Failed to analyze image. Please try again.', variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    startCamera();
  };

  // Simple markdown-like rendering for bold text
  const renderAnalysis = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-green-700">{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });
      return <p key={i} className={`${line.trim() === '' ? 'h-2' : 'mb-1'}`}>{parts}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      {/* Top bar */}
      <div className="flex items-center p-4 bg-black/80 z-10">
        <button onClick={() => { stopCamera(); navigate(-1); }} className="text-white p-1">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="ml-3 flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-400" />
          <h1 className="text-white text-lg font-semibold">Crop Disease Detection</h1>
        </div>
      </div>

      {/* Main content */}
      {!capturedImage ? (
        <>
          {/* Camera view */}
          <div className="flex-1 relative flex items-center justify-center">
            {error ? (
              <div className="text-white text-center p-6">
                <ScanLine className="h-16 w-16 mx-auto mb-4 text-green-400" />
                <p className="text-sm mb-4">{error}</p>
                <div className="flex gap-3 justify-center">
                  <Button className="bg-green-600" onClick={startCamera}>Try Camera</Button>
                  <Button variant="outline" className="text-white border-white" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" /> Upload Image
                  </Button>
                </div>
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
                    <div className="absolute left-2 right-2 h-0.5 bg-green-400 animate-pulse top-1/2" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom controls */}
          <div className="p-4 bg-black/80 flex items-center justify-center gap-6">
            <Button
              variant="outline"
              className="text-white border-white/40 rounded-full h-12 w-12 p-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5" />
            </Button>
            {isCameraActive && (
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 border-green-400 bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Camera className="h-7 w-7 text-white" />
              </button>
            )}
            <div className="w-12" /> {/* spacer */}
          </div>

          <div className="pb-4 bg-black/80 text-center">
            <p className="text-white/70 text-xs">Point at a crop leaf and capture to detect diseases</p>
          </div>
        </>
      ) : (
        /* Results view */
        <div className="flex-1 overflow-y-auto">
          {/* Captured image */}
          <div className="relative">
            <img src={capturedImage} alt="Captured" className="w-full max-h-64 object-cover" />
            {analyzing && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 text-green-400 animate-spin mx-auto mb-2" />
                  <p className="text-white text-sm">Analyzing crop health...</p>
                </div>
              </div>
            )}
          </div>

          {/* Analysis result */}
          {analysisResult && (
            <div className="bg-white p-4 mx-3 mt-3 rounded-xl shadow-lg mb-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-100">
                <Leaf className="h-5 w-5 text-green-600" />
                <h2 className="text-base font-bold text-green-800">Disease Analysis Report</h2>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                {renderAnalysis(analysisResult)}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="p-4 flex gap-3">
            <Button onClick={retake} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Camera className="h-4 w-4 mr-2" /> Scan Again
            </Button>
            <Button variant="outline" onClick={() => { stopCamera(); navigate(-1); }} className="flex-1">
              <X className="h-4 w-4 mr-2" /> Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
