import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface MarketData {
  sno: number;
  product: {
    en: string;
    te: string;
    hi: string;
  };
  avg2024_2025: number;
  avg2025_2026: number;
  yesterday: number;
  today: number;
  newlyAdded: {
    en: string;
    te: string;
    hi: string;
  };
}

const MarketDetails = () => {
  const { language, translations } = useLanguage();

  const marketData: MarketData[] = [
    {
      sno: 1,
      product: { en: 'Cotton', te: 'పత్తి', hi: 'कपास' },
      avg2024_2025: 6800,
      avg2025_2026: 7100,
      yesterday: 7050,
      today: 7100,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
    },
    {
      sno: 2,
      product: { en: 'Red Chilli', te: 'ఎర్ర మిర్చి', hi: 'लाल मिर्च' },
      avg2024_2025: 12500,
      avg2025_2026: 13200,
      yesterday: 13000,
      today: 13200,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
    },
    {
      sno: 3,
      product: { en: 'Turmeric', te: 'పసుపు', hi: 'हल्दी' },
      avg2024_2025: 9100,
      avg2025_2026: 9400,
      yesterday: 9500,
      today: 9400,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
    },
    {
      sno: 4,
      product: { en: 'Maize', te: 'మొక్కజొన్న', hi: 'मक्का' },
      avg2024_2025: 2050,
      avg2025_2026: 2200,
      yesterday: 2150,
      today: 2200,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
    },
    {
      sno: 5,
      product: { en: 'Groundnut', te: 'వేరుశనగ', hi: 'मूंगफली' },
      avg2024_2025: 5900,
      avg2025_2026: 6150,
      yesterday: 6100,
      today: 6150,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
    }
  ];

  const getProductName = (product: { en: string; te: string; hi: string }) => {
    if (language === 'te') return product.te;
    if (language === 'hi') return product.hi;
    return product.en;
  };

  const getNewlyAddedText = (newlyAdded: { en: string; te: string; hi: string }) => {
    if (language === 'te') return newlyAdded.te;
    if (language === 'hi') return newlyAdded.hi;
    return newlyAdded.en;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{translations.market_details}</CardTitle>
            <CardDescription>
              {translations.market_details_description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{translations.sno}</TableHead>
                    <TableHead>{translations.agriculture_product}</TableHead>
                    <TableHead className="text-right">{translations.avg_rate_2024_2025}</TableHead>
                    <TableHead className="text-right">{translations.avg_rate_2025_2026}</TableHead>
                    <TableHead className="text-right">{translations.yesterday_rate}</TableHead>
                    <TableHead className="text-right">{translations.today_rate}</TableHead>
                    <TableHead className="text-center">{translations.newly_added_today}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketData.map((item) => (
                    <TableRow key={item.sno}>
                      <TableCell className="font-medium">{item.sno}</TableCell>
                      <TableCell>{getProductName(item.product)}</TableCell>
                      <TableCell className="text-right">₹{item.avg2024_2025}</TableCell>
                      <TableCell className="text-right">₹{item.avg2025_2026}</TableCell>
                      <TableCell className="text-right">₹{item.yesterday}</TableCell>
                      <TableCell className="text-right">₹{item.today}</TableCell>
                      <TableCell className="text-center">{getNewlyAddedText(item.newlyAdded)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default MarketDetails;
