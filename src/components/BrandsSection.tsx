
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const BrandsSection = () => {
  const { translations } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const brands = [
    { name: "Syngenta", logo: "https://i.postimg.cc/rwG5wdNn/Syngenta.png" },
    { name: "Janatha Agro", logo: "https://i.postimg.cc/xdRGtkkJ/janatha-Agro-Products-Logo.webp" },
    { name: "Bayer", logo: "https://i.postimg.cc/vmqMrzv4/BAYER.png" },
    { name: "Seminis", logo: "https://i.postimg.cc/28JJmtSj/Seminis.png" },
    { name: "Namdhari Seeds", logo: "https://i.postimg.cc/xdGFvTyq/nuziveedu-Seeds.webp" },
    { name: "Rallis India", logo: "https://i.postimg.cc/J7BxWzvg/rallis-Logo.webp" },
    { name: "Dhanuka", logo: "https://i.postimg.cc/PqPZz6kc/dhanuka-Logo.webp" },
    { name: "FMC", logo: "https://i.postimg.cc/dV0TwWD1/fmcLogo.webp" },
    { name: "UPL", logo: "https://i.postimg.cc/QdVVRHnK/uplLogo.webp" },
    { name: "Geolife", logo: "https://i.postimg.cc/FswQHzHL/geolife-Logo.webp" },
    { name: "Otla", logo: "https://i.postimg.cc/7LsFjZdh/otla-web-01.webp" },
    { name: "Dow AgroSciences", logo: "https://i.postimg.cc/fRb5pfN7/dowLogo.webp" },
    { name: "East-West Seed", logo: "https://i.postimg.cc/1Xj4tS83/ews-International-Logo.webp" },
    { name: "Indofil", logo: "https://i.postimg.cc/05F8bctj/indofil-Logo.webp" },
    { name: "Bali Yaan", logo: "https://i.postimg.cc/8Ccp79VF/Balwaan.webp" },
    { name: "Innov-On Seed", logo: "https://i.postimg.cc/7YLx6brH/known-You-Seed-Logo.webp" },
    { name: "PI Industries", logo: "https://i.postimg.cc/SRvHjScR/piLogo.webp" },
    { name: "VNR Seeds", logo: "https://i.postimg.cc/JzwdFdqf/vnrLogo.webp" },
    { name: "BASF", logo: "https://i.postimg.cc/5NJsqF2J/basfLogo.webp" },
    { name: "Crystal", logo: "https://i.postimg.cc/02t7M66c/crystal-Logo.webp" },
    { name: "UAL", logo: "https://i.postimg.cc/nhj9X3fh/UAL-logo.webp" },
    { name: "Multiplex", logo: "https://i.postimg.cc/GtmHdQjr/multiplex-Logo.webp" },
    { name: "Government", logo: "https://i.postimg.cc/zBJfFj6W/ecowealth-Logo.webp" }
  ];

  const displayedBrands = showAll ? brands : brands.slice(0, 8);

  return (
    <section className="py-8 md:py-12 bg-blue-50/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {translations.trusted_brands || "Trusted Brands"}
            </h2>
            <p className="text-gray-600">
              {translations.premium_brands || "Premium agricultural brands you can trust"}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2"
          >
            {showAll ? "View Less" : "View All"}
            <ChevronRight className={`h-4 w-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </Button>
        </div>
        
        <div className={`grid ${showAll ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-4' : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 md:gap-4'}`}>
          {displayedBrands.map((brand, index) => (
            <Card key={index} className="hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border-gray-200">
              <CardContent className="p-2 md:p-3">
                <div className="w-full h-12 md:h-16 flex items-center justify-center">
                  <img 
                    src={brand.logo} 
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
