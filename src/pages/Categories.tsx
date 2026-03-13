import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Camera, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobilePageHeader from '@/components/MobilePageHeader';

// Sidebar icons
import catSeedsIcon from '@/assets/cat-seeds-icon.png';
import catFertilizerIcon from '@/assets/cat-fertilizer-icon.png';
import catAgriIcon from '@/assets/cat-agri-icon.png';
import catBrandsIcon from '@/assets/cat-brands-icon.png';
import catLoansIcon from '@/assets/cat-loans-icon.png';
import catMarketIcon from '@/assets/cat-market-icon.png';
import catFarmworkerIcon from '@/assets/cat-farmworker-icon.png';
import catVehicleIcon from '@/assets/cat-vehicle-icon.png';

// Subcategory images
import catVegetableSeeds from '@/assets/cat-vegetable-seeds.png';
import catFruitSeeds from '@/assets/cat-fruit-seeds.png';
import catFlowerSeeds from '@/assets/cat-flower-seeds.png';
import catGrainSeeds from '@/assets/cat-grain-seeds.png';

interface SubCategory {
  name: string;
  path: string;
  image: string;
  accent?: string;
}

interface Category {
  id: string;
  name: string;
  sidebarIcon: string;
  subcategories: SubCategory[];
  action?: string;
  actionPath?: string;
  shopAllLabel?: string;
}

const Categories = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('seeds');

  const categories: Category[] = [
    {
      id: 'seeds',
      name: 'Seeds',
      sidebarIcon: catSeedsIcon,
      shopAllLabel: 'Shop All Seeds',
      subcategories: [
        { name: 'Vegetable Seeds', path: '/products?category=seeds&type=vegetable', image: catVegetableSeeds, accent: 'text-green-600' },
        { name: 'Fruit Seeds', path: '/products?category=seeds&type=fruit', image: catFruitSeeds, accent: 'text-red-500' },
        { name: 'Flower Seeds', path: '/products?category=seeds&type=flower', image: catFlowerSeeds, accent: 'text-pink-500' },
        { name: 'Grain Seeds', path: '/products?category=seeds&type=grain', image: catGrainSeeds, accent: 'text-amber-600' },
      ]
    },
    {
      id: 'fertilizers',
      name: 'Fertilizers',
      sidebarIcon: catFertilizerIcon,
      shopAllLabel: 'Shop All Fertilizers',
      subcategories: [
        { name: 'Organic Fertilizers', path: '/products?category=fertilizers&type=organic', image: catVegetableSeeds, accent: 'text-green-600' },
        { name: 'Chemical Fertilizers', path: '/products?category=fertilizers&type=chemical', image: catFruitSeeds, accent: 'text-blue-500' },
        { name: 'Bio Fertilizers', path: '/products?category=fertilizers&type=bio', image: catFlowerSeeds, accent: 'text-emerald-500' },
        { name: 'Micronutrients', path: '/products?category=fertilizers&type=micronutrients', image: catGrainSeeds, accent: 'text-amber-600' },
      ]
    },
    {
      id: 'agriculture',
      name: 'Agri\nProducts',
      sidebarIcon: catAgriIcon,
      shopAllLabel: 'Shop All Products',
      subcategories: [
        { name: 'Pesticides', path: '/products?category=agriculture&type=pesticides', image: catVegetableSeeds, accent: 'text-red-500' },
        { name: 'Insecticides', path: '/products?category=agriculture&type=insecticides', image: catFruitSeeds, accent: 'text-orange-500' },
        { name: 'Herbicides', path: '/products?category=agriculture&type=herbicides', image: catFlowerSeeds, accent: 'text-green-600' },
        { name: 'Fungicides', path: '/products?category=agriculture&type=fungicides', image: catGrainSeeds, accent: 'text-amber-600' },
        { name: 'Sprayers', path: '/products?category=agriculture&type=equipment', image: catVegetableSeeds, accent: 'text-blue-500' },
        { name: 'Irrigation', path: '/products?category=agriculture&type=irrigation', image: catFlowerSeeds, accent: 'text-cyan-500' },
      ]
    },
    {
      id: 'brands',
      name: 'Brands',
      sidebarIcon: catBrandsIcon,
      shopAllLabel: 'Shop All Brands',
      subcategories: [
        { name: 'BASF', path: '/products?brand=basf', image: catVegetableSeeds, accent: 'text-blue-600' },
        { name: 'Bayer', path: '/products?brand=bayer', image: catFruitSeeds, accent: 'text-green-600' },
        { name: 'Syngenta', path: '/products?brand=syngenta', image: catFlowerSeeds, accent: 'text-purple-500' },
        { name: 'UPL', path: '/products?brand=upl', image: catGrainSeeds, accent: 'text-amber-600' },
        { name: 'Tata Rallis', path: '/products?brand=tata-rallis', image: catVegetableSeeds, accent: 'text-red-500' },
      ]
    },
    {
      id: 'loans',
      name: 'Loans',
      sidebarIcon: catLoansIcon,
      shopAllLabel: 'View All Loans',
      subcategories: [
        { name: 'Crop Loans', path: '/loans?type=crop', image: catGrainSeeds, accent: 'text-green-600' },
        { name: 'Equipment Loans', path: '/loans?type=equipment', image: catVegetableSeeds, accent: 'text-blue-500' },
        { name: 'Land Loans', path: '/loans?type=land', image: catFlowerSeeds, accent: 'text-amber-600' },
        { name: 'Kisan Credit Card', path: '/loans?type=kcc', image: catFruitSeeds, accent: 'text-red-500' },
      ]
    },
    {
      id: 'market-details',
      name: 'Market\nDetails',
      sidebarIcon: catMarketIcon,
      action: 'navigate',
      actionPath: '/market-details',
      subcategories: []
    },
    {
      id: 'farm-worker',
      name: 'Farm\nWorker',
      sidebarIcon: catFarmworkerIcon,
      action: 'navigate',
      actionPath: '/farm-worker',
      subcategories: []
    },
    {
      id: 'rent-vehicles',
      name: 'Rent\nVehicles',
      sidebarIcon: catVehicleIcon,
      action: 'navigate',
      actionPath: '/vehicle-rent',
      subcategories: []
    },
  ];

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  const handleCategoryClick = (category: Category) => {
    if (category.action === 'navigate' && category.actionPath) {
      navigate(category.actionPath);
    } else {
      setActiveCategory(category.id);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">All Categories</h1>
        </div>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 bg-muted rounded-lg flex items-center px-3 py-2.5 border border-border">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="flex-1 ml-2 text-foreground bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            <Camera className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex min-h-[calc(100vh-140px)]">
        {/* Left Sidebar */}
        <div className="w-[90px] bg-muted/50 border-r border-border overflow-y-auto">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`w-full p-2 py-3 flex flex-col items-center gap-1.5 border-l-[3px] transition-all ${
                  isActive 
                    ? 'bg-white border-l-primary' 
                    : 'border-l-transparent hover:bg-white/60'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${
                  isActive ? 'bg-primary/10 border border-primary/20' : 'bg-white border border-border'
                }`}>
                  <img 
                    src={category.sidebarIcon} 
                    alt={category.name}
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight whitespace-pre-line ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Content - Subcategories */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          {activeCategoryData && activeCategoryData.subcategories.length > 0 && (
            <>
              <h2 className="text-base font-bold text-foreground mb-4">
                Categories
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {activeCategoryData.subcategories.map((sub, index) => (
                  <Link
                    key={index}
                    to={sub.path}
                    className="flex flex-col items-center rounded-xl border border-border bg-card p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="w-20 h-20 rounded-lg flex items-center justify-center mb-2">
                      <img 
                        src={sub.image} 
                        alt={sub.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground text-center leading-tight">
                      {sub.name.split(' ')[0]}
                    </span>
                    <span className={`text-[10px] font-medium text-center ${sub.accent || 'text-primary'}`}>
                      {sub.name.split(' ').slice(1).join(' ')}
                    </span>
                  </Link>
                ))}
              </div>

              <Link 
                to={`/products?category=${activeCategoryData.id}`}
                className="mt-5 block w-full bg-primary text-primary-foreground text-center py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
              >
                {activeCategoryData.shopAllLabel || `Shop All ${activeCategoryData.name}`}
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
