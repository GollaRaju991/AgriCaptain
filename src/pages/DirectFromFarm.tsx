import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2, Search, SlidersHorizontal, Phone, Star, ShoppingCart, Eye, Filter, X, ChevronDown } from 'lucide-react';
import MobilePageHeader from '@/components/MobilePageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<CropWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters);
  const [selectedCategory, setSelectedCategory] = useState('');

  const t = (en: string, te: string, hi?: string) => {
    if (language === 'te') return te;
    if (language === 'hi') return hi || en;
    return en;
  };

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

  const filteredCrops = useMemo(() => {
    let result = crops.filter((crop) => {
      // Only show crops listed for Direct From Farm
      const sellType = (crop as any).sell_type || 'both';
      if (sellType !== 'direct_from_farm' && sellType !== 'both') return false;
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

    const sortBy = appliedFilters.sortBy || 'latest';
    if (sortBy === 'price_low') result.sort((a, b) => parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, '')));
    else if (sortBy === 'price_high') result.sort((a, b) => parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, '')));

    return result;
  }, [crops, appliedFilters, selectedCategory]);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length + (selectedCategory ? 1 : 0);

  const getFirstImage = (images: string[] | null) => {
    if (images && images.length > 0) return images[0];
    return '/placeholder.svg';
  };

  const handleAddToCart = (crop: CropWithSeller) => {
    const priceNum = parseFloat(crop.price.replace(/[^0-9.]/g, '')) || 0;
    addToCart({
      id: crop.id,
      name: crop.crop_name,
      price: priceNum,
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

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-3 w-3 ${i < full ? 'fill-yellow-400 text-yellow-400' : i === full && half ? 'fill-yellow-400/50 text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  const renderProductCard = (crop: CropWithSeller) => {
    const rating = crop.seller ? getFarmerRating(crop.seller.name) : 4.0;
    const isOrganic = crop.quality_grade === 'Organic';
    const isPremium = crop.quality_grade === 'Grade A' || isOrganic;

    return (
      <Card key={crop.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white border border-gray-100 rounded-xl">
        <Link to={`/sell-crop/${crop.id}`}>
          <div className="relative">
            <img
              src={getFirstImage(crop.crop_images)}
              alt={crop.crop_name}
              className="w-full h-32 sm:h-48 object-cover"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
            {isPremium && (
              <Badge className="absolute bottom-2 left-2 bg-green-700/90 text-white text-[10px] px-2 py-0.5 rounded">
                {isOrganic ? 'Organic' : 'Premium'}
              </Badge>
            )}
            {crop.quality_grade && !isPremium && (
              <Badge className="absolute bottom-2 left-2 bg-gray-600/80 text-white text-[10px] px-2 py-0.5 rounded">
                {crop.quality_grade.replace('Grade ', '')}
              </Badge>
            )}
            {crop.seller && (
              <div className="absolute bottom-2 right-2">
                {crop.seller.photo_url ? (
                  <img src={crop.seller.photo_url} alt={crop.seller.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white object-cover shadow" />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm border-2 border-white shadow">
                    {crop.seller.name.charAt(0)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-2 sm:p-3">
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-1">{crop.crop_name}</h3>
              {crop.seller && <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0 truncate max-w-[60px] sm:max-w-none">{crop.seller.name}</span>}
            </div>

            <div className="flex items-baseline gap-1 mt-0.5 sm:mt-1">
              <span className="text-sm sm:text-lg font-bold text-gray-900">₹{crop.price}</span>
              <span className="text-[10px] sm:text-xs text-gray-500">/ {crop.quantity.includes('Quintal') || crop.quantity.includes('quintal') ? 'Quintal' : 'Kg'}</span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-500">
              <span className="flex items-center gap-0.5">
                <span className="text-green-600">✓</span> {crop.quantity}
              </span>
            </div>

            {crop.seller && (
              <div className="flex items-center justify-between mt-1 sm:mt-1.5">
                <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[60px] sm:max-w-none">
                  {crop.seller.village || crop.seller.district || ''}
                </span>
                {renderStars(rating)}
              </div>
            )}
          </div>
        </Link>

        {/* Add to Cart button */}
        <div className="px-2 pb-2 sm:px-3 sm:pb-3">
          <Button
            size="sm"
            className="w-full bg-green-700 hover:bg-green-800 text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-9 rounded-lg min-h-0"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(crop); }}
          >
            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 mr-1" />
            {t('Add to Cart', 'కార్ట్‌కు జోడించు', 'कार्ट में डालें')}
          </Button>
        </div>

        {/* Contact farmer */}
        {crop.seller && (
          <div className="border-t border-gray-100 px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-between">
            <button
              onClick={(e) => handleCallFarmer(crop.seller!.phone, e)}
              className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-green-700 font-medium min-h-0"
            >
              <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              {t('Contact', 'సంప్రదించు', 'संपर्क')}
            </button>
            <span className="text-[10px] sm:text-xs text-gray-400 font-medium">★ {rating.toFixed(1)}</span>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <MobilePageHeader
        title={t('Search fresh products...', 'తాజా ఉత్పత్తులు శోధించండి...', 'ताज़ा उत्पाद खोजें...')}
        fallbackPath="/"
        rightContent={
          <button onClick={() => setDrawerOpen(true)} className="p-1.5">
            <SlidersHorizontal className="h-5 w-5 text-foreground" />
          </button>
        }
      />

      {/* Mobile filter chips */}
      <div className="lg:hidden sticky top-[52px] z-40 bg-white px-4 py-2 flex gap-2 overflow-x-auto border-b border-gray-100 no-scrollbar shadow-sm">
        {/* Inline search for filtering crops */}
        <div className="flex-1 min-w-[120px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              placeholder={t('Filter crops...', 'పంటలు ఫిల్టర్...', 'फसल फ़िल्टर...')}
              value={appliedFilters.search}
              onChange={(e) => setAppliedFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-8 pr-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {/* Mobile filter chips row 2 */}
      <div className="lg:hidden bg-white px-4 py-1.5 flex gap-2 overflow-x-auto border-b border-gray-100 no-scrollbar">
        {/* Filter chips */}
        <div className="bg-white px-4 py-2 flex gap-2 overflow-x-auto border-b border-gray-100 no-scrollbar">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-700 whitespace-nowrap flex-shrink-0"
          >
            <MapPin className="h-3 w-3 text-green-600" /> {t('All Locations', 'అన్ని స్థానాలు', 'सभी स्थान')}
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-700 whitespace-nowrap flex-shrink-0"
          >
            <Filter className="h-3 w-3 text-green-600" /> {t('All Categories', 'అన్ని వర్గాలు', 'सभी श्रेणियां')} <ChevronDown className="h-3 w-3" />
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-700 whitespace-nowrap flex-shrink-0"
          >
            {t('Price', 'ధర', 'कीमत')} <ChevronDown className="h-3 w-3" />
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs whitespace-nowrap flex-shrink-0 ${activeFilterCount > 0 ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-700'}`}
          >
            <SlidersHorizontal className="h-3 w-3" /> {t('More Filters', 'మరిన్ని ఫిల్టర్లు', 'अधिक फिल्टर')}
            {activeFilterCount > 0 && <span className="bg-green-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block"><Header /></div>

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        {/* Desktop search & filters */}
        <div className="hidden lg:block mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('Direct From Farm', 'నేరుగా పొలం నుండి', 'सीधे खेत से')}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('Buy fresh products directly from verified farmers', 'ధృవీకరించబడిన రైతుల నుండి తాజా ఉత్పత్తులను నేరుగా కొనుగోలు చేయండి', 'सत्यापित किसानों से सीधे ताज़ा उत्पाद खरीदें')}</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('Search fresh products from farmers...', 'రైతుల నుండి తాజా ఉత్పత్తులు శోధించండి...', 'किसानों से ताज़ा उत्पाद खोजें...')}
                value={appliedFilters.search}
                onChange={(e) => setAppliedFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9 h-10 rounded-full border-gray-200"
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
                selectedCategory === cat.key ? 'bg-green-100 border-2 border-green-600' : 'bg-white border border-gray-100'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[11px] text-gray-700 font-medium text-center leading-tight">
                {language === 'te' ? cat.labelTe : language === 'hi' ? cat.labelHi : cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Section title */}
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          {t('Fresh Products from Verified Farmers', 'ధృవీకరించబడిన రైతుల నుండి తాజా ఉత్పత్తులు', 'सत्यापित किसानों से ताज़ा उत्पाद')}
        </h2>

        {/* Product grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-gray-700">{t('No products found', 'ఉత్పత్తులు కనుగొనబడలేదు', 'कोई उत्पाद नहीं मिला')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('Try adjusting your filters', 'మీ ఫిల్టర్లను సవరించి ప్రయత్నించండి', 'अपने फिल्टर बदलें')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {filteredCrops.map(crop => renderProductCard(crop))}
          </div>
        )}

        {/* Recommended section */}
        {!loading && filteredCrops.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              {t('Recommended for You', 'మీ కోసం సిఫార్సు', 'आपके लिए अनुशंसित')}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {filteredCrops.slice(0, 4).map(crop => renderProductCard(crop))}
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
            <button onClick={() => setDrawerOpen(false)}><X className="h-5 w-5 text-gray-500" /></button>
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
            <Button className="flex-1 bg-green-700 hover:bg-green-800" onClick={() => { setAppliedFilters(filters); if (filters.category) setSelectedCategory(filters.category); setDrawerOpen(false); }}>
              {t('Apply Filters', 'ఫిల్టర్లు వర్తించు', 'फिल्टर लागू करें')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default DirectFromFarm;
