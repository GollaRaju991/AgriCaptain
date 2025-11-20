import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Share2, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import ProductCategories from '@/components/ProductCategories';
import BrandsSection from '@/components/BrandsSection';

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
      reviews: 124
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
      reviews: 89
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
      reviews: 56
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
      reviews: 78
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
      reviews: 203
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
      reviews: 145
    },
    {
      id: "7",
      name: "Organic Pesticide Spray",
      price: 349,
      originalPrice: 449,
      image: "https://i.postimg.cc/nVmfVH9j/topper-77-file-11270.jpg",
      rating: 4.5,
      discount: 22,
      inStock: true,
      description: "Natural pest control solution safe for organic farming",
      reviews: 98
    },
    {
      id: "8",
      name: "Cotton Seeds Hybrid",
      price: 520,
      originalPrice: 620,
      image: "https://i.postimg.cc/Qd0RYCwP/katyayani-activated-humic-acid-fulvic-acid-plants-fertilizer-bio-enhancer-with-silicon-wetting-agent.png",
      rating: 4.6,
      discount: 16,
      inStock: true,
      description: "Premium hybrid cotton seeds for high fiber quality and yield",
      reviews: 234
    },
    {
      id: "9",
      name: "Organic Pesticide ",
      price: 349,
      originalPrice :500 ,
      image: "https://i.postimg.cc/vBXn9XrQ/katyayani-trichoderma-harzianum-bio-fungicide-powder-file-20375.jpg",
      rating: 4.5,
      discount: 22,
      inStock: true,
      description: "Natural pest control solution safe for organic farming",
      reviews: 98
    },
    {
      id: "10",
      name: "exylon ",
      price: 400,
      originalPrice :650 ,
      image: "https://i.postimg.cc/Qx7tZ0FH/exylon-dronex-insecticide-file-20820.png",
      rating: 4.5,
      discount: 22,
      inStock: true,
      description: "Natural pest control solution safe for organic farming",
      reviews: 98
    }
    
  ];

  const socialMediaLinks = [
    { name: 'Facebook', url: 'https://facebook.com/agricaptain', color: 'bg-blue-600' },
    { name: 'WhatsApp', url: 'https://wa.me/9912365550', color: 'bg-green-500' },
    { name: 'Instagram', url: 'https://instagram.com/agricaptain', color: 'bg-pink-500' },
    { name: 'Twitter', url: 'https://twitter.com/agricaptain', color: 'bg-blue-400' },
    { name: 'Snapchat', url: 'https://snapchat.com/add/agricaptain', color: 'bg-yellow-400' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <div className="w-full">
        <HeroSlider />
      </div>

      {/* Product Categories */}
      <ProductCategories />

      {/* Brands Section */}
      <BrandsSection />

      {/* Featured Products */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">{translations.featured_products || "Featured Products"}</h2>
            <p className="text-sm md:text-base text-gray-600">{translations.discover_products || "Discover our top-quality agricultural products"}</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-8 md:mt-12">
            <Link to="/products">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 md:px-8 py-3 md:py-4"
                onClick={() => window.scrollTo(0, 0)}
              >
                {translations.view_all_products || "View All Products"}
              </Button>
            </Link>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default Index;
