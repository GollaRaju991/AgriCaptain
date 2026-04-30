import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BadgeCheck, Clock, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SellerRegistrationForm from '@/components/seller/SellerRegistrationForm';
import agricultureImg from '@/assets/agriculture-products.png';
import farmersMarketImg from '@/assets/farmers-market.png';
import sellerHeroBg from '@/assets/seller-hero-bg.jpg';
import { supabase } from '@/integrations/supabase/client';

type SellerType = 'agriculture_products' | 'farmers_market';

const sellerOptions = [
  {
    type: 'agriculture_products' as SellerType,
    titleKey: 'seller_agriculture_title',
    descKey: 'seller_agriculture_desc',
    image: agricultureImg,
  },
  {
    type: 'farmers_market' as SellerType,
    titleKey: 'seller_market_title',
    descKey: 'seller_market_desc',
    image: farmersMarketImg,
  },
];

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { translations: t } = useLanguage();
  const [selectedType, setSelectedType] = useState<SellerType | null>(null);
  const [checking, setChecking] = useState(true);
  const [existingSeller, setExistingSeller] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecking(false); return; }
      const { data } = await (supabase.from('sellers') as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('seller_type', 'agriculture_products')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        if (data.status === 'approved') { navigate('/seller/dashboard'); return; }
        setExistingSeller(data);
      }
      setChecking(false);
    })();
  }, [navigate]);

  const deleteAndReapply = async () => {
    if (!existingSeller) return;
    await (supabase.from('sellers') as any).delete().eq('id', existingSeller.id);
    setExistingSeller(null);
    setSelectedType('agriculture_products');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-primary text-primary-foreground flex items-center gap-3 px-4 py-3">
        <button onClick={() => selectedType ? setSelectedType(null) : navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">
          {selectedType ? 'Seller Registration' : (t['become_seller_title'] || 'Become a Seller')}
        </h1>
        {selectedType && (
          <span className="ml-auto flex items-center gap-1 text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">
            <BadgeCheck className="h-3 w-3" /> Verified Seller
          </span>
        )}
      </div>
      {/* Desktop header */}
      <div className="hidden lg:block"><Header /></div>

      {checking ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : existingSeller && existingSeller.status === 'pending' ? (
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Application Under Review</h2>
              <p className="text-sm text-muted-foreground">
                Hi <strong>{existingSeller.name}</strong>, thanks for registering as a seller. Our team is verifying your details. You'll be notified once approved (usually within 24 hours).
              </p>
              <p className="text-xs text-muted-foreground">Submitted on {new Date(existingSeller.created_at).toLocaleDateString()}</p>
              <Button variant="outline" onClick={() => navigate('/')} className="mt-2">Back to Home</Button>
            </CardContent>
          </Card>
        </div>
      ) : existingSeller && existingSeller.status === 'rejected' ? (
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle className="h-7 w-7 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Application Rejected</h2>
                  <p className="text-xs text-muted-foreground">Please update the details below and resubmit.</p>
                </div>
              </div>
              <div className="bg-white border border-red-200 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-1.5 text-red-700 font-semibold mb-1">
                  <AlertTriangle className="h-4 w-4" /> What you need to fix:
                </div>
                <div className="whitespace-pre-line text-foreground text-sm">
                  {existingSeller.rejection_reason || 'Please contact support for details.'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={deleteAndReapply} className="flex-1">Edit & Resubmit</Button>
                <Button variant="outline" onClick={() => navigate('/')} className="flex-1">Home</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : !selectedType ? (
        /* Selection Screen */
        <div className="container mx-auto px-4 py-6 max-w-lg">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-foreground mb-1">
              {t['become_seller_title'] || 'Become a Seller'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t['become_seller_subtitle'] || 'Choose your selling category to get started'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {sellerOptions.map((option) => (
              <Card
                key={option.type}
                className="cursor-pointer group hover:shadow-lg transition-all duration-300 border hover:border-primary overflow-hidden rounded-xl"
                onClick={async () => {
                  if (option.type === 'farmers_market') {
                    navigate('/sell-crop/add');
                    return;
                  }
                  // Check if already registered before showing form
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    const { data } = await (supabase.from('sellers') as any)
                      .select('id')
                      .eq('user_id', user.id)
                      .eq('seller_type', 'agriculture_products')
                      .limit(1);
                    if (data?.length) {
                      navigate('/seller/dashboard');
                      return;
                    }
                  }
                  setSelectedType(option.type);
                }}
              >
                <CardContent className="p-0">
                  <div className="w-full aspect-[4/3] overflow-hidden">
                    <img src={option.image} alt={t[option.titleKey]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                  <div className="p-2.5 text-center">
                    <h3 className="text-sm font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                      {t[option.titleKey]}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t[option.descKey]}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Registration Form */
        <>
          {/* Hero Banner */}
          <div className="relative h-44 md:h-56 overflow-hidden">
            <img src={sellerHeroBg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-primary/90 flex items-end p-5">
              <div>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  Seller <span className="text-accent">Registration</span>
                </h2>
                <p className="text-sm text-primary-foreground/80 mt-0.5">Start Selling on <strong>Agrizin</strong></p>
                <p className="text-xs text-primary-foreground/70 mt-1 flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary-foreground" /> Grow Your Business • Reach Thousands of Buyers
                </p>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 -mt-4 relative z-10 max-w-2xl pb-8">
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <SellerRegistrationForm />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default BecomeSeller;
