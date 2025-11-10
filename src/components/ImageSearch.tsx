import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Image, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageSearchProps {
  onImageSearch: (imageFile: File) => void;
}

const ImageSearch: React.FC<ImageSearchProps> = ({ onImageSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try uploading from gallery instead.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            onImageSearch(file);
            setCapturedImage(canvasRef.current!.toDataURL());
            stopCamera();
            setIsOpen(false);
            toast({
              title: "Photo Captured",
              description: "Searching for similar products..."
            });
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onImageSearch(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        setIsOpen(false);
        toast({
          title: "Image Uploaded",
          description: "Searching for similar products..."
        });
      } else {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive"
        });
      }
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    stopCamera();
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="h-10 px-3 rounded-none border-x-0 hover:bg-gray-50"
      >
        <Camera className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Image Search</h3>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!isCameraActive ? (
                <div className="space-y-4">
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={startCamera}
                  >
                    <Camera className="h-5 w-5" />
                    Take Photo
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="h-5 w-5" />
                    Choose from Gallery
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full rounded-lg"
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={capturePhoto} className="flex-1">
                      Capture Photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ImageSearch;