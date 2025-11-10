
import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Droplet, Wrench, Award, Users, Truck, CreditCard, TrendingUp } from 'lucide-react';
import AnimalHusbandryMenu from './AnimalHusbandryMenu';
import { useLanguage } from '@/contexts/LanguageContext';

const CategoryNavigation = () => {
  const { translations } = useLanguage();
  
  const categories = [
    { name: 'Seeds', icon: Sprout, path: '/products?category=seeds' },
    { name: 'Fertilizers', icon: Droplet, path: '/products?category=fertilizers' },
    { name: 'Agriculture Products', icon: Wrench, path: '/products?category=agriculture' },
    { name: 'Brands', icon: Award, path: '/products?category=brands' }
  ];


  const rightCategories = [
    { name: 'market_details', icon: Users, icon: TrendingUp, path: '/market-details' },
    { name: 'Farm Worker', icon: Users, path: '/farm-worker' },
    { name: 'Rent Vehicles', icon: Truck, path: '/vehicle-rent' },
    { name: 'Loans', icon: CreditCard, path: '/loans' }
  ];

  return (
    <div className="bg-green-600 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-start overflow-x-auto">
          <div className="flex items-center space-x-1">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  to={category.path}
                  className="flex items-center space-x-2 text-white hover:bg-green-700 px-4 py-2 rounded-md transition-colors whitespace-nowrap min-w-fit"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              );
            })}
            
            {/* Animal Husbandry Menu */}
            <AnimalHusbandryMenu />
            
            {/* Market Details */}
            {middleCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={`middle-${index}`}
                  to={category.path}
                  className="flex items-center space-x-2 text-white hover:bg-green-700 px-4 py-2 rounded-md transition-colors whitespace-nowrap min-w-fit"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              );
            })}
            
            {rightCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  to={category.path}
                  className="flex items-center space-x-2 text-white hover:bg-green-700 px-4 py-2 rounded-md transition-colors whitespace-nowrap min-w-fit"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;
