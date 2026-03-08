import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, Droplets, Beaker, Wrench, Wheat, CloudRain } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ProductCategories = () => {
  const { translations } = useLanguage();

  const categories = [
    {
      name: translations.seeds || 'Seeds',
      icon: Sprout,
      href: '/products?category=seeds',
    },
    {
      name: translations.fertilizers || 'Fertilizers',
      icon: Droplets,
      href: '/products?category=fertilizers',
    },
    {
      name: 'Pesticides',
      icon: Beaker,
      href: '/products?category=agriculture',
    },
    {
      name: translations.tools || 'Tools',
      icon: Wrench,
      href: '/products?category=tools',
    },
    {
      name: 'Crop Nutrition',
      icon: Wheat,
      href: '/products?category=organic',
    },
    {
      name: 'Irrigation',
      icon: CloudRain,
      href: '/products?category=equipment',
    },
  ];

  return (
    <section className="py-6 md:py-10 bg-background">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">
          {translations.shop_by_category || 'Shop by Category'}
        </h2>
        
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category, index) => (
            <Link key={index} to={category.href}>
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer h-full border-border bg-card">
                <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center gap-2">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <category.icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="font-medium text-xs md:text-sm text-foreground leading-tight text-center">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
