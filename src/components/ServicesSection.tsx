import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

import catMarketIcon from '@/assets/cat-market-icon.png';
import catFarmworkerIcon from '@/assets/cat-farmworker-icon.png';
import catVehicleIcon from '@/assets/cat-vehicle-icon.png';
import catLoansIcon from '@/assets/cat-loans-icon.png';

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

  return (
    <section className="py-4 md:py-6 bg-background">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {services.map((service, index) => (
            <Link key={index} to={service.path}>
              <div
                className={`bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] border-b-[3px] ${service.borderColor} cursor-pointer`}
              >
                <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center p-4">
                  <img
                    src={service.icon}
                    alt={service.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="px-2 py-2 md:py-3 text-center">
                  <h3 className="font-semibold text-xs md:text-sm text-foreground">{service.name}</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                  <span className={`inline-block mt-1.5 text-[10px] md:text-xs font-medium px-3 py-1 rounded-full ${service.ctaColor}`}>
                    {service.cta}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
