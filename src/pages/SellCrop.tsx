import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2, Sprout, X, Plus, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

interface CropWithSeller {
  id: string;
  crop_name: string;
  quantity: string;
  price: string;
  crop_images: string[] | null;
  harvest_date: string | null;
  quality_grade: string;
  availability_location: string;
  location_address: string | null;
  user_id: string;
  seller: {
    name: string;
    phone: string;
    photo_url: string | null;
    village: string | null;
    district: string | null;
    state: string | null;
  } | null;
}

interface Filters {
  cropName: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  quantity: string;
  availabilityLocation: string;
}

const defaultFilters: Filters = {
  cropName: '', location: '', minPrice: '', maxPrice: '', quantity: '', availabilityLocation: '',
};

const cropOptions = ['Rice', 'Wheat', 'Tomato', 'Onion', 'Potato', 'Cotton', 'Sugarcane', 'Banana'];
const quantityOptions = [
  { label: 'Less than 100 Kg', value: 'lt100kg' },
  { label: '100 Kg – 500 Kg', value: '100to500kg' },
  { label: '1 Quintal – 10 Quintal', value: '1to10q' },
  { label: 'Above 10 Quintal', value: 'gt10q' },
];
const availabilityOptions = ['Farm Location', 'AC Cold Storage', 'Godham (Warehouse)', 'Marketplace'];

const parseQuantityKg = (qty: string): number => {
  const lower = qty.toLowerCase();
  const num = parseFloat(qty);
  if (isNaN(num)) return 0;
  if (lower.includes('ton')) return num * 1000;
  if (lower.includes('quintal')) return num * 100;
  return num;
};

const SellCrop: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<CropWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters);
  const [activeTab, setActiveTab] = useState('crop');

  const t = (en: string, te: string, hi?: string) => {
    if (language === 'te') return te;
    if (language === 'hi') return hi || en;
    return en;
  };

  const fetchCrops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('farmer_crops')
      .select('*, seller:sellers!farmer_crops_seller_id_fkey(name, phone, photo_url, village, district, state)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCrops(data as unknown as CropWithSeller[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCrops(); }, []);

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const f = appliedFilters;
      if (f.cropName && crop.crop_name.toLowerCase() !== f.cropName.toLowerCase()) return false;
      if (f.location) {
        const loc = f.location.toLowerCase();
        const match = [crop.location_address, crop.seller?.village, crop.seller?.district, crop.seller?.state]
          .filter(Boolean).some((v) => v!.toLowerCase().includes(loc));
        if (!match) return false;
      }
      const priceNum = parseFloat(crop.price.replace(/[^0-9.]/g, ''));
      if (f.minPrice && priceNum < parseFloat(f.minPrice)) return false;
      if (f.maxPrice && priceNum > parseFloat(f.maxPrice)) return false;
      if (f.quantity) {
        const qtyKg = parseQuantityKg(crop.quantity);
        switch (f.quantity) {
          case 'lt100kg': if (qtyKg >= 100) return false; break;
          case '100to500kg': if (qtyKg < 100 || qtyKg > 500) return false; break;
          case '1to10q': if (qtyKg < 100 || qtyKg > 1000) return false; break;
          case 'gt10q': if (qtyKg <= 1000) return false; break;
        }
      }
      if (f.availabilityLocation && crop.availability_location !== f.availabilityLocation) return false;
      return true;
    });
  }, [crops, appliedFilters]);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const getFirstImage = (images: string[] | null) => {
    if (images && images.length > 0) return images[0];
    return '/placeholder.svg';
  };

  const renderCropCard = (crop: CropWithSeller) => (
    <Card key={crop.id} className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <Link to={`/sell-crop/${crop.id}`}>
          <div className="flex">
            <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-muted">
              <img src={getFirstImage(crop.crop_images)} alt={crop.crop_name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">{crop.crop_name}</h3>
                <p className="text-sm text-muted-foreground">{crop.quantity}</p>
                <p className="text-sm font-semibold text-primary">₹{crop.price}</p>
              </div>
              {crop.seller && (
                <div className="flex items-center gap-2 mt-2">
                  {crop.seller.photo_url ? (
                    <img src={crop.seller.photo_url} alt={crop.seller.name} className="w-7 h-7 rounded-full object-cover border-2 border-green-500" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                      {crop.seller.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{crop.seller.name}</p>
                    <p className="text-xs text-muted-foreground">+91 {crop.seller.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>

        {crop.location_address && (
          <div className="bg-muted/50 px-3 py-2 flex items-center gap-2 border-t">
            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-muted-foreground truncate">{crop.location_address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="lg:hidden sticky top-0 z-50 bg-green-600 text-white flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold flex-1">{t('Sell Crop', 'పంట అమ్మండి', 'फसल बेचें')}</h1>
      </div>

      <div className="hidden lg:block"><Header /></div>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Filter + Add Crop inline row */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => { setFilters(appliedFilters); setDrawerOpen(true); }}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {t('Filter', 'ఫిల్టర్', 'फ़िल्टर')}
            {activeFilterCount > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate('/sell-crop/add')}
          >
            <Plus className="h-4 w-4 mr-2" /> {t('Add Crop Details', 'పంట వివరాలు జోడించండి', 'फसल विवरण जोड़ें')}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="text-center py-16">
            <Sprout className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-1">
              {t('No crops available', 'పంటలు లేవు', 'कोई फसल उपलब्ध नहीं')}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {activeFilterCount > 0
                ? t('No crops match your filters', 'ఫిల్టర్‌కు సరిపోయే పంటలు లేవు')
                : t('Farmers have not posted any crops yet', 'రైతులు ఇంకా పంటలు పోస్ట్ చేయలేదు')}
            </p>
            {activeFilterCount > 0 && (
              <Button onClick={() => setAppliedFilters(defaultFilters)}>
                {t('Reset Filters', 'ఫిల్టర్‌లు రీసెట్ చేయండి')}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredCrops.map(crop => renderCropCard(crop))}
          </div>
        )}
      </main>

      {/* Filter Drawer - All filters in one panel */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('Filters', 'ఫిల్టర్‌లు', 'फ़िल्टर')}</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('Crop', 'పంట', 'फसल')}</Label>
                <Select value={filters.cropName} onValueChange={(v) => setFilters({ ...filters, cropName: v })}>
                  <SelectTrigger><SelectValue placeholder={t('Select crop', 'పంట ఎంచుకోండి', 'फसल चुनें')} /></SelectTrigger>
                  <SelectContent>
                    {cropOptions.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('Location', 'ప్రాంతం', 'स्थान')}</Label>
                <Input placeholder={t('Village, District or State', 'గ్రామం, జిల్లా లేదా రాష్ట్రం', 'गाँव, जिला या राज्य')} value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('Price Range', 'ధర పరిధి', 'कीमत सीमा')}</Label>
                <div className="flex gap-3">
                  <Input type="number" placeholder="₹ Min" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
                  <Input type="number" placeholder="₹ Max" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('Quantity', 'పరిమాణం', 'मात्रा')}</Label>
                <Select value={filters.quantity} onValueChange={(v) => setFilters({ ...filters, quantity: v })}>
                  <SelectTrigger><SelectValue placeholder={t('Select range', 'పరిధి ఎంచుకోండి', 'सीमा चुनें')} /></SelectTrigger>
                  <SelectContent>
                    {quantityOptions.map((q) => (<SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('Availability', 'అందుబాటు', 'उपलब्धता')}</Label>
                <Select value={filters.availabilityLocation} onValueChange={(v) => setFilters({ ...filters, availabilityLocation: v })}>
                  <SelectTrigger><SelectValue placeholder={t('Select location', 'ప్రాంతం ఎంచుకోండి', 'स्थान चुनें')} /></SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DrawerFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setFilters(defaultFilters); setAppliedFilters(defaultFilters); setDrawerOpen(false); }}>
              {t('Reset Filter', 'ఫిల్టర్ రీసెట్', 'फ़िल्टर रीसेट')}
            </Button>
            <Button className="flex-1" onClick={() => { setAppliedFilters(filters); setDrawerOpen(false); }}>
              {t('Apply Filter', 'ఫిల్టర్ వర్తించు', 'फ़िल्टर लागू करें')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="hidden lg:block"><Footer /></div>
      <MobileBottomNav />
    </div>
  );
};

export default SellCrop;
