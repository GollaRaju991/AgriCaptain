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
import { useLanguage } from '@/contexts/LanguageContext';


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
  const { translations: t } = useLanguage();
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
            {t.payments_title}
          </CardTitle>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Lock className="h-4 w-4" />
            {t.secure_100}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Total Amount Bar */}
        <div className="bg-blue-50 mx-5 mt-5 rounded-xl px-5 py-3.5 flex items-center justify-between">
          <span className="text-sm lg:text-base font-medium text-primary">{t.total_amount}</span>
          <span className="text-lg lg:text-xl font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
        </div>

        {/* Payment Methods */}
        <div className="p-5 space-y-3">

          {/* ── UPI / Credit / Debit Card (Razorpay handles all) ── */}
          <DesktopPaymentCard
            icon={<Smartphone className="h-5 w-5 text-brand-green" />}
            title={t.upi_credit_debit}
            badge={t.recommended}
            subtitle={t.pay_securely_razorpay}
            isOpen={paymentMethod === 'upi' || paymentMethod === 'card'}
            onToggle={() => { setPaymentMethod((paymentMethod === 'upi' || paymentMethod === 'card') ? '' : 'upi'); }}
          >
            <div className="space-y-3 mt-2">
              <p className="text-sm text-muted-foreground">
                {t.click_pay_button_info}
              </p>
              <p className="text-xs text-center text-muted-foreground">
                <Lock className="h-3 w-3 inline mr-1" />
                {t.secure_powered_razorpay}
              </p>
            </div>
          </DesktopPaymentCard>

          {/* ── Cash on Delivery ── */}
          <DesktopPaymentCard
            icon={<Truck className="h-5 w-5 text-brand-green" />}
            title={t.cash_on_delivery}
            subtitle={t.pay_when_arrives}
            isOpen={paymentMethod === 'cod'}
            onToggle={() => setPaymentMethod(paymentMethod === 'cod' ? '' : 'cod')}
          >
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                {t.pay_full_on_delivery}
              </p>
            </div>
          </DesktopPaymentCard>
        </div>

        {/* Payment Info when COD selected */}
        {paymentMethod === 'cod' && (
          <div className="mx-5 mb-5 bg-muted/30 rounded-xl p-4 space-y-2.5 border border-border/40">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-brand-green" />
              <span className="text-sm font-bold text-foreground">{t.payment_info}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.payment_method}</span>
              <span className="text-foreground font-medium">{t.cash_on_delivery}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.order_status || 'Status'}</span>
              <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded-full">{t.pending}</span>
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
