import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import seedsImg from '@/assets/cat-seeds-photo.jpg';

import pesticidesImg from '@/assets/cat-pesticides-photo.jpg';
import toolsImg from '@/assets/cat-tools-photo.jpg';
import nutritionImg from '@/assets/cat-nutrition-photo.jpg';
import irrigationImg from '@/assets/cat-irrigation-photo.jpg';

const borderColors = [
  'border-b-orange-400',
  'border-b-yellow-500',
  'border-b-orange-400',
  'border-b-green-500',
  'border-b-blue-400',
];

const ProductCategories = () => {
  const { translations } = useLanguage();

  const categories = [
    { name: translations.seeds || 'Seeds', image: seedsImg, href: '/products?category=seeds' },
    
    { name: 'Pesticides', image: pesticidesImg, href: '/products?category=agriculture' },
    { name: translations.tools || 'Tools', image: toolsImg, href: '/products?category=tools' },
    { name: 'Crop Nutrition', image: nutritionImg, href: '/products?category=organic' },
    { name: 'Irrigation', image: irrigationImg, href: '/products?category=equipment' },
  ];

  return (
    <section className="py-4 md:py-8 bg-background">
      <div className="w-full px-3 md:px-4">
        {/* Header with View All */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-foreground">
            {translations.shop_by_category || 'Shop by Category'}
          </h2>
          <Link
            to="/categories"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary border border-border rounded-full px-3 py-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category, index) => (
            <Link key={index} to={category.href}>
              <div className={`bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] border-b-[3px] ${borderColors[index]}`}>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="px-2 py-2 md:py-3 text-center">
                  <h3 className="font-semibold text-xs md:text-sm text-foreground">{category.name}</h3>
                  <span className="flex items-center justify-center gap-0.5 text-[10px] md:text-xs text-primary font-medium mt-0.5">
                    Shop Now <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
