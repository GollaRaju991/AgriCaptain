
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddressSection from '@/components/checkout/AddressSection';
import PaymentMethodsSection from '@/components/checkout/PaymentMethodsSection';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useScrollToTop from '@/hooks/useScrollToTop';
import { supabase } from '@/integrations/supabase/client';
import { dualBackendService } from '@/services/dualBackendService';

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
  
  // COD advance payment state
  const [codAdvancePaid, setCodAdvancePaid] = useState(false);
  const [codPaymentMethod, setCodPaymentMethod] = useState('');
  const [codPaymentProcessing, setCodPaymentProcessing] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // COD constants
  const COD_ADVANCE_AMOUNT = 99;

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

  const handleCodAdvancePayment = async (method: string) => {
    setCodPaymentProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCodPaymentMethod(method);
    setCodAdvancePaid(true);
    setCodPaymentProcessing(false);
    
    toast({
      title: "Advance Payment Successful!",
      description: `₹${COD_ADVANCE_AMOUNT} paid via ${method}. Remaining ₹${Math.max(0, finalTotal - COD_ADVANCE_AMOUNT)} will be collected on delivery.`,
    });
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
          quantity: item.quantity
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

  const handlePayment = async () => {
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

    // Validation for different payment methods
    if (paymentMethod === 'upi' && !upiId) {
      toast({
        title: "Enter UPI ID",
        description: "Please enter your UPI ID",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv || !nameOnCard)) {
      toast({
        title: "Complete card details",
        description: "Please fill in all card details",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'netbanking' && !selectedBank) {
      toast({
        title: "Select Bank",
        description: "Please select your bank for Net Banking",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'emi' && !selectedEMI) {
      toast({
        title: "Select EMI Option",
        description: "Please select an EMI option",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderDetails = {
        orderNumber: '#AG' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
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
        : `Order placed successfully! Payment will be processed using ${paymentMethod.toUpperCase()}`;

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
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading...</span>
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">Add some products to continue</p>
          <button 
            onClick={() => navigate('/products')} 
            className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded hover:bg-blue-700 text-sm md:text-base"
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
          <h1 className="text-2xl md:text-3xl font-bold">Complete Payment</h1>
          <div className="flex items-center text-green-600">
            <Shield className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span className="text-xs md:text-sm font-medium">100% Secure</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <AddressSection
              addresses={addresses}
              selectedAddress={selectedAddress}
              addressesLoading={addressesLoading}
              onAddressSelect={handleAddressSelect}
              onAddressRefresh={loadAddresses}
            />

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
              codAdvancePaid={codAdvancePaid}
              onCodAdvancePayment={handleCodAdvancePayment}
              codPaymentProcessing={codPaymentProcessing}
            />
          </div>

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
            codAdvancePaid={codAdvancePaid}
            codAdvanceAmount={COD_ADVANCE_AMOUNT}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
