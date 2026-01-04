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
import MobileBottomNav from "@/components/MobileBottomNav";
import CategoryNavigation from "@/components/CategoryNavigation";
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
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Header />
      
      {/* Desktop Category Navigation */}
      <div className="hidden lg:block">
        <CategoryNavigation />
      </div>

      {/* Hero Slider */}
      <HeroSlider />

      {/* Categories Section - Full Width */}
      <div className="w-full px-2 md:px-4 py-4 md:py-6 bg-white">
        <ProductCategories />
      </div>

      {/* Brands Section */}
      <BrandsSection />

      {/* Featured Products */}
      <section className="py-4 md:py-8 bg-white">
        <div className="w-full px-2 md:px-4 pb-24">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{translations.featured_products}</h2>
            <p className="text-sm text-gray-600">{translations.discover_products}</p>
          </div>

          {/* Product Grid - Tighter gaps like Flipkart */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
            {products
              .slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * productsPerPage + 1} - {Math.min(currentPage * productsPerPage, products.length)} of {products.length} products
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={`cursor-pointer ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                  />
                </PaginationItem>
                {(() => {
                  const totalPages = Math.ceil(products.length / productsPerPage);
                  const pages: (number | string)[] = [];
                  
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push("...");
                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                      pages.push(i);
                    }
                    if (currentPage < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                  }
                  
                  return pages.map((page, idx) => (
                    <PaginationItem key={idx}>
                      {page === "..." ? (
                        <span className="px-3 py-2">...</span>
                      ) : (
                        <PaginationLink
                          onClick={() => setCurrentPage(page as number)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ));
                })()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, Math.ceil(products.length / productsPerPage))
                      )
                    }
                    className={`cursor-pointer ${currentPage === Math.ceil(products.length / productsPerPage) ? "pointer-events-none opacity-50" : ""}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

        </div>
      </section>
      <div className="h-20 lg:hidden"></div>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Index;


