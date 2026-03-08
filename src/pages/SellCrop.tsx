import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Loader2, Sprout } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  } | null;
}

const SellCrop: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<CropWithSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('farmer_crops')
        .select('*, seller:sellers!farmer_crops_seller_id_fkey(name, phone, photo_url)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCrops(data as unknown as CropWithSeller[]);
      }
      setLoading(false);
    };
    fetchCrops();
  }, []);

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
        <h1 className="text-lg font-bold">
          {language === 'te' ? 'పంట అమ్మండి' : language === 'hi' ? 'फसल बेचें' : 'Sell Crop'}
        </h1>
      </div>

      {/* Desktop header */}
      <div className="hidden lg:block">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : crops.length === 0 ? (
          <div className="text-center py-16">
            <Sprout className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-1">
              {language === 'te' ? 'పంటలు లేవు' : 'No crops available'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'te' ? 'రైతులు ఇంకా పంటలు పోస్ట్ చేయలేదు' : 'Farmers have not posted any crops yet'}
            </p>
            <Link to="/become-seller">
              <Button>{language === 'te' ? 'పంట పోస్ట్ చేయండి' : 'Post Your Crop'}</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {crops.map((crop) => (
              <Link key={crop.id} to={`/sell-crop/${crop.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    {/* Top section: image + crop info */}
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
                    {/* Location bar */}
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

      <div className="hidden lg:block"><Footer /></div>
      <MobileBottomNav />
    </div>
  );
};

export default SellCrop;
