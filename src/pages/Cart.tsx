
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { translateProductName } from '@/data/translations';
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
  const { language, translations } = useLanguage();
  const navigate = useNavigate();

  const deliveryCharges = 0;
  const platformCharges = 0;
  const discountAmount = Math.round(totalPrice * 0.05);
  const upiDiscount = Math.round(totalPrice * 0.1);
  const totalAfterDiscount = totalPrice - discountAmount;
  const totalWithUPI = totalAfterDiscount - upiDiscount;

  const handleCheckoutClick = () => {
    if (user) {
      navigate('/checkout');
      window.scrollTo(0, 0);
    } else {
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
            <h2 className="text-2xl font-bold text-foreground mb-4">{translations.your_cart_empty}</h2>
            <p className="text-muted-foreground mb-8">{translations.cart_empty_desc}</p>
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
      {/* Desktop header */}
      <div className="hidden lg:block">
        <Header />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex flex-col pb-20">
        {/* Mobile Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{translations.shopping_cart}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="border-green-600 text-green-700 font-semibold rounded-lg"
          >
            {translations.clear_cart || 'Clear'}
          </Button>
        </div>

        <div className="flex-1 px-4 space-y-4 overflow-y-auto">
          {/* Cart Items */}
          {items.map((item) => (
            <Card key={item.id} className="border border-gray-200 rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-contain rounded-lg bg-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-foreground">{translateProductName(item.name, language)}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">₹{item.price}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-lg font-bold text-foreground hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-10 h-10 flex items-center justify-center text-base font-semibold border-x border-gray-300">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-lg font-bold text-foreground hover:bg-gray-100"
                    >
                      +
                    </button>
                    <span className="bg-green-700 text-white font-bold px-4 h-10 flex items-center justify-center text-base rounded-r-lg">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-red-600 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Order Summary */}
          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-xl font-bold text-foreground mb-4">{translations.order_summary}</h3>
              <div className="space-y-3 text-base">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{translations.subtotal}</span>
                  <span className="font-semibold text-foreground">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{translations.delivery_charges || 'Delivery'}</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{translations.platform_charges || 'Platform Fee'}</span>
                  <span className="font-semibold text-foreground">₹{platformCharges}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">{translations.discount_amount || 'Discount'}</span>
                  <span className="font-semibold">-₹{discountAmount}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">{translations.upi_discount || 'UPI Discount (10%)'}</span>
                  <span className="font-semibold">-₹{upiDiscount}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-xl font-bold text-foreground">
                  <span>{translations.total || 'Total Amount'}</span>
                  <span>₹{totalAfterDiscount}</span>
                </div>
              </div>

              <div className="mt-4 bg-green-700 text-white rounded-xl py-3 px-4 text-center font-semibold text-base">
                {translations.with_upi || 'With UPI'}: <span className="text-lg font-bold">₹{totalWithUPI}</span>
              </div>
            </CardContent>
          </Card>

          {/* Coupon Section */}
          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-foreground">{translations.have_coupon}</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder={translations.enter_coupon}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <Button variant="outline" className="border-green-600 text-green-700 font-semibold">{translations.apply}</Button>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{translations.available_coupons}</p>
                <p className="text-green-600">• SAVE10 - 10% off on orders above ₹1000</p>
                <p className="text-green-600">• FIRST20 - 20% off for first time buyers</p>
                <p className="text-green-600">• UPI10 - Extra 10% off with UPI payment</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50 safe-area-bottom">
          {user ? (
            <Button
              className="w-full h-12 text-base font-semibold rounded-xl bg-green-700 hover:bg-green-800 text-white"
              onClick={handleCheckoutClick}
            >
              {translations.checkout || 'Checkout'}
            </Button>
          ) : (
            <>
              <Link to="/products" className="flex-1">
                <Button variant="outline" className="w-full h-12 text-base font-semibold rounded-xl border-gray-300">
                  {translations.continue_shopping}
                </Button>
              </Link>
              <Button
                className="flex-1 h-12 text-base font-semibold rounded-xl bg-green-700 hover:bg-green-800 text-white"
                onClick={handleCheckoutClick}
              >
                {translations.login_to_checkout || 'Login to Checkout'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">{translations.shopping_cart}</h1>
          <Button variant="outline" onClick={clearCart}>{translations.clear_cart}</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{translateProductName(item.name, language)}</h3>
                      <p className="text-muted-foreground capitalize">{item.category}</p>
                      <p className="text-green-600 font-bold">₹{item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{item.price * item.quantity}</p>
                      <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{translations.tax}</span>
                    <span>{translations.tax_at_checkout}</span>
                  </div>
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{translations.total}</span>
                    <span>₹{totalAfterDiscount}</span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    {translations.with_upi}: ₹{totalWithUPI}
                  </div>
                </div>
                <Button className="w-full mb-4" onClick={handleCheckoutClick}>
                  {user ? translations.checkout : translations.login_to_checkout}
                </Button>
                {!user && (
                  <p className="text-sm text-muted-foreground text-center mb-4">{translations.login_to_proceed}</p>
                )}
                <Link to="/products">
                  <Button variant="outline" className="w-full">{translations.continue_shopping}</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">{translations.have_coupon}</h4>
                <div className="flex space-x-2">
                  <input type="text" placeholder={translations.enter_coupon} className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <Button variant="outline">{translations.apply}</Button>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>{translations.available_coupons}</p>
                  <p className="text-green-600">• SAVE10 - 10% off on orders above ₹1000</p>
                  <p className="text-green-600">• FIRST20 - 20% off for first time buyers</p>
                  <p className="text-green-600">• UPI10 - Extra 10% off with UPI payment</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default Cart;
