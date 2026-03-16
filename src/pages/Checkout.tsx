
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddressSection from '@/components/checkout/AddressSection';
import PaymentMethodsSection from '@/components/checkout/PaymentMethodsSection';
import OrderSummary from '@/components/checkout/OrderSummary';
import PaymentProcessingDialog from '@/components/checkout/PaymentProcessingDialog';
import MobileCheckoutFlow from '@/components/checkout/MobileCheckoutFlow';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Package, Truck, Receipt, CheckCircle, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useScrollToTop from '@/hooks/useScrollToTop';
import { supabase } from '@/integrations/supabase/client';
import { dualBackendService } from '@/services/dualBackendService';
import { useIsMobile } from '@/hooks/use-mobile';


interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  address_type: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const { user, session, loading: authLoading, setRedirectAfterLogin } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Address state
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedEMI, setSelectedEMI] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  
  // Payment processing dialog state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // COD state
  const [showCodSuccess, setShowCodSuccess] = useState(false);
  const [codOrderNumber, setCodOrderNumber] = useState('');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Submission guard
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing calculations
  const deliveryFee = 0;
  const platformFee = 0;
  const handlingFee = 0;
  const upiDiscount = (paymentMethod === 'upi' && upiId.trim()) ? Math.round(totalPrice * 0.1) : 0;
  const couponDiscount = appliedCoupon === 'WELCOME50' ? 50 : appliedCoupon === 'SAVE10' ? 20 : appliedCoupon === 'FIRST20' ? 20 : 0;
  const finalTotal = Math.max(0, totalPrice + deliveryFee + platformFee + handlingFee - upiDiscount - couponDiscount);

  useScrollToTop();

  // Handle authentication requirement
  useEffect(() => {
    if (!authLoading && !user && !session) {
      console.log('User not authenticated, redirecting to auth');
      setRedirectAfterLogin('/checkout');
      navigate('/auth');
    }
  }, [user, session, authLoading, setRedirectAfterLogin, navigate]);

  // Load addresses when user is authenticated
  useEffect(() => {
    if (!authLoading && user && session) {
      console.log('User authenticated, loading addresses');
      loadAddresses();
    }
  }, [user, session, authLoading]);

  const loadAddresses = async () => {
    if (!user || !session) {
      console.log('No authenticated user, skipping address load');
      return;
    }

    setAddressesLoading(true);
    console.log('Loading addresses for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      console.log('Addresses query result:', { data, error, count: data?.length });

      if (error) {
        console.error('Error loading addresses:', error);
        toast({
          title: "Error loading addresses",
          description: error.message || "Please try again or add a new address",
          variant: "destructive",
        });
        setAddresses([]);
      } else {
        console.log('Successfully loaded addresses:', data?.length || 0);
        setAddresses(data || []);
        
        // Auto-select default address or first address
        if (data && data.length > 0) {
          const defaultAddress = data.find(addr => addr.is_default) || data[0];
          console.log('Auto-selecting address:', defaultAddress);
          setSelectedAddress(defaultAddress);
        } else {
          setSelectedAddress(null);
        }
      }
    } catch (error) {
      console.error('Exception loading addresses:', error);
      toast({
        title: "Error loading addresses",
        description: "Something went wrong while loading addresses",
        variant: "destructive",
      });
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleAddressSelect = (address: Address) => {
    console.log('Address selected:', address);
    setSelectedAddress(address);
  };

  const handleCouponApply = () => {
    const validCoupons = ['SAVE10', 'FIRST20', 'UPI10', 'WELCOME50'];
    if (validCoupons.includes(couponCode.toUpperCase())) {
      setAppliedCoupon(couponCode.toUpperCase());
      toast({
        title: "Coupon Applied!",
        description: `You saved ₹${couponCode.toUpperCase() === 'WELCOME50' ? 50 : 20} with coupon ${couponCode.toUpperCase()}`,
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "Please enter a valid coupon code",
        variant: "destructive",
      });
    }
  };


  const saveOrderToDatabase = async (orderDetails: any) => {
    try {
      const dualOrderData = {
        orderId: orderDetails.orderNumber,
        userId: user?.id || '',
        customerData: {
          name: user?.name || selectedAddress?.name || '',
          email: user?.email || '',
          phone: user?.phone || selectedAddress?.phone || ''
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: finalTotal,
        paymentMethod: paymentMethod,
        address: selectedAddress
      };

      const result = await dualBackendService.saveOrderDual(dualOrderData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  };

  const getPaymentDetail = () => {
    if (paymentMethod === 'upi') return selectedUpiApp ? `UPI - ${selectedUpiApp}` : `UPI: ${upiId}`;
    if (paymentMethod === 'card') return `Card ending ****${cardNumber.replace(/\s/g, '').slice(-4)}`;
    if (paymentMethod === 'netbanking') return `Net Banking: ${selectedBank.toUpperCase()}`;
    if (paymentMethod === 'emi') return `EMI: ${selectedEMI}`;
    if (paymentMethod === 'cod') return 'Cash on Delivery';
    return '';
  };

  const handlePayment = async () => {
    if (isSubmitting) return;

    if (!user || !session) {
      toast({
        title: "Please login",
        description: "You need to be logged in to place an order",
        variant: "destructive",
      });
      setRedirectAfterLogin('/checkout');
      navigate('/auth');
      return;
    }

    if (!selectedAddress) {
      toast({
        title: "Add delivery address",
        description: "Please add or select a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Select payment method",
        description: "Please select a payment method to continue",
        variant: "destructive",
      });
      return;
    }

    // Validation for UPI
    if (paymentMethod === 'upi') {
      if (!selectedUpiApp && !upiId) {
        toast({ title: "Select UPI app or enter UPI ID", variant: "destructive" });
        return;
      }
      if (upiId && !selectedUpiApp) {
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
        if (!upiRegex.test(upiId)) {
          toast({ title: "Invalid UPI ID", description: "Enter a valid UPI ID like name@bank", variant: "destructive" });
          return;
        }
      }
    }

    // Validation for card
    if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv || !nameOnCard)) {
      toast({ title: "Complete card details", description: "Please fill in all card details", variant: "destructive" });
      return;
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 19 || !/^\d+$/.test(cleanCard)) {
        toast({ title: "Invalid card number", description: "Please enter a valid card number", variant: "destructive" });
        return;
      }
      if (!/^\d{2}\s?\/\s?\d{2}$/.test(expiryDate)) {
        toast({ title: "Invalid expiry", description: "Use MM/YY format", variant: "destructive" });
        return;
      }
      if (cvv.length < 3) {
        toast({ title: "Invalid CVV", description: "CVV must be 3-4 digits", variant: "destructive" });
        return;
      }
    }

    if (paymentMethod === 'netbanking' && !selectedBank) {
      toast({ title: "Select Bank", description: "Please select your bank for Net Banking", variant: "destructive" });
      return;
    }

    if (paymentMethod === 'emi' && !selectedEMI) {
      toast({ title: "Select EMI Option", description: "Please select an EMI option", variant: "destructive" });
      return;
    }

    // For COD, skip payment dialog — place order directly with success popup
    if (paymentMethod === 'cod') {
      setIsSubmitting(true);
      const orderNum = '#AG' + crypto.randomUUID().replace(/-/g, '').substring(0, 9).toUpperCase();
      setCodOrderNumber(orderNum);
      try {
        const orderDetails = {
          orderNumber: orderNum,
          date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
          items: items.map(item => ({ name: item.name, quantity: item.quantity, price: item.price, image: item.image })),
          shippingAddress: selectedAddress,
          paymentSummary: { subtotal: totalPrice, delivery: deliveryFee, discount: upiDiscount + couponDiscount, total: finalTotal },
          paymentMethod: 'Cash on Delivery'
        };
        await saveOrderToDatabase(orderDetails);
        setShowCodSuccess(true);
        setTimeout(() => {
          clearCart();
          navigate('/orders');
        }, 5000);
      } catch (error: any) {
        toast({ title: "Order failed", description: error?.message || "Please try again.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Show payment processing dialog for all online methods
    setShowPaymentDialog(true);
  };

  const completeOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const orderDetails = {
        orderNumber: '#AG' + crypto.randomUUID().replace(/-/g, '').substring(0, 9).toUpperCase(),
        date: new Date().toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        shippingAddress: selectedAddress,
        paymentSummary: {
          subtotal: totalPrice,
          delivery: deliveryFee,
          discount: upiDiscount + couponDiscount,
          total: finalTotal
        },
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()
      };

      await saveOrderToDatabase(orderDetails);

      const paymentMessage = paymentMethod === 'cod' 
        ? "Order placed successfully! You can pay when your order is delivered."
        : `Order placed successfully! Payment of ₹${finalTotal} processed via ${paymentMethod.toUpperCase()}`;

      toast({
        title: "Order placed successfully!",
        description: paymentMessage,
      });

      clearCart();
      navigate('/order-confirmation', { state: { orderDetails } });
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMobileCompleteOrder = async (mobilePaymentMethod: string, paymentDetails: any) => {
    const orderDetails = {
      orderNumber: '#AG' + crypto.randomUUID().replace(/-/g, '').substring(0, 9).toUpperCase(),
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: items.map(item => ({ name: item.name, quantity: item.quantity, price: item.price, image: item.image })),
      shippingAddress: selectedAddress,
      paymentSummary: { subtotal: totalPrice, delivery: deliveryFee, discount: upiDiscount + couponDiscount, total: finalTotal },
      paymentMethod: mobilePaymentMethod === 'cod' ? 'Cash on Delivery' : mobilePaymentMethod.toUpperCase()
    };
    await saveOrderToDatabase(orderDetails);
    // Don't clear cart immediately - let the success popup show first
    // Cart will be cleared after navigation
    setTimeout(() => clearCart(), 6000);
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user || !session) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">Add some products to continue</p>
          <button 
            onClick={() => navigate('/products')} 
            className="bg-brand-green text-white px-4 md:px-6 py-2 rounded hover:bg-brand-green/90 text-sm md:text-base"
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Mobile checkout flow
  if (isMobile) {
    return (
      <MobileCheckoutFlow
        items={items}
        totalPrice={totalPrice}
        finalTotal={finalTotal}
        upiDiscount={upiDiscount}
        couponDiscount={couponDiscount}
        deliveryFee={deliveryFee}
        addresses={addresses}
        selectedAddress={selectedAddress}
        addressesLoading={addressesLoading}
        onAddressSelect={handleAddressSelect}
        onAddressRefresh={loadAddresses}
        onCompleteOrder={handleMobileCompleteOrder}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        appliedCoupon={appliedCoupon}
        onCouponApply={handleCouponApply}
      />
    );
  }

  const expectedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
  const discount = upiDiscount + couponDiscount;

  return (
    <div className="min-h-screen bg-muted/50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Payment Details</h1>
          <div className="flex items-center gap-2 text-brand-green">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold">100% Secure</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. DELIVERY ADDRESS */}
            <AddressSection
              addresses={addresses}
              selectedAddress={selectedAddress}
              addressesLoading={addressesLoading}
              onAddressSelect={handleAddressSelect}
              onAddressRefresh={loadAddresses}
            />

            {/* 2. ORDER DETAILS */}
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border/30 flex items-center gap-3">
                <Package className="h-5 w-5 text-brand-green" />
                <h2 className="text-base lg:text-lg font-bold text-foreground">Order Details</h2>
              </div>
              <div className="divide-y divide-border/30">
                {items.map((item, idx) => (
                  <div key={idx} className="p-5 flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl object-cover bg-muted border border-border/30" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm lg:text-base font-medium text-foreground line-clamp-2">{item.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      <p className="text-base lg:text-lg font-bold text-foreground mt-1.5">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Delivery info */}
              <div className="px-6 py-4 bg-brand-green/5 flex items-center gap-4 border-t border-border/30">
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-sm border border-border/30">
                  <Truck className="h-5 w-5 text-brand-green" />
                </div>
                <div className="flex-1">
                  <p className="text-xs lg:text-sm text-muted-foreground">Expected Delivery</p>
                  <p className="text-sm lg:text-base font-semibold text-foreground">{expectedDelivery}</p>
                </div>
                <span className="text-sm font-bold text-brand-green">FREE</span>
              </div>
            </div>

            {/* 3. INVOICE DETAILS */}
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border/30 flex items-center gap-3">
                <Receipt className="h-5 w-5 text-brand-green" />
                <h2 className="text-base lg:text-lg font-bold text-foreground">Invoice Details</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm lg:text-base">
                  <span className="text-muted-foreground">Items Total ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span className="text-foreground font-medium">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm lg:text-base">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-brand-green font-medium">Free</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-brand-green font-medium">−₹{discount.toLocaleString()}</span>
                  </div>
                )}
                {/* Coupon */}
                <div className="pt-1 pb-1">
                  <div className="flex gap-2">
                    <input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                    <button onClick={handleCouponApply} className="text-sm font-semibold text-brand-green px-5 h-10 border border-brand-green rounded-lg hover:bg-brand-green/5 transition-colors">
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="bg-brand-green/5 rounded-lg p-3 mt-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span className="text-sm text-brand-green font-medium">{appliedCoupon} applied — saved ₹{couponDiscount}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                  <span className="text-base lg:text-lg font-bold text-foreground">Total Amount</span>
                  <span className="text-xl lg:text-2xl font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 4. PAYMENT METHODS */}
            <PaymentMethodsSection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              upiId={upiId}
              setUpiId={setUpiId}
              cardNumber={cardNumber}
              setCardNumber={setCardNumber}
              expiryDate={expiryDate}
              setExpiryDate={setExpiryDate}
              cvv={cvv}
              setCvv={setCvv}
              nameOnCard={nameOnCard}
              setNameOnCard={setNameOnCard}
              selectedBank={selectedBank}
              setSelectedBank={setSelectedBank}
              selectedEMI={selectedEMI}
              setSelectedEMI={setSelectedEMI}
              finalTotal={finalTotal}
              codAdvancePaid={false}
              onCodAdvancePayment={async () => {}}
              codPaymentProcessing={false}
              onPayment={handlePayment}
              selectedUpiApp={selectedUpiApp}
              onUpiAppSelect={setSelectedUpiApp}
            />
          </div>

          {/* RIGHT COLUMN - Summary */}
          <div className="space-y-5">
            <OrderSummary
              items={items}
              totalPrice={totalPrice}
              upiDiscount={upiDiscount}
              couponDiscount={couponDiscount}
              finalTotal={finalTotal}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedCoupon={appliedCoupon}
              paymentMethod={paymentMethod}
              selectedAddress={selectedAddress}
              onCouponApply={handleCouponApply}
              onPayment={handlePayment}
              codAdvancePaid={false}
              codAdvanceAmount={0}
            />
          </div>
        </div>
      </div>

      <Footer />

      <PaymentProcessingDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        paymentMethod={paymentMethod}
        amount={finalTotal}
        paymentDetail={getPaymentDetail()}
        onSuccess={() => {
          setShowPaymentDialog(false);
          completeOrder();
        }}
        onRetry={() => {
          setShowPaymentDialog(false);
          setTimeout(() => setShowPaymentDialog(true), 300);
        }}
      />

      {/* COD Order Success Popup */}
      {showCodSuccess && (
        <CodSuccessPopup
          orderNumber={codOrderNumber}
          finalTotal={finalTotal}
          onNavigate={(path) => {
            clearCart();
            navigate(path);
          }}
        />
      )}

    </div>
  );
};

// COD Success Popup with auto-close
const CodSuccessPopup: React.FC<{
  orderNumber: string;
  finalTotal: number;
  onNavigate: (path: string) => void;
}> = ({ orderNumber, finalTotal, onNavigate }) => {
  const [countdown, setCountdown] = useState(5);
  const expectedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onNavigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onNavigate]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto">
          <Shield className="h-12 w-12 text-brand-green" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order Placed Successfully!</h2>
          <p className="text-sm text-muted-foreground mt-2">Your order has been confirmed. Pay on delivery.</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-semibold text-foreground">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount to Pay</span>
              <span className="font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected Delivery</span>
              <span className="font-semibold text-foreground">{expectedDelivery}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Redirecting to orders in {countdown}s...</p>
        <div className="space-y-3 pt-2">
          <button
            onClick={() => onNavigate('/orders')}
            className="w-full h-11 bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl"
          >
            Order Details
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="w-full h-11 border border-brand-green text-brand-green font-semibold rounded-xl"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
