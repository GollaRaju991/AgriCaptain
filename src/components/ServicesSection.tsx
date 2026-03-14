import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

import catMarketIcon from '@/assets/cat-market-icon.png';
import catFarmworkerIcon from '@/assets/cat-farmworker-icon.png';
import catVehicleIcon from '@/assets/cat-vehicle-icon.png';
import catLoansIcon from '@/assets/cat-loans-icon.png';
import catDirectFarmIcon from '@/assets/direct-from-farm-hero.jpeg';
import catSellCropIcon from '@/assets/sell-crop-hero.jpeg';

const ServicesSection = () => {
  const { translations } = useLanguage();

  const services = [
    {
      name: 'Market Details',
      description: 'Check daily mandi crop prices',
      icon: catMarketIcon,
      cta: 'View Prices →',
      ctaColor: 'bg-green-500 text-white',
      borderColor: 'border-b-green-500',
      path: '/market-details',
    },
    {
      name: 'Farm Worker',
      description: 'Find local labor and farm help',
      icon: catFarmworkerIcon,
      cta: 'Hire Labor →',
      ctaColor: 'bg-yellow-500 text-white',
      borderColor: 'border-b-yellow-500',
      path: '/farm-worker',
    },
    {
      name: 'Rent Vehicles',
      description: 'Rent tractors, trailers, harvesters',
      icon: catVehicleIcon,
      cta: 'Find Rentals →',
      ctaColor: 'bg-blue-500 text-white',
      borderColor: 'border-b-blue-500',
      path: '/vehicle-rent',
    },
    {
      name: 'Loans',
      description: 'Apply for agriculture loans',
      icon: catLoansIcon,
      cta: 'Apply Now →',
      ctaColor: 'bg-orange-500 text-white',
      borderColor: 'border-b-orange-500',
      path: '/loans',
    },
  ];

  const sideCards = {
    directFromFarm: {
      name: 'Direct From Farm',
      icon: catDirectFarmIcon,
      path: '/direct-from-farm',
      borderColor: 'border-green-500',
    },
    sellCrop: {
      name: 'Sell Crop',
      icon: catSellCropIcon,
      path: '/sell-crop',
      borderColor: 'border-orange-500',
    },
  };

  return (
    <section className="py-4 md:py-6 bg-background">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        {/* Mobile: 2x2 grid of services only */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {services.map((service, index) => (
            <Link key={index} to={service.path}>
              <div
                className={`bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] border-b-[3px] ${service.borderColor} cursor-pointer`}
              >
                <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center p-4">
                  <img src={service.icon} alt={service.name} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <div className="px-2 py-2 text-center">
                  <h3 className="font-semibold text-xs text-foreground">{service.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-medium px-3 py-1 rounded-full ${service.ctaColor}`}>
                    {service.cta}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop: Direct From Farm + 4 services + Sell Crop in a 6-column layout */}
        <div className="hidden md:grid md:grid-cols-6 gap-4">
          {/* Direct From Farm - left side card */}
          <Link to={sideCards.directFromFarm.path}>
            <div className={`bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] border-2 ${sideCards.directFromFarm.borderColor} cursor-pointer h-full flex flex-col items-center justify-center p-4`}>
              <div className="w-20 h-20 mb-3">
                <img src={sideCards.directFromFarm.icon} alt={sideCards.directFromFarm.name} className="w-full h-full object-contain" loading="lazy" />
              </div>
              <h3 className="font-bold text-sm text-foreground text-center">{sideCards.directFromFarm.name}</h3>
            </div>
          </Link>

          {/* 4 service cards */}
          {services.map((service, index) => (
            <Link key={index} to={service.path}>
              <div
                className={`bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] border-b-[3px] ${service.borderColor} cursor-pointer h-full`}
              >
                <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center p-4">
                  <img src={service.icon} alt={service.name} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <div className="px-2 py-3 text-center">
                  <h3 className="font-semibold text-sm text-foreground">{service.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                  <span className={`inline-block mt-1.5 text-xs font-medium px-3 py-1 rounded-full ${service.ctaColor}`}>
                    {service.cta}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Sell Crop - right side card */}
          <Link to={sideCards.sellCrop.path}>
            <div className={`bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] border-2 ${sideCards.sellCrop.borderColor} cursor-pointer h-full flex flex-col items-center justify-center p-4`}>
              <div className="w-20 h-20 mb-3">
                <img src={sideCards.sellCrop.icon} alt={sideCards.sellCrop.name} className="w-full h-full object-contain" loading="lazy" />
              </div>
              <h3 className="font-bold text-sm text-foreground text-center">{sideCards.sellCrop.name}</h3>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
