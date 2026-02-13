import React from 'react';
import { Heart, ShoppingCart, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';

const WishlistSection: React.FC = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, category: item.category });
    toast({ title: "Added to cart!", description: `${item.name} added.` });
  };

  const handleBuyNow = (item: typeof wishlistItems[0]) => {
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, category: item.category });
    navigate('/checkout');
  };

  return (
    <div className="bg-card border rounded-xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        <h2 className="text-xl font-bold text-foreground">My Wishlist</h2>
        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-sm">{wishlistItems.length}</span>
      </div>
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg font-bold text-foreground mb-1">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mb-4">Save items you like by clicking the heart icon</p>
          <Link to="/products"><Button>Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {wishlistItems.map(item => (
            <Card key={item.id} className="group">
              <CardContent className="p-4">
                <Link to={`/product/${item.id}`}>
                  <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                    <img src={item.image || '/placeholder.svg'} alt={item.name} onError={e => { e.currentTarget.src = '/placeholder.svg'; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                </Link>
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm">{item.name}</h3>
                <p className="text-base font-bold text-primary mb-3">₹{item.price.toLocaleString()}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => handleAddToCart(item)}>
                    <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { removeFromWishlist(item.id); toast({ title: "Removed from wishlist" }); }} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="sm" variant="secondary" className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleBuyNow(item)}>
                  <Zap className="h-4 w-4 mr-1" /> Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistSection;
