import React from "react";
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

const Index = () => {
  const { translations } = useLanguage();

  const products = [
    {
      id: "1",
      name: "Premium Tomato Seeds",
      price: 299,
      originalPrice: 399,
      image: "https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png",
      rating: 4.5,
      discount: 25,
      inStock: true,
      description: "High-quality hybrid tomato seeds for excellent yield and disease resistance",
      reviews: 124,
    },
    {
      id: "2",
      name: "Organic NPK Fertilizer",
      price: 799,
      originalPrice: 999,
      image: "https://i.postimg.cc/4y7Mm13R/Pestiside.png",
      rating: 4.8,
      discount: 20,
      inStock: true,
      description: "Complete nutrition fertilizer for healthy plant growth and better yield",
      reviews: 89,
    },
    {
      id: "3",
      name: "Garden Tools Set",
      price: 1299,
      originalPrice: 1699,
      image: "https://i.postimg.cc/bNby5x95/ns-404-file-1319.jpg",
      rating: 4.3,
      discount: 24,
      inStock: true,
      description: "Professional grade garden tools for efficient farming and gardening",
      reviews: 56,
    },
    {
      id: "4",
      name: "Drip Irrigation Kit",
      price: 2499,
      originalPrice: 3199,
      image: "https://i.postimg.cc/vmPbn3G4/balwaan-shakti-battery-sprayer-12x8-file-7234.jpg",
      rating: 4.6,
      discount: 22,
      inStock: true,
      description: "Water-efficient irrigation system for precise and economical watering",
      reviews: 78,
    },
    {
      id: "5",
      name: "Wheat Seeds Premium",
      price: 450,
      originalPrice: 550,
      image: "https://i.postimg.cc/dtMvG7cj/glycel-herbicide-1-file-5004.png",
      rating: 4.7,
      discount: 18,
      inStock: true,
      description: "High-yielding wheat seeds suitable for various soil conditions",
      reviews: 203,
    },
    {
      id: "6",
      name: "Bio Fertilizer Mix",
      price: 799,
      originalPrice: 999,
      image: "https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png",
      rating: 4.4,
      discount: 20,
      inStock: false,
      description: "Organic bio-fertilizer for sustainable farming and soil health",
      reviews: 145,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Header />

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
          {/* <-- padding ensures button is fully visible */}

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">{translations.featured_products}</h2>
            <p className="text-gray-600">{translations.discover_products}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* --------  FIXED VIEW ALL BUTTON -------- */}
          <div className="text-center mt-12">
            <Link to="/products">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 px-8 py-4 text-white"
              >
                {translations.view_all_products}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <div className="h-20 lg:hidden"></div
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Index;


