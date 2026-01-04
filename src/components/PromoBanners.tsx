import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  offer: string;
  image: string;
  bgColor: string;
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
      image: 'https://i.postimg.cc/dtMvG7cj/glycel-herbicide-1-file-5004.png',
      bgColor: 'from-green-100 to-green-200',
      link: '/products?category=seeds'
    },
    {
      id: '2',
      title: 'Fertilizers',
      subtitle: 'Organic & Chemical',
      offer: 'Up to 40% Off',
      image: 'https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png',
      bgColor: 'from-blue-100 to-blue-200',
      link: '/products?category=fertilizers'
    },
    {
      id: '3',
      title: 'Pesticides',
      subtitle: 'Crop Protection',
      offer: 'From ₹199',
      image: 'https://i.postimg.cc/dtMvG7cj/glycel-herbicide-1-file-5004.png',
      bgColor: 'from-orange-100 to-orange-200',
      link: '/products?category=pesticides'
    },
    {
      id: '4',
      title: 'Garden Tools',
      subtitle: 'Professional Grade',
      offer: 'Min. 25% Off',
      image: 'https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png',
      bgColor: 'from-purple-100 to-purple-200',
      link: '/products?category=tools'
    },
    {
      id: '5',
      title: 'Irrigation',
      subtitle: 'Drip & Sprinkler',
      offer: 'Up to 50% Off',
      image: 'https://i.postimg.cc/dtMvG7cj/glycel-herbicide-1-file-5004.png',
      bgColor: 'from-cyan-100 to-cyan-200',
      link: '/products?category=irrigation'
    },
    {
      id: '6',
      title: 'Organic Products',
      subtitle: 'Natural Farming',
      offer: 'Special Deals',
      image: 'https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png',
      bgColor: 'from-emerald-100 to-emerald-200',
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
    <section className="py-3 md:py-4 bg-gradient-to-r from-cyan-50 via-blue-50 to-cyan-50">
      <div className="w-full px-2 md:px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Shop by Category</h2>
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
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {banners.map((banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className="flex-shrink-0 w-[160px] md:w-[220px] group"
            >
              <div className={`relative bg-gradient-to-br ${banner.bgColor} rounded-lg p-3 md:p-4 h-[140px] md:h-[160px] overflow-hidden transition-transform hover:scale-[1.02]`}>
                {/* Content */}
                <div className="relative z-10">
                  <p className="text-[10px] md:text-xs text-gray-600">{banner.subtitle}</p>
                  <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight">
                    {banner.title}
                  </h3>
                  <p className="text-green-700 font-bold text-sm md:text-base mt-1">
                    {banner.offer}
                  </p>
                </div>

                {/* Image */}
                <div className="absolute right-0 bottom-0 w-20 md:w-28 h-20 md:h-28">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
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