import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateProductName, translateDescription } from '@/data/translations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, ChevronDown, ArrowLeft, ZoomIn, Search, Tag, CreditCard, Smartphone, Zap, X, Camera } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import MobileBottomNav from "@/components/MobileBottomNav";
import { useToast } from '@/hooks/use-toast';
import { products } from '@/data/products';
import { mockProducts } from '@/data/mockProducts';
import ProductCard from '@/components/ProductCard';
import ShareDialog from '@/components/ShareDialog';
import ImageZoomModal from '@/components/ImageZoomModal';
import ProductReviewForm from '@/components/ProductReviewForm';
import SearchSuggestions from '@/components/SearchSuggestions';
import { addToSearchHistory } from '@/hooks/useSearchHistory';

// Collapsible Product Section Component
interface ProductSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const ProductSection = ({ title, defaultOpen = false, children }: ProductSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-950/50 transition-all">
        <span className="font-semibold text-green-800 dark:text-green-300">{title}</span>
        <ChevronDown className={`h-5 w-5 text-green-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 border-t-0 rounded-b-lg px-4 pb-4 pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [sellerProduct, setSellerProduct] = useState<any>(null);
  const [loadingSeller, setLoadingSeller] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset state and scroll instantly when product changes (Flipkart-style instant land)
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setSelectedImage(0);
    setQuantity(1);
    setSearchActive(false);
    setSearchQuery('');
    setShowSuggestions(false);
    setUserReviews([]);
  }, [id]);

  const isSellerProduct = id?.startsWith('sp-');

  // Fetch seller product from DB
  useEffect(() => {
    if (isSellerProduct && id) {
      const dbId = id.replace('sp-', '');
      setLoadingSeller(true);
      (supabase.from('seller_products') as any)
        .select('*')
        .eq('id', dbId)
        .single()
        .then(({ data }: any) => {
          if (data) setSellerProduct(data);
          setLoadingSeller(false);
        });
    }
  }, [id, isSellerProduct]);

  const currentIndex = useMemo(() => products.findIndex(p => p.id === id), [id]);
  const prevProduct = currentIndex > 0 ? products[currentIndex - 1] : null;
  const nextProduct = currentIndex < products.length - 1 ? products[currentIndex + 1] : null;

  const foundMockProduct = isSellerProduct ? null : mockProducts.find(p => p.id === id);
  const foundProduct = isSellerProduct ? null : (foundMockProduct || products.find(p => p.id === id));

  const product = sellerProduct ? {
    id: id || '',
    name: sellerProduct.product_name,
    price: sellerProduct.selling_price,
    originalPrice: sellerProduct.mrp_price,
    images: sellerProduct.product_images?.length > 0 
      ? sellerProduct.product_images 
      : ['https://via.placeholder.com/400'],
    category: sellerProduct.category?.toLowerCase() || 'seeds',
    rating: 4.0,
    reviews: 0,
    discount: sellerProduct.discount_percent || Math.round(((sellerProduct.mrp_price - sellerProduct.selling_price) / sellerProduct.mrp_price) * 100),
    inStock: sellerProduct.stock_quantity > 0,
    shortDescription: sellerProduct.description || sellerProduct.product_name,
    detailedDescription: sellerProduct.description || sellerProduct.product_name,
    usage: `Category: ${sellerProduct.category}${sellerProduct.sub_category ? ' > ' + sellerProduct.sub_category : ''}`,
    specifications: {
      'Brand': sellerProduct.brand || 'N/A',
      'Category': sellerProduct.category,
      'Sub Category': sellerProduct.sub_category || 'N/A',
      'Crop Type': sellerProduct.crop_type || 'N/A',
      'Season': sellerProduct.season || 'N/A',
      'Shelf Life': sellerProduct.shelf_life || 'N/A',
      'Unit': sellerProduct.unit_type,
      'Delivery': sellerProduct.delivery_available ? `${sellerProduct.delivery_days || '3-5 days'} (₹${sellerProduct.delivery_charge || 0})` : 'Not available',
    },
    features: [
      sellerProduct.brand ? `Brand: ${sellerProduct.brand}` : null,
      sellerProduct.season ? `Season: ${sellerProduct.season}` : null,
      sellerProduct.crop_type ? `Crop Type: ${sellerProduct.crop_type}` : null,
      `Unit: ${sellerProduct.unit_type}`,
      sellerProduct.delivery_available ? 'Delivery Available' : null,
    ].filter(Boolean),
    reviewsList: []
  } : foundProduct ? {
    ...foundProduct,
    images: [
      foundProduct.image,
    ],
    category: (foundProduct as any).category || 'seeds',
    shortDescription: foundProduct.description || 'Premium quality product for farming',
    detailedDescription: `${foundProduct.description || 'Premium quality product'}\n\nKey Benefits:\n• High quality assured\n• Suitable for all conditions\n• Professional tested`,
    usage: (foundProduct as any).forUse || `Ideal for commercial farming and home gardening.`,
    specifications: {
      'Product Type': ((foundProduct as any).category || 'Seeds').charAt(0).toUpperCase() + ((foundProduct as any).category || 'seeds').slice(1),
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
      { id: 1, name: 'Ramesh Kumar', rating: 5, date: '2 weeks ago', comment: 'Excellent product! Great quality and fast delivery.', helpful: 45, notHelpful: 2 },
      { id: 2, name: 'Suresh Patel', rating: 4, date: '1 month ago', comment: 'Good product. Works as expected.', helpful: 23, notHelpful: 3 },
      { id: 3, name: 'Mahesh Singh', rating: 5, date: '1 month ago', comment: 'Best quality I have ever used.', helpful: 67, notHelpful: 1 },
    ]
  } : null;

  const { relatedProducts, unrelatedProducts } = useMemo(() => {
    if (!product) return { relatedProducts: [], unrelatedProducts: [] };
    const currentId = product.id;
    const keywords = product.name.toLowerCase().split(' ').filter(w => w.length > 3);
    const allProducts = [...products, ...mockProducts.map(mp => ({
      ...mp,
      originalPrice: mp.originalPrice,
    }))];
    const uniqueProducts = allProducts.filter((p, idx, arr) => 
      p.id !== currentId && arr.findIndex(x => x.id === p.id) === idx
    );
    const related = uniqueProducts.filter(p => {
      const pName = p.name.toLowerCase();
      return keywords.some(kw => pName.includes(kw));
    });
    const relatedIds = new Set(related.map(p => p.id));
    const unrelated = uniqueProducts.filter(p => !relatedIds.has(p.id));
    const shuffled = [...unrelated].sort(() => Math.random() - 0.5);
    return {
      relatedProducts: related.slice(0, 30),
      unrelatedProducts: shuffled.slice(0, 60),
    };
  }, [product?.id, product?.name]);

  const allReviews = useMemo(() => {
    const staticReviews = product?.reviewsList || [];
    return [...userReviews, ...staticReviews];
  }, [product?.reviewsList, userReviews]);

  const ratingDistribution = useMemo(() => {
    const total = allReviews.length || 1;
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(r => {
      dist[r.rating as keyof typeof dist]++;
    });
    return Object.entries(dist).reverse().map(([stars, count]) => ({
      stars: parseInt(stars),
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }, [allReviews]);

  const handleReviewSubmit = (review: any) => {
    setUserReviews(prev => [review, ...prev]);
  };

  if (!product && !loadingSeller) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center gap-2 px-2 py-2">
          <button onClick={() => { if (searchActive) { setSearchActive(false); setSearchQuery(''); } else if (window.history.length > 2) navigate(-1); else navigate('/'); }} className="p-1.5">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1 relative">
            {searchActive ? (
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 border border-gray-200">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      addToSearchHistory(searchQuery.trim());
                      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  placeholder="Search for products"
                  className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="!min-h-0 !min-w-0">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setSearchActive(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                className="w-full flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 border border-gray-200"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate flex-1 text-left">Search for products</span>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <SearchSuggestions
              query={searchQuery}
              onSelect={(suggestion) => {
                addToSearchHistory(suggestion);
                setSearchQuery(suggestion);
                navigate(`/products?search=${encodeURIComponent(suggestion)}`);
              }}
              visible={showSuggestions && searchActive}
            />
          </div>
          <button onClick={() => navigate('/cart')} className="p-1.5 relative">
            <ShoppingCart className="h-5 w-5 text-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="hidden lg:block"><Header /></div>
      
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-8 pb-32 md:pb-8">
        {/* Back Button & Breadcrumb - Desktop only */}
        <div className="hidden lg:block mb-4 md:mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/products'); }}
            className="flex items-center gap-1 text-sm mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <nav className="flex text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-primary">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground truncate max-w-[200px] md:max-w-[300px]">{translateProductName(product.name, language)}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
          {/* Product Images */}
          <div>
            <div 
              className="relative cursor-zoom-in group bg-white"
              onClick={() => setZoomModalOpen(true)}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-[350px] md:h-[420px] lg:h-96 object-contain bg-white p-4"
              />
              
              <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.images[0],
                      category: product.category
                    });
                    toast({
                      title: isInWishlist(product.id) ? "Removed from wishlist" : "Added to wishlist",
                    });
                  }}
                  className="bg-white p-2.5 rounded-full shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShareDialogOpen(true); }}
                  className="bg-white p-2.5 rounded-full shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="hidden lg:flex absolute top-3 left-3 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4" />
                <span>Click to zoom</span>
              </div>

              <div className="absolute bottom-3 left-3 lg:hidden">
                <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 border border-gray-100">
                  <span className="font-bold text-sm text-foreground">{product.rating}</span>
                  <Star className="h-3.5 w-3.5 fill-green-600 text-green-600" />
                  <span className="text-xs text-muted-foreground ml-0.5">| {product.reviews?.toLocaleString() || allReviews.length}</span>
                </div>
              </div>
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              
              <div className="absolute bottom-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                {selectedImage + 1} / {product.images.length}
              </div>
            </div>
            
            <div className="flex justify-center items-center gap-1.5 py-2 lg:hidden">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  role="button"
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-full transition-all cursor-pointer !min-h-0 !min-w-0 ${
                    selectedImage === index 
                      ? 'w-[7px] h-[7px] bg-blue-600' 
                      : 'w-[6px] h-[6px] bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="hidden lg:flex gap-3 overflow-x-auto pb-2 mt-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all bg-muted ${
                    selectedImage === index 
                      ? 'border-primary ring-2 ring-primary/20 scale-105' 
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>

            <ImageZoomModal
              isOpen={zoomModalOpen}
              onClose={() => setZoomModalOpen(false)}
              images={product.images}
              selectedIndex={selectedImage}
              productName={product.name}
              onChangeImage={setSelectedImage}
            />
          </div>

          {/* Product Info */}
          <div className="px-4 lg:px-0">
            <div className="mb-3 lg:mb-4">
              <Badge className="bg-green-100 text-green-800 mb-2 text-[10px] lg:text-sm">
                {product.category.toUpperCase()}
              </Badge>
              <h1 className="text-lg lg:text-4xl font-medium lg:font-bold text-foreground mb-1 lg:mb-3">
                {translateProductName(product.name, language)}
              </h1>
              
              <div className="hidden lg:flex items-center mb-4">
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
                  <span className="ml-2 text-base text-muted-foreground">
                    {product.rating} ({product.reviews || allReviews.length} reviews)
                  </span>
                </div>
              </div>

              <p className="hidden lg:block text-base text-muted-foreground mb-4">{product.shortDescription}</p>
            </div>

            {/* Price Section */}
            <div className="mb-4 lg:mb-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl lg:text-4xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-base lg:text-xl text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-green-600 font-semibold text-sm lg:text-lg">
                      {product.discount}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground">inclusive of all taxes</p>
            </div>

            {/* Offers Section */}
            <div className="mb-4 lg:mb-6 border border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  <span className="font-semibold text-sm lg:text-base">Available Offers</span>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 divide-y divide-blue-100 dark:divide-blue-900">
                <div className="px-4 py-3 flex items-start gap-3">
                  <Tag className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm lg:text-base font-medium text-foreground">Coupon Discount</p>
                    <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
                      Use code <span className="font-bold text-green-700">AGRI100</span> to get ₹100 off on orders above ₹999
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm lg:text-base font-medium text-foreground">Bank Offer</p>
                    <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
                      10% off on SBI Credit Card, up to ₹500 on orders above ₹2,000
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-start gap-3">
                  <Smartphone className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm lg:text-base font-medium text-foreground">UPI Offer</p>
                    <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
                      Pay via UPI and get ₹50 cashback on first order
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-start gap-3">
                  <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm lg:text-base font-medium text-foreground">Special Offer</p>
                    <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
                      Buy 2 or more items and get extra 5% off
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex flex-wrap gap-3 mb-4 lg:mb-6 py-3 border-y border-border lg:border-0 lg:p-4 lg:bg-green-50 lg:rounded-lg">
              <div className="flex items-center gap-1.5 text-xs lg:text-base">
                <Truck className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                <span className="font-medium">Free Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs lg:text-base">
                <RotateCcw className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                <span className="font-medium">7 Day Returns</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs lg:text-base">
                <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                <span className="font-medium">Quality Assured</span>
              </div>
            </div>

            <div className="lg:hidden mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{product.shortDescription}</p>
            </div>

            {/* Quantity and Actions - Desktop only */}
            <div className="hidden lg:block mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-base font-medium">{translations.quantity}:</label>
                <div className="flex items-center border rounded">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 hover:bg-muted">-</button>
                  <span className="px-4 py-1 border-x">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 hover:bg-muted">+</button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <Button onClick={handleAddToCart} className="flex-1 bg-white text-foreground border border-border hover:bg-muted">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {translations.add_to_cart}
                </Button>
                <Button onClick={handleBuyNow} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  {translations.buy_now}
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      toggleWishlist({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.images[0],
                        category: product.category
                      });
                      toast({
                        title: isInWishlist(product.id) ? "Removed from wishlist" : "Added to wishlist",
                        description: isInWishlist(product.id) 
                          ? `${product.name} removed from your wishlist.`
                          : `${product.name} added to your wishlist.`
                      });
                    }}
                    className={isInWishlist(product.id) ? 'border-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setShareDialogOpen(true)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ShareDialog
              isOpen={shareDialogOpen}
              onClose={() => setShareDialogOpen(false)}
              productName={product.name}
              productUrl={window.location.href}
            />
          </div>
        </div>

        {/* ===== ONLY 3 SECTIONS: Description, Vendor Details, Reviews ===== */}
        <div className="mt-4 lg:mt-12 px-4 lg:px-0 space-y-3">
          {/* 1. Description - Expanded by default */}
          <ProductSection title={language === 'te' ? 'వివరణ' : 'Description'} defaultOpen={true}>
            <div className="prose max-w-none space-y-5">
              <div>
                <h4 className="text-base md:text-lg font-semibold mb-2 text-green-800 dark:text-green-300">
                  {language === 'te' ? '📋 ఉత్పత్తి అవలోకనం' : '📋 Product Overview'}
                </h4>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {translateDescription(product.detailedDescription || product.shortDescription, language)}
                </p>
              </div>

              <div className="pt-3 border-t border-green-200 dark:border-green-700">
                <h4 className="text-base md:text-lg font-semibold mb-2 text-green-800 dark:text-green-300">
                  {language === 'te' ? '🎯 ఉపయోగం (ఎందుకు వాడాలి)' : '🎯 Usage (Why to Use)'}
                </h4>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {language === 'te' 
                    ? (sellerProduct?.target_pests 
                        ? `ఈ ఉత్పత్తి ${sellerProduct.target_pests} వంటి పురుగులను నియంత్రించడానికి ఉపయోగపడుతుంది.`
                        : 'ఈ ఉత్పత్తి పంటలను పురుగులు మరియు వ్యాధుల నుండి రక్షించడానికి ఉపయోగపడుతుంది.')
                    : (sellerProduct?.target_pests 
                        ? `This product is used to control pests like ${sellerProduct.target_pests}. It provides effective protection for your crops.`
                        : 'This product helps protect crops from pests and diseases, ensuring healthy growth and better yield.')
                  }
                </p>
              </div>

              <div className="pt-3 border-t border-green-200 dark:border-green-700">
                <h4 className="text-base md:text-lg font-semibold mb-2 text-green-800 dark:text-green-300">
                  {language === 'te' ? '🌾 అనుకూల పంటలు' : '🌾 Applicable Crops'}
                </h4>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {language === 'te'
                    ? (sellerProduct?.suitable_crops || 'పత్తి, వరి, కూరగాయలు, మిర్చి, టమాటా')
                    : (sellerProduct?.suitable_crops || 'Cotton, Paddy, Vegetables, Chilli, Tomato')
                  }
                </p>
              </div>

              <div className="pt-3 border-t border-green-200 dark:border-green-700">
                <h4 className="text-base md:text-lg font-semibold mb-2 text-green-800 dark:text-green-300">
                  {language === 'te' ? '💊 మోతాదు వివరాలు' : '💊 Dosage Details'}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <p className="text-muted-foreground text-sm md:text-base">
                      <span className="font-medium text-foreground">{language === 'te' ? 'మోతాదు:' : 'Dosage:'}</span>{' '}
                      {sellerProduct?.dosage || (language === 'te' ? 'లీటరు నీటికి 1 ml' : '1 ml per liter of water')}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <p className="text-muted-foreground text-sm md:text-base">
                      <span className="font-medium text-foreground">{language === 'te' ? 'పద్ధతి:' : 'Method:'}</span>{' '}
                      {sellerProduct?.application_method || (language === 'te' ? 'స్ప్రే చేయడం' : 'Spraying')}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <p className="text-muted-foreground text-sm md:text-base">
                      <span className="font-medium text-foreground">{language === 'te' ? 'ఎకరాకు:' : 'Per Acre:'}</span>{' '}
                      {sellerProduct?.package_size || (language === 'te' ? '200ml - 250ml' : '200ml - 250ml')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ProductSection>

          {/* 2. Vendor Details - Collapsed by default */}
          <ProductSection title={language === 'te' ? 'విక్రేత వివరాలు' : 'Vendor Details'} defaultOpen={false}>
            <div className="space-y-3">
              <div className="border-b border-green-200 dark:border-green-700 pb-3">
                <span className="font-medium text-sm text-green-900 dark:text-green-100">
                  {language === 'te' ? 'విక్రేత పేరు:' : 'Vendor Name:'}
                </span>
                <p className="text-muted-foreground text-sm mt-1">{sellerProduct?.brand || 'Agrizin Verified Seller'}</p>
              </div>
              <div className="border-b border-green-200 dark:border-green-700 pb-3">
                <span className="font-medium text-sm text-green-900 dark:text-green-100">
                  {language === 'te' ? 'దుకాణ చిరునామా:' : 'Vendor Address:'}
                </span>
                <p className="text-muted-foreground text-sm mt-1">{sellerProduct?.shop_address || (language === 'te' ? 'చిరునామా కోసం విక్రేతను సంప్రదించండి' : 'Contact seller for address details')}</p>
              </div>
              <div className="pb-1">
                <span className="font-medium text-sm text-green-900 dark:text-green-100">
                  {language === 'te' ? 'లైసెన్స్ నంబర్:' : 'License Number:'}
                </span>
                <p className="text-muted-foreground text-sm mt-1">{sellerProduct?.license_number || (language === 'te' ? 'కీటకనాశిని చట్టం 1968 ప్రకారం' : 'As per Insecticides Act 1968')}</p>
              </div>
            </div>
          </ProductSection>

          {/* 3. Reviews - Collapsed by default */}
          <ProductSection title={language === 'te' ? `సమీక్షలు (${allReviews.length})` : `Reviews (${allReviews.length})`} defaultOpen={false}>
            <div className="mb-6">
              <ProductReviewForm productId={product.id} onReviewSubmit={handleReviewSubmit} />
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-shrink-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-green-800 dark:text-green-300">{product.rating}</span>
                  <Star className="h-6 w-6 md:h-8 md:w-8 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-muted-foreground text-sm">{allReviews.length} {language === 'te' ? 'సమీక్షలు' : 'Reviews'}</p>
              </div>
              
              <div className="flex-1 space-y-2">
                {ratingDistribution.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-6">{stars}★</span>
                    <div className="flex-1 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <h4 className="text-base md:text-lg font-semibold mb-4 text-green-800 dark:text-green-300">
              {language === 'te' ? 'కస్టమర్ సమీక్షలు' : 'Customer Reviews'}
            </h4>
            <div className="space-y-4">
              {allReviews.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {language === 'te' ? 'ఇంకా సమీక్షలు లేవు. మొదటిగా సమీక్ష రాయండి!' : 'No reviews yet. Be the first to review!'}
                </p>
              )}
              {allReviews.map((review) => (
                <div key={review.id} className="border-b border-green-200 dark:border-green-700 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <span className="text-green-700 dark:text-green-300 font-medium text-sm">
                          {review.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className={`flex items-center px-2 py-0.5 rounded text-sm text-white ${
                      review.rating >= 4 ? 'bg-green-600' : review.rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      <span>{review.rating}</span>
                      <Star className="h-3 w-3 fill-current ml-0.5" />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{review.comment}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{language === 'te' ? 'ఉపయోగకరం' : 'Helpful'} ({review.helpful})</span>
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 lg:mt-12 mb-4 px-4 lg:px-0">
            <h2 className="text-lg lg:text-2xl font-bold mb-4 lg:mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
              {relatedProducts.map(relProduct => (
                <ProductCard key={relProduct.id} product={relProduct} variant="grid" />
              ))}
            </div>
          </div>
        )}

        {unrelatedProducts.length > 0 && (
          <div className="mt-6 mb-8 px-4 lg:px-0">
            <h2 className="text-lg lg:text-2xl font-bold mb-4 lg:mb-6">More Products You May Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
              {unrelatedProducts.map(product => (
                <ProductCard key={product.id} product={product} variant="grid" />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex lg:hidden z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <button 
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-foreground border-r border-border active:bg-muted"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold bg-green-600 text-white active:bg-green-700"
        >
          Buy Now
          <span className="text-xs font-normal">at ₹{product.price.toLocaleString()}</span>
        </button>
      </div>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetails;
