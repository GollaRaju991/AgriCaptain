import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Loader2, Sprout, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
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
  cropName: '',
  location: '',
  minPrice: '',
  maxPrice: '',
  quantity: '',
  availabilityLocation: '',
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
  return num; // kg
};

const SellCrop: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<CropWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters);

  useEffect(() => {
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
    fetchCrops();
  }, []);

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const f = appliedFilters;

      if (f.cropName && crop.crop_name.toLowerCase() !== f.cropName.toLowerCase()) return false;

      if (f.location) {
        const loc = f.location.toLowerCase();
        const match = [crop.location_address, crop.seller?.village, crop.seller?.district, crop.seller?.state]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(loc));
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-green-600 text-white flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold flex-1">
          {language === 'te' ? 'పంట అమ్మండి' : language === 'hi' ? 'फसल बेचें' : 'Sell Crop'}
        </h1>
      </div>

      {/* Desktop header */}
      <div className="hidden lg:block">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Filter bar */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => { setFilters(appliedFilters); setDrawerOpen(true); }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {language === 'te' ? 'ఫిల్టర్' : 'Filter'}
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setAppliedFilters(defaultFilters)}>
              <X className="h-4 w-4 mr-1" />
              {language === 'te' ? 'రీసెట్' : 'Reset'}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="text-center py-16">
            <Sprout className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-1">
              {language === 'te' ? 'పంటలు లేవు' : 'No crops available'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {activeFilterCount > 0
                ? (language === 'te' ? 'ఫిల్టర్‌కు సరిపోయే పంటలు లేవు' : 'No crops match your filters')
                : (language === 'te' ? 'రైతులు ఇంకా పంటలు పోస్ట్ చేయలేదు' : 'Farmers have not posted any crops yet')}
            </p>
            {activeFilterCount > 0 ? (
              <Button onClick={() => setAppliedFilters(defaultFilters)}>
                {language === 'te' ? 'ఫిల్టర్‌లు రీసెట్ చేయండి' : 'Reset Filters'}
              </Button>
            ) : (
              <Link to="/become-seller">
                <Button>{language === 'te' ? 'పంట పోస్ట్ చేయండి' : 'Post Your Crop'}</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredCrops.map((crop) => (
              <Link key={crop.id} to={`/sell-crop/${crop.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-muted">
                        <img
                          src={getFirstImage(crop.crop_images)}
                          alt={crop.crop_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                        />
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{crop.crop_name}</h3>
                          <p className="text-sm text-muted-foreground">{crop.quantity}</p>
                        </div>
                        {crop.seller && (
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              {crop.seller.photo_url ? (
                                <img src={crop.seller.photo_url} alt={crop.seller.name} className="w-8 h-8 rounded-full object-cover border-2 border-green-500" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                                  {crop.seller.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-foreground">{crop.seller.name}</p>
                                <p className="text-xs text-muted-foreground">+91 {crop.seller.phone}</p>
                              </div>
                            </div>
                            <a
                              href={`tel:+91${crop.seller.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Phone className="h-5 w-5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    {crop.location_address && (
                      <div className="bg-muted/50 px-3 py-2 flex items-center gap-2 border-t">
                        <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">{crop.location_address}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Filter Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>{language === 'te' ? 'ఫిల్టర్‌లు' : 'Filters'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4 overflow-y-auto">
            {/* Crop Name */}
            <div className="space-y-1.5">
              <Label>{language === 'te' ? 'పంట పేరు' : 'Crop Name'}</Label>
              <Select value={filters.cropName} onValueChange={(v) => setFilters({ ...filters, cropName: v })}>
                <SelectTrigger><SelectValue placeholder={language === 'te' ? 'ఎంచుకోండి' : 'Select crop'} /></SelectTrigger>
                <SelectContent>
                  {cropOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label>{language === 'te' ? 'ప్రాంతం' : 'Location'}</Label>
              <Input
                placeholder={language === 'te' ? 'గ్రామం, జిల్లా లేదా రాష్ట్రం' : 'Village, District or State'}
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            {/* Price Range */}
            <div className="space-y-1.5">
              <Label>{language === 'te' ? 'ధర పరిధి' : 'Price Range'}</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={language === 'te' ? 'కనిష్ఠ' : 'Min'}
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder={language === 'te' ? 'గరిష్ఠ' : 'Max'}
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label>{language === 'te' ? 'పరిమాణం' : 'Quantity'}</Label>
              <Select value={filters.quantity} onValueChange={(v) => setFilters({ ...filters, quantity: v })}>
                <SelectTrigger><SelectValue placeholder={language === 'te' ? 'ఎంచుకోండి' : 'Select range'} /></SelectTrigger>
                <SelectContent>
                  {quantityOptions.map((q) => (
                    <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability Location */}
            <div className="space-y-1.5">
              <Label>{language === 'te' ? 'అందుబాటు ప్రాంతం' : 'Availability Location'}</Label>
              <Select value={filters.availabilityLocation} onValueChange={(v) => setFilters({ ...filters, availabilityLocation: v })}>
                <SelectTrigger><SelectValue placeholder={language === 'te' ? 'ఎంచుకోండి' : 'Select location'} /></SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setFilters(defaultFilters); setAppliedFilters(defaultFilters); setDrawerOpen(false); }}
            >
              {language === 'te' ? 'రీసెట్' : 'Reset'}
            </Button>
            <Button
              className="flex-1"
              onClick={() => { setAppliedFilters(filters); setDrawerOpen(false); }}
            >
              {language === 'te' ? 'ఫిల్టర్ వర్తించు' : 'Apply Filter'}
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
