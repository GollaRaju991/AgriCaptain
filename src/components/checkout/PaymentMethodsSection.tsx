import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Smartphone, Building, Truck, CheckCircle, ChevronDown, ChevronUp, HelpCircle, Lock } from 'lucide-react';
import CODAdvancePayment from './CODAdvancePayment';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
}

const COD_ADVANCE_AMOUNT = 99;

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
  selectedBank,
  setSelectedBank,
  selectedEMI,
  setSelectedEMI,
  finalTotal,
  codAdvancePaid,
  onCodAdvancePayment,
  codPaymentProcessing,
  onPayment
}) => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState<string>('');
  const [savedCardCvv, setSavedCardCvv] = useState('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [saveNewCard, setSaveNewCard] = useState(false);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) { clearInterval(timer); return 0; }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSelectSavedCard = (cardId: string) => {
    setSelectedSavedCard(cardId);
    setShowNewCardForm(false);
    setSavedCardCvv('');
  };

  const handleAddNewCard = () => {
    setSelectedSavedCard('');
    setShowNewCardForm(true);
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
    <Card className="border border-border">
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
            Payments
          </CardTitle>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Lock className="h-4 w-4" />
            100% Secure
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Total Amount Bar */}
        <div className="bg-blue-50 mx-4 mt-4 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">Total Amount</span>
          <span className="text-lg font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
        </div>

        {/* Timer */}
        <div className="px-4 py-2 flex items-center text-xs text-muted-foreground">
          <span className="mr-2">Complete payment in</span>
          <div className="bg-background px-2 py-1 rounded border font-mono text-foreground">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Payment Methods - Accordion Style */}
        <div className="divide-y">
          {/* UPI Payment */}
          <PaymentAccordion
            icon={<Smartphone className="h-5 w-5 text-orange-500" />}
            title="UPI"
            subtitle="Pay by any UPI app"
            isOpen={paymentMethod === 'upi'}
            onToggle={() => setPaymentMethod(paymentMethod === 'upi' ? '' : 'upi')}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroup value="upi-id">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi-id" id="upi-id-inner" />
                    <Label htmlFor="upi-id-inner" className="text-sm font-medium">Your UPI ID</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex space-x-2 ml-6">
                <Input
                  placeholder="Enter UPI ID"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" className="text-primary">VERIFY</Button>
              </div>
              <div className="ml-6">
                <Button size="sm" className="w-full bg-amber-400 hover:bg-amber-500 text-foreground font-semibold" onClick={onPayment}>
                  Pay ₹{finalTotal.toLocaleString()}
                </Button>
              </div>
            </div>
          </PaymentAccordion>

          {/* Credit/Debit Card */}
          <PaymentAccordion
            icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
            title="Credit / Debit / ATM Card"
            subtitle=""
            isOpen={paymentMethod === 'card'}
            onToggle={() => setPaymentMethod(paymentMethod === 'card' ? '' : 'card')}
          >
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground italic">
                <span className="font-medium not-italic text-foreground">Note:</span> Please ensure your card can be used for online transactions. <span className="text-primary cursor-pointer">Learn More</span>
              </p>

              {/* Saved Cards */}
              {savedCards.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Saved Cards</p>
                  <RadioGroup value={selectedSavedCard} onValueChange={handleSelectSavedCard}>
                    {savedCards.map((card) => (
                      <div key={card.id} className={`border rounded-lg p-3 transition-colors ${selectedSavedCard === card.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={card.id} id={`saved-card-${card.id}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor={`saved-card-${card.id}`} className="text-sm font-medium cursor-pointer">
                                •••• •••• •••• {card.card_number_last4}
                              </Label>
                              {card.is_default && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                              {card.card_holder_name} · {card.card_type === 'credit' ? 'Credit' : 'Debit'} · Exp {String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}
                              {card.bank_name && ` · ${card.bank_name}`}
                            </p>
                          </div>
                        </div>
                        {/* CVV input for selected saved card */}
                        {selectedSavedCard === card.id && (
                          <div className="mt-3 ml-7 flex items-center gap-3">
                            <div className="w-24">
                              <Label className="text-xs text-muted-foreground">CVV</Label>
                              <div className="relative">
                                <Input
                                  type="password"
                                  placeholder="CVV"
                                  value={savedCardCvv}
                                  onChange={(e) => setSavedCardCvv(e.target.value)}
                                  maxLength={4}
                                  className="pr-8"
                                />
                                <HelpCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                            <Button className="bg-amber-400 hover:bg-amber-500 text-foreground font-semibold mt-4" onClick={onPayment}>
                              Pay ₹{finalTotal.toLocaleString()}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Add New Card / New Card Form */}
              {savedCards.length > 0 && !showNewCardForm ? (
                <Button variant="outline" size="sm" onClick={handleAddNewCard} className="text-primary border-primary/30">
                  + Add New Card
                </Button>
              ) : (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                  <div>
                    <Label className="text-sm text-muted-foreground">Card Number</Label>
                    <Input
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Valid Thru</Label>
                      <Input
                        placeholder="MM / YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">CVV</Label>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="CVV"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={4}
                          className="mt-1 pr-8"
                        />
                        <HelpCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground mt-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Save Card Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="save-card"
                      checked={saveNewCard}
                      onCheckedChange={(checked) => setSaveNewCard(!!checked)}
                    />
                    <Label htmlFor="save-card" className="text-sm text-muted-foreground cursor-pointer">
                      Save this card for future payments
                    </Label>
                  </div>

                  <Button
                    className="w-full bg-amber-400 hover:bg-amber-500 text-foreground font-semibold py-3"
                    onClick={() => { if (saveNewCard) handleSaveNewCard(); onPayment?.(); }}
                  >
                    {saveNewCard ? 'Save & Pay' : 'Pay'} ₹{finalTotal.toLocaleString()}
                  </Button>
                </div>
              )}
            </div>
          </PaymentAccordion>

          {/* Net Banking */}
          <PaymentAccordion
            icon={<Building className="h-5 w-5 text-primary" />}
            title="Net Banking"
            subtitle=""
            isOpen={paymentMethod === 'netbanking'}
            onToggle={() => setPaymentMethod(paymentMethod === 'netbanking' ? '' : 'netbanking')}
          >
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Select Your Bank</Label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">Choose Bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="pnb">Punjab National Bank</option>
                  <option value="bob">Bank of Baroda</option>
                  <option value="other">Other Banks</option>
                </select>
              </div>
              {selectedBank && (
                <Button className="w-full bg-amber-400 hover:bg-amber-500 text-foreground font-semibold py-3 lg:hidden" onClick={onPayment}>
                  Pay ₹{finalTotal.toLocaleString()}
                </Button>
              )}
            </div>
          </PaymentAccordion>

          {/* EMI */}
          <PaymentAccordion
            icon={<CreditCard className="h-5 w-5 text-purple-600" />}
            title="EMI"
            subtitle="Agrizin EMI"
            isOpen={paymentMethod === 'emi'}
            onToggle={() => setPaymentMethod(paymentMethod === 'emi' ? '' : 'emi')}
          >
            <div className="space-y-3">
              <RadioGroup value={selectedEMI} onValueChange={setSelectedEMI}>
                <div className="space-y-2">
                  {[
                    { value: '3months', label: '3 Months', divisor: 3 },
                    { value: '6months', label: '6 Months', divisor: 6 },
                    { value: '12months', label: '12 Months', divisor: 12 },
                  ].map((emi) => (
                    <div key={emi.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={emi.value} id={emi.value} />
                      <Label htmlFor={emi.value} className="text-sm">
                        {emi.label} - ₹{Math.ceil(finalTotal / emi.divisor)}/month
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {selectedEMI && (
                <Button className="w-full bg-amber-400 hover:bg-amber-500 text-foreground font-semibold py-3 lg:hidden">
                  Pay ₹{finalTotal.toLocaleString()}
                </Button>
              )}
            </div>
          </PaymentAccordion>

          {/* Cash on Delivery */}
          <PaymentAccordion
            icon={<Truck className="h-5 w-5 text-green-600" />}
            title="Cash on Delivery"
            subtitle=""
            badge={codAdvancePaid ? (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                ₹{COD_ADVANCE_AMOUNT} Paid
              </span>
            ) : undefined}
            isOpen={paymentMethod === 'cod'}
            onToggle={() => setPaymentMethod(paymentMethod === 'cod' ? '' : 'cod')}
          >
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Pay ₹{COD_ADVANCE_AMOUNT} now, remaining ₹{Math.max(0, finalTotal - COD_ADVANCE_AMOUNT)} on delivery
              </p>
              {codAdvancePaid ? (
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-green-700 font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Advance payment of ₹{COD_ADVANCE_AMOUNT} completed!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Pay remaining ₹{Math.max(0, finalTotal - COD_ADVANCE_AMOUNT)} when your order is delivered
                  </p>
                </div>
              ) : (
                <CODAdvancePayment
                  advanceAmount={COD_ADVANCE_AMOUNT}
                  onPaymentComplete={onCodAdvancePayment}
                  isProcessing={codPaymentProcessing}
                />
              )}
            </div>
          </PaymentAccordion>
        </div>
      </CardContent>
    </Card>
  );
};

// Reusable Accordion Component for Payment Methods
const PaymentAccordion: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ icon, title, subtitle, badge, isOpen, onToggle, children }) => (
  <div>
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {subtitle && <p className="text-xs text-primary">{subtitle}</p>}
        </div>
        {badge}
      </div>
      {isOpen ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
    {isOpen && (
      <div className="px-4 pb-4 pt-1">
        {children}
      </div>
    )}
  </div>
);

export default PaymentMethodsSection;
