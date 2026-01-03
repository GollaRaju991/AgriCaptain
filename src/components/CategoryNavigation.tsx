import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Droplet, Wrench, Award, Users, Truck, CreditCard, TrendingUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import FarmWorkerDialog from './FarmWorkerDialog';
import RentVehicleDialog from './RentVehicleDialog';

const CategoryNavigation = () => {
  const { translations } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [farmWorkerOpen, setFarmWorkerOpen] = useState(false);
  const [rentVehicleOpen, setRentVehicleOpen] = useState(false);

  const categories = [
    { 
      name: 'Seeds', 
      icon: Sprout, 
      path: '/products?category=seeds',
      hasDropdown: true,
      subcategories: [
        { name: 'Vegetable Seeds', path: '/products?category=seeds&type=vegetable', color: 'bg-green-500' },
        { name: 'Fruit Seeds', path: '/products?category=seeds&type=fruit', color: 'bg-orange-500' },
        { name: 'Flower Seeds', path: '/products?category=seeds&type=flower', color: 'bg-pink-500' },
        { name: 'Grain Seeds', path: '/products?category=seeds&type=grain', color: 'bg-amber-500' },
      ]
    },
    { 
      name: 'Fertilizers', 
      icon: Droplet, 
      path: '/products?category=fertilizers',
      hasDropdown: true,
      subcategories: [
        { name: 'Organic Fertilizers', path: '/products?category=fertilizers&type=organic', color: 'bg-emerald-500' },
        { name: 'Chemical Fertilizers', path: '/products?category=fertilizers&type=chemical', color: 'bg-blue-500' },
        { name: 'Bio Fertilizers', path: '/products?category=fertilizers&type=bio', color: 'bg-teal-500' },
        { name: 'Micronutrients', path: '/products?category=fertilizers&type=micronutrients', color: 'bg-purple-500' },
      ]
    },
    { 
      name: 'Agriculture Products', 
      icon: Wrench, 
      path: '/products?category=agriculture',
      hasDropdown: true,
      subcategories: [
        { name: 'Pesticides', path: '/products?category=agriculture&type=pesticides', color: 'bg-red-500' },
        { name: 'Insecticides', path: '/products?category=agriculture&type=insecticides', color: 'bg-yellow-500' },
        { name: 'Herbicides', path: '/products?category=agriculture&type=herbicides', color: 'bg-lime-500' },
        { name: 'Fungicides', path: '/products?category=agriculture&type=fungicides', color: 'bg-cyan-500' },
        { name: 'Plant Growth Regulators', path: '/products?category=agriculture&type=growth-regulators', color: 'bg-indigo-500' },
        { name: 'Sprayers & Equipment', path: '/products?category=agriculture&type=equipment', color: 'bg-slate-500' },
        { name: 'Irrigation Tools', path: '/products?category=agriculture&type=irrigation', color: 'bg-sky-500' },
        { name: 'Harvesting Tools', path: '/products?category=agriculture&type=harvesting', color: 'bg-rose-500' },
      ]
    },
    { 
      name: 'Brands', 
      icon: Award, 
      path: '/products?category=brands',
      hasDropdown: true,
      subcategories: [
        { name: 'BASF', path: '/products?brand=basf', color: 'bg-blue-600' },
        { name: 'Bayer', path: '/products?brand=bayer', color: 'bg-green-600' },
        { name: 'Syngenta', path: '/products?brand=syngenta', color: 'bg-violet-600' },
        { name: 'UPL', path: '/products?brand=upl', color: 'bg-red-600' },
        { name: 'Tata Rallis', path: '/products?brand=tata-rallis', color: 'bg-amber-600' },
      ]
    },
    { name: 'Market Details', icon: TrendingUp, path: '/market-details' },
    { name: 'Farm Worker', icon: Users, isPopup: true, action: 'farmWorker' },
    { name: 'Rent Vehicles', icon: Truck, isPopup: true, action: 'rentVehicle' },
    { 
      name: 'Loans', 
      icon: CreditCard, 
      hasDropdown: true,
      isDropdownOnly: true,
      subcategories: [
        { name: 'Crop Loans', path: '/loans?type=crop' },
        { name: 'Equipment Loans', path: '/loans?type=equipment' },
        { name: 'Land Loans', path: '/loans?type=land' },
        { name: 'Kisan Credit Card', path: '/loans?type=kcc' },
      ]
    },
  ];

  const handleCategoryClick = (category: any) => {
    if (category.isPopup) {
      if (category.action === 'farmWorker') {
        setFarmWorkerOpen(true);
      } else if (category.action === 'rentVehicle') {
        setRentVehicleOpen(true);
      }
    }
  };

  return (
    <>
      <div className="bg-green-600 w-full">
        <div className="flex items-center justify-between">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const hasDropdown = 'hasDropdown' in category && category.hasDropdown;
            const isPopup = 'isPopup' in category && category.isPopup;
            const isDropdownOnly = 'isDropdownOnly' in category && category.isDropdownOnly;
            
            return (
              <div 
                key={index}
                className="flex-1 relative"
                onMouseEnter={() => hasDropdown && setOpenDropdown(category.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {isPopup ? (
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="flex items-center justify-center space-x-2 text-white hover:bg-green-700 py-3 px-2 border-r border-green-500 last:border-r-0 transition-colors w-full"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
                  </button>
                ) : isDropdownOnly ? (
                  <div
                    className="flex items-center justify-center space-x-2 text-white hover:bg-green-700 py-3 px-2 border-r border-green-500 last:border-r-0 transition-colors w-full cursor-pointer"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
                    {hasDropdown && <ChevronDown className="h-4 w-4" />}
                  </div>
                ) : (
                  <Link
                    to={'path' in category ? category.path : '#'}
                    className="flex items-center justify-center space-x-2 text-white hover:bg-green-700 py-3 px-2 border-r border-green-500 last:border-r-0 transition-colors w-full"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
                    {hasDropdown && <ChevronDown className="h-4 w-4" />}
                  </Link>
                )}
                
                {/* Dropdown Menu */}
                {hasDropdown && openDropdown === category.name && 'subcategories' in category && (
                  <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-b-md z-50 border border-gray-200 p-2">
                    <div className="grid grid-cols-1 gap-1">
                      {category.subcategories.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          to={sub.path}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors group"
                        >
                          <div className={`w-8 h-8 ${sub.color} rounded-md flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                            <div className="w-4 h-4 bg-white/30 rounded-sm"></div>
                          </div>
                          <span className="font-medium group-hover:text-green-700">{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup Dialogs */}
      <FarmWorkerDialog open={farmWorkerOpen} onOpenChange={setFarmWorkerOpen} />
      <RentVehicleDialog open={rentVehicleOpen} onOpenChange={setRentVehicleOpen} />
    </>
  );
};

export default CategoryNavigation;