import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  inStock?: boolean;
  description?: string;
  forUse?: string;
}

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'grid' }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category || 'General'
    });
    
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category || 'General'
    });
    
    navigate('/cart');
    window.scrollTo(0, 0);
  };

  // Mobile List View (Flipkart Style)
  if (variant === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow bg-white">
        <Link to={`/product/${product.id}`}>
          <div className="flex p-3 gap-3">
            {/* Image Section */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-contain rounded-lg bg-gray-50"
              />
              {product.discount && (
                <Badge className="absolute top-0 left-0 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-br-lg rounded-tl-lg">
                  {product.discount}% OFF
                </Badge>
              )}
            </div>

            {/* Details Section */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 pr-2">
                  {product.name}
                </h3>
                <button className="text-gray-400 hover:text-red-500 flex-shrink-0">
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center mt-1.5 gap-1">
                  <div className="flex items-center bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                    <Star className="h-3 w-3 fill-white mr-0.5" />
                    <span>{product.rating}</span>
                  </div>
                  {product.reviews && (
                    <span className="text-xs text-gray-500">({product.reviews.toLocaleString()})</span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2 mt-2">
                {product.discount && (
                  <span className="text-green-600 text-xs font-medium">↓{product.discount}%</span>
                )}
                {product.originalPrice && (
                  <span className="text-gray-400 text-xs line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
                <span className="text-gray-900 font-bold text-base">₹{product.price.toLocaleString()}</span>
              </div>

              {product.inStock === false && (
                <span className="text-red-500 text-xs mt-1">Out of Stock</span>
              )}
            </div>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="px-3 pb-3 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs border-gray-300"
            onClick={handleAddToCart}
            disabled={product.inStock === false}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Add
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
            onClick={handleBuyNow}
            disabled={product.inStock === false}
          >
            Buy
          </Button>
        </div>
      </Card>
    );
  }

  // Grid View (Default)
  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col bg-white">
      <Link to={`/product/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-32 md:h-48 object-contain bg-gray-50 rounded-t-lg p-2"
          />
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-green-600 text-white text-[10px] px-1.5 py-0.5">
              {product.discount}% OFF
            </Badge>
          )}
          {product.inStock === false && (
            <Badge className="absolute top-2 right-2 bg-gray-500 text-[10px] px-1.5 py-0.5">
              Out of Stock
            </Badge>
          )}
          <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm">
            <Heart className="h-4 w-4" />
          </button>
        </div>
        
        <CardContent className="p-3 flex-1 flex flex-col">
          <h3 className="font-medium text-sm text-gray-900 mb-1.5 line-clamp-2 hover:text-green-600 transition-colors leading-tight">
            {product.name}
          </h3>
          
          {product.rating && (
            <div className="flex items-center mb-1.5 gap-1">
              <div className="flex items-center bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                <Star className="h-3 w-3 fill-white mr-0.5" />
                <span>{product.rating}</span>
              </div>
              {product.reviews && (
                <span className="text-xs text-gray-500">({product.reviews.toLocaleString()})</span>
              )}
            </div>
          )}
          
          <div className="flex items-center flex-wrap gap-1 mb-2">
            <span className="text-base font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {product.discount && (
              <span className="text-green-600 text-xs font-medium">{product.discount}% off</span>
            )}
          </div>
        </CardContent>
      </Link>
      
      <div className="px-3 pb-3 flex flex-col gap-2 mt-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs border-gray-300"
          onClick={handleAddToCart}
          disabled={product.inStock === false}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          Add
        </Button>
        <Button 
          size="sm" 
          className="w-full bg-green-600 hover:bg-green-700 text-xs"
          onClick={handleBuyNow}
          disabled={product.inStock === false}
        >
          Buy
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;