import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Leaf, Camera, Upload, Loader2, X, ScanLine, Sun, Hand, Eye, ShieldCheck, ShoppingCart, Stethoscope, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { products } from '@/data/products';
import { useLanguage } from '@/contexts/LanguageContext';

/* ─── sub-components ─── */

const ScannerHeader = ({ onBack, translations }: { onBack: () => void; translations: any }) => (
  <div className="sticky top-0 z-20 bg-gradient-to-r from-green-700 to-emerald-600 text-white px-4 py-3 flex items-center gap-3 shadow-md">
    <button onClick={onBack} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
        <Leaf className="h-4 w-4" />
      </div>
      <div>
        <h1 className="text-base font-bold leading-tight">{translations.scanner_crop_disease}</h1>
        <p className="text-[10px] text-green-100">{translations.scanner_subtitle}</p>
      </div>
    </div>
  </div>
);

const CameraView = ({
  videoRef,
  error,
  isCameraActive,
  onCapture,
  onUpload,
  onRetryCamera,
  fileInputRef,
  translations,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  error: string | null;
  isCameraActive: boolean;
  onCapture: () => void;
  onUpload: () => void;
  onRetryCamera: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  translations: any;
}) => (
  <div className="px-3 py-4">
    {/* Scanner Frame */}
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-square max-w-sm mx-auto shadow-xl border-2 border-green-500/30">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-3">
            <Leaf className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-sm text-gray-300 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onRetryCamera}>{translations.scanner_try_camera}</Button>
            <Button size="sm" variant="outline" className="text-white border-white/40" onClick={onUpload}>
              <Upload className="h-3.5 w-3.5 mr-1" /> {translations.scanner_upload}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          {/* Corner markers */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 relative">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-green-400 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-green-400 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-green-400 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-green-400 rounded-br-2xl" />
              {/* Scan line animation */}
              <div className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-[scan_2s_ease-in-out_infinite]" style={{ top: '50%' }} />
            </div>
          </div>
          {/* Label */}
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white">
              <Leaf className="h-12 w-12 text-green-400 mb-2" />
              <p className="text-sm text-gray-300">{translations.scanner_point_camera}</p>
            </div>
          )}
        </>
      )}
    </div>

    {/* Buttons */}
    <div className="flex gap-3 mt-4 max-w-sm mx-auto">
      {isCameraActive && (
        <Button onClick={onCapture} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 font-semibold shadow-lg">
          <Camera className="h-4 w-4 mr-2" /> {translations.scanner_scan_leaf}
        </Button>
      )}
      <Button onClick={onUpload} variant="outline" className={`${isCameraActive ? '' : 'flex-1'} rounded-xl h-11 border-green-300 text-green-700 hover:bg-green-50 font-semibold`}>
        <Upload className="h-4 w-4 mr-2" /> {translations.scanner_upload_image}
      </Button>
    </div>

    {/* Instructions */}
    <div className="mt-5 max-w-sm mx-auto space-y-2">
      {[
        { icon: Eye, text: translations.scanner_leaf_visible },
        { icon: Sun, text: translations.scanner_natural_light },
        { icon: Hand, text: translations.scanner_hold_steady },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2.5 bg-green-50 rounded-xl px-3 py-2">
          <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            <item.icon className="h-3.5 w-3.5 text-green-600" />
          </div>
          <p className="text-xs text-green-800">{item.text}</p>
        </div>
      ))}
    </div>
  </div>
);

const AnalyzingOverlay = ({ translations }: { translations: any }) => (
  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl z-10">
    <div className="text-center">
      <Loader2 className="h-10 w-10 text-green-400 animate-spin mx-auto mb-2" />
      <p className="text-white text-sm font-medium">{translations.scanner_analyzing}</p>
      <p className="text-white/60 text-[10px] mt-1">{translations.scanner_analyzing_wait}</p>
    </div>
  </div>
);

const ResultCard = ({ result, capturedImage, onRetake, translations }: { result: string; capturedImage: string; onRetake: () => void; translations: any }) => {
  const isNotPlant = result.includes('**NOT_A_PLANT**');
  const isUnclear = result.includes('**UNCLEAR_IMAGE**');
  const isPlantDisease = result.includes('**IS_PLANT_DISEASE**');

  // Clean the marker tags from display text
  const cleanResult = result
    .replace('**NOT_A_PLANT**', '')
    .replace('**UNCLEAR_IMAGE**', '')
    .replace('**IS_PLANT_DISEASE**', '')
    .trim();

  const lines = cleanResult.split('\n').filter(l => l.trim());

  // Find matching products from our catalog based on AI recommendations
  const getMatchingProducts = () => {
    if (isNotPlant || isUnclear) return [];
    const lowerResult = result.toLowerCase();
    // Only show pesticide category products that match keywords in the analysis
    const pesticides = products.filter(p => p.category?.toLowerCase() === 'pesticides');
    const matched = pesticides.filter(p => {
      const nameWords = p.name.toLowerCase().split(/[\s\-–]+/);
      return nameWords.some(word => word.length > 3 && lowerResult.includes(word));
    });
    return matched.slice(0, 3);
  };

  const matchingProducts = getMatchingProducts();

  return (
    <div className="px-3 py-4 space-y-3 animate-fade-in">
      {/* Captured image */}
      <div className="relative rounded-2xl overflow-hidden max-w-sm mx-auto shadow-lg">
        <img src={capturedImage} alt="Scanned crop" className="w-full max-h-48 object-cover" />
        <div className={`absolute top-2 left-2 ${isNotPlant || isUnclear ? 'bg-orange-500' : 'bg-green-600'} text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
          {isNotPlant || isUnclear ? (
            <><AlertTriangle className="w-3 h-3" /> {isNotPlant ? translations.scanner_not_plant || 'Not a Plant' : translations.scanner_unclear || 'Unclear Image'}</>
          ) : (
            <><CheckCircle2 className="w-3 h-3" /> {translations.scanner_scan_complete}</>
          )}
        </div>
      </div>

      {/* Analysis Report */}
      <Card className="max-w-sm mx-auto border-green-200 shadow-md rounded-2xl overflow-hidden">
        <div className={`bg-gradient-to-r ${isNotPlant || isUnclear ? 'from-orange-500 to-amber-500' : 'from-green-600 to-emerald-500'} px-4 py-2.5 flex items-center gap-2`}>
          {isNotPlant || isUnclear ? (
            <AlertTriangle className="h-4 w-4 text-white" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-white" />
          )}
          <h2 className="text-sm font-bold text-white">{translations.scanner_disease_report}</h2>
        </div>
        <CardContent className="p-4">
          <div className="text-sm text-gray-700 leading-relaxed space-y-1">
            {lines.map((line, i) => {
              // Skip lines that mention "Recommended Products: NONE"
              if (line.toLowerCase().includes('recommended products') && line.toLowerCase().includes('none')) return null;
              const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j} className="text-green-700">{part.slice(2, -2)}</strong>;
                }
                return <span key={j}>{part}</span>;
              });
              return <p key={i} className={line.trim() === '' ? 'h-1' : 'mb-0.5'}>{parts}</p>;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Products - only show if plant disease detected AND matching products found */}
      {isPlantDisease && matchingProducts.length > 0 && (
        <div className="max-w-sm mx-auto">
          <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4 text-green-600" />
            {translations.scanner_recommended_products}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {matchingProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="rounded-xl overflow-hidden border-green-100 hover:shadow-md transition-shadow">
                  <img src={product.image} alt={product.name} className="w-full h-20 object-cover" />
                  <div className="p-2">
                    <p className="text-[10px] font-semibold text-gray-800 line-clamp-2 leading-tight">{product.name}</p>
                    <p className="text-[11px] font-bold text-green-700 mt-0.5">₹{product.price}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons - show scan again prominently for not-plant/unclear */}
      {(isNotPlant || isUnclear) ? (
        <div className="max-w-sm mx-auto">
          <Button onClick={onRetake} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 font-semibold">
            <Camera className="h-4 w-4 mr-2" /> {translations.scanner_scan_again}
          </Button>
        </div>
      ) : (
        <div className="max-w-sm mx-auto flex gap-2">
          <Link to="/scanner" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 text-xs font-semibold">
              <Stethoscope className="h-3.5 w-3.5 mr-1.5" />
              {translations.scanner_consult_doctor}
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50 rounded-xl h-10 text-xs font-semibold">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              {translations.scanner_buy_product}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

/* ─── Main Scanner Page ─── */

const Scanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { translations } = useLanguage();
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      setError(translations.scanner_camera_error);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
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
      toast({ title: translations.scanner_invalid_file, description: translations.scanner_select_image, variant: 'destructive' });
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
        toast({ title: translations.scanner_analysis_error, description: data.error, variant: 'destructive' });
      } else {
        setAnalysisResult(data.analysis);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      toast({ title: translations.scanner_error, description: translations.scanner_failed_analyze, variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    startCamera();
  };

  const goBack = () => { stopCamera(); navigate(-1); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      <ScannerHeader onBack={goBack} translations={translations} />

      <div className="flex-1 overflow-y-auto pb-20">
        {!capturedImage ? (
          <CameraView
            videoRef={videoRef}
            error={error}
            isCameraActive={isCameraActive}
            onCapture={capturePhoto}
            onUpload={() => fileInputRef.current?.click()}
            onRetryCamera={startCamera}
            fileInputRef={fileInputRef}
            translations={translations}
          />
        ) : (
          <div className="relative">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="h-10 w-10 text-green-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-700">{translations.scanner_analyzing}</p>
                <p className="text-xs text-gray-400 mt-1">{translations.scanner_analyzing_wait}</p>
              </div>
            ) : analysisResult ? (
              <ResultCard result={analysisResult} capturedImage={capturedImage} onRetake={retake} translations={translations} />
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">{translations.scanner_processing}</div>
            )}
          </div>
        )}

        {capturedImage && !analyzing && (
          <div className="px-3 pb-4 flex gap-2 max-w-sm mx-auto">
            <Button onClick={retake} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 font-semibold">
              <Camera className="h-4 w-4 mr-2" /> {translations.scanner_scan_again}
            </Button>
            <Button variant="outline" onClick={goBack} className="flex-1 rounded-xl h-10 border-green-300 text-green-700">
              <X className="h-4 w-4 mr-2" /> {translations.scanner_close}
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 85%; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
