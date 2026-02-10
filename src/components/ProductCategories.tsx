import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, Beaker, Tractor, Award, Wrench, Wheat, Scissors, Droplets, Gift, Users, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ProductCategories = () => {
  const { translations } = useLanguage();

  const categories = [
    {
      nameKey: 'offers',
      icon: Gift,
      href: '/products?category=offers',
      color: 'bg-red-100 text-red-600',
      image: "https://i.postimg.cc/Y2d2Kr6Y/Offers.webp"
    },
    {
      nameKey: 'seeds',
      icon: Sprout,
      href: '/products?category=seeds',
      color: 'bg-green-100 text-green-600',
      image: "https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png"
    },
    {
      nameKey: 'fertilizers',
      icon: Beaker,
      href: '/products?category=fertilizers',
      color: 'bg-blue-100 text-blue-600',
      image: "https://i.postimg.cc/0Q24pk6h/Fertilizer.png"
    },
    {
      nameKey: 'agriculture',
      icon: Droplets,
      href: '/products?category=agriculture',
      color: 'bg-purple-100 text-purple-600',
      image: "https://i.postimg.cc/4y7Mm13R/Pestiside.png"
    },
    {
      nameKey: 'equipment',
      icon: Tractor,
      href: '/products?category=equipment',
      color: 'bg-orange-100 text-orange-600',
      image: "https://i.postimg.cc/bNby5x95/ns-404-file-1319.jpg"
    },
    {
      nameKey: 'tools',
      icon: Wrench,
      href: '/products?category=tools',
      color: 'bg-gray-100 text-gray-600',
      image: "https://i.postimg.cc/vmPbn3G4/balwaan-shakti-battery-sprayer-12x8-file-7234.jpg"
    },
    {
      nameKey: 'organic_farming',
      icon: Wheat,
      href: '/products?category=organic',
      color: 'bg-green-100 text-green-600',
      image: "https://i.postimg.cc/Qd0RYCwP/katyayani-activated-humic-acid-fulvic-acid-plants-fertilizer-bio-enhancer-with-silicon-wetting-agent.png"
    },
    {
      nameKey: 'animal_husbandry',
      icon: Users,
      href: '/products?category=animal-husbandry',
      color: 'bg-orange-100 text-orange-600',
      image: "https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png"
    }
  ];

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {translations.shop_by_category}
          </h2>
          <p className="text-gray-600">
            {translations.browse_categories}
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category, index) => (
            <Link key={index} to={category.href}>
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer h-full border-gray-200">
                <CardContent className="p-3 md:p-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={translations[category.nameKey]}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <category.icon className={`h-8 w-8 md:h-10 md:w-10 ${category.color.split(' ')[1]}`} />
                    )}
                  </div>
                  <h3 className="font-medium text-xs md:text-sm text-gray-800 leading-tight">{translations[category.nameKey]}</h3>
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
