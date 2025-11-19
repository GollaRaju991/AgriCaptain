import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, Beaker, Tractor, Award, Wrench, Wheat, Scissors, Droplets, Gift, Users, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ProductCategories = () => {
  const { translations } = useLanguage();

  const categories = [
    {
      name: "Offers",
      icon: Gift,
      href: '/products?category=offers',
      color: 'bg-red-100 text-red-600',
      description: "Special offers and deals",
      image: "https://i.postimg.cc/Y2d2Kr6Y/Offers.webp"
    },
    {
      name: "Herbicides",
      icon: Droplets,
      href: '/products?category=herbicides',
      color: 'bg-green-100 text-green-600',
      description: "Weed control solutions",
      image: "https://i.postimg.cc/4y7Mm13R/Pestiside.png"
    },
    {
      name: "Growth Promoters",
      icon: Sprout,
      href: '/products?category=growth-promoters',
      color: 'bg-blue-100 text-blue-600',
      description: "Plant growth enhancers",
      image: "https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png"
    },
    {
      name: "Fungicides",
      icon: Award,
      href: '/products?category=fungicides',
      color: 'bg-purple-100 text-purple-600',
      description: "Fungal disease control",
      image: "https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png"
    },
    {
      name: "Vegetable & Fruit Seeds",
      icon: Sprout,
      href: '/products?category=seeds',
      color: 'bg-green-100 text-green-600',
      description: "High quality seeds for all crops",
      image: "https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png"
    },
    {
      name: "Farm Machinery",
      icon: Tractor,
      href: '/products?category=machinery',
      color: 'bg-orange-100 text-orange-600',
      description: "Agricultural machinery",
      image: "https://i.postimg.cc/bNby5x95/ns-404-file-1319.jpg"
    },
    {
      name: "Nutrients",
      icon: Beaker,
      href: '/products?category=fertilizers',
      color: 'bg-blue-100 text-blue-600',
      description: "Organic & chemical fertilizers",
      image: "https://i.postimg.cc/4y7Mm13R/Pestiside.png"
    },
    {
      name: "Flower Seeds",
      icon: Sprout,
      href: '/products?category=flower-seeds',
      color: 'bg-pink-100 text-pink-600',
      description: "Beautiful flower seeds",
      image: "https://i.postimg.cc/dtMvG7cj/glycel-herbicide-1-file-5004.png"
    },
    {
      name: "Insecticides",
      icon: Droplets,
      href: '/products?category=pesticides',
      color: 'bg-red-100 text-red-600',
      description: "Crop protection solutions",
      image: "https://i.postimg.cc/nVmfVH9j/topper-77-file-11270.jpg"
    },
    {
      name: "Organic Farming",
      icon: Wheat,
      href: '/products?category=organic',
      color: 'bg-green-100 text-green-600',
      description: "Organic farming products",
      image: "https://i.postimg.cc/Qd0RYCwP/katyayani-activated-humic-acid-fulvic-acid-plants-fertilizer-bio-enhancer-with-silicon-wetting-agent.png"
    },
    {
      name: "Animal Husbandry",
      icon: Users,
      href: '/products?category=animal-husbandry',
      color: 'bg-orange-100 text-orange-600',
      description: "Animal care products",
      image: "https://i.postimg.cc/vmPbn3G4/balwaan-shakti-battery-sprayer-12x8-file-7234.jpg"
    },
    {
      name: "New Arrivals",
      icon: Star,
      href: '/products?category=new',
      color: 'bg-yellow-100 text-yellow-600',
      description: "Latest products",
      image: "https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png"
    }
  ];

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {translations.shop_by_category || "Shop by Category"}
          </h2>
          <p className="text-gray-600">
            {translations.browse_categories || "Browse our wide range of agricultural categories"}
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category, index) => (
            <Link key={index} to={category.href}>
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer h-full border-gray-200">
                <CardContent className="p-3 md:p-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-12 h-12 md:w-16 md:h-16 object-contain"
                      />
                    ) : (
                      <category.icon className={`h-8 w-8 md:h-10 md:w-10 ${category.color.split(' ')[1]}`} />
                    )}
                  </div>
                  <h3 className="font-medium text-xs md:text-sm text-gray-800 leading-tight">{category.name}</h3>
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
