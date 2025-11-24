import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import MobileBottomNav from "@/components/MobileBottomNav";
import { useToast } from '@/hooks/use-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Enhanced mock product data
  const product = {
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
    Our seeds undergo rigorous quality testing and come with a 95%+ germination guarantee. Perfect for both 
    commercial farming and home gardening, these seeds produce disease-resistant plants with excellent fruit quality.
    
    Key Benefits:
    • High yield potential (15-20 tons per acre)
    • Disease resistant varieties
    • Suitable for all seasons
    • Premium quality assurance
    • Organic farming compatible
    • Professional farmer tested`,
    usage: `Ideal for commercial farming, kitchen gardens, and greenhouse cultivation. These seeds work well in 
    various soil types and climatic conditions across India. Best planted during the recommended seasons for 
    optimal yield and quality.`,
    specifications: {
      'Seed Type': 'Hybrid F1',
      'Germination Rate': '95%+',
      'Days to Maturity': '75-80 days',
      'Plant Height': '4-6 feet (indeterminate)',
      'Fruit Weight': '150-200g average',
      'Package Weight': '10g (approximately 40-50 seeds)',
      'Shelf Life': '2 years from manufacture date',
      'Origin': 'India'
    },
    features: [
      'High germination rate (95%+)',
      'Disease resistant varieties',
      'Suitable for all climates',
      'High yield potential',
      'Premium quality assurance',
      'Organic farming compatible',
      'Professional packaging',
      'Detailed growing instructions included'
    ]
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link to="/" className="text-gray-600 hover:text-green-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/products" className="text-gray-600 hover:text-green-600">Products</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

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

              <div className="flex space-x-4">
                <Button onClick={handleAddToCart} className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
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

        {/* Enhanced Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {product.detailedDescription}
                    </div>
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2">Usage Instructions</h4>
                      <p className="text-gray-700">{product.usage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-medium">John Farmer</span>
                      </div>
                      <p className="text-gray-700">
                        Excellent seeds! Great germination rate and healthy plants. 
                        Highly recommend for anyone looking for quality tomato seeds.
                      </p>
                    </div>
                    <div className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-2">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <Star className="h-4 w-4 text-gray-300" />
                        </div>
                        <span className="font-medium">Sarah Green</span>
                      </div>
                      <p className="text-gray-700">
                        Good quality seeds. Plants grew well but took a bit longer to fruit than expected.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
<MobileBottomNav />
      <Footer />
    </div>
  );
};

export default ProductDetails;
