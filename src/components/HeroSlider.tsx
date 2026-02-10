import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { translations } = useLanguage();

  const slides = [
    {
      id: 1,
      titleKey: 'premium_quality_seeds',
      subtitleKey: 'grow_your_success',
      descriptionKey: 'discover_seeds',
      image: "https://i.postimg.cc/pL0vy9Dt/head.png",
      ctaKey: 'shop_seeds',
      bgColor: "from-green-600 to-green-800"
    },
    {
      id: 2,
      titleKey: 'advanced_farm_equipment',
      subtitleKey: 'modern_farming_solutions',
      descriptionKey: 'upgrade_farming',
      image: "https://i.postimg.cc/qMTkKt8H/WEB-Brand-TCS-080725-en.webp",
      ctaKey: 'view_equipment',
      bgColor: "from-blue-600 to-blue-800"
    },
    {
      id: 3,
      titleKey: 'organic_fertilizers_title',
      subtitleKey: 'nourish_your_crops',
      descriptionKey: 'boost_soil',
      image: "https://i.postimg.cc/02nqJVk7/Screenshot-2025-07-09-230107.png",
      ctaKey: 'shop_fertilizers',
      bgColor: "from-purple-600 to-purple-800"
    },
    {
      id: 4,
      titleKey: 'smart_irrigation',
      subtitleKey: 'water_efficiently',
      descriptionKey: 'save_water',
      image: "https://i.postimg.cc/nrx6XDNd/Chat-GPT-Image-2.png",
      ctaKey: 'explore_systems',
      bgColor: "from-teal-600 to-teal-800"
    },
    {
      id: 5,
      titleKey: 'seasonal_sale',
      subtitleKey: 'limited_time',
      descriptionKey: 'dont_miss',
      image: "https://i.postimg.cc/dV3gZvSK/header1.png",
      ctaKey: 'shop_now',
      bgColor: "from-red-600 to-red-800"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[180px] sm:h-[220px] md:h-[260px] lg:h-[320px] overflow-hidden bg-gray-100 rounded-md">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            index === currentSlide ? 'translate-x-0' :
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="relative w-full h-full flex">
            <div className="relative z-20 w-1/2 h-full flex items-center bg-gradient-to-r from-black/60 to-transparent">
              <div className="px-4 md:px-8">
                <h3 className="text-xs md:text-sm text-yellow-300 font-medium mb-1">
                  {translations[slide.subtitleKey]}
                </h3>
                <h1 className="text-lg md:text-2xl font-bold text-white">
                  {translations[slide.titleKey]}
                </h1>
                <p className="text-[10px] md:text-sm text-gray-200 mt-2">
                  {translations[slide.descriptionKey]}
                </p>
                <Button className="mt-3 bg-white text-gray-900 text-xs px-3 py-1 rounded-md">
                  {translations[slide.ctaKey]}
                </Button>
              </div>
            </div>
            <div className="absolute inset-0 w-full h-full z-10">
              <img src={slide.image} alt={translations[slide.titleKey]} className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      ))}

      <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white h-8 w-8 rounded-full z-20" onClick={prevSlide}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white h-8 w-8 rounded-full z-20" onClick={nextSlide}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-row items-center justify-center gap-1">
        {slides.map((_, index) => (
          <button key={index} type="button" onClick={() => setCurrentSlide(index)} className="p-1 bg-transparent focus:outline-none">
            <span className={"block rounded-sm transition-all duration-300 " + (index === currentSlide ? "w-5 h-1 bg-background shadow-md" : "w-3 h-1 bg-background/50 hover:bg-background/70")} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
