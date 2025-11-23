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

  // ---------------------------------------
  // ✅ Telangana Old Districts Dropdown Data
  // ---------------------------------------
  const districts = [
    "Adilabad",
    "Nizamabad",
    "Karimnagar",
    "Medak",
    "Warangal",
    "Khammam",
    "Nalgonda",
    "Mahbubnagar",
    "Rangareddy",
    "Hyderabad"
  ];

  const [selectedDistrict, setSelectedDistrict] = React.useState("Select District");

  // ---------------------------------------
  // Existing Market Data (unchanged)
  // ---------------------------------------
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
    },
    {
    sno: 6,
    product: { en: 'Paddy', te: 'వరి', hi: 'धान' },
    avg2024_2025: 2100,
    avg2025_2026: 2300,
    yesterday: 2250,
    today: 2300,
    newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' }
  },
  {
    sno: 7,
    product: { en: 'Wheat', te: 'గోధుమ', hi: 'गेहूँ' },
    avg2024_2025: 2400,
    avg2025_2026: 2600,
    yesterday: 2500,
    today: 2600,
    newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
  },
  {
    sno: 8,
    product: { en: 'Bajra', te: 'సజ్జలు', hi: 'बाजरा' },
    avg2024_2025: 1800,
    avg2025_2026: 1950,
    yesterday: 1900,
    today: 1950,
    newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
  },
  {
    sno: 9,
    product: { en: 'Jowar', te: 'జొన్న', hi: 'ज्वार' },
    avg2024_2025: 2200,
    avg2025_2026: 2400,
    yesterday: 2350,
    today: 2400,
    newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' }
  },
  {
    sno: 10,
    product: { en: 'Green Gram (Moong)', te: 'పెసలు', hi: 'मूंग' },
    avg2024_2025: 7000,
    avg2025_2026: 7500,
    yesterday: 7400,
    today: 7500,
    newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
  },
  {
    sno: 11,
    product: { en: 'Black Gram (Urad)', te: 'మినుములు', hi: 'उड़द' },
    avg2024_2025: 6800,
    avg2025_2026: 7100,
    yesterday: 7000,
    today: 7100,
    newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' }
  },
  {
    sno: 12,
    product: { en: 'Toor Dal', te: 'కందులు', hi: 'अरहर दाल' },
    avg2024_2025: 7800,
    avg2025_2026: 8200,
    yesterday: 8000,
    today: 8200,
    newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
  },
  {
    sno: 13,
    product: { en: 'Sesame (Til)', te: 'నువ్వులు', hi: 'तिल' },
    avg2024_2025: 9000,
    avg2025_2026: 9400,
    yesterday: 9300,
    today: 9400,
    newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' }
  },
  {
    sno: 14,
    product: { en: 'Sunflower Seeds', te: 'సూర్యకాంతి', hi: 'सूरजमुखी' },
    avg2024_2025: 6500,
    avg2025_2026: 6900,
    yesterday: 6800,
    today: 6900,
    newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
  },
  {
    sno: 15,
    product: { en: 'Sugarcane', te: 'చెరకు', hi: 'गन्ना' },
    avg2024_2025: 320,
    avg2025_2026: 350,
    yesterday: 340,
    today: 350,
    newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
  },
  {
    sno: 16,
    product: { en: 'Onion', te: 'ఉల్లిపాయ', hi: 'प्याज़' },
    avg2024_2025: 1600,
    avg2025_2026: 1800,
    yesterday: 1750,
    today: 1800,
    newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' }
  },
  {
    sno: 17,
    product: { en: 'Potato', te: 'బంగాళాదుంప', hi: 'आलू' },
    avg2024_2025: 1400,
    avg2025_2026: 1500,
    yesterday: 1450,
    today: 1500,
    newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
  },
  {
    sno: 18,
    product: { en: 'Tomato', te: 'టమోటా', hi: 'टमाटर' },
    avg2024_2025: 900,
    avg2025_2026: 1100,
    yesterday: 1000,
    today: 1100,
    newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' }
  },
  {
    sno: 19,
    product: { en: 'Garlic', te: 'వెల్లులి', hi: 'लहसुन' },
    avg2024_2025: 8500,
    avg2025_2026: 9000,
    yesterday: 8900,
    today: 9000,
    newlyAdded: { en: 'No', te: 'కాదు', hi: 'नहीं' }
  },
  {
    sno: 20,
    product: { en: 'Ginger', te: 'అల్లం', hi: 'अदरक' },
    avg2024_2025: 9500,
    avg2025_2026: 10500,
    yesterday: 10200,
    today: 10500,
    newlyAdded: { en: 'Yes', te: 'అవును', hi: 'हाँ' }
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

          {/* -----------------------------------------
              ✅ Telangana District Dropdown (Added)
              ----------------------------------------- */}
          <div className="mb-4 px-6">
            <label className="font-medium mr-3">Select District:</label>
            <select
              className="border px-4 py-2 rounded-md"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="Select District">Select District</option>
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

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
                      <TableCell className="text-center">
                        {getNewlyAddedText(item.newlyAdded)}
                      </TableCell>
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
