import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCategories from "@/components/ProductCategories";
import BrandsSection from "@/components/BrandsSection";
import PromoBanners from "@/components/PromoBanners";
import MobileBottomNav from "@/components/MobileBottomNav";
import CategoryNavigation from "@/components/CategoryNavigation";
import WeatherReport from "@/components/WeatherReport";
import AgrizinDoctorBanner from "@/components/AgrizinDoctorBanner";
import ProductAdBanner from "@/components/ProductAdBanner";
import ScannerPromoBanner from "@/components/ScannerPromoBanner";
import ServicesSection from "@/components/ServicesSection";
import { products } from "@/data/products";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Index = () => {
  const { translations } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Header />
      
      {/* Desktop Category Navigation */}
      <div className="hidden lg:block">
        <CategoryNavigation />
      </div>

      {/* Hero Slider */}
      <HeroSlider />

      {/* Scanner Promo Banner */}
      <ScannerPromoBanner />

      {/* Categories Section - Full Width */}
      <div className="w-full px-2 md:px-4 py-4 md:py-6 bg-white">
        <ProductCategories />
      </div>

      {/* Services Section */}
      <ServicesSection />

      {/* Promo Banners */}
      <PromoBanners />

      {/* Brands Section */}
      <BrandsSection />

      {/* Agrizin Doctor Banner */}
      <AgrizinDoctorBanner />

      {/* Featured Products */}
      <section className="py-4 md:py-8 bg-white">
        <div className="w-full px-2 md:px-4 pb-24">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{translations.featured_products}</h2>
            <p className="text-sm text-gray-600">{translations.discover_products}</p>
          </div>

          {(() => {
            const batch1 = products.slice(0, 6);
            const batch2 = products.slice(6, 12);
            const remaining = products.slice(12);
            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 md:gap-2">
                  {batch1.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Ad Banner 1 */}
                <ProductAdBanner />

                {/* Weather Report */}
                <WeatherReport />

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 md:gap-2">
                  {batch2.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Ad Banner 2 */}
                <ProductAdBanner />

                {/* All remaining products */}
                {remaining.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 md:gap-2 mt-2">
                    {remaining.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Index;


