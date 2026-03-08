import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
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
  const [checkingSeller, setCheckingSeller] = useState(false);

  // Check if user is already registered as agriculture seller
  const checkExistingSeller = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCheckingSeller(true);
    const { data } = await (supabase.from('sellers') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('seller_type', 'agriculture_products')
      .limit(1);
    if (data?.length) {
      navigate('/seller/dashboard');
      return;
    }
    setCheckingSeller(false);
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

      {!selectedType ? (
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
