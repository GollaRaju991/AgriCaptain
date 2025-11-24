import React from 'react';
import MobileBottomNav from "@/components/MobileBottomNav";
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

  // -----------------------------
  // Markets (20)
  // -----------------------------
  const markets = [
    'Adilabad',
    'Nizamabad',
    'Karimnagar',
    'Medak',
    'Warangal',
    'Khammam',
    'Nalgonda',
    'Mahbubnagar',
    'Rangareddy',
    'Hyderabad',
    'Guntur',
    'Vijayawada',
    'Kurnool',
    'Nellore',
    'Tirupati',
    'Anantapur',
    'Rajahmundry',
    'Ongole',
    'Kadapa',
    'Chittoor',
  ];

  const [selectedMarket, setSelectedMarket] = React.useState<string>('All Markets');

  // -----------------------------
  // Master crop list (20 crops) - base prices chosen as representative examples
  // -----------------------------
  const masterCrops: MarketData[] = [
    {
      sno: 1,
      product: { en: 'Cotton', te: 'పత్తి', hi: 'कपास' },
      avg2024_2025: 6800,
      avg2025_2026: 7100,
      yesterday: 7050,
      today: 7100,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 2,
      product: { en: 'Red Chilli', te: 'ఎర్ర మిర్చి', hi: 'लाल मिर्च' },
      avg2024_2025: 12500,
      avg2025_2026: 13200,
      yesterday: 13000,
      today: 13200,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 3,
      product: { en: 'Turmeric', te: 'పసుపు', hi: 'हल्दी' },
      avg2024_2025: 9100,
      avg2025_2026: 9400,
      yesterday: 9500,
      today: 9400,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 4,
      product: { en: 'Maize', te: 'మొక్కజొన్న', hi: 'मक्का' },
      avg2024_2025: 2050,
      avg2025_2026: 2200,
      yesterday: 2150,
      today: 2200,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 5,
      product: { en: 'Groundnut', te: 'వేరుశనగ', hi: 'मूंगफली' },
      avg2024_2025: 5900,
      avg2025_2026: 6150,
      yesterday: 6100,
      today: 6150,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 6,
      product: { en: 'Paddy', te: 'వరి', hi: 'धान' },
      avg2024_2025: 2100,
      avg2025_2026: 2300,
      yesterday: 2250,
      today: 2300,
      newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' },
    },
    {
      sno: 7,
      product: { en: 'Wheat', te: 'గోధుమ', hi: 'गेहूँ' },
      avg2024_2025: 2400,
      avg2025_2026: 2600,
      yesterday: 2500,
      today: 2600,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 8,
      product: { en: 'Bajra', te: 'సజ్జలు', hi: 'बाजरा' },
      avg2024_2025: 1800,
      avg2025_2026: 1950,
      yesterday: 1900,
      today: 1950,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 9,
      product: { en: 'Jowar', te: 'జొన్న', hi: 'ज्वार' },
      avg2024_2025: 2200,
      avg2025_2026: 2400,
      yesterday: 2350,
      today: 2400,
      newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' },
    },
    {
      sno: 10,
      product: { en: 'Green Gram (Moong)', te: 'పెసలు', hi: 'मूंग' },
      avg2024_2025: 7000,
      avg2025_2026: 7500,
      yesterday: 7400,
      today: 7500,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 11,
      product: { en: 'Black Gram (Urad)', te: 'మినుములు', hi: 'उड़द' },
      avg2024_2025: 6800,
      avg2025_2026: 7100,
      yesterday: 7000,
      today: 7100,
      newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' },
    },
    {
      sno: 12,
      product: { en: 'Toor Dal', te: 'కందులు', hi: 'अरहर दाल' },
      avg2024_2025: 7800,
      avg2025_2026: 8200,
      yesterday: 8000,
      today: 8200,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 13,
      product: { en: 'Sesame (Til)', te: 'నువ్వులు', hi: 'तिल' },
      avg2024_2025: 9000,
      avg2025_2026: 9400,
      yesterday: 9300,
      today: 9400,
      newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' },
    },
    {
      sno: 14,
      product: { en: 'Sunflower Seeds', te: 'సూర్యకాంతి', hi: 'सूरजमुखी' },
      avg2024_2025: 6500,
      avg2025_2026: 6900,
      yesterday: 6800,
      today: 6900,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 15,
      product: { en: 'Sugarcane', te: 'చెరకు', hi: 'गन्ना' },
      avg2024_2025: 320,
      avg2025_2026: 350,
      yesterday: 340,
      today: 350,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 16,
      product: { en: 'Onion', te: 'ఉల్లిపాయ', hi: 'प्याज़' },
      avg2024_2025: 1600,
      avg2025_2026: 1800,
      yesterday: 1750,
      today: 1800,
      newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' },
    },
    {
      sno: 17,
      product: { en: 'Potato', te: 'బంగాళాదుంప', hi: 'आलू' },
      avg2024_2025: 1400,
      avg2025_2026: 1500,
      yesterday: 1450,
      today: 1500,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 18,
      product: { en: 'Tomato', te: 'టమోటా', hi: 'टमाटर' },
      avg2024_2025: 900,
      avg2025_2026: 1100,
      yesterday: 1000,
      today: 1100,
      newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' },
    },
    {
      sno: 19,
      product: { en: 'Garlic', te: 'వెల్లులి', hi: 'लहसुन' },
      avg2024_2025: 8500,
      avg2025_2026: 9000,
      yesterday: 8900,
      today: 9000,
      newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' },
    },
    {
      sno: 20,
      product: { en: 'Ginger', te: 'అల్లం', hi: 'अदरक' },
      avg2024_2025: 9500,
      avg2025_2026: 10500,
      yesterday: 10200,
      today: 10500,
      newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' },
    },
  ];

  // -----------------------------
  // Deterministic price generator:
  // returns an object mapping market -> list of MarketData for that market
  // Prices are derived from masterCrops base price plus deterministic offsets
  // -----------------------------
  const marketPrices = React.useMemo(() => {
    const map: Record<string, MarketData[]> = {};

    // helper deterministic "hash" function from strings to integer
    const hash = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h);
    };

    markets.forEach((market, mIdx) => {
      const mSeed = hash(market) % 500; // market-level seed 0..499
      const arr: MarketData[] = masterCrops.map((crop, cIdx) => {
        const base = crop.avg2024_2025;
        // create deterministic modifiers:
        const mod1 = Math.floor(((mIdx - 10) * 30) + ((cIdx % 7) * 18) + (mSeed % 120));
        const mod2 = Math.floor(((mIdx * 7) % 90) - (cIdx % 5) * 6);
        // avg2024_2025 adjusted:
        const avg24 = Math.max(1, Math.round(base + mod1 + mod2));
        // avg2025_2026 is slightly higher
        const avg25 = Math.round(avg24 + Math.max(50, Math.round(base * 0.03)));
        // yesterday: avg24 +/- small deterministic variation
        const yesterday = Math.round(avg24 + ((hash(market + crop.product.en) % 101) - 50) * 0.6);
        // today: yesterday +/- small deterministic variation
        const today = Math.round(yesterday + ((hash(crop.product.en + market) % 31) - 15) * 0.6);

        return {
          sno: crop.sno,
          product: crop.product,
          avg2024_2025: avg24,
          avg2025_2026: avg25,
          yesterday,
          today,
          newlyAdded: crop.newlyAdded,
        };
      });
      map[market] = arr;
    });

    // default = master crops base values (shown when no market selected)
    map['All Markets'] = masterCrops.map((c) => ({ ...c }));
    return map;
  }, [masterCrops, markets]);

  // -----------------------------
  // Final data to render: always show master crop list structure,
  // but price columns replaced with selected market prices when chosen.
  // -----------------------------
  const finalDisplayedData: MarketData[] = React.useMemo(() => {
    // get selected market prices; if none selected, use All Markets
    const sel = selectedMarket && selectedMarket !== 'All Markets' ? selectedMarket : 'All Markets';
    const priceList = marketPrices[sel] || marketPrices['All Markets'];

    // merge product names & newlyAdded from masterCrops (keep same order)
    // but replace the numeric fields with the corresponding priceList values.
    const merged = masterCrops.map((crop) => {
      const p = priceList.find((x) => x.sno === crop.sno);
      if (!p) {
        // fallback to crop itself
        return { ...crop };
      }
      return {
        sno: crop.sno,
        product: crop.product,
        avg2024_2025: p.avg2024_2025,
        avg2025_2026: p.avg2025_2026,
        yesterday: p.yesterday,
        today: p.today,
        newlyAdded: crop.newlyAdded,
      } as MarketData;
    });

    return merged;
  }, [selectedMarket, marketPrices, masterCrops]);

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

  // light green theme colors
  const headerBg = '#d1fae5';
  const hoverBg = '#ecfdf5';
  const borderColor = '#a7f3d0';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between w-full">
              <div>
                <CardTitle className="text-2xl">{translations.market_details}</CardTitle>
                <CardDescription>{translations.market_details_description}</CardDescription>
              </div>

              {/* Dropdown on the right */}
              <div className="ml-4">
                <label className="sr-only">Select Market</label>
                <div className="flex items-center">
                  <select
                    aria-label="Select Market"
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    className="border px-4 py-2 rounded-md"
                    style={{ borderColor: borderColor }}
                  >
                    <option value="All Markets">All Markets</option>
                    {markets.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="w-16"
                      style={{ background: headerBg, borderBottom: `2px solid ${borderColor}` }}
                    >
                      {translations.sno || 'S.No'}
                    </TableHead>
                    <TableHead
                      style={{ background: headerBg, borderBottom: `2px solid ${borderColor}` }}
                    >
                      {translations.agriculture_product || 'Product'}
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ background: headerBg, borderBottom: `2px solid ${borderColor}` }}
                    >
                      {translations.avg_rate_2024_2025 || 'Avg 2024-25'}
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ background: headerBg, borderBottom: `2px solid ${borderColor}` }}
                    >
                      {translations.avg_rate_2025_2026 || 'Avg 2025-26'}
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ background: headerBg, borderBottom: `2px solid ${borderColor}` }}
                    >
                      {translations.yesterday_rate || 'Yesterday'}
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ background: headerBg, borderBottom: `2px solid ${borderColor}` }}
                    >
                      {translations.today_rate || 'Today'}
                    </TableHead>
                    <TableHead
                      className="text-center"
                      style={{ background: headerBg, borderBottom: `2px solid ${borderColor}` }}
                    >
                      {translations.newly_added_today || 'New'}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {finalDisplayedData.map((item) => (
                    <TableRow
                      key={item.sno}
                      className="hover:shadow-sm"
                      style={{ borderBottom: `1px solid ${borderColor}` }}
                    >
                      <TableCell className="font-medium">{item.sno}</TableCell>
                      <TableCell>{getProductName(item.product)}</TableCell>
                      <TableCell className="text-right">₹{item.avg2024_2025}</TableCell>
                      <TableCell className="text-right">₹{item.avg2025_2026}</TableCell>
                      <TableCell className="text-right">₹{item.yesterday}</TableCell>
                      <TableCell className="text-right">₹{item.today}</TableCell>
                      <TableCell className="text-center">{getNewlyAddedText(item.newlyAdded)}</TableCell>
                      <style jsx>{`
                        /* row hover background using arbitrary color with Tailwind notations
                           In case your Tailwind config doesn't allow arbitrary colors in class names,
                           the inline style fallback below is used. */
                        tr:hover {
                          background: ${hoverBg};
                        }
                      `}</style>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {finalDisplayedData.length === 0 && (
                <p className="text-center text-gray-500 py-4">No market data available for this selection.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <div className="h-20 lg:hidden"></div
<MobileBottomNav />
      <Footer />
    </div>
  );
};

export default MarketDetails;

