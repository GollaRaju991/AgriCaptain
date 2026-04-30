import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Eye, Heart, ShoppingCart, Loader2, Sprout, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';

interface CropRow {
  id: string;
  crop_name: string;
  price: string;
  quantity: string;
  crop_images: string[] | null;
  location_address: string | null;
  availability_location: string;
  sell_type: string;
  created_at: string;
  review_status?: string | null;
  rejection_reason?: string | null;
}

type TabKey = 'all' | 'pending' | 'approved' | 'rejected';

const MyCrops: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<CropRow[]>([]);
  const [tab, setTab] = useState<TabKey>('all');
  const [sellerName, setSellerName] = useState('');

  const t = (en: string, te: string, hi?: string) => {
    if (language === 'te') return te;
    if (language === 'hi') return hi || en;
    return en;
  };

  useEffect(() => {
    const load = async () => {
      if (!sellerId) return;
      setLoading(true);
      const [{ data: cropsData }, { data: sellerData }] = await Promise.all([
        supabase.from('farmer_crops').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false }),
        supabase.from('sellers').select('name').eq('id', sellerId).maybeSingle(),
      ]);
      setCrops((cropsData || []) as any);
      if (sellerData) setSellerName((sellerData as any).name || '');
      setLoading(false);
    };
    load();
  }, [sellerId]);

  type StatusKey = 'pending' | 'approved' | 'rejected';
  const getStatus = (c: CropRow): StatusKey => {
    const s = (c.review_status || 'pending').toLowerCase();
    if (s === 'approved') return 'approved';
    if (s === 'rejected') return 'rejected';
    return 'pending';
  };

  const filtered = useMemo(() => {
    if (tab === 'all') return crops;
    return crops.filter(c => getStatus(c) === tab);
  }, [crops, tab]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: t('All', 'అన్ని', 'सभी') },
    { key: 'pending', label: t('Pending', 'పెండింగ్', 'लंबित') },
    { key: 'approved', label: t('Approved', 'ఆమోదించబడింది', 'स्वीकृत') },
    { key: 'rejected', label: t('Rejected', 'తిరస్కరించబడింది', 'अस्वीकृत') },
  ];

  const statusBadge = (status: StatusKey) => {
    const styles: Record<StatusKey, string> = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const dot: Record<StatusKey, string> = {
      pending: 'bg-amber-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    const label =
      status === 'approved' ? t('Approved', 'ఆమోదించబడింది', 'स्वीकृत')
      : status === 'rejected' ? t('Rejected', 'తిరస్కరించబడింది', 'अस्वीकृत')
      : t('Pending Approval', 'ఆమోదం కోసం వేచి', 'अनुमोदन प्रतीक्षित');
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-green-600 text-white flex items-center gap-3 px-4 py-3 shadow">
        <button onClick={() => navigate('/sell-crop/add')} aria-label="Back">
          <ArrowLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-bold">{t('My Crops', 'నా పంటలు', 'मेरी फसलें')}</h1>
      </div>

      <div className="hidden lg:block"><Header /></div>

      {/* Desktop title row */}
      <div className="hidden lg:flex container mx-auto max-w-3xl px-4 pt-6 pb-2 items-center gap-3">
        <button onClick={() => navigate('/sell-crop/add')} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">{t('My Crops', 'నా పంటలు', 'मेरी फसलें')}</h1>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border sticky top-12 lg:top-0 z-40">
        <div className="container mx-auto max-w-3xl px-2 flex overflow-x-auto no-scrollbar">
          {tabs.map(tb => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === tb.key ? 'border-green-600 text-green-700' : 'border-transparent text-muted-foreground'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto max-w-3xl px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Sprout className="h-16 w-16 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground">
              {t('No crops in this list', 'ఈ జాబితాలో పంటలు లేవు', 'इस सूची में कोई फसल नहीं')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {sellerName && t(`for ${sellerName}`, `${sellerName} కోసం`, `${sellerName} के लिए`)}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3 px-1">
              {filtered.length} {t('Crops Found', 'పంటలు కనుగొనబడ్డాయి', 'फसलें मिलीं')}
            </p>
            <div className="space-y-3">
              {filtered.map(crop => {
                const img = (crop.crop_images && crop.crop_images[0]) || '/placeholder.svg';
                const status = getStatus(crop);
                return (
                  <Card
                    key={crop.id}
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow rounded-xl"
                    onClick={() => navigate(`/sell-crop/my-crops/${sellerId}/${crop.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={img}
                            alt={crop.crop_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-bold text-foreground truncate">{crop.crop_name}</h3>
                              <p className="text-sm font-semibold text-foreground mt-0.5">
                                ₹{crop.price} <span className="text-xs text-muted-foreground font-normal">/ kg</span>
                              </p>
                              {crop.location_address && (
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 flex-shrink-0" /> {crop.location_address}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              {statusBadge(status)}
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> 0</span>
                            <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> 0</span>
                            <span className="inline-flex items-center gap-1"><ShoppingCart className="h-3.5 w-3.5" /> {crop.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default MyCrops;
