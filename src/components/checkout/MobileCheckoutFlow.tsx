import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ChevronRight, Plus, Smartphone, CreditCard, Truck, CheckCircle, XCircle, Lock, Loader2, ChevronDown, ChevronUp, HelpCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import AddressManager from '@/components/AddressManager';
import CODAdvancePayment from '@/components/checkout/CODAdvancePayment';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Google Pay icon
const GooglePayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/>
  </svg>
);

// PhonePe icon
const PhonePeIcon = () => (
  <div className="h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
    <span className="text-white text-[10px] font-bold">P</span>
  </div>
);

// Paytm icon
const PaytmIcon = () => (
  <div className="h-5 w-5 bg-blue-500 rounded flex items-center justify-center">
    <span className="text-white text-[8px] font-bold">PT</span>
  </div>
);

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

interface SavedCard {
  id: string;
  card_number_last4: string;
  card_holder_name: string;
  card_type: string;
  bank_name: string | null;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

interface MobileCheckoutFlowProps {
  items: any[];
  totalPrice: number;
  finalTotal: number;
  upiDiscount: number;
  couponDiscount: number;
  deliveryFee: number;
  addresses: Address[];
  selectedAddress: Address | null;
  addressesLoading: boolean;
  onAddressSelect: (address: Address) => void;
  onAddressRefresh: () => void;
  onCompleteOrder: (paymentMethod: string, paymentDetails: any) => Promise<void>;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: string | null;
  onCouponApply: () => void;
}

type CheckoutStep = 'address' | 'summary' | 'payment' | 'processing' | 'success' | 'failed';

const COD_ADVANCE_AMOUNT = 99;

const MobileCheckoutFlow: React.FC<MobileCheckoutFlowProps> = ({
  items,
  totalPrice,
  finalTotal,
  upiDiscount,
  couponDiscount,
  deliveryFee,
  addresses,
  selectedAddress,
  addressesLoading,
  onAddressSelect,
  onAddressRefresh,
  onCompleteOrder,
  couponCode,
  setCouponCode,
  appliedCoupon,
  onCouponApply,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<CheckoutStep>('address');
  const [showAddressManager, setShowAddressManager] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState('');
  const [savedCardCvv, setSavedCardCvv] = useState('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [codAdvancePaid, setCodAdvancePaid] = useState(false);
  const [codPaymentProcessing, setCodPaymentProcessing] = useState(false);

  // Processing state
  const [processingStep, setProcessingStep] = useState(0);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (user) fetchSavedCards();
  }, [user]);

  const fetchSavedCards = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('saved_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    if (data) setSavedCards(data as SavedCard[]);
  };

  const handleCodAdvancePayment = async (method: string) => {
    setCodPaymentProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCodAdvancePaid(true);
    setCodPaymentProcessing(false);
    toast({ title: "Advance Payment Successful!", description: `₹${COD_ADVANCE_AMOUNT} paid via ${method}.` });
  };

  const handlePay = async () => {
    // Validations
    if (paymentMethod === 'upi' && !selectedUpiApp && !upiVerified) {
      toast({ title: "Select UPI app or verify UPI ID", variant: "destructive" });
      return;
    }
    if (paymentMethod === 'card') {
      if (selectedSavedCard) {
        if (savedCardCvv.length < 3) {
          toast({ title: "Enter CVV", description: "Please enter your card CVV", variant: "destructive" });
          return;
        }
      } else if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
        toast({ title: "Complete card details", variant: "destructive" });
        return;
      }
    }
    if (paymentMethod === 'cod' && !codAdvancePaid) {
      toast({ title: "Complete advance payment", description: `Pay ₹${COD_ADVANCE_AMOUNT} to proceed`, variant: "destructive" });
      return;
    }

    // Start processing
    setStep('processing');
    setProcessingStep(0);

    const steps = paymentMethod === 'upi' ? 4 : paymentMethod === 'card' ? 4 : 3;
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setProcessingStep(i + 1);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // 90% success rate
    const success = Math.random() > 0.1;
    if (success) {
      const orderNum = '#AG' + crypto.randomUUID().replace(/-/g, '').substring(0, 9).toUpperCase();
      setOrderNumber(orderNum);
      try {
        await onCompleteOrder(paymentMethod, { upiId, cardNumber, selectedUpiApp });
        setStep('success');
      } catch {
        setStep('failed');
      }
    } else {
      setStep('failed');
    }
  };

  const getProcessingSteps = () => {
    if (paymentMethod === 'upi') return ['Sending payment request...', 'Waiting for approval...', 'Verifying transaction...', 'Payment confirmed!'];
    if (paymentMethod === 'card') return ['Encrypting card details...', 'Contacting bank...', 'Processing transaction...', 'Payment confirmed!'];
    return ['Processing payment...', 'Verifying details...', 'Payment confirmed!'];
  };

  const expectedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  // Header
  const renderHeader = (title: string, onBack?: () => void) => (
    <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      )}
      <h1 className="text-base font-semibold text-foreground flex-1">{title}</h1>
      <div className="flex items-center gap-1 text-brand-green">
        <Lock className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Secure</span>
      </div>
    </div>
  );

  // ── STEP 1: ADDRESS ──
  if (step === 'address') {
    if (showAddressManager) {
      return (
        <div className="min-h-screen bg-white">
          {renderHeader('Add Address', () => setShowAddressManager(false))}
          <div className="p-4">
            <AddressManager
              onAddressSelect={(addr: Address) => {
                onAddressSelect(addr);
                onAddressRefresh();
                setShowAddressManager(false);
              }}
              selectedAddressId={selectedAddress?.id}
              onClose={() => setShowAddressManager(false)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        {renderHeader('Checkout', () => navigate(-1))}

        <div className="p-4 space-y-3">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="bg-brand-green text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">1</span>
            <span className="font-medium text-foreground">Delivery Address</span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground">2. Summary</span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground">3. Payment</span>
          </div>

          <h2 className="text-lg font-bold text-foreground">Delivery Address</h2>

          {addressesLoading ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-brand-green mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading addresses...</p>
            </div>
          ) : selectedAddress ? (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-brand-green" />
                    <span className="font-semibold text-sm text-foreground">{selectedAddress.name}</span>
                    <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full capitalize">{selectedAddress.address_type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{selectedAddress.phone}</p>
                  <p className="text-xs text-muted-foreground ml-6 mt-1 leading-relaxed">
                    {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressManager(true)}
                  className="text-xs font-semibold text-brand-green px-3 py-1 border border-brand-green rounded-lg"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No address selected</p>
            </div>
          )}

          {/* Other addresses */}
          {addresses.filter(a => a.id !== selectedAddress?.id).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Other Addresses</p>
              {addresses.filter(a => a.id !== selectedAddress?.id).map(addr => (
                <button
                  key={addr.id}
                  onClick={() => onAddressSelect(addr)}
                  className="w-full bg-white rounded-xl p-3 shadow-sm border border-border text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground">{addr.name}</span>
                      <p className="text-xs text-muted-foreground truncate">{addr.address}, {addr.city}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowAddressManager(true)}
            className="w-full bg-white rounded-xl p-3 shadow-sm border border-dashed border-brand-green text-brand-green font-medium text-sm flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>
        </div>

        {/* Bottom bar */}
        {selectedAddress && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{items.length} item{items.length > 1 ? 's' : ''}</span>
              <span className="text-lg font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
            </div>
            <Button
              onClick={() => setStep('summary')}
              className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-white font-semibold text-sm rounded-xl"
            >
              Continue to Order Summary
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── STEP 2: ORDER SUMMARY ──
  if (step === 'summary') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] pb-32">
        {renderHeader('Order Summary', () => setStep('address'))}

        <div className="p-4 space-y-3">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="bg-brand-green/20 text-brand-green rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✓</span>
            <span className="text-muted-foreground">Address</span>
            <div className="flex-1 h-px bg-brand-green" />
            <span className="bg-brand-green text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">2</span>
            <span className="font-medium text-foreground">Summary</span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground">3. Payment</span>
          </div>

          <h2 className="text-lg font-bold text-foreground">Order Summary</h2>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 flex gap-3">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                  <p className="text-sm font-bold text-foreground mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery info */}
          <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-green/10 rounded-full flex items-center justify-center">
              <Truck className="h-4 w-4 text-brand-green" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Estimated Delivery</p>
              <p className="text-sm font-semibold text-foreground">{expectedDelivery}</p>
            </div>
            <span className="text-xs text-brand-green font-medium">FREE</span>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 h-9 text-sm rounded-lg"
              />
              <Button variant="outline" size="sm" onClick={onCouponApply} className="text-brand-green border-brand-green text-xs h-9 rounded-lg">
                Apply
              </Button>
            </div>
            {appliedCoupon && (
              <div className="bg-brand-green/5 rounded-lg p-2 mt-2 flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-brand-green" />
                <span className="text-xs text-brand-green font-medium">{appliedCoupon} applied — saved ₹{couponDiscount}</span>
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price Details</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items Total ({items.length})</span>
              <span className="text-foreground">₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-brand-green font-medium">FREE</span>
            </div>
            {upiDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">UPI Discount</span>
                <span className="text-brand-green">−₹{upiDiscount}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coupon Discount</span>
                <span className="text-brand-green">−₹{couponDiscount}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between">
              <span className="text-sm font-bold text-foreground">Total Amount</span>
              <span className="text-lg font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-20">
          <Button
            onClick={() => setStep('payment')}
            className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-white font-semibold text-sm rounded-xl"
          >
            Continue to Payment
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP 3: PAYMENT ──
  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] pb-28">
        {renderHeader('Payment Options', () => setStep('summary'))}

        <div className="px-4 pt-3 pb-2 bg-white border-b flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{items.length} item{items.length > 1 ? 's' : ''} · Total</span>
          <span className="text-base font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
        </div>

        <div className="p-4 space-y-3">
          <h2 className="text-base font-bold text-foreground">Select Payment Method</h2>

          {/* UPI */}
          <PaymentCard
            icon={<Smartphone className="h-5 w-5 text-brand-green" />}
            title="UPI"
            badge="Recommended"
            subtitle="Pay using UPI apps"
            isOpen={paymentMethod === 'upi'}
            onToggle={() => setPaymentMethod(paymentMethod === 'upi' ? '' : 'upi')}
          >
            <div className="space-y-2">
              {[
                { id: 'gpay', name: 'Google Pay', icon: <GooglePayIcon /> },
                { id: 'phonepe', name: 'PhonePe', icon: <PhonePeIcon /> },
                { id: 'paytm', name: 'Paytm', icon: <PaytmIcon /> },
              ].map(app => (
                <button
                  key={app.id}
                  onClick={() => { setSelectedUpiApp(app.id); setUpiId(''); setUpiVerified(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedUpiApp === app.id ? 'border-brand-green bg-brand-green/5' : 'border-border'
                  }`}
                >
                  {app.icon}
                  <span className="text-sm font-medium text-foreground flex-1 text-left">{app.name}</span>
                  {selectedUpiApp === app.id && <CheckCircle className="h-4 w-4 text-brand-green" />}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}

              <div className="border-t pt-3 mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Or enter UPI ID</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="name@ybl, name@paytm"
                    value={upiId}
                    onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); setSelectedUpiApp(''); }}
                    className="flex-1 h-9 text-sm rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs h-9 rounded-lg ${upiVerified ? 'text-brand-green border-brand-green' : 'text-brand-green border-brand-green'}`}
                    disabled={upiVerifying || !upiId.trim()}
                    onClick={() => {
                      const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
                      if (!upiRegex.test(upiId)) {
                        toast({ title: "Invalid UPI ID", description: "Format: name@bankname", variant: "destructive" });
                        return;
                      }
                      setUpiVerifying(true);
                      setTimeout(() => { setUpiVerifying(false); setUpiVerified(true); }, 1500);
                    }}
                  >
                    {upiVerifying ? <Loader2 className="h-3 w-3 animate-spin" /> : upiVerified ? '✓ Verified' : 'Verify'}
                  </Button>
                </div>
              </div>
            </div>
          </PaymentCard>

          {/* Card */}
          <PaymentCard
            icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
            title="Credit / Debit Card"
            subtitle="Secure card payment"
            isOpen={paymentMethod === 'card'}
            onToggle={() => setPaymentMethod(paymentMethod === 'card' ? '' : 'card')}
          >
            <div className="space-y-3">
              {/* Amount display */}
              <div className="bg-brand-green/5 rounded-lg p-3 text-center">
                <span className="text-xs text-muted-foreground">Pay</span>
                <p className="text-xl font-bold text-foreground">₹{finalTotal.toLocaleString()}</p>
              </div>

              {/* Saved cards */}
              {savedCards.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Saved Cards</p>
                  {savedCards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => { setSelectedSavedCard(card.id); setShowNewCardForm(false); setSavedCardCvv(''); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left ${
                        selectedSavedCard === card.id ? 'border-brand-green bg-brand-green/5' : 'border-border'
                      }`}
                    >
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">•••• {card.card_number_last4}</p>
                        <p className="text-xs text-muted-foreground">{card.card_holder_name} · {String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}</p>
                      </div>
                      {selectedSavedCard === card.id && <CheckCircle className="h-4 w-4 text-brand-green" />}
                    </button>
                  ))}
                  {selectedSavedCard && (
                    <div className="flex items-center gap-2 pl-1">
                      <div className="w-20">
                        <Label className="text-xs text-muted-foreground">CVV</Label>
                        <Input
                          type="password"
                          placeholder="•••"
                          value={savedCardCvv}
                          onChange={(e) => setSavedCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          maxLength={3}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* New card form */}
              {(savedCards.length === 0 || showNewCardForm) ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Card Number</Label>
                    <Input
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
                      }}
                      maxLength={19}
                      className="h-10 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Card Holder Name</Label>
                    <Input
                      placeholder="Name"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="h-10 text-sm mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Expiry Date</Label>
                      <Input
                        placeholder="MM / YY"
                        value={expiryDate}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^\d/]/g, '');
                          if (val.length === 2 && !val.includes('/') && expiryDate.length < val.length) val += '/';
                          if (val.length > 5) return;
                          const month = parseInt(val.substring(0, 2));
                          if (val.length >= 2 && (month < 1 || month > 12)) return;
                          setExpiryDate(val);
                        }}
                        maxLength={5}
                        className="h-10 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">CVV</Label>
                      <Input
                        type="password"
                        placeholder="***"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                        className="h-10 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="save-card-m" checked={saveNewCard} onCheckedChange={(c) => setSaveNewCard(!!c)} />
                    <Label htmlFor="save-card-m" className="text-xs text-muted-foreground">Save card for future</Label>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setShowNewCardForm(true); setSelectedSavedCard(''); }} className="text-xs text-brand-green font-medium">
                  + Add New Card
                </button>
              )}
            </div>
          </PaymentCard>

          {/* COD */}
          <PaymentCard
            icon={<Truck className="h-5 w-5 text-brand-green" />}
            title="Cash on Delivery"
            subtitle="Pay when order arrives"
            isOpen={paymentMethod === 'cod'}
            onToggle={() => setPaymentMethod(paymentMethod === 'cod' ? '' : 'cod')}
          >
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Pay ₹{COD_ADVANCE_AMOUNT} now, remaining ₹{Math.max(0, finalTotal - COD_ADVANCE_AMOUNT)} on delivery
              </p>
              {codAdvancePaid ? (
                <div className="bg-brand-green/5 p-3 rounded-lg">
                  <p className="text-sm text-brand-green font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Advance ₹{COD_ADVANCE_AMOUNT} paid!
                  </p>
                </div>
              ) : (
                <CODAdvancePayment
                  advanceAmount={COD_ADVANCE_AMOUNT}
                  onPaymentComplete={handleCodAdvancePayment}
                  isProcessing={codPaymentProcessing}
                />
              )}
            </div>
          </PaymentCard>
        </div>

        {/* Bottom pay bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
          </div>
          <Button
            onClick={handlePay}
            disabled={!paymentMethod}
            className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-white font-semibold text-sm rounded-xl disabled:opacity-50"
          >
            <Shield className="h-4 w-4 mr-2" />
            PAY SECURELY
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP 4: PROCESSING ──
  if (step === 'processing') {
    const pSteps = getProcessingSteps();
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-8 py-12 space-y-6">
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-brand-green/20" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-green border-t-transparent animate-spin" />
            <Smartphone className="h-6 w-6 text-brand-green" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Processing Payment</p>
            <p className="text-2xl font-bold text-brand-green mt-1">₹{finalTotal.toLocaleString()}</p>
          </div>
          <div className="space-y-2 text-left max-w-xs mx-auto">
            {pSteps.map((s, i) => (
              <div key={i} className={`flex items-center gap-2.5 text-sm transition-all duration-300 ${i < processingStep ? 'opacity-100' : i === processingStep ? 'opacity-100' : 'opacity-30'}`}>
                {i < processingStep ? (
                  <CheckCircle className="h-4 w-4 text-brand-green shrink-0" />
                ) : i === processingStep ? (
                  <Loader2 className="h-4 w-4 text-brand-green animate-spin shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                )}
                <span className={i <= processingStep ? 'text-foreground' : 'text-muted-foreground'}>{s}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Do not close or press back</p>
        </div>
      </div>
    );
  }

  // ── STEP 5: SUCCESS ──
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-8 py-12 space-y-6 max-w-sm mx-auto">
          <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
            <CheckCircle className="h-14 w-14 text-brand-green" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Payment Successful</h2>
            <div className="mt-4 space-y-1">
              <p className="text-sm text-muted-foreground">Order ID: <span className="font-semibold text-foreground">{orderNumber || 'AGR12345'}</span></p>
              <p className="text-sm text-muted-foreground">Amount Paid: <span className="font-bold text-foreground text-lg">₹{finalTotal.toLocaleString()}</span></p>
            </div>
          </div>

          <div className="bg-brand-green/5 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-brand-green shrink-0" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Expected Delivery</p>
              <p className="text-sm font-bold text-foreground">{expectedDelivery}</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => navigate('/orders')}
              className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl"
            >
              Track Order
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
              className="w-full h-12 border-brand-green text-brand-green font-semibold rounded-xl"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 6: FAILED ──
  if (step === 'failed') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-8 py-12 space-y-6 max-w-sm mx-auto">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
            <XCircle className="h-14 w-14 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Payment Failed</h2>
            <p className="text-sm text-muted-foreground mt-2">Transaction could not be completed.</p>
            <p className="text-xs text-muted-foreground mt-1">Your money has not been deducted.</p>
          </div>
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => setStep('payment')}
              className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl"
            >
              Retry Payment
            </Button>
            <Button
              variant="outline"
              onClick={() => { setPaymentMethod(''); setStep('payment'); }}
              className="w-full h-12 border-border text-foreground font-semibold rounded-xl"
            >
              Change Payment Method
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Payment card component
const PaymentCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ icon, title, subtitle, badge, isOpen, onToggle, children }) => (
  <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${isOpen ? 'ring-1 ring-brand-green' : ''}`}>
    <button onClick={onToggle} className="w-full flex items-center gap-3 p-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOpen ? 'bg-brand-green/10' : 'bg-muted'}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge && (
            <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full font-medium">{badge}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {isOpen ? (
        <CheckCircle className="h-5 w-5 text-brand-green" />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
    {isOpen && (
      <div className="px-4 pb-4 pt-1 border-t border-border/50">
        {children}
      </div>
    )}
  </div>
);

export default MobileCheckoutFlow;
