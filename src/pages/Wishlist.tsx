import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import MobileBottomNav from "@/components/MobileBottomNav";   // ✅ correct import


const Wishlist = () => {
  const { translations } = useLanguage();
  
  const wishlistItems: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              {translations.language === 'te' ? 'ఇష్టపడిన వస్తువులు' : 'My Wishlist'}
            </h1>

            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
              {wishlistItems.length}
            </span>
          </div>

          {wishlistItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <Heart className="h-12 w-12 text-gray-400" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900">
                  {translations.language === 'te' 
                    ? 'మీ ఇష్టపడిన వస్తువుల జాబితా ఖాళీగా ఉంది'
                    : 'Your wishlist is empty'}
                </h3>

                <p className="text-gray-600 max-w-md mx-auto">
                  {translations.language === 'te'
                    ? 'మీకు నచ్చిన ఉత్పత్తులను సేవ్ చేయడానికి హార్ట్ ఐకాన్‌పై క్లిక్ చేయండి'
                    : 'Save items you like by clicking the heart icon'}
                </p>

                <Button className="mt-4">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {translations.language === 'te' ? 'షాపింగ్ ప్రారంభించండి' : 'Start Shopping'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item, index) => (
                <Card key={index} className="group">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-lg font-bold text-green-600 mb-3">₹{item.price}</p>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {translations.language === 'te' ? 'కార్ట్‌కి జోడించు' : 'Add to Cart'}
                      </Button>

                      <Button size="sm" variant="outline">
                        <Heart className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <MobileBottomNav />   {/* ✅ Fix: Nav will show now */}

      <Footer />
    </div>
  );
};

export default Wishlist;
