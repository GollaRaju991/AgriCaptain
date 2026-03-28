import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

import promoSeeds from '@/assets/promo-seeds.png';
import promoPesticides from '@/assets/promo-pesticides.png';
import promoFarmtools from '@/assets/promo-farmtools.png';
import promoIrrigation from '@/assets/promo-irrigation.png';
import promoOrganic from '@/assets/promo-organic.png';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  offer: string;
  image: string;
  bgColor: string;
  borderColor: string;
  link: string;
}

const PromoBanners = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const banners: PromoBanner[] = [
    {
      id: '1',
      title: 'Seeds Collection',
      subtitle: 'Premium Quality Seeds',
      offer: 'Min. 30% Off',
      image: promoSeeds,
      bgColor: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
      link: '/products?category=seeds'
    },
    {
      id: '2',
      title: 'Pesticides',
      subtitle: 'Crop Protection',
      offer: 'From ₹199',
      image: promoPesticides,
      bgColor: 'from-orange-50 to-amber-100',
      borderColor: 'border-orange-200',
      link: '/products?category=pesticides'
    },
    {
      id: '3',
      title: 'Farm Tools',
      subtitle: 'Professional Grade',
      offer: 'Min. 25% Off',
      image: promoFarmtools,
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      link: '/products?category=farm-tools'
    },
    {
      id: '4',
      title: 'Irrigation',
      subtitle: 'Drip & Sprinkler',
      offer: 'Up to 50% Off',
      image: promoIrrigation,
      bgColor: 'from-cyan-50 to-blue-100',
      borderColor: 'border-cyan-200',
      link: '/products?category=farm-tools'
    },
    {
      id: '5',
      title: 'Organic Products',
      subtitle: 'Natural Farming',
      offer: 'Special Deals',
      image: promoOrganic,
      bgColor: 'from-emerald-50 to-green-100',
      borderColor: 'border-emerald-200',
      link: '/products?category=organic'
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 md:py-6 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50">
      <div className="w-full px-2 md:px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-foreground">Shop by Category</h2>
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-white shadow-sm"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-white shadow-sm"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {banners.map((banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className="flex-shrink-0 w-[200px] md:w-[240px] lg:w-[260px] group"
            >
              <div className={`relative bg-gradient-to-br ${banner.bgColor} rounded-2xl border ${banner.borderColor} overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-[220px] md:h-[250px]`}>
                {/* Text Content */}
                <div className="relative z-10 p-4 pb-0">
                  <p className="text-[11px] md:text-xs text-muted-foreground font-medium">
                    {banner.subtitle}
                  </p>
                  <h3 className="text-base md:text-lg font-bold text-foreground leading-tight mt-0.5">
                    {banner.title}
                  </h3>
                  <p className="text-green-700 font-bold text-sm md:text-base mt-1">
                    {banner.offer}
                  </p>
                </div>

                {/* Product Image */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end h-[130px] md:h-[150px]">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="max-w-[85%] max-h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    width={512}
                    height={512}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
