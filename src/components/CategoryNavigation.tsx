import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Droplet, Wrench, Award, Users, Truck, CreditCard, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CategoryNavigation = () => {
  const { translations } = useLanguage();

  const categories = [
    { name: 'Seeds', icon: Sprout, path: '/products?category=seeds' },
    { name: 'Fertilizers', icon: Droplet, path: '/products?category=fertilizers' },
    { name: 'Agriculture Products', icon: Wrench, path: '/products?category=agriculture' },
    { name: 'Brands', icon: Award, path: '/products?category=brands' },
    { name: 'Market Details', icon: TrendingUp, path: '/market-details' },
  ];

  const rightCategories = [
    { name: 'Farm Worker', icon: Users, path: '/farm-worker' },
    { name: 'Rent Vehicles', icon: Truck, path: '/vehicle-rent' },
    { name: 'Loans', icon: CreditCard, path: '/loans' },
  ];

  return (
    <div className="bg-green-600">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {[...categories, ...rightCategories].map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={index}
                to={category.path}
                className="flex-1 flex items-center justify-center space-x-2 text-white hover:bg-green-700 py-3 px-2 border-r border-green-500 last:border-r-0 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;
