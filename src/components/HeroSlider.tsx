import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    id: 1,
    title: "Premium Quality Seeds",
    subtitle: "Grow Your Success",
    description: "Discover our collection of high-yield, disease-resistant seeds for better harvests",
    image: "https://i.postimg.cc/pL0vy9Dt/head.png",
    cta: "Shop Seeds",
    bgColor: "from-green-600 to-green-800"
  },
  {
    id: 2,
    title: "Advanced Farm Equipment",
    subtitle: "Modern Farming Solutions",
    description: "Upgrade your farming with our latest machinery and equipment",
    image: "https://i.postimg.cc/qMTkKt8H/WEB-Brand-TCS-080725-en.webp",
    cta: "View Equipment",
    bgColor: "from-blue-600 to-blue-800"
  },
  {
    id: 3,
    title: "Organic Fertilizers",
    subtitle: "Nourish Your Crops",
    description: "Boost soil health and crop yield with our organic fertilizer range",
    image: "https://i.postimg.cc/02nqJVk7/Screenshot-2025-07-09-230107.png",
    cta: "Shop Fertilizers",
    bgColor: "from-purple-600 to-purple-800"
  },
  {
    id: 4,
    title: "Smart Irrigation Systems",
    subtitle: "Water Efficiently",
    description: "Save water and increase productivity with our smart irrigation solutions",
    image: "https://i.postimg.cc/nrx6XDNd/Chat-GPT-Image-2.png",
    cta: "Explore Systems",
    bgColor: "from-teal-600 to-teal-800"
  },
  {
    id: 5,
    title: "Seasonal Sale - Up to 50% Off",
    subtitle: "Limited Time Offer",
    description: "Don't miss out on amazing deals across all agricultural products",
    image: "https://i.postimg.cc/dV3gZvSK/header1.png",
    cta: "Shop Now",
    bgColor: "from-red-600 to-red-800"
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full 
      h-[180px] sm:h-[220px] md:h-[260px] lg:h-[320px]
      overflow-hidden bg-gray-100 rounded-md">

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            index === currentSlide ? 'translate-x-0' :
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="relative w-full h-full flex">

            {/* Text Section */}
            <div className="relative z-20 w-1/2 h-full flex items-center bg-gradient-to-r from-black/60 to-transparent">
              <div className="px-4 md:px-8">
                <h3 className="text-xs md:text-sm text-yellow-300 font-medium mb-1">
                  {slide.subtitle}
                </h3>
                <h1 className="text-lg md:text-2xl font-bold text-white">
                  {slide.title}
                </h1>
                <p className="text-[10px] md:text-sm text-gray-200 mt-2">
                  {slide.description}
                </p>
                <Button className="mt-3 bg-white text-gray-900 text-xs px-3 py-1 rounded-md">
                  {slide.cta}
                </Button>
              </div>
            </div>

            {/* Image Section */}
            <div className="absolute inset-0 w-full h-full z-10">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

          </div>
        </div>
      ))}

      {/* Left Arrow */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white h-8 w-8 rounded-full z-20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Right Arrow */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white h-8 w-8 rounded-full z-20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Horizontal Flipkart-style dots with animations */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-row items-center justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`rounded-full transition-all duration-500 ease-out transform ${
              index === currentSlide
                ? 'w-4 h-2 bg-white scale-100 shadow-lg'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70 hover:scale-110'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;

