
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from '@/contexts/LanguageContext';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user, setRedirectAfterLogin } = useAuth();
  const { translations } = useLanguage();
  const navigate = useNavigate();

  const deliveryCharges = 0;
  const platformCharges = 0;
  const discountAmount = Math.round(totalPrice * 0.05); // 5% general discount
  const upiDiscount = Math.round(totalPrice * 0.1); // 10% UPI discount

  const handleCheckoutClick = () => {
    if (user) {
      navigate('/checkout');
      window.scrollTo(0, 0);
    } else {
      // Set redirect path to checkout after login
      setRedirectAfterLogin('/checkout');
      navigate('/auth');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/products">
              <Button>{translations.continue_shopping}</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{translations.shopping_cart}</h1>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600 capitalize">{item.category}</p>
                      <p className="text-green-600 font-bold">₹{item.price}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold">₹{item.price * item.quantity}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">{translations.order_summary}</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span>{translations.subtotal} ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{translations.delivery_charges}</span>
                    <span className="text-green-600">₹{deliveryCharges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{translations.platform_charges}</span>
                    <span className="text-green-600">₹{platformCharges}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>{translations.discount_amount}</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>{translations.upi_discount}</span>
                    <span>-₹{upiDiscount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{translations.total}</span>
                    <span>₹{totalPrice - discountAmount}</span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    With UPI: ₹{totalPrice - discountAmount - upiDiscount}
                  </div>
                </div>
                
                <Button 
                  className="w-full mb-4" 
                  onClick={handleCheckoutClick}
                >
                  {user ? translations.checkout : 'Login to Checkout'}
                </Button>
                
                {!user && (
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Please login to proceed with your order
                  </p>
                )}
                
                <Link to="/products">
                  <Button variant="outline" className="w-full">
                    {translations.continue_shopping}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Coupon Section */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">Have a Coupon?</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Button variant="outline">Apply</Button>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>Available Coupons:</p>
                  <p className="text-green-600">• SAVE10 - 10% off on orders above ₹1000</p>
                  <p className="text-green-600">• FIRST20 - 20% off for first time buyers</p>
                  <p className="text-green-600">• UPI10 - Extra 10% off with UPI payment</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
<MobileBottomNav />

      <Footer />
    </div>
  );
};

export default Cart;
