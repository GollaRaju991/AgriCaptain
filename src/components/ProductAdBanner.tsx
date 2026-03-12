import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import adCropYields from '@/assets/ad-crop-yields.jpg';
import adSmartFarming from '@/assets/ad-smart-farming.jpg';

const ads = [
  { image: adCropYields, link: '/products?category=fertilizers', label: 'Crop Yield Booster' },
  { image: adSmartFarming, link: '/products?category=seeds', label: 'Smart Farming Solutions' },
];

const ProductAdBanner: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % ads.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full my-3 px-0.5">
      <div className="relative rounded-xl overflow-hidden shadow-sm border border-border h-[140px] md:h-[200px] lg:h-[240px]">
        <span className="absolute top-2 left-3 z-20 text-[10px] font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded">
          Advertisement
        </span>

        {ads.map((ad, i) => (
          <Link
            key={i}
            to={ad.link}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
              i === current ? 'translate-x-0' : i < current ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <img src={ad.image} alt={ad.label} className="w-full h-full object-cover" loading="lazy" />
          </Link>
        ))}

        <button onClick={() => setCurrent((p) => (p - 1 + ads.length) % ads.length)} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/30 text-white rounded-full h-7 w-7 flex items-center justify-center">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => setCurrent((p) => (p + 1) % ads.length)} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/30 text-white rounded-full h-7 w-7 flex items-center justify-center">
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1">
          {ads.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className="p-0.5">
              <span className={`block rounded-sm transition-all duration-300 ${i === current ? 'w-5 h-1 bg-background shadow-md' : 'w-3 h-1 bg-background/50'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductAdBanner;
