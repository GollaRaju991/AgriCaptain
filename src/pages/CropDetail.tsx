import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Calendar, Award, Warehouse, Loader2, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

interface CropDetail {
  id: string;
  crop_name: string;
  quantity: string;
  price: string;
  sell_type: string | null;
  crop_images: string[] | null;
  harvest_date: string | null;
  quality_grade: string;
  availability_location: string;
  location_address: string | null;
  seller: {
    name: string;
    phone: string;
    photo_url: string | null;
  } | null;
}

const CropDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from || '/sell-crop';
  const backLabelEn = fromPath === '/direct-from-farm' ? 'Back to Direct From Farm' : 'Back to Sell Crop';
  const backLabelTe = fromPath === '/direct-from-farm' ? 'డైరెక్ట్ ఫ్రమ్ ఫార్మ్‌కి తిరిగి' : 'పంట అమ్మకానికి తిరిగి';
  const handleBack = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate(fromPath);
  };
  const { language } = useLanguage();
  const [crop, setCrop] = useState<CropDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = crop ? items.find(i => i.id === crop.id) : undefined;
  const [selectedKg, setSelectedKg] = useState<number>(1);
  const [related, setRelated] = useState<Array<{ id: string; crop_name: string; price: string; quantity: string; crop_images: string[] | null; availability_location: string }>>([]);

  useEffect(() => {
    const fetchCrop = async () => {
      if (!id) return;
      setLoading(true);
      // Use public views to avoid exposing sensitive data (aadhaar, etc.)
      const { data: cropData, error: cropError } = await supabase
        .from('public_farmer_crops' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (!cropError && cropData) {
        // Fetch seller info from public view
        let seller: { name: string; phone: string; photo_url: string | null } | null = null;
        if ((cropData as any).seller_id) {
          const { data: sellerData, error: sellerError } = await supabase
            .from('public_sellers' as any)
            .select('name, phone, photo_url')
            .eq('id', (cropData as any).seller_id)
            .maybeSingle();
          if (sellerError) console.error('Seller fetch error:', sellerError);
          if (sellerData) seller = sellerData as any;
        }
        // Robust fallback: use a SECURITY DEFINER RPC to fetch the contact
        // even if the seller is not exposed via the public view for any reason.
        if (!seller || !seller.phone) {
          const { data: contactData, error: contactError } = await supabase
            .rpc('get_farmer_crop_contact' as any, { _crop_id: id });
          if (contactError) console.error('Contact RPC error:', contactError);
          const contact = Array.isArray(contactData) ? contactData[0] : contactData;
          if (contact && (contact as any).phone) {
            seller = {
              name: (contact as any).name || seller?.name || 'Farmer',
              phone: (contact as any).phone || '',
              photo_url: (contact as any).photo_url || seller?.photo_url || null,
            };
          }
        }
        // Final fallback so the Farmer Details section is always shown
        if (!seller) {
          seller = { name: 'Farmer', phone: '', photo_url: null };
        }
        setCrop({ ...(cropData as any), seller } as unknown as CropDetail);
      }

      // Fetch related farm products (other crops, excluding current)
      const { data: relatedData } = await supabase
        .from('public_farmer_crops' as any)
        .select('id, crop_name, price, quantity, crop_images, availability_location')
        .neq('id', id)
        .limit(12);
      if (relatedData) setRelated(relatedData as any);

      setLoading(false);
    };
    fetchCrop();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Crop not found</p>
        <Button onClick={() => navigate(fromPath)}>Go Back</Button>
      </div>
    );
  }

  const images = crop.crop_images && crop.crop_images.length > 0 ? crop.crop_images : ['/placeholder.svg'];

  const label = (en: string, te: string) => language === 'te' ? te : en;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-green-600 text-white flex items-center gap-3 px-4 py-3">
        <button onClick={handleBack}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold truncate">{crop.crop_name}</h1>
      </div>

      <div className="hidden lg:block"><Header /></div>

      {/* Desktop back button */}
      <div className="hidden lg:flex container mx-auto max-w-2xl px-4 pt-4">
        <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {label(backLabelEn, backLabelTe)}
        </Button>
      </div>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Image gallery - swipeable on mobile */}
        <div className="rounded-xl overflow-hidden bg-muted mb-4">
          <div
            className="relative w-full h-64 sm:h-80 bg-white overflow-hidden touch-pan-y select-none"
            onTouchStart={(e) => {
              (e.currentTarget as any)._tsx = e.touches[0].clientX;
              (e.currentTarget as any)._tsy = e.touches[0].clientY;
            }}
            onTouchEnd={(e) => {
              const startX = (e.currentTarget as any)._tsx as number | undefined;
              const startY = (e.currentTarget as any)._tsy as number | undefined;
              if (startX == null || startY == null) return;
              const endX = e.changedTouches[0].clientX;
              const endY = e.changedTouches[0].clientY;
              const dx = endX - startX;
              const dy = endY - startY;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) setActiveImage((activeImage + 1) % images.length);
                else setActiveImage((activeImage - 1 + images.length) % images.length);
              }
            }}
          >
            <div
              className="flex h-full w-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${activeImage * 100}%)` }}
            >
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${crop.crop_name} ${i + 1}`}
                  className="w-full h-full object-contain bg-white flex-shrink-0"
                  draggable={false}
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
              ))}
            </div>

            {images.length > 1 && (
              <>
                {/* Desktop arrows */}
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                  className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setActiveImage((activeImage + 1) % images.length)}
                  className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow"
                >
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${i === activeImage ? 'w-4 bg-green-600' : 'w-1.5 bg-black/30'}`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${i === activeImage ? 'border-green-600' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {(() => {
          const priceNum = parseFloat(String(crop.price).replace(/[^0-9.]/g, '')) || 0;
          const isDirectFromFarm = crop.sell_type === 'direct_from_farm' || crop.sell_type === 'both';

          // Tiered pricing: bulk discount per kg
          const tiers = [
            { kg: 1, perKg: priceNum },
            { kg: 2, perKg: Math.max(0, priceNum - 1) },
            { kg: 5, perKg: Math.max(0, priceNum - 2) },
            { kg: 10, perKg: Math.max(0, priceNum - 3) },
          ].map(t => ({
            ...t,
            total: Math.round(t.perKg * t.kg),
            save: Math.round((priceNum - t.perKg) * t.kg),
          }));
          const selectedTier = tiers.find(t => t.kg === selectedKg) || tiers[0];

          const handleAdd = (navigateAfter = false) => {
            const img = crop.crop_images && crop.crop_images.length > 0 ? crop.crop_images[0] : '/placeholder.svg';
            const unitPrice = isDirectFromFarm ? selectedTier.total : priceNum;
            if (cartItem) {
              updateQuantity(crop.id, cartItem.quantity + 1);
            } else {
              addToCart({
                id: crop.id,
                name: isDirectFromFarm ? `${crop.crop_name} (${selectedTier.kg} kg)` : crop.crop_name,
                price: unitPrice,
                image: img,
                category: 'Direct From Farm',
              });
            }
            toast({
              title: label('Added to cart', 'కార్ట్‌కి జోడించబడింది'),
              description: crop.crop_name,
            });
            if (navigateAfter) navigate('/cart');
          };
          return (
            <>
              {/* Crop info */}
              <Card className="mb-4">
                <CardContent className="p-4 space-y-3">
                  <div>
                    {crop.quality_grade === 'Organic' && (
                      <span className="inline-block text-[11px] font-semibold text-green-700 border border-green-300 bg-green-50 rounded-full px-2 py-0.5 mb-1">
                        {label('Organic', 'ఆర్గానిక్')}
                      </span>
                    )}
                    <h2 className="text-2xl font-bold text-foreground">{crop.crop_name}</h2>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-foreground">₹{crop.price}</span>
                      <span className="text-sm text-muted-foreground">{isDirectFromFarm ? '/ kg' : `• ${crop.quantity}`}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                      <Award className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">{label('Quality', 'నాణ్యత')}</p>
                        <p className="font-semibold text-sm text-foreground">{crop.quality_grade}</p>
                      </div>
                    </div>
                    {crop.harvest_date && (
                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">{label('Harvest Date', 'పంట తేదీ')}</p>
                          <p className="font-semibold text-sm text-foreground">{new Date(crop.harvest_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                    <Warehouse className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label('Availability Location', 'అందుబాటు స్థానం')}</p>
                      <p className="font-semibold text-sm text-foreground">
                        {crop.location_address || crop.availability_location}
                      </p>
                      {crop.location_address && crop.availability_location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {crop.availability_location}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Farmer info */}
              {crop.seller && (
                <Card className="mb-4 border-green-200">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-3">{label('Farmer Details', 'రైతు వివరాలు')}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {crop.seller.photo_url ? (
                          <img src={crop.seller.photo_url} alt={crop.seller.name} className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                            {crop.seller.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{crop.seller.name}</p>
                          {crop.seller.phone ? (
                            <a
                              href={`tel:+91${crop.seller.phone}`}
                              className="text-sm text-green-700 font-semibold hover:underline flex items-center gap-1"
                            >
                              <Phone className="h-3.5 w-3.5" /> +91 {crop.seller.phone}
                            </a>
                          ) : (
                            <p className="text-xs text-muted-foreground">{label('Contact not available', 'సంప్రదింపు అందుబాటులో లేదు')}</p>
                          )}
                        </div>
                      </div>
                      {crop.seller.phone && (
                        <a href={`tel:+91${crop.seller.phone}`} className="flex-shrink-0">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-full h-10 w-10 p-0">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quantity selector — Direct From Farm only */}
              {isDirectFromFarm && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-foreground mb-2">
                    {label('Select Quantity (Per kg)', 'పరిమాణం ఎంచుకోండి (కిలోకి)')}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {tiers.map((t) => {
                      const active = selectedKg === t.kg;
                      return (
                        <button
                          key={t.kg}
                          type="button"
                          onClick={() => setSelectedKg(t.kg)}
                          className={`rounded-lg border-2 p-2 text-center transition ${
                            active
                              ? 'border-green-600 bg-green-50'
                              : 'border-border bg-card hover:border-green-300'
                          }`}
                        >
                          <p className="text-sm font-bold text-foreground">{t.kg} kg</p>
                          <p className="text-base font-extrabold text-foreground">₹{t.total}</p>
                          <p className="text-[10px] text-muted-foreground">₹{t.perKg} per kg</p>
                          {t.save > 0 && (
                            <span className="inline-block mt-1 text-[10px] font-semibold text-green-700 bg-green-100 rounded px-1.5 py-0.5">
                              {label(`Save ₹${t.save}`, `₹${t.save} ఆదా`)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add to Cart + Buy Now */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                  variant="outline"
                  onClick={() => handleAdd(false)}
                  className="h-12 text-base font-bold border-2 border-green-600 text-green-700 hover:bg-green-50"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {label('Add to Cart', 'కార్ట్‌కి జోడించు')}
                </Button>
                <Button
                  onClick={() => handleAdd(true)}
                  className="h-12 text-base font-bold bg-green-600 hover:bg-green-700 flex flex-col leading-tight"
                >
                  <span>{label('Buy Now', 'ఇప్పుడే కొనండి')}</span>
                  {isDirectFromFarm && (
                    <span className="text-xs font-normal opacity-90">at ₹{selectedTier.total}</span>
                  )}
                </Button>
              </div>
            </>
          );
        })()}

        {/* Related Farm Products */}
        {related.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-foreground mb-3">
              {label('Related Farm Products', 'సంబంధిత వ్యవసాయ ఉత్పత్తులు')}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {related.map((r) => {
                const img = r.crop_images && r.crop_images.length > 0 ? r.crop_images[0] : '/placeholder.svg';
                return (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/sell-crop/${r.id}`, { state: { from: fromPath } })}
                    className="bg-card border border-border rounded-lg overflow-hidden text-left hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-muted">
                      <img
                        src={img}
                        alt={r.crop_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                    </div>
                    <div className="p-2">
                      <p className="font-semibold text-sm text-foreground truncate">{r.crop_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.quantity}</p>
                      <p className="text-sm font-bold text-green-600 mt-1">₹{r.price}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <div className="hidden lg:block"><Footer /></div>
      <MobileBottomNav />
    </div>
  );
};

export default CropDetailPage;
