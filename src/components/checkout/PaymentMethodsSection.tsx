import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Smartphone, Truck, CheckCircle, ChevronDown, ChevronUp, HelpCircle, Lock, Loader2, Shield, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


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

interface PaymentMethodsSectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  upiId: string;
  setUpiId: (id: string) => void;
  cardNumber: string;
  setCardNumber: (number: string) => void;
  expiryDate: string;
  setExpiryDate: (date: string) => void;
  cvv: string;
  setCvv: (cvv: string) => void;
  nameOnCard: string;
  setNameOnCard: (name: string) => void;
  selectedBank: string;
  setSelectedBank: (bank: string) => void;
  selectedEMI: string;
  setSelectedEMI: (emi: string) => void;
  finalTotal: number;
  codAdvancePaid: boolean;
  onCodAdvancePayment: (method: string) => void;
  codPaymentProcessing: boolean;
  onPayment?: () => void;
  selectedUpiApp?: string;
  onUpiAppSelect?: (app: string) => void;
}

const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = ({
  paymentMethod,
  setPaymentMethod,
  upiId,
  setUpiId,
  cardNumber,
  setCardNumber,
  expiryDate,
  setExpiryDate,
  cvv,
  setCvv,
  nameOnCard,
  setNameOnCard,
  finalTotal,
  onPayment,
  selectedUpiApp: externalSelectedUpiApp,
  onUpiAppSelect,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState<string>('');
  const [savedCardCvv, setSavedCardCvv] = useState('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [internalSelectedUpiApp, setInternalSelectedUpiApp] = useState('');

  const selectedUpiApp = externalSelectedUpiApp ?? internalSelectedUpiApp;
  const setSelectedUpiApp = (app: string) => {
    if (onUpiAppSelect) onUpiAppSelect(app);
    else setInternalSelectedUpiApp(app);
  };

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

  const handleSaveNewCard = async () => {
    if (!user || !cardNumber || !expiryDate || !nameOnCard) return;
    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    const [month, year] = expiryDate.split('/');
    const payload = {
      user_id: user.id,
      card_number_last4: last4,
      card_holder_name: nameOnCard.trim(),
      card_type: 'debit',
      bank_name: null,
      expiry_month: parseInt(month),
      expiry_year: parseInt('20' + year),
      is_default: savedCards.length === 0,
    };
    await supabase.from('saved_cards').insert([payload]);
    fetchSavedCards();
  };


  return (
    <Card className="border border-border/50 rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="bg-primary/5 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base lg:text-lg font-bold flex items-center gap-3">
            <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm">2</span>
            Payments
          </CardTitle>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Lock className="h-4 w-4" />
            100% Secure
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Total Amount Bar */}
        <div className="bg-blue-50 mx-5 mt-5 rounded-xl px-5 py-3.5 flex items-center justify-between">
          <span className="text-sm lg:text-base font-medium text-primary">Total Amount</span>
          <span className="text-lg lg:text-xl font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
        </div>

        {/* Payment Methods */}
        <div className="p-5 space-y-3">

          {/* ── UPI ── */}
          <DesktopPaymentCard
            icon={<Smartphone className="h-5 w-5 text-brand-green" />}
            title="UPI"
            badge="Recommended"
            subtitle="Pay using UPI apps"
            isOpen={paymentMethod === 'upi'}
            onToggle={() => { setPaymentMethod(paymentMethod === 'upi' ? '' : 'upi'); }}
          >
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                Click below to pay securely via UPI. You can choose your preferred UPI app in the payment window.
              </p>
              <Button
                className="w-full h-11 bg-brand-green hover:bg-brand-green/90 text-white font-semibold text-sm rounded-xl"
                onClick={onPayment}
              >
                <Shield className="h-4 w-4 mr-2" />
                Pay ₹{finalTotal.toLocaleString()}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                <Lock className="h-3 w-3 inline mr-1" />
                Secure payment powered by Razorpay
              </p>
            </div>
          </DesktopPaymentCard>

          {/* ── Credit / Debit Card ── */}
          <DesktopPaymentCard
            icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
            title="Credit / Debit Card"
            subtitle="Secure card payment"
            isOpen={paymentMethod === 'card'}
            onToggle={() => setPaymentMethod(paymentMethod === 'card' ? '' : 'card')}
          >
            <div className="space-y-4 mt-2">
              <p className="text-xs text-muted-foreground italic">
                <span className="font-medium not-italic text-foreground">Note:</span> Please ensure your card can be used for online transactions.
              </p>

              {/* Saved Cards */}
              {savedCards.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Saved Cards</p>
                  {savedCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => { setSelectedSavedCard(card.id); setShowNewCardForm(false); setSavedCardCvv(''); }}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        selectedSavedCard === card.id ? 'border-brand-green bg-brand-green/5' : 'border-border hover:border-muted-foreground/40'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">•••• •••• •••• {card.card_number_last4}</p>
                          {card.is_default && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {card.card_holder_name} · {card.card_type === 'credit' ? 'Credit' : 'Debit'} · Exp {String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}
                        </p>
                      </div>
                      {selectedSavedCard === card.id && <CheckCircle className="h-5 w-5 text-brand-green" />}
                    </button>
                  ))}
                  {selectedSavedCard && (
                    <div className="flex items-end gap-4 ml-1">
                      <div className="w-24">
                        <Label className="text-xs text-muted-foreground">CVV</Label>
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="•••"
                            value={savedCardCvv}
                            onChange={(e) => setSavedCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            maxLength={3}
                            className="pr-8 h-10"
                          />
                          <HelpCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <Button className="h-10 bg-brand-green hover:bg-brand-green/90 text-white font-semibold px-6" onClick={onPayment}>
                        Pay ₹{finalTotal.toLocaleString()}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Add New Card / New Card Form */}
              {savedCards.length > 0 && !showNewCardForm ? (
                <Button variant="outline" size="sm" onClick={() => { setShowNewCardForm(true); setSelectedSavedCard(''); }} className="text-primary border-primary/30">
                  + Add New Card
                </Button>
              ) : (
                <div className="border rounded-xl p-5 space-y-4 bg-muted/20">
                  <div>
                    <Label className="text-sm text-muted-foreground">Card Number</Label>
                    <Input
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
                      }}
                      maxLength={19}
                      className="mt-1 h-10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Valid Thru</Label>
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
                        className="mt-1 h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">CVV</Label>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="•••"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          maxLength={3}
                          className="mt-1 pr-8 h-10"
                        />
                        <HelpCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground mt-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="save-card-desktop"
                      checked={saveNewCard}
                      onCheckedChange={(checked) => setSaveNewCard(!!checked)}
                    />
                    <Label htmlFor="save-card-desktop" className="text-sm text-muted-foreground cursor-pointer">
                      Save this card for future payments
                    </Label>
                  </div>
                  <Button
                    className="w-full h-11 bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl"
                    onClick={() => { if (saveNewCard) handleSaveNewCard(); onPayment?.(); }}
                  >
                    {saveNewCard ? 'Save & Pay' : 'Pay'} ₹{finalTotal.toLocaleString()}
                  </Button>
                </div>
              )}
            </div>
          </DesktopPaymentCard>

          {/* ── Cash on Delivery ── */}
          <DesktopPaymentCard
            icon={<Truck className="h-5 w-5 text-brand-green" />}
            title="Cash on Delivery"
            subtitle="Pay when order arrives"
            isOpen={paymentMethod === 'cod'}
            onToggle={() => setPaymentMethod(paymentMethod === 'cod' ? '' : 'cod')}
          >
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Pay the full amount when your order is delivered to your doorstep.
              </p>
            </div>
          </DesktopPaymentCard>
        </div>

        {/* Payment Info when COD selected */}
        {paymentMethod === 'cod' && (
          <div className="mx-5 mb-5 bg-muted/30 rounded-xl p-4 space-y-2.5 border border-border/40">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-brand-green" />
              <span className="text-sm font-bold text-foreground">Payment Info</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="text-foreground font-medium">Cash on Delivery</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Reusable desktop payment accordion card (matching mobile PaymentOptionCard style)
const DesktopPaymentCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ icon, title, subtitle, badge, isOpen, onToggle, children }) => (
  <div className={`rounded-xl overflow-hidden transition-all border ${isOpen ? 'border-brand-green bg-brand-green/[0.02] shadow-sm' : 'border-border/60 hover:border-muted-foreground/40'}`}>
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-4 px-5 py-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-brand-green/10' : 'bg-muted/60'}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm lg:text-base font-semibold text-foreground">{title}</span>
          {badge && (
            <span className="text-xs bg-brand-green/10 text-brand-green px-2.5 py-0.5 rounded-full font-medium">{badge}</span>
          )}
        </div>
        <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isOpen ? 'border-brand-green bg-brand-green' : 'border-muted-foreground/30'}`}>
        {isOpen && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
      </div>
    </button>
    {isOpen && (
      <div className="px-5 pb-5 pt-0">
        {children}
      </div>
    )}
  </div>
);

export default PaymentMethodsSection;
