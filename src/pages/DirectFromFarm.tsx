import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Loader2, Search, SlidersHorizontal, Phone, Star, ShoppingCart, Filter, X, ChevronDown, Navigation, Sprout, Plus, Minus } from 'lucide-react';
import MobilePageHeader from '@/components/MobilePageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { calculateDistance, formatDistance, detectUserLocation, type UserLocation } from '@/utils/locationUtils';

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
  created_at: string | null;
  seller_id: string | null;
  sell_type: string | null;
  latitude: number | null;
  longitude: number | null;
  seller: {
    name: string;
    phone: string;
    photo_url: string | null;
    village: string | null;
    district: string | null;
    state: string | null;
  } | null;
  distance?: number;
}

interface Filters {
  search: string;
  category: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  qualityGrade: string;
  sortBy: string;
}

const defaultFilters: Filters = {
  search: '', category: '', location: '', minPrice: '', maxPrice: '', qualityGrade: '', sortBy: '',
};

const categories = [
  { key: 'Rice', icon: '🌾', label: 'Rice', labelTe: 'బియ్యం', labelHi: 'चावल' },
  { key: 'Vegetables', icon: '🥕', label: 'Vegetables', labelTe: 'కూరగాయలు', labelHi: 'सब्जियां' },
  { key: 'Spices', icon: '🌶', label: 'Mirchi & Spices', labelTe: 'మిర్చి & మసాలాలు', labelHi: 'मिर्च और मसाले' },
  { key: 'Fruits', icon: '🍎', label: 'Fruits', labelTe: 'పండ్లు', labelHi: 'फल' },
  { key: 'Pulses', icon: '🌱', label: 'Pulses', labelTe: 'పప్పులు', labelHi: 'दालें' },
  { key: 'Root', icon: '🥔', label: 'Root Vegetables', labelTe: 'దుంప కూరగాయలు', labelHi: 'कंद सब्जियां' },
];

const cropCategoryMap: Record<string, string> = {
  'Rice': 'Rice', 'Wheat': 'Rice', 'Maize': 'Rice',
  'Tomato': 'Vegetables', 'Onion': 'Vegetables', 'Banana': 'Fruits',
  'Cotton': 'Pulses', 'Sugarcane': 'Pulses',
  'Potato': 'Root', 'Turmeric': 'Spices', 'Groundnut': 'Pulses', 'Mango': 'Fruits',
};

const qualityGrades = ['Grade A', 'Grade B', 'Grade C', 'Organic'];

const sortOptions = [
  { value: 'nearest', label: 'Nearest First', labelTe: 'సమీపంలో ముందు', labelHi: 'निकटतम पहले' },
  { value: 'latest', label: 'Latest Added', labelTe: 'తాజాగా జోడించబడింది', labelHi: 'नवीनतम' },
  { value: 'price_low', label: 'Price: Low to High', labelTe: 'ధర: తక్కువ నుండి ఎక్కువ', labelHi: 'कीमत: कम से अधिक' },
  { value: 'price_high', label: 'Price: High to Low', labelTe: 'ధర: ఎక్కువ నుండి తక్కువ', labelHi: 'कीमत: अधिक से कम' },
];

const getFarmerRating = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return 3.5 + (Math.abs(hash) % 16) / 10;
};

const DirectFromFarm: React.FC = () => {
  const { language, translations } = useLanguage();
  const { addToCart, items: cartItems, updateQuantity } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<CropWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const t = (en: string, te: string, hi?: string) => {
    if (language === 'te') return te;
    if (language === 'hi') return hi || en;
    return en;
  };

  const handleDetectLocation = useCallback(async () => {
    setDetectingLocation(true);
    try {
      const loc = await detectUserLocation();
      setUserLocation(loc);
      toast({ title: t('Location detected!', 'స్థానం గుర్తించబడింది!', 'स्थान पहचाना गया!'), description: loc.address });
    } catch (err: any) {
      toast({ title: t('Could not detect location', 'స్థానాన్ని గుర్తించలేకపోయింది', 'स्थान नहीं मिला'), description: err?.message, variant: 'destructive' });
    } finally {
      setDetectingLocation(false);
    }
  }, []);

  const fetchCrops = async () => {
    setLoading(true);
    const { data: cropsData, error: cropsError } = await supabase
      .from('public_farmer_crops' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (!cropsError && cropsData) {
      const sellerIds = [...new Set((cropsData as any[]).map(c => c.seller_id).filter(Boolean))];
      const { data: sellersData } = await supabase
        .from('public_sellers' as any)
        .select('id, name, phone, photo_url, village, district, state')
        .in('id', sellerIds);

      const sellerMap = new Map((sellersData || []).map((s: any) => [s.id, s]));
      const enrichedCrops = (cropsData as any[]).map(crop => ({
        ...crop,
        seller: sellerMap.get(crop.seller_id) || null,
      }));
      setCrops(enrichedCrops as CropWithSeller[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCrops(); }, []);

  // Try auto-detect location on mount (will silently skip if permission not granted)
  useEffect(() => {
    // Check if permission is already granted before auto-detecting
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          handleDetectLocation();
        }
      }).catch(() => {
        // permissions API not supported, skip auto-detect
      });
    }
  }, []);

  // Add distance to crops when user location changes
  const cropsWithDistance = useMemo(() => {
    if (!userLocation) return crops.map(c => ({ ...c, distance: undefined }));
    return crops.map(crop => {
      if (crop.latitude && crop.longitude) {
        const dist = calculateDistance(userLocation.latitude, userLocation.longitude, crop.latitude, crop.longitude);
        return { ...crop, distance: dist };
      }
      return { ...crop, distance: undefined };
    });
  }, [crops, userLocation]);

  const filteredCrops = useMemo(() => {
    let result = cropsWithDistance.filter((crop) => {
      const sellType = crop.sell_type || 'both';
      // Tab filter
      if (activeTab === 'direct') {
        if (sellType !== 'direct_from_farm' && sellType !== 'both') return false;
      } else if (activeTab === 'self') {
        if (sellType !== 'crop_market' && sellType !== 'both') return false;
      } else {
        if (sellType !== 'direct_from_farm' && sellType !== 'crop_market' && sellType !== 'both') return false;
      }

      const f = appliedFilters;
      if (f.search) {
        const s = f.search.toLowerCase();
        const match = crop.crop_name.toLowerCase().includes(s) ||
          crop.seller?.name?.toLowerCase().includes(s) ||
          crop.seller?.village?.toLowerCase().includes(s);
        if (!match) return false;
      }
      if (f.category || selectedCategory) {
        const cat = f.category || selectedCategory;
        const cropCat = cropCategoryMap[crop.crop_name] || '';
        if (cropCat !== cat && crop.crop_name !== cat) return false;
      }
      if (f.location) {
        const loc = f.location.toLowerCase();
        const match = [crop.location_address, crop.seller?.village, crop.seller?.district, crop.seller?.state]
          .filter(Boolean).some(v => v!.toLowerCase().includes(loc));
        if (!match) return false;
      }
      const priceNum = parseFloat(crop.price.replace(/[^0-9.]/g, ''));
      if (f.minPrice && priceNum < parseFloat(f.minPrice)) return false;
      if (f.maxPrice && priceNum > parseFloat(f.maxPrice)) return false;
      if (f.qualityGrade && crop.quality_grade !== f.qualityGrade) return false;
      return true;
    });

    const sortBy = appliedFilters.sortBy || (userLocation ? 'nearest' : 'latest');
    if (sortBy === 'nearest') {
      result.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, '')));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, '')));
    }

    return result;
  }, [cropsWithDistance, appliedFilters, selectedCategory, activeTab, userLocation]);

  // Group crops by distance
  const nearbyCrops = useMemo(() => filteredCrops.filter(c => c.distance !== undefined && c.distance <= 100), [filteredCrops]);
  const extendedCrops = useMemo(() => filteredCrops.filter(c => c.distance !== undefined && c.distance > 100 && c.distance <= 500), [filteredCrops]);
  const otherCrops = useMemo(() => filteredCrops.filter(c => c.distance === undefined || c.distance > 500), [filteredCrops]);

  const hasLocationGrouping = userLocation && filteredCrops.some(c => c.distance !== undefined);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length + (selectedCategory ? 1 : 0);

  const getFirstImage = (images: string[] | null) => {
    if (images && images.length > 0) return images[0];
    return '/placeholder.svg';
  };

  const getPricePerKg = (crop: CropWithSeller): number => {
    const priceNum = parseFloat(crop.price.replace(/[^0-9.]/g, '')) || 0;
    const isQuintal = crop.quantity?.toLowerCase().includes('quintal') || crop.price?.toLowerCase().includes('quintal');
    // 1 Quintal = 100 kg
    return isQuintal ? Math.round(priceNum / 100) : priceNum;
  };

  const handleAddToCart = (crop: CropWithSeller) => {
    addToCart({
      id: crop.id,
      name: crop.crop_name,
      price: getPricePerKg(crop),
      image: getFirstImage(crop.crop_images),
      category: 'Direct From Farm'
    });
    toast({ title: translations.added_to_cart, description: `${crop.crop_name} ${translations.added_to_cart_desc}` });
  };

  const handleCallFarmer = (phone: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`tel:+91${phone}`, '_self');
  };

  const getSellTypeTag = (sellType: string | null) => {
    if (sellType === 'direct_from_farm' || sellType === 'both') return 'Direct from Farm';
    if (sellType === 'crop_market') return 'Self Crop';
    return null;
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-3 w-3 ${i < full ? 'fill-yellow-400 text-yellow-400' : i === full && half ? 'fill-yellow-400/50 text-yellow-400' : 'text-muted-foreground/30'}`} />
        ))}
      </div>
    );
  };

  const renderProductCard = (crop: CropWithSeller) => {
    const rating = crop.seller ? getFarmerRating(crop.seller.name) : 4.0;
    const isOrganic = crop.quality_grade === 'Organic';
    const isPremium = crop.quality_grade === 'Grade A' || isOrganic;
    const sellTag = getSellTypeTag(crop.sell_type);

    return (
      <Card key={crop.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-card border border-border rounded-xl relative">
        <Link to={`/sell-crop/${crop.id}`} state={{ from: '/direct-from-farm' }}>
          <div className="relative">
            <img
              src={getFirstImage(crop.crop_images)}
              alt={crop.crop_name}
              className="w-full h-32 sm:h-48 object-cover"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
            {/* Sell type tag */}
            {sellTag && (
              <Badge className={`absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded ${
                sellTag === 'Direct from Farm' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {sellTag === 'Direct from Farm' ? '✅ ' : '🌱 '}{sellTag}
              </Badge>
            )}
            {isPremium && (
              <Badge className="absolute bottom-2 left-2 bg-green-700/90 text-white text-[10px] px-2 py-0.5 rounded">
                {isOrganic ? 'Organic' : 'Premium'}
              </Badge>
            )}
            {crop.seller && (
              <div className="absolute bottom-2 right-2">
                {crop.seller.photo_url ? (
                  <img src={crop.seller.photo_url} alt={crop.seller.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white object-cover shadow" />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm border-2 border-white shadow">
                    {crop.seller.name.charAt(0)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-2 sm:p-3 pr-10 sm:pr-12">
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1">{crop.crop_name}</h3>
              {crop.seller && <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0 truncate max-w-[60px] sm:max-w-none">{crop.seller.name}</span>}
            </div>

            <div className="flex items-baseline gap-1 mt-0.5 sm:mt-1">
              <span className="text-sm sm:text-lg font-bold text-foreground">₹{getPricePerKg(crop)}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">/ kg</span>
              {(crop.quantity?.toLowerCase().includes('quintal')) && (
                <span className="text-[9px] sm:text-[10px] text-muted-foreground ml-1">(₹{crop.price}/Quintal)</span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <span className="text-green-600">✓</span> {crop.quantity}
              </span>
            </div>

            {/* Location + Distance (inline, distance right-aligned) */}
            <div className="flex items-center justify-between gap-2 mt-1 sm:mt-1.5">
              <span className="text-[10px] sm:text-xs text-muted-foreground truncate flex items-center gap-0.5 min-w-0 flex-1">
                <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                <span className="truncate">{crop.seller?.village || crop.seller?.district || crop.location_address || ''}</span>
              </span>
              {crop.distance !== undefined && (
                <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary font-medium flex-shrink-0 whitespace-nowrap">
                  {formatDistance(crop.distance)}
                </Badge>
              )}
            </div>

            {crop.seller && (
              <div className="flex items-center justify-between mt-1">
                {renderStars(rating)}
                <span className="text-[10px] text-muted-foreground font-medium">★ {rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </Link>

        {/* Farmer contact details intentionally removed from listing cards — shown only on product detail page */}


        {/* + / quantity stepper - positioned between image and details (overlapping image bottom-right) */}
        <div className="absolute right-2 sm:right-3 z-10 top-[7rem] sm:top-[11rem]">
          {(() => {
            const cartItem = cartItems.find(
              (i) => i.id === crop.id || (i.name === crop.crop_name && i.category === 'Direct From Farm')
            );
            if (!cartItem) {
              return (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(crop); }}
                  aria-label={t('Add', 'జోడించు', 'जोड़ें')}
                  className="flex items-center justify-center h-5 w-9 sm:h-9 sm:w-10 rounded-lg bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 active:scale-95 transition shadow-md"
                >
                  <Plus className="h-3 w-3 sm:h-5 sm:w-5" strokeWidth={3} />
                </button>
              );
            }
            return (
              <div className="flex items-center justify-between gap-0.5 bg-green-600 rounded-lg h-5 w-[4.5rem] sm:h-9 sm:w-10 sm:flex-col sm:py-0.5 px-1 sm:px-0 shadow-md">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(cartItem.id, cartItem.quantity + 1); }}
                  className="text-white hover:bg-green-700 rounded active:scale-95 transition leading-none"
                  aria-label="Increase"
                >
                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
                </button>
                <span className="text-white font-bold text-[9px] sm:text-[10px] leading-none">{cartItem.quantity}kg</span>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(cartItem.id, cartItem.quantity - 1); }}
                  className="text-white hover:bg-green-700 rounded active:scale-95 transition leading-none"
                  aria-label="Decrease"
                >
                  <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
                </button>
              </div>
            );
          })()}
        </div>

      </Card>
    );
  };

  const renderCropGrid = (cropsList: CropWithSeller[], sectionTitle?: string) => {
    if (cropsList.length === 0) return null;
    return (
      <div className="mb-6">
        {sectionTitle && (
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            {sectionTitle}
            <Badge variant="secondary" className="text-xs">{cropsList.length}</Badge>
          </h2>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {cropsList.map(crop => renderProductCard(crop))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobilePageHeader
        title={t('Search fresh products...', 'తాజా ఉత్పత్తులు శోధించండి...', 'ताज़ा उत्पाद खोजें...')}
        fallbackPath="/"
        rightContent={
          <button onClick={() => setDrawerOpen(true)} className="p-1.5">
            <SlidersHorizontal className="h-5 w-5 text-foreground" />
          </button>
        }
      />

      {/* Location bar (mobile) */}
      <div className="lg:hidden bg-card px-4 py-2 border-b border-border">
        <button
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          className="flex items-center gap-2 w-full"
        >
          {detectingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Navigation className="h-4 w-4 text-primary" />
          )}
          <span className="text-sm text-foreground font-medium truncate">
            {userLocation?.address || t('Detect your location', 'మీ స్థానాన్ని గుర్తించండి', 'अपना स्थान पहचानें')}
          </span>
          {userLocation && <MapPin className="h-3 w-3 text-green-600 ml-auto flex-shrink-0" />}
        </button>
      </div>

      {/* Tabs: All / Direct from Farm / Self Crop */}
      <div className="lg:hidden bg-card border-b border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-0 bg-transparent rounded-none border-b-0">
            <TabsTrigger value="all" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs py-2.5">
              {t('All Crops', 'అన్ని పంటలు', 'सभी फसलें')}
            </TabsTrigger>
            <TabsTrigger value="direct" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent text-xs py-2.5">
              ✅ {t('Direct from Farm', 'పొలం నుండి', 'खेत से')}
            </TabsTrigger>
            <TabsTrigger value="self" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-xs py-2.5">
              🌱 {t('Self Crop', 'స్వంత పంట', 'स्वयं फसल')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile filter chips with Nearby button */}
      <div className="lg:hidden bg-card px-4 py-1.5 flex gap-2 overflow-x-auto border-b border-border no-scrollbar">
        <button
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 font-medium ${
            userLocation ? 'bg-green-700 text-white border border-green-700' : 'border border-border text-foreground'
          }`}
        >
          {detectingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
          {t('Nearby', 'సమీపంలో', 'नज़दीक')}
        </button>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border text-xs text-foreground whitespace-nowrap flex-shrink-0"
        >
          <Filter className="h-3 w-3 text-primary" /> {t('All Categories', 'అన్ని వర్గాలు', 'सभी श्रेणियां')} <ChevronDown className="h-3 w-3" />
        </button>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border text-xs text-foreground whitespace-nowrap flex-shrink-0"
        >
          {t('Price', 'ధర', 'कीमत')} <ChevronDown className="h-3 w-3" />
        </button>
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs whitespace-nowrap flex-shrink-0 ${activeFilterCount > 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground'}`}
        >
          <SlidersHorizontal className="h-3 w-3" /> {t('More Filters', 'మరిన్ని ఫిల్టర్లు', 'अधिक फिल्टर')}
          {activeFilterCount > 0 && <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block"><Header /></div>

      <div className="w-full px-4 py-4 lg:py-6">
        {/* Desktop header with location */}
        <div className="hidden lg:block mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('Crop Marketplace', 'పంట మార్కెట్', 'फसल बाज़ार')}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t('Buy fresh crops directly from verified farmers near you', 'మీ సమీపంలోని ధృవీకరించబడిన రైతుల నుండి తాజా పంటలు కొనుగోలు చేయండి', 'अपने पास के सत्यापित किसानों से ताज़ा फसलें खरीदें')}</p>
            </div>
            <Button
              variant={userLocation ? 'default' : 'outline'}
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className={`gap-2 ${userLocation ? 'bg-green-700 hover:bg-green-800' : ''}`}
            >
              {detectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {userLocation?.address ? `📍 ${userLocation.address.split(',')[0]}` : t('Nearby', 'సమీపంలో', 'नज़दीक')}
            </Button>
          </div>

          {/* Desktop tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">{t('All Crops', 'అన్ని పంటలు', 'सभी फसलें')}</TabsTrigger>
              <TabsTrigger value="direct">✅ {t('Direct from Farm', 'పొలం నుండి', 'खेत से')}</TabsTrigger>
              <TabsTrigger value="self">🌱 {t('Self Crop', 'స్వంత పంట', 'स्वयं फसल')}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('Search crops, farmers...', 'పంటలు, రైతులు శోధించండి...', 'फसल, किसान खोजें...')}
                value={appliedFilters.search}
                onChange={(e) => setAppliedFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9 h-10 rounded-full"
              />
            </div>
            <Select value={appliedFilters.qualityGrade} onValueChange={(v) => setAppliedFilters(prev => ({ ...prev, qualityGrade: v === 'all' ? '' : v }))}>
              <SelectTrigger className="w-40 h-10 rounded-full"><SelectValue placeholder={t('Quality', 'నాణ్యత', 'गुणवत्ता')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Grades', 'అన్ని గ్రేడ్లు', 'सभी ग्रेड')}</SelectItem>
                {qualityGrades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={appliedFilters.sortBy} onValueChange={(v) => setAppliedFilters(prev => ({ ...prev, sortBy: v }))}>
              <SelectTrigger className="w-48 h-10 rounded-full"><SelectValue placeholder={t('Sort By', 'క్రమపరచు', 'क्रमबद्ध')} /></SelectTrigger>
              <SelectContent>
                {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{language === 'te' ? o.labelTe : language === 'hi' ? o.labelHi : o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category icons */}
        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar mb-4">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => {
                setSelectedCategory(prev => prev === cat.key ? '' : cat.key);
                setAppliedFilters(prev => ({ ...prev, category: prev.category === cat.key ? '' : cat.key }));
              }}
              className={`flex flex-col items-center gap-1.5 min-w-[70px] flex-shrink-0 p-2 rounded-xl transition-all ${
                selectedCategory === cat.key ? 'bg-primary/10 border-2 border-primary' : 'bg-card border border-border'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[11px] text-foreground font-medium text-center leading-tight">
                {language === 'te' ? cat.labelTe : language === 'hi' ? cat.labelHi : cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Product grid with location grouping */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="text-center py-20">
            <Sprout className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">{t('No crops available in your region', 'మీ ప్రాంతంలో పంటలు అందుబాటులో లేవు', 'आपके क्षेत्र में कोई फसल उपलब्ध नहीं')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('Try adjusting your filters or expanding your search area', 'మీ ఫిల్టర్‌లను సవరించండి లేదా శోధన ప్రాంతాన్ని విస్తరించండి', 'अपने फिल्टर बदलें या खोज क्षेत्र बढ़ाएं')}</p>
            {activeFilterCount > 0 && (
              <Button variant="outline" className="mt-4" onClick={() => { setAppliedFilters(defaultFilters); setSelectedCategory(''); }}>
                {t('Clear Filters', 'ఫిల్టర్లు తీసేయండి', 'फिल्टर हटाएं')}
              </Button>
            )}
          </div>
        ) : hasLocationGrouping ? (
          <>
            {renderCropGrid(nearbyCrops, `📍 ${t('Nearby Crops (0-100 km)', 'సమీపంలోని పంటలు (0-100 కి.మీ)', 'नज़दीकी फसलें (0-100 कि.मी.)')}`)}
            {renderCropGrid(extendedCrops, `🗺️ ${t('Extended Area (100-500 km)', 'విస్తారిత ప్రాంతం (100-500 కి.మీ)', 'विस्तारित क्षेत्र (100-500 कि.मी.)')}`)}
            {renderCropGrid(otherCrops, `🌍 ${t('Other Regions', 'ఇతర ప్రాంతాలు', 'अन्य क्षेत्र')}`)}
            {nearbyCrops.length === 0 && extendedCrops.length === 0 && otherCrops.length > 0 && (
              <p className="text-sm text-muted-foreground text-center mb-4">
                {t('No crops found within 500 km. Showing crops from other regions.', '500 కి.మీ లోపల పంటలు కనుగొనబడలేదు. ఇతర ప్రాంతాల పంటలు చూపిస్తున్నాము.', '500 कि.मी. के भीतर कोई फसल नहीं मिली। अन्य क्षेत्रों की फसलें दिखा रहे हैं।')}
              </p>
            )}
          </>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">
              {t('Available Crops', 'అందుబాటులో ఉన్న పంటలు', 'उपलब्ध फसलें')}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {filteredCrops.map(crop => renderProductCard(crop))}
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:block"><Footer /></div>

      {/* Filter Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-bold text-lg">{t('Filters & Sort', 'ఫిల్టర్లు & క్రమం', 'फिल्टर और सॉर्ट')}</h3>
            <button onClick={() => setDrawerOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto">
            <div>
              <Label className="text-sm font-medium">{t('Location', 'స్థానం', 'स्थान')}</Label>
              <Input
                placeholder={t('Enter location...', 'స్థానం నమోదు చేయండి...', 'स्थान दर्ज करें...')}
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">{t('Category', 'వర్గం', 'श्रेणी')}</Label>
              <Select value={filters.category} onValueChange={(v) => setFilters(prev => ({ ...prev, category: v === 'all' ? '' : v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t('All Categories', 'అన్ని వర్గాలు', 'सभी श्रेणियां')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All', 'అన్నీ', 'सभी')}</SelectItem>
                  {categories.map(c => <SelectItem key={c.key} value={c.key}>{language === 'te' ? c.labelTe : language === 'hi' ? c.labelHi : c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">{t('Min Price', 'కనిష్ట ధర', 'न्यूनतम कीमत')}</Label>
                <Input type="number" value={filters.minPrice} onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))} className="mt-1" placeholder="₹0" />
              </div>
              <div>
                <Label className="text-sm font-medium">{t('Max Price', 'గరిష్ట ధర', 'अधिकतम कीमत')}</Label>
                <Input type="number" value={filters.maxPrice} onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))} className="mt-1" placeholder="₹10000" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">{t('Quality Grade', 'నాణ్యత గ్రేడ్', 'गुणवत्ता ग्रेड')}</Label>
              <Select value={filters.qualityGrade} onValueChange={(v) => setFilters(prev => ({ ...prev, qualityGrade: v === 'all' ? '' : v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t('All Grades', 'అన్ని గ్రేడ్లు', 'सभी ग्रेड')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All', 'అన్నీ', 'सभी')}</SelectItem>
                  {qualityGrades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">{t('Sort By', 'క్రమపరచు', 'क्रमबद्ध')}</Label>
              <Select value={filters.sortBy} onValueChange={(v) => setFilters(prev => ({ ...prev, sortBy: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t('Select', 'ఎంచుకోండి', 'चुनें')} /></SelectTrigger>
                <SelectContent>
                  {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{language === 'te' ? o.labelTe : language === 'hi' ? o.labelHi : o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter className="flex-row gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setFilters(defaultFilters); setAppliedFilters(defaultFilters); setSelectedCategory(''); setDrawerOpen(false); }}>
              {t('Clear All', 'అన్నీ తీసేయి', 'सब हटाएं')}
            </Button>
            <Button className="flex-1" onClick={() => { setAppliedFilters(filters); if (filters.category) setSelectedCategory(filters.category); setDrawerOpen(false); }}>
              {t('Apply Filters', 'ఫిల్టర్లు వర్తించు', 'फिल्टर लागू करें')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default DirectFromFarm;
