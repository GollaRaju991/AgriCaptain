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

      {/* Left + Right Image Layout */}
      <div className="flex justify-center items-start gap-4 px-4 py-10">
        <img
          src="https://i.postimg.cc/dtMvG7cj/glycel-herbicide-1-file-5004.png"
          alt="Left Banner"
          className="hidden lg:block w-60 h-[500px] object-cover rounded-xl shadow-lg"
        />

        <div className="w-full max-w-4xl mx-auto">
          <ProductCategories />
        </div>

        <img
          src="https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png"
          alt="Right Banner"
          className="hidden lg:block w-60 h-[500px] object-cover rounded-xl shadow-lg"
        />
      </div>

      {/* Brands Section */}
      <BrandsSection />

      {/* Featured Products */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 pb-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">{translations.featured_products}</h2>
            <p className="text-gray-600">{translations.discover_products}</p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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


