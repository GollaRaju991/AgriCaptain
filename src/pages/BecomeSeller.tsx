import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BadgeCheck, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SellerRegistrationForm from '@/components/seller/SellerRegistrationForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import agricultureImg from '@/assets/agriculture-products.png';
import farmersMarketImg from '@/assets/farmers-market.png';
import sellerHeroBg from '@/assets/seller-hero-bg.jpg';

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
  const [loadingSeller, setLoadingSeller] = useState(true);
  const [existingSeller, setExistingSeller] = useState<any>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Check existing seller registration when user enters agriculture flow
  useEffect(() => {
    const fetchSeller = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingSeller(false);
        return;
      }
      const { data } = await (supabase.from('sellers') as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('seller_type', 'agriculture_products')
        .maybeSingle();
      setExistingSeller(data);
      setLoadingSeller(false);
    };
    fetchSeller();
  }, []);

  // Show approval popup ONLY the first time after admin approves.
  // After dismissal, subsequent visits just show inline status badge.
  useEffect(() => {
    if (existingSeller?.status === 'approved' && existingSeller?.id) {
      const key = `seller_approved_seen_${existingSeller.id}`;
      if (!localStorage.getItem(key)) {
        setStatusDialogOpen(true);
        localStorage.setItem(key, '1');
      }
    }
  }, [existingSeller]);

  const isRejected = existingSeller?.status === 'rejected';
  const showForm = selectedType === 'agriculture_products' && (!existingSeller || isRejected);

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
                onClick={() => {
                  if (option.type === 'farmers_market') {
                    navigate('/sell-crop/add');
                    return;
                  }
                  // Block duplicate registration if pending/approved
                  if (existingSeller && (existingSeller.status === 'pending' || existingSeller.status === 'approved')) {
                    setStatusDialogOpen(true);
                    return;
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
          {loadingSeller && (
            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Checking your registration…
            </p>
          )}
        </div>
      ) : showForm ? (
        /* Registration Form (new or rejected re-submission) */
        <>
          {/* Hero Banner */}
          <div className="relative h-44 md:h-56 overflow-hidden">
            <img src={sellerHeroBg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-primary/90 flex items-end p-5">
              <div>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  {isRejected ? 'Edit & Resubmit' : 'Seller'} <span className="text-accent">Registration</span>
                </h2>
                <p className="text-sm text-primary-foreground/80 mt-0.5">Start Selling on <strong>Agrizin</strong></p>
                <p className="text-xs text-primary-foreground/70 mt-1 flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary-foreground" /> Grow Your Business • Reach Thousands of Buyers
                </p>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 -mt-4 relative z-10 max-w-2xl pb-8">
            {isRejected && existingSeller?.rejection_reason && (
              <Card className="mb-3 border-destructive/40 bg-destructive/5">
                <CardContent className="p-3 text-sm">
                  <p className="font-bold text-destructive flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" /> Your previous registration was rejected
                  </p>
                  <p className="text-foreground mt-1"><strong>Reason:</strong> {existingSeller.rejection_reason}</p>
                  <p className="text-muted-foreground text-xs mt-1">Please update the details below and resubmit for approval.</p>
                </CardContent>
              </Card>
            )}
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <SellerRegistrationForm existingSeller={isRejected ? existingSeller : null} />
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {/* Existing-registration status popup */}
      <Dialog open={statusDialogOpen} onOpenChange={(open) => {
        setStatusDialogOpen(open);
        if (!open) setSelectedType(null);
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-2">
              {existingSeller?.status === 'approved' ? (
                <CheckCircle2 className="h-14 w-14 text-primary" />
              ) : (
                <Clock className="h-14 w-14 text-amber-500" />
              )}
            </div>
            <DialogTitle className="text-center">
              {existingSeller?.status === 'approved' ? 'You are already approved' : 'Registration under review'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {existingSeller?.status === 'approved'
                ? 'Your seller account is approved. You can start adding products from your seller dashboard.'
                : 'Your registration has been submitted and is awaiting admin approval. You cannot register again. We will notify you once approved.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            {existingSeller?.status === 'approved' && (
              <Button className="w-full" onClick={() => navigate('/seller/dashboard')}>
                Go to Seller Dashboard
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => { setStatusDialogOpen(false); navigate('/'); }}>
              Back to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default BecomeSeller;
