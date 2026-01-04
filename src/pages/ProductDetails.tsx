import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, ChevronDown, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import MobileBottomNav from "@/components/MobileBottomNav";
import { useToast } from '@/hooks/use-toast';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';

// Collapsible Product Section Component
interface ProductSectionProps {
  title: string;
  defaultOpen?: boolean;
  bgColor: string;
  borderColor: string;
  children: React.ReactNode;
}

const ProductSection = ({ title, defaultOpen = false, bgColor, borderColor, children }: ProductSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className={`w-full flex items-center justify-between p-4 ${bgColor} ${borderColor} border rounded-lg hover:opacity-90 transition-all`}>
        <span className="font-semibold text-foreground">{title}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className={`${bgColor} ${borderColor} border border-t-0 rounded-b-lg px-4 pb-4 pt-2`}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Find current product index for navigation
  const currentIndex = useMemo(() => products.findIndex(p => p.id === id), [id]);
  const prevProduct = currentIndex > 0 ? products[currentIndex - 1] : null;
  const nextProduct = currentIndex < products.length - 1 ? products[currentIndex + 1] : null;

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  // Find product from products data or use mock
  const foundProduct = products.find(p => p.id === id);

  // Enhanced mock product data
  const product = foundProduct ? {
    ...foundProduct,
    images: [
      foundProduct.image,
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1566909702770-bd3ec25f6b29?w=600&h=400&fit=crop'
    ],
    category: 'seeds',
    shortDescription: foundProduct.description || 'Premium quality product for farming',
    detailedDescription: `${foundProduct.description || 'Premium quality product'}\n\nKey Benefits:\n• High quality assured\n• Suitable for all conditions\n• Professional tested`,
    usage: `Ideal for commercial farming and home gardening.`,
    specifications: {
      'Product Type': 'Seeds',
      'Quality': 'Premium',
      'Shelf Life': '2 years',
      'Origin': 'India'
    },
    features: [
      'High quality product',
      'Suitable for all conditions',
      'Professional packaging',
      'Detailed instructions included'
    ],
    reviewsList: [
      { id: 1, name: 'Ramesh Kumar', rating: 5, date: '2 weeks ago', comment: 'Excellent product! Great quality and fast delivery. Highly recommend for all farmers.', helpful: 45, notHelpful: 2 },
      { id: 2, name: 'Suresh Patel', rating: 4, date: '1 month ago', comment: 'Good product. Works as expected. Delivery was on time.', helpful: 23, notHelpful: 3 },
      { id: 3, name: 'Mahesh Singh', rating: 5, date: '1 month ago', comment: 'Best quality I have ever used. Will buy again.', helpful: 67, notHelpful: 1 },
      { id: 4, name: 'Dinesh Yadav', rating: 4, date: '2 months ago', comment: 'Value for money product. Recommended for farmers.', helpful: 34, notHelpful: 5 },
      { id: 5, name: 'Rajesh Sharma', rating: 5, date: '2 months ago', comment: 'Amazing results! Very happy with this purchase.', helpful: 89, notHelpful: 0 }
    ]
  } : {
    id: id || '1',
    name: 'Hybrid Tomato Seeds - Premium Quality',
    price: 299,
    originalPrice: 399,
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1566909702770-bd3ec25f6b29?w=600&h=400&fit=crop'
    ],
    category: 'seeds',
    rating: 4.5,
    reviews: 124,
    discount: 25,
    inStock: true,
    shortDescription: 'Premium quality hybrid tomato seeds for high-yield farming',
    detailedDescription: `These premium hybrid tomato seeds are specially developed for Indian growing conditions. 
    Our seeds undergo rigorous quality testing and come with a 95%+ germination guarantee.`,
    usage: `Ideal for commercial farming, kitchen gardens, and greenhouse cultivation.`,
    specifications: {
      'Seed Type': 'Hybrid F1',
      'Germination Rate': '95%+',
      'Days to Maturity': '75-80 days',
      'Origin': 'India'
    },
    features: [
      'High germination rate (95%+)',
      'Disease resistant varieties',
      'Suitable for all climates',
      'Premium quality assurance'
    ],
    reviewsList: [
      { id: 1, name: 'John Farmer', rating: 5, date: '2 weeks ago', comment: 'Excellent seeds! Great germination rate and healthy plants.', helpful: 45, notHelpful: 2 },
      { id: 2, name: 'Sarah Green', rating: 4, date: '1 month ago', comment: 'Good quality seeds. Plants grew well but took a bit longer.', helpful: 23, notHelpful: 3 }
    ]
  };

  // Get related products - match by similar names or random selection
  const relatedProducts = useMemo(() => {
    const currentId = product.id;
    // Get products with similar keywords in name
    const keywords = product.name.toLowerCase().split(' ').filter(w => w.length > 3);
    const similar = products.filter(p => {
      if (p.id === currentId) return false;
      const pName = p.name.toLowerCase();
      return keywords.some(kw => pName.includes(kw));
    });
    
    if (similar.length >= 4) return similar.slice(0, 8);
    
    // If not enough similar, add random products
    const remaining = products.filter(p => p.id !== currentId && !similar.includes(p));
    return [...similar, ...remaining].slice(0, 8);
  }, [product.id, product.name]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const reviews = product.reviewsList || [];
    const total = reviews.length || 1;
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      dist[r.rating as keyof typeof dist]++;
    });
    return Object.entries(dist).reverse().map(([stars, count]) => ({
      stars: parseInt(stars),
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }, [product.reviewsList]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category
      });
    }
    
    toast({
      title: "Added to Cart",
      description: `${quantity} × ${product.name} added to your cart.`
    });
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category
      });
    }
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 pb-32 md:pb-8">
        {/* Back Button & Breadcrumb with Product Navigation */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Back</span>
            </Button>
            
            {/* Desktop Breadcrumb */}
            <nav className="hidden md:flex text-sm">
              <Link to="/" className="text-gray-600 hover:text-green-600">Home</Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/products" className="text-gray-600 hover:text-green-600">Products</Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
            </nav>
          </div>

          {/* Product Navigation - Prev/Next */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => prevProduct && navigate(`/product/${prevProduct.id}`)}
              disabled={!prevProduct}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden md:inline">Prev</span>
            </Button>
            <span className="text-xs text-gray-500 hidden md:inline">
              {currentIndex + 1} / {products.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => nextProduct && navigate(`/product/${nextProduct.id}`)}
              disabled={!nextProduct}
              className="flex items-center gap-1"
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Enhanced Product Images Gallery */}
          <div>
            <div className="relative mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImage + 1} / {product.images.length}
              </div>
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all ${
                    selectedImage === index ? 'border-green-600 scale-105' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Product Info */}
          <div>
            <div className="mb-4">
              <Badge className="bg-green-100 text-green-800 mb-2">
                {product.category.toUpperCase()}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>
              
              {/* Short Description */}
              <p className="text-gray-600 mb-4">{product.shortDescription}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-green-600">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <Badge className="bg-red-100 text-red-800">
                      {product.discount}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-green-600 font-medium">✓ In Stock • Free Delivery • 7 Day Returns</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{product.shortDescription}</p>
            </div>

            {/* Quantity and Actions */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <Button onClick={handleAddToCart} className="flex-1 bg-white text-gray-900 border border-gray-300 hover:bg-gray-100">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button onClick={handleBuyNow} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Buy Now
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Free Delivery</p>
                  <p className="text-gray-600">Within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-gray-600">7 days policy</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Quality Assured</p>
                  <p className="text-gray-600">95%+ germination</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details - Stacked Collapsible Sections */}
        <div className="mt-8 md:mt-12 space-y-3">
          {/* Description Section */}
          <ProductSection 
            title="Description" 
            defaultOpen={true}
            bgColor="bg-blue-50 dark:bg-blue-950/30"
            borderColor="border-blue-200 dark:border-blue-800"
          >
            <div className="prose max-w-none">
              <h4 className="text-base md:text-lg font-semibold mb-3 text-blue-800 dark:text-blue-300">Product Description</h4>
              <div className="whitespace-pre-line text-muted-foreground leading-relaxed text-sm md:text-base">
                {product.detailedDescription}
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                <h4 className="text-base md:text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Usage Instructions</h4>
                <p className="text-muted-foreground text-sm md:text-base">{product.usage}</p>
              </div>
            </div>
          </ProductSection>

          {/* Specifications Section */}
          <ProductSection 
            title="Specifications" 
            defaultOpen={false}
            bgColor="bg-green-50 dark:bg-green-950/30"
            borderColor="border-green-200 dark:border-green-800"
          >
            <h4 className="text-base md:text-lg font-semibold mb-4 text-green-800 dark:text-green-300">Product Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border-b border-green-200 dark:border-green-700 pb-2">
                  <span className="font-medium text-sm md:text-base text-green-900 dark:text-green-100">{key}:</span>
                  <span className="text-muted-foreground text-sm md:text-base">{value}</span>
                </div>
              ))}
            </div>
          </ProductSection>

          {/* Features Section */}
          <ProductSection 
            title="Features" 
            defaultOpen={false}
            bgColor="bg-orange-50 dark:bg-orange-950/30"
            borderColor="border-orange-200 dark:border-orange-800"
          >
            <h4 className="text-base md:text-lg font-semibold mb-4 text-orange-800 dark:text-orange-300">Key Features</h4>
            <ul className="space-y-3">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                  <span className="text-sm md:text-base">{feature}</span>
                </li>
              ))}
            </ul>
          </ProductSection>

          {/* Reviews Section */}
          <ProductSection 
            title="Reviews" 
            defaultOpen={false}
            bgColor="bg-purple-50 dark:bg-purple-950/30"
            borderColor="border-purple-200 dark:border-purple-800"
          >
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Rating Summary */}
              <div className="flex-shrink-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-purple-800 dark:text-purple-300">{product.rating}</span>
                  <Star className="h-6 w-6 md:h-8 md:w-8 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-muted-foreground text-sm">{product.reviews || product.reviewsList?.length || 0} Reviews</p>
              </div>
              
              {/* Rating Distribution */}
              <div className="flex-1 space-y-2">
                {ratingDistribution.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-6">{stars}★</span>
                    <div className="flex-1 h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <h4 className="text-base md:text-lg font-semibold mb-4 text-purple-800 dark:text-purple-300">Customer Reviews</h4>
            <div className="space-y-4">
              {(product.reviewsList || []).map((review) => (
                <div key={review.id} className="border-b border-purple-200 dark:border-purple-700 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 dark:text-purple-300 font-medium text-sm">
                          {review.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-purple-600 text-white px-2 py-0.5 rounded text-sm">
                      <span>{review.rating}</span>
                      <Star className="h-3 w-3 fill-current ml-0.5" />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{review.comment}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-destructive transition-colors">
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span>({review.notHelpful})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ProductSection>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            
            {/* Mobile: 2 column grid */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {relatedProducts.slice(0, 6).map(relProduct => (
                <ProductCard key={relProduct.id} product={relProduct} variant="grid" />
              ))}
            </div>
            
            {/* Desktop: 4 column grid */}
            <div className="hidden md:grid md:grid-cols-4 gap-6">
              {relatedProducts.map(relProduct => (
                <ProductCard key={relProduct.id} product={relProduct} variant="grid" />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-2 lg:hidden z-40 shadow-lg">
        <Button 
          variant="outline" 
          className="flex-1 border-gray-300"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
        <Button 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          onClick={handleBuyNow}
        >
          Buy Now
        </Button>
      </div>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetails;
