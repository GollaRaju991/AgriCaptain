import React from 'react';
import { Link } from 'react-router-dom';
import adCropYields from '@/assets/ad-crop-yields.jpg';
import adSmartFarming from '@/assets/ad-smart-farming.jpg';

const ads = [
  { image: adCropYields, link: '/products?category=fertilizers', label: 'Crop Yield Booster' },
  { image: adSmartFarming, link: '/products?category=seeds', label: 'Smart Farming Solutions' },
];

interface ProductAdBannerProps {
  index?: number;
}

const ProductAdBanner: React.FC<ProductAdBannerProps> = ({ index = 0 }) => {
  const ad = ads[index % ads.length];

  return (
    <div className="w-full my-3 px-0.5">
      <div className="relative rounded-xl overflow-hidden shadow-sm border border-border">
        <span className="absolute top-2 left-3 text-[10px] font-medium text-muted-foreground bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded">
          Advertisement
        </span>
        <span className="absolute bottom-2 right-3 text-[10px] font-medium text-muted-foreground bg-black/50 text-white px-2 py-0.5 rounded">
          Ad
        </span>
        <Link to={ad.link}>
          <img
            src={ad.image}
            alt={ad.label}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </Link>
      </div>
    </div>
  );
};

export default ProductAdBanner;
