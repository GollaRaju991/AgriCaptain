import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, ChevronRight, Sprout, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateDistance, formatDistance, type UserLocation } from '@/utils/locationUtils';

interface CropWithSeller {
  id: string;
  crop_name: string;
  quantity: string;
  price: string;
  crop_images: string[] | null;
  quality_grade: string;
  availability_location: string;
  location_address: string | null;
  sell_type: string | null;
  latitude: number | null;
  longitude: number | null;
  seller_id: string | null;
  seller: {
    name: string;
    village: string | null;
    district: string | null;
    state: string | null;
  } | null;
  distance?: number;
}

const getFarmerRating = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return 3.5 + (Math.abs(hash) % 16) / 10;
};

const getPricePerKg = (crop: CropWithSeller): number => {
  const priceNum = parseFloat(crop.price.replace(/[^0-9.]/g, '')) || 0;
  const isQuintal =
    crop.quantity?.toLowerCase().includes('quintal') ||
    crop.price?.toLowerCase().includes('quintal');
  return isQuintal ? Math.round(priceNum / 100) : priceNum;
};

const getFirstImage = (images: string[] | null) =>
  images && images.length > 0 ? images[0] : '/placeholder.svg';

const HomeDirectFromFarm: React.FC = () => {
  const [crops, setCrops] = useState<CropWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { translations } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCrops = async () => {
      setLoading(true);
      const { data: cropsData } = await supabase
        .from('public_farmer_crops' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (cropsData) {
        const sellerIds = [...new Set((cropsData as any[]).map((c) => c.seller_id).filter(Boolean))];
        const { data: sellersData } = await supabase
          .from('public_sellers' as any)
          .select('id, name, village, district, state')
          .in('id', sellerIds);
        const sellerMap = new Map((sellersData || []).map((s: any) => [s.id, s]));
        const enriched = (cropsData as any[]).map((c) => ({ ...c, seller: sellerMap.get(c.seller_id) || null }));
        setCrops(enriched as CropWithSeller[]);
      }
      setLoading(false);
    };
    fetchCrops();
  }, []);

  // Auto-detect location only if already permitted
  useEffect(() => {
    if (!navigator.permissions || !navigator.geolocation) return;
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((result) => {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, address: '' }),
            () => {},
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
          );
        }
      })
      .catch(() => {});
  }, []);

  const cropsToShow = useMemo(() => {
    let list = crops.filter((c) => {
      const t = c.sell_type || 'both';
      return t === 'direct_from_farm' || t === 'both';
    });
    if (userLocation) {
      list = list.map((c) => {
        if (c.latitude && c.longitude) {
          const d = calculateDistance(userLocation.latitude, userLocation.longitude, c.latitude, c.longitude);
          return { ...c, distance: d };
        }
        return c;
      });
      list.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
    }
    return list.slice(0, 8);
  }, [crops, userLocation]);

  const handleAdd = (e: React.MouseEvent, crop: CropWithSeller) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: crop.id,
      name: crop.crop_name,
      price: getPricePerKg(crop),
      image: getFirstImage(crop.crop_images),
      category: 'Direct From Farm',
    });
    toast({ title: translations.added_to_cart, description: `${crop.crop_name} ${translations.added_to_cart_desc}` });
  };

  if (!loading && cropsToShow.length === 0) return null;

  return (
    <section className="w-full px-2 md:px-4 py-3 md:py-5">
      <div className="rounded-2xl border border-green-200 bg-gradient-to-b from-green-50 to-white p-3 md:p-4">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-3 cursor-pointer"
          onClick={() => navigate('/direct-from-farm')}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-xl font-bold text-gray-900 leading-tight truncate">
                Direct From Farm
              </h2>
              <p className="text-[11px] md:text-sm text-gray-600 truncate">
                Fresh products straight from farmers to you
              </p>
            </div>
          </div>
          <Link
            to="/direct-from-farm"
            className="flex items-center gap-1 text-green-700 font-semibold text-xs md:text-sm hover:text-green-800 flex-shrink-0"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex gap-3 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-40 md:w-48 h-56 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          /* Horizontal scroll on mobile, grid on desktop */
          <div className="flex gap-2.5 md:gap-3 overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-6 pb-1 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
            {cropsToShow.map((crop) => {
              const isOrganic = crop.quality_grade === 'Organic';
              const isPremium = crop.quality_grade === 'Grade A' || isOrganic;
              const rating = crop.seller ? getFarmerRating(crop.seller.name) : 4.0;
              const locationText =
                crop.location_address ||
                crop.availability_location ||
                crop.seller?.village ||
                crop.seller?.district ||
                '';

              return (
                <Card
                  key={crop.id}
                  className="flex-shrink-0 w-40 md:w-auto overflow-hidden bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow snap-start relative"
                >
                  <Link to={`/sell-crop/${crop.id}`} state={{ from: '/' }}>
                    <div className="relative">
                      <img
                        src={getFirstImage(crop.crop_images)}
                        alt={crop.crop_name}
                        className="w-full h-28 md:h-32 object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <Badge className="absolute top-1.5 left-1.5 bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded">
                        ✓ Direct from Farm
                      </Badge>
                      {isPremium && (
                        <Badge className="absolute bottom-1.5 left-1.5 bg-green-700/90 text-white text-[9px] px-1.5 py-0.5 rounded">
                          {isOrganic ? 'Organic' : 'Premium'}
                        </Badge>
                      )}
                    </div>

                    <div className="p-2 pr-9">
                      <h3 className="font-semibold text-xs md:text-sm text-gray-900 line-clamp-1">
                        {crop.crop_name}
                      </h3>
                      <div className="flex items-baseline gap-0.5 mt-0.5">
                        <span className="text-sm md:text-base font-bold text-gray-900">
                          ₹{getPricePerKg(crop)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">/ kg</span>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="text-[10px] text-gray-500 truncate flex items-center gap-0.5 min-w-0 flex-1">
                          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                          <span className="truncate">{locationText}</span>
                        </span>
                        {crop.distance !== undefined && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 h-4 border-green-300 text-green-700 font-medium flex-shrink-0 whitespace-nowrap"
                          >
                            {formatDistance(crop.distance)}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-gray-700 font-medium">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={(e) => handleAdd(e, crop)}
                    aria-label="Add to cart"
                    className="absolute right-1.5 bottom-1.5 flex items-center justify-center h-7 w-7 rounded-full bg-green-600 hover:bg-green-700 text-white active:scale-95 transition shadow-md ring-2 ring-white"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeDirectFromFarm;
