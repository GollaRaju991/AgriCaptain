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
        { name: 'Vegetable Seeds', path: '/products?category=seeds&type=vegetable' },
        { name: 'Fruit Seeds', path: '/products?category=seeds&type=fruit' },
        { name: 'Flower Seeds', path: '/products?category=seeds&type=flower' },
        { name: 'Grain Seeds', path: '/products?category=seeds&type=grain' },
      ]
    },
    { 
      name: 'Fertilizers', 
      icon: Droplet, 
      path: '/products?category=fertilizers',
      hasDropdown: true,
      subcategories: [
        { name: 'Organic Fertilizers', path: '/products?category=fertilizers&type=organic' },
        { name: 'Chemical Fertilizers', path: '/products?category=fertilizers&type=chemical' },
        { name: 'Bio Fertilizers', path: '/products?category=fertilizers&type=bio' },
        { name: 'Micronutrients', path: '/products?category=fertilizers&type=micronutrients' },
      ]
    },
    { 
      name: 'Agriculture Products', 
      icon: Wrench, 
      path: '/products?category=agriculture',
      hasDropdown: true,
      subcategories: [
        { name: 'Pesticides', path: '/products?category=agriculture&type=pesticides' },
        { name: 'Insecticides', path: '/products?category=agriculture&type=insecticides' },
        { name: 'Herbicides', path: '/products?category=agriculture&type=herbicides' },
        { name: 'Fungicides', path: '/products?category=agriculture&type=fungicides' },
        { name: 'Plant Growth Regulators', path: '/products?category=agriculture&type=growth-regulators' },
        { name: 'Sprayers & Equipment', path: '/products?category=agriculture&type=equipment' },
        { name: 'Irrigation Tools', path: '/products?category=agriculture&type=irrigation' },
        { name: 'Harvesting Tools', path: '/products?category=agriculture&type=harvesting' },
      ]
    },
    { 
      name: 'Brands', 
      icon: Award, 
      path: '/products?category=brands',
      hasDropdown: true,
      subcategories: [
        { name: 'BASF', path: '/products?brand=basf' },
        { name: 'Bayer', path: '/products?brand=bayer' },
        { name: 'Syngenta', path: '/products?brand=syngenta' },
        { name: 'UPL', path: '/products?brand=upl' },
        { name: 'Tata Rallis', path: '/products?brand=tata-rallis' },
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
                  <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-b-md z-50 border border-gray-200">
                    {category.subcategories.map((sub, subIndex) => (
                      <Link
                        key={subIndex}
                        to={sub.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
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