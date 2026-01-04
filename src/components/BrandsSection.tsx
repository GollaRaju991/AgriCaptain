
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
    <section className="py-4 md:py-6 bg-white border-t border-gray-100">
      <div className="w-full px-2 md:px-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            {translations.trusted_brands || "Trusted Brands"}
          </h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-green-600 hover:text-green-700 text-sm"
          >
            {showAll ? "View Less" : "View All"}
            <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </Button>
        </div>
        
        <div className={`grid ${showAll ? 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1 md:gap-2' : 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 md:gap-2'}`}>
          {displayedBrands.map((brand, index) => (
            <Card key={index} className="hover:shadow-sm transition-all cursor-pointer border border-gray-100 bg-white">
              <CardContent className="p-1.5 md:p-2">
                <div className="w-full h-10 md:h-12 flex items-center justify-center">
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
