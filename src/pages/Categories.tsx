import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, Droplet, Wrench, Award, CreditCard, 
  Carrot, Apple, Flower2, Wheat, Leaf, FlaskConical, Bug, Sparkles,
  ShieldAlert, Target, Spline, CircleDot, TrendingUp, SprayCan, Droplets, Scissors,
  Factory, Building2, Atom, Zap, Star, Search, Camera, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import MobileBottomNav from '@/components/MobileBottomNav';

interface SubCategory {
  name: string;
  path: string;
  icon: React.ElementType;
  image: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  image: string;
  subcategories: SubCategory[];
}

const Categories = () => {
  const { translations } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('seeds');

  const categories: Category[] = [
    {
      id: 'seeds',
      name: 'Seeds',
      icon: Sprout,
      image: 'https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png',
      subcategories: [
        { name: 'Vegetable Seeds', path: '/products?category=seeds&type=vegetable', icon: Carrot, image: 'https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png' },
        { name: 'Fruit Seeds', path: '/products?category=seeds&type=fruit', icon: Apple, image: 'https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png' },
        { name: 'Flower Seeds', path: '/products?category=seeds&type=flower', icon: Flower2, image: 'https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png' },
        { name: 'Grain Seeds', path: '/products?category=seeds&type=grain', icon: Wheat, image: 'https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png' },
      ]
    },
    {
      id: 'fertilizers',
      name: 'Fertilizers',
      icon: Droplet,
      image: 'https://i.postimg.cc/0Q24pk6h/Fertilizer.png',
      subcategories: [
        { name: 'Organic Fertilizers', path: '/products?category=fertilizers&type=organic', icon: Leaf, image: 'https://i.postimg.cc/0Q24pk6h/Fertilizer.png' },
        { name: 'Chemical Fertilizers', path: '/products?category=fertilizers&type=chemical', icon: FlaskConical, image: 'https://i.postimg.cc/0Q24pk6h/Fertilizer.png' },
        { name: 'Bio Fertilizers', path: '/products?category=fertilizers&type=bio', icon: Bug, image: 'https://i.postimg.cc/0Q24pk6h/Fertilizer.png' },
        { name: 'Micronutrients', path: '/products?category=fertilizers&type=micronutrients', icon: Sparkles, image: 'https://i.postimg.cc/0Q24pk6h/Fertilizer.png' },
      ]
    },
    {
      id: 'agriculture',
      name: 'Agri Products',
      icon: Wrench,
      image: 'https://i.postimg.cc/4y7Mm13R/Pestiside.png',
      subcategories: [
        { name: 'Pesticides', path: '/products?category=agriculture&type=pesticides', icon: ShieldAlert, image: 'https://i.postimg.cc/4y7Mm13R/Pestiside.png' },
        { name: 'Insecticides', path: '/products?category=agriculture&type=insecticides', icon: Target, image: 'https://i.postimg.cc/4y7Mm13R/Pestiside.png' },
        { name: 'Herbicides', path: '/products?category=agriculture&type=herbicides', icon: Spline, image: 'https://i.postimg.cc/4y7Mm13R/Pestiside.png' },
        { name: 'Fungicides', path: '/products?category=agriculture&type=fungicides', icon: CircleDot, image: 'https://i.postimg.cc/4y7Mm13R/Pestiside.png' },
        { name: 'Growth Regulators', path: '/products?category=agriculture&type=growth-regulators', icon: TrendingUp, image: 'https://i.postimg.cc/4y7Mm13R/Pestiside.png' },
        { name: 'Sprayers', path: '/products?category=agriculture&type=equipment', icon: SprayCan, image: 'https://i.postimg.cc/vmPbn3G4/balwaan-shakti-battery-sprayer-12x8-file-7234.jpg' },
        { name: 'Irrigation Tools', path: '/products?category=agriculture&type=irrigation', icon: Droplets, image: 'https://i.postimg.cc/bNby5x95/ns-404-file-1319.jpg' },
        { name: 'Harvesting Tools', path: '/products?category=agriculture&type=harvesting', icon: Scissors, image: 'https://i.postimg.cc/bNby5x95/ns-404-file-1319.jpg' },
      ]
    },
    {
      id: 'brands',
      name: 'Brands',
      icon: Award,
      image: 'https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png',
      subcategories: [
        { name: 'BASF', path: '/products?brand=basf', icon: Factory, image: 'https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png' },
        { name: 'Bayer', path: '/products?brand=bayer', icon: Building2, image: 'https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png' },
        { name: 'Syngenta', path: '/products?brand=syngenta', icon: Atom, image: 'https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png' },
        { name: 'UPL', path: '/products?brand=upl', icon: Zap, image: 'https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png' },
        { name: 'Tata Rallis', path: '/products?brand=tata-rallis', icon: Star, image: 'https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png' },
      ]
    },
    {
      id: 'loans',
      name: 'Loans',
      icon: CreditCard,
      image: 'https://i.postimg.cc/Y2d2Kr6Y/Offers.webp',
      subcategories: [
        { name: 'Crop Loans', path: '/loans?type=crop', icon: Wheat, image: 'https://i.postimg.cc/Y2d2Kr6Y/Offers.webp' },
        { name: 'Equipment Loans', path: '/loans?type=equipment', icon: Wrench, image: 'https://i.postimg.cc/Y2d2Kr6Y/Offers.webp' },
        { name: 'Land Loans', path: '/loans?type=land', icon: Sprout, image: 'https://i.postimg.cc/Y2d2Kr6Y/Offers.webp' },
        { name: 'Kisan Credit Card', path: '/loans?type=kcc', icon: CreditCard, image: 'https://i.postimg.cc/Y2d2Kr6Y/Offers.webp' },
      ]
    },
  ];

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold">All Categories</h1>
        </div>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 bg-white rounded-lg flex items-center px-3 py-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="flex-1 ml-2 text-gray-800 outline-none text-sm"
            />
            <Camera className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex min-h-[calc(100vh-140px)]">
        {/* Left Sidebar - Categories */}
        <div className="w-24 bg-gray-100 border-r border-gray-200 overflow-y-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full p-3 flex flex-col items-center gap-2 border-l-4 transition-all ${
                  isActive 
                    ? 'bg-white border-l-green-600 text-green-600' 
                    : 'border-l-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden ${
                  isActive ? 'bg-green-100' : 'bg-white'
                }`}>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${
                  isActive ? 'text-green-600' : 'text-gray-700'
                }`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Content - Subcategories */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          {activeCategoryData && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {activeCategoryData.name}
              </h2>
              
              <div className="grid grid-cols-3 gap-3">
                {activeCategoryData.subcategories.map((sub, index) => {
                  const SubIcon = sub.icon;
                  return (
                    <Link
                      key={index}
                      to={sub.path}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                        <img 
                          src={sub.image} 
                          alt={sub.name}
                          className="w-14 h-14 object-contain"
                        />
                      </div>
                      <span className="text-xs text-gray-700 text-center leading-tight">
                        {sub.name}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Shop All Button */}
              <Link 
                to={`/products?category=${activeCategoryData.id}`}
                className="mt-6 block w-full bg-green-600 text-white text-center py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Shop All {activeCategoryData.name}
              </Link>
            </>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Categories;
