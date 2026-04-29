import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Eye, Heart, ShoppingCart, Pencil, Trash2, Loader2, Calendar, Award, Sprout, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';

interface Crop {
  id: string;
  crop_name: string;
  price: string;
  quantity: string;
  crop_images: string[] | null;
  harvest_date: string | null;
  quality_grade: string;
  availability_location: string;
  location_address: string | null;
  sell_type: string;
  created_at: string;
}

const MyCropDetail: React.FC = () => {
  const { sellerId, cropId } = useParams<{ sellerId: string; cropId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  const startEditPrice = () => {
    if (!crop) return;
    setPriceInput(String(crop.price ?? ''));
    setEditingPrice(true);
  };

  const cancelEditPrice = () => {
    setEditingPrice(false);
    setPriceInput('');
  };

  const savePrice = async () => {
    if (!crop || !cropId) return;
    const trimmed = priceInput.trim();
    if (!trimmed || isNaN(Number(trimmed)) || Number(trimmed) <= 0) {
      toast({ title: t('Enter a valid price', 'సరైన ధరను నమోదు చేయండి', 'मान्य कीमत दर्ज करें'), variant: 'destructive' });
      return;
    }
    setSavingPrice(true);
    try {
      const { error } = await supabase.from('farmer_crops').update({ price: trimmed }).eq('id', cropId);
      if (error) throw error;
      setCrop({ ...crop, price: trimmed });
      setEditingPrice(false);
      toast({ title: t('Price updated', 'ధర నవీకరించబడింది', 'कीमत अपडेट हुई') });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSavingPrice(false);
    }
  };

  const t = (en: string, te: string, hi?: string) => {
    if (language === 'te') return te;
    if (language === 'hi') return hi || en;
    return en;
  };

  useEffect(() => {
    const load = async () => {
      if (!cropId) return;
      setLoading(true);
      const { data } = await supabase.from('farmer_crops').select('*').eq('id', cropId).maybeSingle();
      if (data) setCrop(data as any);
      setLoading(false);
    };
    load();
  }, [cropId]);

  const handleDelete = async () => {
    if (!cropId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('farmer_crops').delete().eq('id', cropId);
      if (error) throw error;
      toast({ title: t('Crop deleted', 'పంట తొలగించబడింది', 'फसल हटाई गई') });
      navigate(`/sell-crop/my-crops/${sellerId}`);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">{t('Crop not found', 'పంట కనుగొనబడలేదు', 'फसल नहीं मिली')}</p>
        <Button onClick={() => navigate(`/sell-crop/my-crops/${sellerId}`)}>{t('Back', 'వెనుకకు', 'वापस')}</Button>
      </div>
    );
  }

  const images = (crop.crop_images && crop.crop_images.length > 0) ? crop.crop_images : ['/placeholder.svg'];
  const farmingType = crop.quality_grade === 'Organic' ? t('Organic', 'ఆర్గానిక్', 'ऑर्गेनिक') : t('Conventional', 'సాంప్రదాయ', 'पारंपरिक');

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-green-600 text-white flex items-center gap-3 px-4 py-3 shadow">
        <button onClick={() => navigate(`/sell-crop/my-crops/${sellerId}`)} aria-label="Back">
          <ArrowLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-bold">{t('Crop Details', 'పంట వివరాలు', 'फसल विवरण')}</h1>
      </div>

      <div className="hidden lg:block"><Header /></div>

      <div className="hidden lg:flex container mx-auto max-w-3xl px-4 pt-4 items-center gap-3">
        <button onClick={() => navigate(`/sell-crop/my-crops/${sellerId}`)} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">{t('Crop Details', 'పంట వివరాలు', 'फसल विवरण')}</h1>
      </div>

      <main className="container mx-auto max-w-3xl px-4 py-4">
        {/* Banner image — swipeable slider (matches Direct From Farm) */}
        <div className="rounded-2xl overflow-hidden bg-muted mb-4">
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
                {/* Dot indicators (matches main hero slider) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to image ${i + 1}`}
                      onClick={() => setActiveImage(i)}
                      className={"block rounded-sm transition-all duration-300 " + (i === activeImage ? "w-5 h-1 bg-white shadow-md" : "w-3 h-1 bg-white/50 hover:bg-white/70")}
                    />
                  ))}
                </div>

                {/* Image count */}
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title + status */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-foreground">{crop.crop_name}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {t('Active', 'యాక్టివ్', 'सक्रिय')}
              </span>
            </div>
            {editingPrice ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">₹</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="h-10 w-28 text-lg font-bold"
                  autoFocus
                />
                <span className="text-sm text-muted-foreground">/ kg</span>
                <Button size="icon" className="h-9 w-9 bg-green-600 hover:bg-green-700" onClick={savePrice} disabled={savingPrice}>
                  {savingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2.5} />}
                </Button>
                <Button size="icon" variant="outline" className="h-9 w-9" onClick={cancelEditPrice} disabled={savingPrice}>
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            ) : (
              <p className="text-2xl font-bold text-foreground mt-1">
                ₹{crop.price} <span className="text-sm text-muted-foreground font-normal">/ kg</span>
              </p>
            )}
            {crop.location_address && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {crop.location_address}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 4.8
            </p>
          </div>
        </div>

        {/* Stats row */}
        <Card className="mb-4 rounded-xl">
          <CardContent className="p-3 grid grid-cols-3 divide-x divide-border">
            <div className="text-center px-2">
              <Eye className="h-4 w-4 mx-auto text-green-600 mb-1" />
              <p className="text-sm font-bold text-foreground">0</p>
              <p className="text-[10px] text-muted-foreground uppercase">{t('Views', 'వీక్షణలు', 'दृश्य')}</p>
            </div>
            <div className="text-center px-2">
              <Heart className="h-4 w-4 mx-auto text-red-500 mb-1" />
              <p className="text-sm font-bold text-foreground">0</p>
              <p className="text-[10px] text-muted-foreground uppercase">{t('Likes', 'లైకులు', 'पसंद')}</p>
            </div>
            <div className="text-center px-2">
              <ShoppingCart className="h-4 w-4 mx-auto text-green-600 mb-1" />
              <p className="text-sm font-bold text-foreground">{crop.quantity}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{t('Available', 'అందుబాటు', 'उपलब्ध')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="mb-4 rounded-xl">
          <CardContent className="p-4 divide-y divide-border">
            <div className="flex justify-between py-2 first:pt-0">
              <span className="text-sm text-muted-foreground">{t('Price per Kg', 'కిలోకి ధర', 'प्रति किलो कीमत')}</span>
              <span className="text-sm font-semibold text-foreground">₹{crop.price}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">{t('Available Quantity', 'అందుబాటు పరిమాణం', 'उपलब्ध मात्रा')}</span>
              <span className="text-sm font-semibold text-foreground">{crop.quantity}</span>
            </div>
            {crop.harvest_date && (
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t('Harvest Date', 'పంట తేదీ', 'फसल तिथि')}</span>
                <span className="text-sm font-semibold text-foreground">{new Date(crop.harvest_date).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">{t('Farming Type', 'వ్యవసాయ రకం', 'खेती का प्रकार')}</span>
              <span className="text-sm font-semibold text-foreground">{farmingType}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">{t('Quality', 'నాణ్యత', 'गुणवत्ता')}</span>
              <span className="text-sm font-semibold text-foreground">{crop.quality_grade}</span>
            </div>
            <div className="flex justify-between py-2 last:pb-0">
              <span className="text-sm text-muted-foreground">{t('Created On', 'సృష్టించబడింది', 'बनाया गया')}</span>
              <span className="text-sm font-semibold text-foreground">{new Date(crop.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="mb-4 rounded-xl">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-foreground mb-2">{t('About this crop', 'ఈ పంట గురించి', 'इस फसल के बारे में')}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(
                `Fresh ${crop.crop_name.toLowerCase()} from the farm. Available at ${crop.availability_location}. Quality: ${crop.quality_grade}.`,
                `పొలం నుండి తాజా ${crop.crop_name}. ${crop.availability_location}లో అందుబాటులో ఉంది. నాణ్యత: ${crop.quality_grade}.`,
                `खेत से ताज़ा ${crop.crop_name}। ${crop.availability_location} पर उपलब्ध। गुणवत्ता: ${crop.quality_grade}।`
              )}
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Bottom action bar */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-card border-t border-border p-3 z-40">
        <div className="container mx-auto max-w-3xl flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-700"
            onClick={startEditPrice}
          >
            <Pencil className="h-4 w-4 mr-2" /> {t('Edit Crop', 'పంట మార్చండి', 'फसल संपादित करें')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1" disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" /> {t('Delete Crop', 'పంట తొలగించు', 'फसल हटाएं')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('Are you sure you want to delete this crop?', 'మీరు ఖచ్చితంగా ఈ పంటను తొలగించాలనుకుంటున్నారా?', 'क्या आप वाकई इस फसल को हटाना चाहते हैं?')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('This will permanently remove the crop from your listings. This action cannot be undone.', 'ఇది మీ జాబితాల నుండి పంటను శాశ్వతంగా తొలగిస్తుంది. ఈ చర్య రద్దు చేయబడదు.', 'यह आपकी सूची से फसल को स्थायी रूप से हटा देगा। यह क्रिया वापस नहीं की जा सकती।')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('Cancel', 'రద్దు', 'रद्द')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>{t('Delete', 'తొలగించు', 'हटाएं')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default MyCropDetail;
