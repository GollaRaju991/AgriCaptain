import React, { useState } from 'react';
import { ChevronDown, Beef, Milk, Zap, Truck, Syringe, Heart, Wheat, Users, Leaf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const AnimalHusbandryMenu = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = {
    cattle: {
      en: [
        { name: "Cattle Feed", icon: Wheat, path: "/products?category=cattle-feed" },
        { name: "Cattle Supplements", icon: Heart, path: "/products?category=cattle-supplements" },
        { name: "Milking Machine", icon: Milk, path: "/products?category=milking-machine" },
        { name: "Milking Machine Accessories", icon: Zap, path: "/products?category=milking-accessories" },
        { name: "Cattle Mat", icon: Beef, path: "/products?category=cattle-mat" },
        { name: "Calf Feeding Bottle", icon: Milk, path: "/products?category=calf-feeding" }
      ],
      te: [
        { name: "పశువుల ఆహారం", icon: Wheat, path: "/products?category=cattle-feed" },
        { name: "పశువుల సప్లిమెంట్స్", icon: Heart, path: "/products?category=cattle-supplements" },
        { name: "పాలు పిండే మెషిన్", icon: Milk, path: "/products?category=milking-machine" },
        { name: "పాలు పిండే మెషిన్ భాగాలు", icon: Zap, path: "/products?category=milking-accessories" },
        { name: "పశువుల మ్యాట్", icon: Beef, path: "/products?category=cattle-mat" },
        { name: "దూడల దాణా బాటిల్", icon: Milk, path: "/products?category=calf-feeding" }
      ]
    },
    poultry: {
      en: [
        { name: "Poultry Feed", icon: Wheat, path: "/products?category=poultry-feed" },
        { name: "Poultry Supplements", icon: Heart, path: "/products?category=poultry-supplements" },
        { name: "Poultry Equipment", icon: Truck, path: "/products?category=poultry-equipment" }
      ],
      te: [
        { name: "కోడిపిల్లల ఆహారం", icon: Wheat, path: "/products?category=poultry-feed" },
        { name: "కోడిపిల్లల సప్లిమెంట్స్", icon: Heart, path: "/products?category=poultry-supplements" },
        { name: "కోడిపిల్లల పరికరాలు", icon: Truck, path: "/products?category=poultry-equipment" }
      ]
    },
    others: {
      en: [
        { name: "Forage Seeds", icon: Wheat, path: "/products?category=forage-seeds" },
        { name: "Silage Culture", icon: Heart, path: "/products?category=silage-culture" }
      ],
      te: [
        { name: "మేత విత్తనాలు", icon: Wheat, path: "/products?category=forage-seeds" },
        { name: "సైలేజ్ సంస్కృతి", icon: Heart, path: "/products?category=silage-culture" }
      ]
    },
    brands: {
      en: [
        { name: "Meenakshi Agro", icon: Users, path: "/products?brand=meenakshi-agro" },
        { name: "Ecowealth", icon: Users, path: "/products?brand=ecowealth" },
        { name: "Godhan", icon: Users, path: "/products?brand=godhan" },
        { name: "Prompt Equipments", icon: Users, path: "/products?brand=prompt-equipments" },
        { name: "Agrigators Enterprises", icon: Users, path: "/products?brand=agrigators" },
        { name: "Shivam Pharma", icon: Syringe, path: "/products?brand=shivam-pharma" }
      ],
      te: [
        { name: "మీనాక్షి అగ్రో", icon: Users, path: "/products?brand=meenakshi-agro" },
        { name: "ఎకోవెల్త్", icon: Users, path: "/products?brand=ecowealth" },
        { name: "గోధన్", icon: Users, path: "/products?brand=godhan" },
        { name: "ప్రాంప్ట్ ఎక్విప్మెంట్స్", icon: Users, path: "/products?brand=prompt-equipments" },
        { name: "అగ్రిగేటర్స్ ఎంటర్‌ప్రైజెస్", icon: Users, path: "/products?brand=agrigators" },
        { name: "శివం ఫార్మా", icon: Syringe, path: "/products?brand=shivam-pharma" }
      ]
    }
  };

  const currentLang = language as 'en' | 'te';

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 text-white hover:bg-green-700 px-4 py-2 rounded-md transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Leaf className="h-5 w-5" />
        <span className="text-sm font-medium">
          {currentLang === 'te' ? 'పంటలు & మొక్కలు' : 'Crops & Plants'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-4 grid grid-cols-2 gap-4">
            {/* Cattle Section */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                {currentLang === 'te' ? 'పశువులు' : 'Cattle'}
              </h4>
              <ul className="space-y-2">
                {menuItems.cattle[currentLang].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 text-xs py-1"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Poultry Section */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                {currentLang === 'te' ? 'కోడిపిల్లలు' : 'Poultry'}
              </h4>
              <ul className="space-y-2">
                {menuItems.poultry[currentLang].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 text-xs py-1"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Others Section */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                {currentLang === 'te' ? 'ఇతరాలు' : 'Others'}
              </h4>
              <ul className="space-y-2">
                {menuItems.others[currentLang].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 text-xs py-1"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Popular Brands Section */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                {currentLang === 'te' ? 'ప్రసిద్ధ బ్రాండ్లు' : 'Popular Brands'}
              </h4>
              <ul className="space-y-2">
                {menuItems.brands[currentLang].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 text-xs py-1"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalHusbandryMenu;
