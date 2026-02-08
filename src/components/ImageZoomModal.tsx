import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  selectedIndex: number;
  productName: string;
  onChangeImage: (index: number) => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  images,
  selectedIndex,
  productName,
  onChangeImage
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePrevImage = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    onChangeImage((selectedIndex - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    onChangeImage((selectedIndex + 1) % images.length);
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetZoom(); onClose(); } }}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex flex-col">
          {/* Header Controls */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <span className="text-white text-sm font-medium px-2">{Math.round(zoomLevel * 100)}%</span>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 4}
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </div>
            
            <Button
              variant="secondary"
              size="icon"
              onClick={() => { resetZoom(); onClose(); }}
              className="bg-white/20 hover:bg-white/30 text-white border-none"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Image Area */}
          <div 
            className="flex-1 flex items-center justify-center overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white border-none h-12 w-12"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white border-none h-12 w-12"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            <img
              src={images[selectedIndex]}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain select-none transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
              }}
              onClick={() => zoomLevel === 1 && handleZoomIn()}
              draggable={false}
            />
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  resetZoom();
                  onChangeImage(index);
                }}
                className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  selectedIndex === index 
                    ? 'border-white scale-110' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageZoomModal;
