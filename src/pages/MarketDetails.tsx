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
  // ✅ Main Crop Market List (Corrected)
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
    "Hyderabad",
    "Guntur",
    "Vijayawada",
    "Kurnool",
    "Nellore",
    "Tirupati",
    "Anantapur",
    "Rajahmundry",
    "Ongole",
    "Kadapa",
    "Chittoor"
  ];

  const [selectedDistrict, setSelectedDistrict] = React.useState("Select District");

  // -------------------------------------------------------
  // ⭐ Market-wise Crop Data (Each district has its own data)
  // -------------------------------------------------------
  const marketWiseData: Record<string, MarketData[]> = {
    Guntur: [
      {
        sno: 1,
        product: { en: "Red Chilli", te: "ఎర్ర మిర్చి", hi: "लाल मिर्च" },
        avg2024_2025: 13000,
        avg2025_2026: 13800,
        yesterday: 13600,
        today: 13800,
        newlyAdded: { en: "No", te: "కాదు", hi: "नहीं" }
      }
    ],

    Warangal: [
      {
        sno: 1,
        product: { en: "Cotton", te: "పత్తి", hi: "कपास" },
        avg2024_2025: 6800,
        avg2025_2026: 7200,
        yesterday: 7000,
        today: 7200,
        newlyAdded: { en: "Yes", te: "అవును", hi: "हाँ" }
      }
    ],

    Nizamabad: [
      {
        sno: 1,
        product: { en: "Turmeric", te: "పసుపు", hi: "हल्दी" },
        avg2024_2025: 9200,
        avg2025_2026: 9500,
        yesterday: 9400,
        today: 9500,
        newlyAdded: { en: "No", te: "కాదు", hi: "नहीं" }
      }
    ],

    // ▶ Default: ALL DATA (if user selects no district)
    Default: [
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
      }
    ]
  };

  // ---------------------------------------------
  // ⭐ Final Market Data After District Selection
  // ---------------------------------------------
  const finalData =
    selectedDistrict !== "Select District"
      ? marketWiseData[selectedDistrict] || []
      : marketWiseData.Default;

  const getProductName = (product: any) => {
    if (language === 'te') return product.te;
    if (language === 'hi') return product.hi;
    return product.en;
  };

  const getNewlyAddedText = (newlyAdded: any) => {
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
            <CardDescription>{translations.market_details_description}</CardDescription>
          </CardHeader>

          {/* ----------------------------------------------------
              ✅ Market Dropdown (Updated & Working)
              ---------------------------------------------------- */}
          <div className="mb-4 px-6">
            <label className="font-medium mr-3">Select Market:</label>
            <select
              className="border px-4 py-2 rounded-md"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="Select District">Select Market</option>
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
                    <TableHead>S.No</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Avg 2024-25</TableHead>
                    <TableHead className="text-right">Avg 2025-26</TableHead>
                    <TableHead className="text-right">Yesterday</TableHead>
                    <TableHead className="text-right">Today</TableHead>
                    <TableHead className="text-center">New</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {finalData.map((item) => (
                    <TableRow key={item.sno}>
                      <TableCell>{item.sno}</TableCell>
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

              {/* If no data available */}
              {finalData.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No market data available for this selection.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default MarketDetails;
