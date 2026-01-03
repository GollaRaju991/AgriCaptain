import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, Droplet, Wrench, Award, Users, Truck, CreditCard, TrendingUp, ChevronDown,
  Carrot, Apple, Flower2, Wheat, Leaf, FlaskConical, Bug, Sparkles,
  ShieldAlert, Target, Spline, CircleDot, TrendingUp as Growth, SprayCan, Droplets, Scissors,
  Factory, Building2, Atom, Zap, Star, LucideIcon
} from 'lucide-react';
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
        { name: 'Vegetable Seeds', path: '/products?category=seeds&type=vegetable', icon: Carrot },
        { name: 'Fruit Seeds', path: '/products?category=seeds&type=fruit', icon: Apple },
        { name: 'Flower Seeds', path: '/products?category=seeds&type=flower', icon: Flower2 },
        { name: 'Grain Seeds', path: '/products?category=seeds&type=grain', icon: Wheat },
      ]
    },
    { 
      name: 'Fertilizers', 
      icon: Droplet, 
      path: '/products?category=fertilizers',
      hasDropdown: true,
      subcategories: [
        { name: 'Organic Fertilizers', path: '/products?category=fertilizers&type=organic', icon: Leaf },
        { name: 'Chemical Fertilizers', path: '/products?category=fertilizers&type=chemical', icon: FlaskConical },
        { name: 'Bio Fertilizers', path: '/products?category=fertilizers&type=bio', icon: Bug },
        { name: 'Micronutrients', path: '/products?category=fertilizers&type=micronutrients', icon: Sparkles },
      ]
    },
    { 
      name: 'Agriculture Products', 
      icon: Wrench, 
      path: '/products?category=agriculture',
      hasDropdown: true,
      subcategories: [
        { name: 'Pesticides', path: '/products?category=agriculture&type=pesticides', icon: ShieldAlert },
        { name: 'Insecticides', path: '/products?category=agriculture&type=insecticides', icon: Target },
        { name: 'Herbicides', path: '/products?category=agriculture&type=herbicides', icon: Spline },
        { name: 'Fungicides', path: '/products?category=agriculture&type=fungicides', icon: CircleDot },
        { name: 'Plant Growth Regulators', path: '/products?category=agriculture&type=growth-regulators', icon: Growth },
        { name: 'Sprayers & Equipment', path: '/products?category=agriculture&type=equipment', icon: SprayCan },
        { name: 'Irrigation Tools', path: '/products?category=agriculture&type=irrigation', icon: Droplets },
        { name: 'Harvesting Tools', path: '/products?category=agriculture&type=harvesting', icon: Scissors },
      ]
    },
    { 
      name: 'Brands', 
      icon: Award, 
      path: '/products?category=brands',
      hasDropdown: true,
      subcategories: [
        { name: 'BASF', path: '/products?brand=basf', icon: Factory },
        { name: 'Bayer', path: '/products?brand=bayer', icon: Building2 },
        { name: 'Syngenta', path: '/products?brand=syngenta', icon: Atom },
        { name: 'UPL', path: '/products?brand=upl', icon: Zap },
        { name: 'Tata Rallis', path: '/products?brand=tata-rallis', icon: Star },
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
        { name: 'Crop Loans', path: '/loans?type=crop', icon: Wheat },
        { name: 'Equipment Loans', path: '/loans?type=equipment', icon: Wrench },
        { name: 'Land Loans', path: '/loans?type=land', icon: Sprout },
        { name: 'Kisan Credit Card', path: '/loans?type=kcc', icon: CreditCard },
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
                
                {/* Dropdown Menu - Simple List Style */}
                {hasDropdown && openDropdown === category.name && 'subcategories' in category && (
                  <div className="absolute top-full left-0 min-w-[160px] bg-white shadow-lg z-50 border border-gray-200">
                    {category.subcategories.map((sub, subIndex) => {
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={subIndex}
                          to={sub.path}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <SubIcon className="h-4 w-4 text-green-600" />
                          {sub.name}
                        </Link>
                      );
                    })}
                    <Link
                      to={'path' in category ? category.path : '#'}
                      className="block px-4 py-2 text-sm font-medium bg-gray-50 text-gray-800 hover:bg-gray-100 border-t border-gray-200"
                    >
                      Shop Now
                    </Link>
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