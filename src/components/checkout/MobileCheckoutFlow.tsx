import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Smartphone, CreditCard, Truck, CheckCircle, XCircle, Lock, Loader2, ChevronRight, Shield, Headphones, Package, Receipt, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AddressManager from '@/components/AddressManager';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GooglePayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/>
  </svg>
);

const PhonePeIcon = () => (
  <div className="h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
    <span className="text-white text-[10px] font-bold">P</span>
  </div>
);

const PaytmIcon = () => (
  <div className="h-5 w-5 bg-blue-500 rounded flex items-center justify-center">
    <span className="text-white text-[8px] font-bold">PT</span>
  </div>
);

const CREDIcon = () => (
  <div className="h-5 w-5 bg-gray-900 rounded flex items-center justify-center">
    <span className="text-white text-[7px] font-bold">CR</span>
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

  const [showAddressManager, setShowAddressManager] = useState(false);
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

  // Overlay states
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [orderNumber, setOrderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const expectedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
  const discount = upiDiscount + couponDiscount;

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

  const getProcessingSteps = () => {
    if (paymentMethod === 'upi') return ['Sending payment request...', 'Waiting for approval...', 'Verifying transaction...', 'Payment confirmed!'];
    if (paymentMethod === 'card') return ['Encrypting card details...', 'Contacting bank...', 'Processing transaction...', 'Payment confirmed!'];
    return ['Processing payment...', 'Verifying details...', 'Payment confirmed!'];
  };

  const getPaymentMethodLabel = () => {
    if (paymentMethod === 'upi') return selectedUpiApp ? `UPI - ${selectedUpiApp.charAt(0).toUpperCase() + selectedUpiApp.slice(1)}` : `UPI - ${upiId}`;
    if (paymentMethod === 'card') return selectedSavedCard ? `Card •••• ${savedCards.find(c => c.id === selectedSavedCard)?.card_number_last4}` : `Card •••• ${cardNumber.replace(/\s/g, '').slice(-4)}`;
    if (paymentMethod === 'cod') return 'Cash on Delivery';
    return '';
  };

  const handlePay = async () => {
    if (!selectedAddress) {
      toast({ title: "Select delivery address", variant: "destructive" });
      return;
    }
    if (!paymentMethod) {
      toast({ title: "Select payment method", variant: "destructive" });
      return;
    }
    if (paymentMethod === 'upi' && !selectedUpiApp && !upiVerified) {
      toast({ title: "Select UPI app or verify UPI ID", variant: "destructive" });
      return;
    }
    if (paymentMethod === 'card') {
      if (selectedSavedCard) {
        if (savedCardCvv.length < 3) {
          toast({ title: "Enter CVV", variant: "destructive" });
          return;
        }
      } else if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
        toast({ title: "Complete card details", variant: "destructive" });
        return;
      }
    }
    // COD: skip payment processing, directly place order
    if (paymentMethod === 'cod') {
      const orderNum = '#AG' + crypto.randomUUID().replace(/-/g, '').substring(0, 9).toUpperCase();
      setOrderNumber(orderNum);
      try {
        await onCompleteOrder(paymentMethod, {});
        setShowSuccess(true);
      } catch {
        toast({ title: "Order failed", description: "Please try again.", variant: "destructive" });
      }
      return;
    }

    // Start processing overlay for online payments
    setShowProcessing(true);
    setProcessingStep(0);

    const txnId = 'TXN' + crypto.randomUUID().replace(/-/g, '').substring(0, 9).toUpperCase();
    setTransactionId(txnId);

    const steps = paymentMethod === 'upi' ? 4 : paymentMethod === 'card' ? 4 : 3;
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setProcessingStep(i + 1);
    }
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = Math.random() > 0.1;
    setShowProcessing(false);

    if (success) {
      const orderNum = '#AG' + crypto.randomUUID().replace(/-/g, '').substring(0, 9).toUpperCase();
      setOrderNumber(orderNum);
      try {
        await onCompleteOrder(paymentMethod, { upiId, cardNumber, selectedUpiApp });
        setShowSuccess(true);
      } catch {
        setShowFailed(true);
      }
    } else {
      setShowFailed(true);
    }
  };

  // Address Manager full screen
  if (showAddressManager) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setShowAddressManager(false)} className="p-1">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Manage Address</h1>
        </div>
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
    <div className="min-h-screen bg-[#F7F7F7] pb-36">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground flex-1">Payment Details</h1>
        <button className="p-1.5 rounded-full bg-muted/50">
          <Headphones className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="p-4 space-y-4">

        {/* ── SECTION 1: DELIVERY ADDRESS ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-green" />
            <h2 className="text-sm font-bold text-foreground">Delivery Address</h2>
          </div>
          {addressesLoading ? (
            <div className="p-6 text-center">
              <Loader2 className="h-5 w-5 animate-spin text-brand-green mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : selectedAddress ? (
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{selectedAddress.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">+91 {selectedAddress.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {selectedAddress.address}<br />
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressManager(true)}
                  className="text-xs font-semibold text-brand-green px-3 py-1.5 border border-brand-green rounded-lg shrink-0 ml-3"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-3">No address added</p>
              <button
                onClick={() => setShowAddressManager(true)}
                className="text-xs font-semibold text-brand-green border border-brand-green rounded-lg px-4 py-2 inline-flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Address
              </button>
            </div>
          )}
        </div>

        {/* ── SECTION 2: ORDER DETAILS ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <Package className="h-4 w-4 text-brand-green" />
            <h2 className="text-sm font-bold text-foreground">Order Details</h2>
          </div>
          <div className="divide-y divide-border/30">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 flex gap-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-muted border border-border/30" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.quantity} {item.category === 'seeds' ? 'kg' : 'unit'}</p>
                  <p className="text-sm font-bold text-foreground mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Delivery info */}
          <div className="px-4 py-3 bg-brand-green/5 flex items-center gap-3 border-t border-border/30">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Truck className="h-4 w-4 text-brand-green" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground">Expected Delivery</p>
              <p className="text-sm font-semibold text-foreground">{expectedDelivery}</p>
            </div>
            <span className="text-xs font-bold text-brand-green">FREE</span>
          </div>
        </div>

        {/* ── SECTION 3: INVOICE DETAILS ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-brand-green" />
            <h2 className="text-sm font-bold text-foreground">Invoice Details</h2>
          </div>
          <div className="p-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items Total ({items.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className="text-foreground">₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-brand-green font-medium">Free</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-brand-green font-medium">−₹{discount.toLocaleString()}</span>
              </div>
            )}
            {/* Coupon input */}
            <div className="pt-1 pb-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 h-9 text-xs rounded-lg"
                />
                <Button variant="outline" size="sm" onClick={onCouponApply} className="text-brand-green border-brand-green text-xs h-9 rounded-lg px-4">
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
            <div className="border-t border-border/50 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-foreground">Total Amount</span>
              <span className="text-lg font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: PAYMENT OPTIONS ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-brand-green" />
            <h2 className="text-sm font-bold text-foreground">Select Payment Method</h2>
          </div>
          <div className="p-3 space-y-2">
            {/* UPI */}
            <PaymentOptionCard
              icon={<Smartphone className="h-5 w-5 text-brand-green" />}
              title="UPI"
              badge="Recommended"
              subtitle="Pay using UPI apps"
              isOpen={paymentMethod === 'upi'}
              onToggle={() => setPaymentMethod(paymentMethod === 'upi' ? '' : 'upi')}
            >
              <div className="space-y-2 mt-1">
                {/* Quick UPI apps */}
                <div className="flex gap-4 py-2">
                  {[
                    { id: 'gpay', name: 'Google Pay', icon: <GooglePayIcon /> },
                    { id: 'phonepe', name: 'PhonePe', icon: <PhonePeIcon /> },
                    { id: 'paytm', name: 'Paytm', icon: <PaytmIcon /> },
                    { id: 'cred', name: 'CRED', icon: <CREDIcon /> },
                  ].map(app => (
                    <button
                      key={app.id}
                      onClick={() => { setSelectedUpiApp(app.id); setUpiId(''); setUpiVerified(false); }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                        selectedUpiApp === app.id ? 'border-brand-green bg-brand-green/5 shadow-sm' : 'border-border bg-muted/30'
                      }`}>
                        {app.icon}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{app.name}</span>
                    </button>
                  ))}
                </div>
                {/* UPI ID */}
                <div className="border-t border-border/30 pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Or enter UPI ID</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="name@ybl, name@paytm"
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); setSelectedUpiApp(''); }}
                      className="flex-1 h-9 text-xs rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 rounded-lg text-brand-green border-brand-green"
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
            </PaymentOptionCard>

            {/* Card */}
            <PaymentOptionCard
              icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
              title="Credit / Debit Card"
              subtitle="Secure card payment"
              isOpen={paymentMethod === 'card'}
              onToggle={() => setPaymentMethod(paymentMethod === 'card' ? '' : 'card')}
            >
              <div className="space-y-3 mt-1">
                {savedCards.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Saved Cards</p>
                    {savedCards.map(card => (
                      <button
                        key={card.id}
                        onClick={() => { setSelectedSavedCard(card.id); setShowNewCardForm(false); setSavedCardCvv(''); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          selectedSavedCard === card.id ? 'border-brand-green bg-brand-green/5' : 'border-border'
                        }`}
                      >
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">•••• {card.card_number_last4}</p>
                          <p className="text-xs text-muted-foreground">{card.card_holder_name}</p>
                        </div>
                        {selectedSavedCard === card.id && <CheckCircle className="h-4 w-4 text-brand-green" />}
                      </button>
                    ))}
                    {selectedSavedCard && (
                      <div className="w-20">
                        <Label className="text-xs text-muted-foreground">CVV</Label>
                        <Input
                          type="password"
                          placeholder="•••"
                          value={savedCardCvv}
                          onChange={(e) => setSavedCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          maxLength={3}
                          className="h-9 text-sm mt-0.5"
                        />
                      </div>
                    )}
                  </div>
                )}
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
                        className="h-10 text-sm mt-0.5"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Card Holder Name</Label>
                      <Input placeholder="Name" value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} className="h-10 text-sm mt-0.5" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Expiry</Label>
                        <Input
                          placeholder="MM/YY"
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
                          className="h-10 text-sm mt-0.5"
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
                          className="h-10 text-sm mt-0.5"
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
            </PaymentOptionCard>

            {/* COD */}
            <PaymentOptionCard
              icon={<Truck className="h-5 w-5 text-brand-green" />}
              title="Cash on Delivery"
              subtitle="Pay when order arrives"
              isOpen={paymentMethod === 'cod'}
              onToggle={() => setPaymentMethod(paymentMethod === 'cod' ? '' : 'cod')}
            >
              <div className="mt-1">
                <p className="text-xs text-muted-foreground">
                  Pay the full amount when your order is delivered to your doorstep.
                </p>
              </div>
            </PaymentOptionCard>
          </div>
        </div>

        {/* ── SECTION 5: PAYMENT DETAILS (shown when method selected) ── */}
        {paymentMethod && (
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-green" />
              <h2 className="text-sm font-bold text-foreground">Payment Info</h2>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="text-foreground font-medium">{getPaymentMethodLabel()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM STICKY BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 z-20">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <p className="text-[11px] text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold text-foreground">₹{finalTotal.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-1 text-brand-green">
            <Lock className="h-3 w-3" />
            <span className="text-[10px] font-medium">100% Secure</span>
          </div>
        </div>
        <Button
          onClick={handlePay}
          disabled={!paymentMethod || !selectedAddress}
          className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-white font-bold text-sm rounded-xl disabled:opacity-50 shadow-lg"
        >
          {paymentMethod === 'cod' ? (
            <>
              <Package className="h-4 w-4 mr-2" />
              Place Order
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Pay Securely
            </>
          )}
        </Button>
      </div>

      {/* ── PROCESSING OVERLAY ── */}
      {showProcessing && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
          <div className="text-center px-8 space-y-6">
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
              {getProcessingSteps().map((s, i) => (
                <div key={i} className={`flex items-center gap-2.5 text-sm transition-all duration-300 ${i <= processingStep ? 'opacity-100' : 'opacity-30'}`}>
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
      )}

      {/* ── SUCCESS OVERLAY ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-brand-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{paymentMethod === 'cod' ? 'Order Placed Successfully' : 'Payment Successful'}</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-semibold text-foreground">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Delivery</span>
                  <span className="font-semibold text-foreground">{expectedDelivery}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => navigate('/orders')}
                className="w-full h-11 bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl"
              >
                View Order History
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full h-11 border-brand-green text-brand-green font-semibold rounded-xl"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── FAILED OVERLAY ── */}
      {showFailed && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Payment Failed</h2>
              <p className="text-sm text-muted-foreground mt-2">Transaction could not be completed.</p>
              <p className="text-xs text-muted-foreground mt-1">Your money has not been deducted.</p>
            </div>
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => setShowFailed(false)}
                className="w-full h-11 bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl"
              >
                Retry Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => { setPaymentMethod(''); setShowFailed(false); }}
                className="w-full h-11 border-border text-foreground font-semibold rounded-xl"
              >
                Change Payment Method
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Payment option accordion card
const PaymentOptionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ icon, title, subtitle, badge, isOpen, onToggle, children }) => (
  <div className={`rounded-xl overflow-hidden transition-all border ${isOpen ? 'border-brand-green bg-brand-green/[0.02] shadow-sm' : 'border-border/60'}`}>
    <button onClick={onToggle} className="w-full flex items-center gap-3 p-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-brand-green/10' : 'bg-muted/60'}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge && (
            <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full font-medium">{badge}</span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isOpen ? 'border-brand-green bg-brand-green' : 'border-muted-foreground/30'}`}>
        {isOpen && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
    </button>
    {isOpen && (
      <div className="px-3.5 pb-3.5 pt-0">
        {children}
      </div>
    )}
  </div>
);

export default MobileCheckoutFlow;
