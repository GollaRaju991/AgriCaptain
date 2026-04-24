import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/Footer';
import { MapPin, Calendar, TrendingUp, TrendingDown, Minus, Sprout, BarChart3, Users, ChevronDown } from 'lucide-react';

// ── Crop SVG icon components ──
const CottonIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <circle cx="20" cy="14" r="5" fill="#f5f5f0" stroke="#c8c8b0" strokeWidth="1"/>
    <circle cx="14" cy="18" r="5" fill="#f5f5f0" stroke="#c8c8b0" strokeWidth="1"/>
    <circle cx="26" cy="18" r="5" fill="#f5f5f0" stroke="#c8c8b0" strokeWidth="1"/>
    <circle cx="17" cy="24" r="5" fill="#f5f5f0" stroke="#c8c8b0" strokeWidth="1"/>
    <circle cx="23" cy="24" r="5" fill="#f5f5f0" stroke="#c8c8b0" strokeWidth="1"/>
    <path d="M20 28 L20 36" stroke="#4a7c59" strokeWidth="2" fill="none"/>
    <path d="M18 30 Q16 28 14 30" stroke="#4a7c59" strokeWidth="1.5" fill="none"/>
    <path d="M22 32 Q24 30 26 32" stroke="#4a7c59" strokeWidth="1.5" fill="none"/>
  </svg>
);

const ChilliIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <path d="M20 6 Q18 6 16 8 Q12 14 14 24 Q16 30 18 34 Q20 36 22 34 Q24 30 26 24 Q28 14 24 8 Q22 6 20 6Z" fill="#d32f2f"/>
    <path d="M20 4 Q18 2 20 0 Q22 2 20 4Z" fill="#4a7c59"/>
    <path d="M20 6 L20 4" stroke="#4a7c59" strokeWidth="1.5"/>
  </svg>
);

const TurmericIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <ellipse cx="20" cy="20" rx="7" ry="10" fill="#e6a817" transform="rotate(-15 20 20)"/>
    <ellipse cx="14" cy="22" rx="5" ry="8" fill="#d4960f" transform="rotate(10 14 22)"/>
    <ellipse cx="26" cy="22" rx="5" ry="8" fill="#d4960f" transform="rotate(-10 26 22)"/>
    <circle cx="20" cy="10" r="2" fill="#e6a817"/>
  </svg>
);

const MaizeIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <ellipse cx="20" cy="20" rx="6" ry="12" fill="#f9c74f"/>
    <line x1="20" y1="8" x2="20" y2="32" stroke="#e6a817" strokeWidth="0.5"/>
    <line x1="14" y1="20" x2="26" y2="20" stroke="#e6a817" strokeWidth="0.5"/>
    <circle cx="17" cy="14" r="1.5" fill="#e6a817"/><circle cx="23" cy="14" r="1.5" fill="#e6a817"/>
    <circle cx="17" cy="18" r="1.5" fill="#e6a817"/><circle cx="23" cy="18" r="1.5" fill="#e6a817"/>
    <circle cx="17" cy="22" r="1.5" fill="#e6a817"/><circle cx="23" cy="22" r="1.5" fill="#e6a817"/>
    <circle cx="17" cy="26" r="1.5" fill="#e6a817"/><circle cx="23" cy="26" r="1.5" fill="#e6a817"/>
    <path d="M14 8 Q10 4 8 6" stroke="#4a7c59" strokeWidth="1.5" fill="none"/>
    <path d="M26 8 Q30 4 32 6" stroke="#4a7c59" strokeWidth="1.5" fill="none"/>
  </svg>
);

const GroundnutIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <ellipse cx="16" cy="20" rx="6" ry="8" fill="#c4956a"/>
    <ellipse cx="26" cy="22" rx="5" ry="7" fill="#b8845a"/>
    <line x1="20" y1="14" x2="20" y2="28" stroke="#a07050" strokeWidth="1" strokeDasharray="2"/>
  </svg>
);

const PaddyIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <path d="M20 36 L20 12" stroke="#8B7355" strokeWidth="2"/>
    <ellipse cx="16" cy="10" rx="3" ry="5" fill="#DAA520" transform="rotate(-20 16 10)"/>
    <ellipse cx="24" cy="10" rx="3" ry="5" fill="#DAA520" transform="rotate(20 24 10)"/>
    <ellipse cx="14" cy="16" rx="3" ry="5" fill="#DAA520" transform="rotate(-30 14 16)"/>
    <ellipse cx="26" cy="16" rx="3" ry="5" fill="#DAA520" transform="rotate(30 26 16)"/>
  </svg>
);

const WheatIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <path d="M20 36 L20 8" stroke="#C4A35A" strokeWidth="2"/>
    <ellipse cx="18" cy="8" rx="2" ry="4" fill="#DAA520" transform="rotate(-15 18 8)"/>
    <ellipse cx="22" cy="10" rx="2" ry="4" fill="#DAA520" transform="rotate(15 22 10)"/>
    <ellipse cx="18" cy="14" rx="2" ry="4" fill="#DAA520" transform="rotate(-15 18 14)"/>
    <ellipse cx="22" cy="16" rx="2" ry="4" fill="#DAA520" transform="rotate(15 22 16)"/>
    <ellipse cx="18" cy="20" rx="2" ry="4" fill="#DAA520" transform="rotate(-15 18 20)"/>
  </svg>
);

const BajraIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <path d="M20 36 L20 14" stroke="#6B5B3A" strokeWidth="2"/>
    <ellipse cx="20" cy="10" rx="4" ry="8" fill="#8B7355"/>
    <ellipse cx="20" cy="10" rx="3" ry="6" fill="#A0896A"/>
  </svg>
);

const JowarIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <path d="M20 36 L20 12" stroke="#7A6B4E" strokeWidth="2"/>
    <circle cx="16" cy="8" r="2" fill="#C4A35A"/><circle cx="20" cy="6" r="2" fill="#C4A35A"/>
    <circle cx="24" cy="8" r="2" fill="#C4A35A"/><circle cx="18" cy="11" r="2" fill="#C4A35A"/>
    <circle cx="22" cy="11" r="2" fill="#C4A35A"/>
  </svg>
);

const MoongIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <ellipse cx="20" cy="20" rx="4" ry="6" fill="#7CB342"/>
    <ellipse cx="14" cy="22" rx="3" ry="5" fill="#689F38"/>
    <ellipse cx="26" cy="22" rx="3" ry="5" fill="#689F38"/>
    <path d="M20 14 L20 8" stroke="#4a7c59" strokeWidth="1.5"/>
    <path d="M18 10 Q16 6 14 8" stroke="#4a7c59" strokeWidth="1" fill="none"/>
  </svg>
);

const UradIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <ellipse cx="20" cy="20" rx="4" ry="6" fill="#333"/><ellipse cx="14" cy="22" rx="3" ry="5" fill="#444"/>
    <ellipse cx="26" cy="22" rx="3" ry="5" fill="#444"/>
    <path d="M20 14 L20 8" stroke="#4a7c59" strokeWidth="1.5"/>
  </svg>
);

const ToorIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <ellipse cx="20" cy="20" rx="4" ry="6" fill="#C8A951"/>
    <ellipse cx="14" cy="22" rx="3" ry="5" fill="#B89A42"/>
    <ellipse cx="26" cy="22" rx="3" ry="5" fill="#B89A42"/>
  </svg>
);

const SesameIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <path d="M20 36 L20 10" stroke="#8B7355" strokeWidth="1.5"/>
    <ellipse cx="17" cy="12" rx="2" ry="3" fill="#F5E6C4"/><ellipse cx="23" cy="14" rx="2" ry="3" fill="#F5E6C4"/>
    <ellipse cx="17" cy="18" rx="2" ry="3" fill="#F5E6C4"/><ellipse cx="23" cy="20" rx="2" ry="3" fill="#F5E6C4"/>
  </svg>
);

const SunflowerIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <circle cx="20" cy="16" r="5" fill="#5D4037"/>
    {[0,45,90,135,180,225,270,315].map(a => (
      <ellipse key={a} cx="20" cy="8" rx="3" ry="5" fill="#FDD835" transform={`rotate(${a} 20 16)`}/>
    ))}
    <path d="M20 24 L20 36" stroke="#4a7c59" strokeWidth="2"/>
  </svg>
);

const SugarcaneIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <rect x="18" y="4" width="4" height="32" rx="2" fill="#8BC34A"/>
    <line x1="18" y1="10" x2="22" y2="10" stroke="#689F38" strokeWidth="1.5"/>
    <line x1="18" y1="16" x2="22" y2="16" stroke="#689F38" strokeWidth="1.5"/>
    <line x1="18" y1="22" x2="22" y2="22" stroke="#689F38" strokeWidth="1.5"/>
    <line x1="18" y1="28" x2="22" y2="28" stroke="#689F38" strokeWidth="1.5"/>
    <path d="M22 8 Q28 4 30 8" stroke="#4a7c59" strokeWidth="1" fill="none"/>
    <path d="M18 14 Q12 10 10 14" stroke="#4a7c59" strokeWidth="1" fill="none"/>
  </svg>
);

const OnionIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <ellipse cx="20" cy="24" rx="10" ry="12" fill="#CE93D8"/>
    <ellipse cx="20" cy="24" rx="7" ry="9" fill="#E1BEE7"/>
    <path d="M20 12 L20 4" stroke="#4a7c59" strokeWidth="2"/>
    <path d="M18 8 Q16 4 14 6" stroke="#4a7c59" strokeWidth="1" fill="none"/>
    <path d="M22 6 Q24 2 26 4" stroke="#4a7c59" strokeWidth="1" fill="none"/>
  </svg>
);

const PotatoIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <ellipse cx="20" cy="22" rx="12" ry="10" fill="#C4A35A"/>
    <ellipse cx="20" cy="22" rx="10" ry="8" fill="#D4B36A"/>
    <circle cx="16" cy="20" r="1" fill="#B89A42"/><circle cx="24" cy="22" r="1" fill="#B89A42"/>
    <circle cx="20" cy="18" r="1" fill="#B89A42"/>
  </svg>
);

const TomatoIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <circle cx="20" cy="22" r="11" fill="#e53935"/>
    <circle cx="20" cy="22" r="9" fill="#ef5350"/>
    <path d="M16 12 Q18 8 20 11 Q22 8 24 12" stroke="#4a7c59" strokeWidth="1.5" fill="#4a7c59"/>
  </svg>
);

const GarlicIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <ellipse cx="20" cy="24" rx="10" ry="12" fill="#F5F5F0"/>
    <path d="M20 12 L20 24" stroke="#E0D8C8" strokeWidth="0.5"/>
    <path d="M14 14 Q14 24 20 36" stroke="#E0D8C8" strokeWidth="0.5" fill="none"/>
    <path d="M26 14 Q26 24 20 36" stroke="#E0D8C8" strokeWidth="0.5" fill="none"/>
    <path d="M20 12 L18 6 Q20 4 22 6 Z" fill="#C8B898"/>
  </svg>
);

const GingerIcon = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
    <path d="M10 20 Q14 16 20 18 Q26 14 30 18 Q32 22 28 24 Q24 28 20 26 Q16 30 12 26 Q8 24 10 20Z" fill="#C4956A"/>
    <path d="M12 20 Q16 18 20 20 Q24 16 28 20" stroke="#A07050" strokeWidth="0.5" fill="none"/>
  </svg>
);

// Map crop names to icon components
const cropIconMap: Record<string, React.FC> = {
  'Cotton': CottonIcon,
  'Red Chilli': ChilliIcon,
  'Turmeric': TurmericIcon,
  'Maize': MaizeIcon,
  'Groundnut': GroundnutIcon,
  'Paddy': PaddyIcon,
  'Wheat': WheatIcon,
  'Bajra': BajraIcon,
  'Jowar': JowarIcon,
  'Green Gram (Moong)': MoongIcon,
  'Black Gram (Urad)': UradIcon,
  'Toor Dal': ToorIcon,
  'Sesame (Til)': SesameIcon,
  'Sunflower Seeds': SunflowerIcon,
  'Sugarcane': SugarcaneIcon,
  'Onion': OnionIcon,
  'Potato': PotatoIcon,
  'Tomato': TomatoIcon,
  'Garlic': GarlicIcon,
  'Ginger': GingerIcon,
};

// ── Date period options ──
type DatePeriod = 'today' | 'yesterday' | 'last_week' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'last_2_years';

const datePeriodLabels: Record<DatePeriod, { en: string; te: string; hi: string }> = {
  today: { en: 'Today', te: 'ఈ రోజు', hi: 'आज' },
  yesterday: { en: 'Yesterday', te: 'నిన్న', hi: 'कल' },
  last_week: { en: 'Last Week', te: 'గత వారం', hi: 'पिछला सप्ताह' },
  last_month: { en: 'Last Month', te: 'గత నెల', hi: 'पिछला महीना' },
  last_3_months: { en: 'Last 3 Months', te: 'గత 3 నెలలు', hi: 'पिछले 3 महीने' },
  last_6_months: { en: 'Last 6 Months', te: 'గత 6 నెలలు', hi: 'पिछले 6 महीने' },
  last_year: { en: 'Last Year', te: 'గత సంవత్సరం', hi: 'पिछला साल' },
  last_2_years: { en: 'Last 2 Years', te: 'గత 2 సంవత్సరాలు', hi: 'पिछले 2 साल' },
};

interface CropData {
  product: { en: string; te: string; hi: string };
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  last3Months: number;
  last6Months: number;
  lastYear: number;
  last2Years: number;
}

const MarketDetails = () => {
  const { language } = useLanguage();
  const [selectedMarket, setSelectedMarket] = useState('All Markets');
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('today');

  const markets = [
    'Adilabad','Nizamabad','Karimnagar','Medak','Warangal','Khammam','Nalgonda',
    'Mahbubnagar','Rangareddy','Hyderabad','Guntur','Vijayawada','Kurnool',
    'Nellore','Tirupati','Anantapur','Rajahmundry','Ongole','Kadapa','Chittoor',
  ];

  const masterCrops: CropData[] = [
    { product: { en: 'Cotton', te: 'పత్తి', hi: 'कपास' }, today: 7100, yesterday: 6900, lastWeek: 6800, lastMonth: 6600, last3Months: 6400, last6Months: 6200, lastYear: 5800, last2Years: 5500 },
    { product: { en: 'Red Chilli', te: 'ఎర్ర మిర్చి', hi: 'लाल मिर्च' }, today: 13200, yesterday: 13000, lastWeek: 12800, lastMonth: 12500, last3Months: 12000, last6Months: 11500, lastYear: 11000, last2Years: 10500 },
    { product: { en: 'Turmeric', te: 'పసుపు', hi: 'हल्दी' }, today: 9400, yesterday: 9600, lastWeek: 9500, lastMonth: 9100, last3Months: 8800, last6Months: 8500, lastYear: 8000, last2Years: 7500 },
    { product: { en: 'Maize', te: 'మొక్కజొన్న', hi: 'मक्का' }, today: 2200, yesterday: 2150, lastWeek: 2100, lastMonth: 2050, last3Months: 2000, last6Months: 1950, lastYear: 1900, last2Years: 1850 },
    { product: { en: 'Groundnut', te: 'వేరుశనగ', hi: 'मूंगफली' }, today: 6150, yesterday: 6100, lastWeek: 6000, lastMonth: 5900, last3Months: 5800, last6Months: 5700, lastYear: 5500, last2Years: 5300 },
    { product: { en: 'Paddy', te: 'వరి', hi: 'धान' }, today: 2300, yesterday: 2250, lastWeek: 2200, lastMonth: 2100, last3Months: 2050, last6Months: 2000, lastYear: 1950, last2Years: 1900 },
    { product: { en: 'Wheat', te: 'గోధుమ', hi: 'गेहूँ' }, today: 2600, yesterday: 2550, lastWeek: 2500, lastMonth: 2400, last3Months: 2350, last6Months: 2300, lastYear: 2200, last2Years: 2100 },
    { product: { en: 'Bajra', te: 'సజ్జలు', hi: 'बाजरा' }, today: 1950, yesterday: 1900, lastWeek: 1880, lastMonth: 1800, last3Months: 1750, last6Months: 1700, lastYear: 1650, last2Years: 1600 },
    { product: { en: 'Jowar', te: 'జొన్న', hi: 'ज्वार' }, today: 2400, yesterday: 2350, lastWeek: 2300, lastMonth: 2200, last3Months: 2150, last6Months: 2100, lastYear: 2000, last2Years: 1900 },
    { product: { en: 'Green Gram (Moong)', te: 'పెసలు', hi: 'मूंग' }, today: 7500, yesterday: 7400, lastWeek: 7300, lastMonth: 7000, last3Months: 6800, last6Months: 6500, lastYear: 6200, last2Years: 5900 },
    { product: { en: 'Black Gram (Urad)', te: 'మినుములు', hi: 'उड़द' }, today: 7100, yesterday: 7000, lastWeek: 6900, lastMonth: 6800, last3Months: 6600, last6Months: 6400, lastYear: 6100, last2Years: 5800 },
    { product: { en: 'Toor Dal', te: 'కందులు', hi: 'अरहर दाल' }, today: 8200, yesterday: 8000, lastWeek: 7900, lastMonth: 7800, last3Months: 7600, last6Months: 7400, lastYear: 7000, last2Years: 6700 },
    { product: { en: 'Sesame (Til)', te: 'నువ్వులు', hi: 'तिल' }, today: 9400, yesterday: 9300, lastWeek: 9200, lastMonth: 9000, last3Months: 8800, last6Months: 8500, lastYear: 8200, last2Years: 7900 },
    { product: { en: 'Sunflower Seeds', te: 'సూర్యకాంతి', hi: 'सूरजमुखी' }, today: 6900, yesterday: 6800, lastWeek: 6700, lastMonth: 6500, last3Months: 6300, last6Months: 6100, lastYear: 5800, last2Years: 5500 },
    { product: { en: 'Sugarcane', te: 'చెరకు', hi: 'गन्ना' }, today: 350, yesterday: 340, lastWeek: 335, lastMonth: 320, last3Months: 310, last6Months: 300, lastYear: 290, last2Years: 280 },
    { product: { en: 'Onion', te: 'ఉల్లిపాయ', hi: 'प्याज़' }, today: 1800, yesterday: 1750, lastWeek: 1700, lastMonth: 1600, last3Months: 1550, last6Months: 1500, lastYear: 1400, last2Years: 1300 },
    { product: { en: 'Potato', te: 'బంగాళాదుంప', hi: 'आलू' }, today: 1500, yesterday: 1450, lastWeek: 1420, lastMonth: 1400, last3Months: 1350, last6Months: 1300, lastYear: 1250, last2Years: 1200 },
    { product: { en: 'Tomato', te: 'టమోటా', hi: 'टमाटर' }, today: 1100, yesterday: 1000, lastWeek: 950, lastMonth: 900, last3Months: 850, last6Months: 800, lastYear: 750, last2Years: 700 },
    { product: { en: 'Garlic', te: 'వెల్లులి', hi: 'लहसुन' }, today: 9000, yesterday: 8900, lastWeek: 8800, lastMonth: 8500, last3Months: 8200, last6Months: 8000, lastYear: 7500, last2Years: 7000 },
    { product: { en: 'Ginger', te: 'అల్లం', hi: 'अदरक' }, today: 10500, yesterday: 10200, lastWeek: 10000, lastMonth: 9500, last3Months: 9200, last6Months: 8800, lastYear: 8200, last2Years: 7800 },
  ];

  // Deterministic market-specific price adjustment
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  };

  const displayData = useMemo(() => {
    if (selectedMarket === 'All Markets') return masterCrops;
    const seed = hash(selectedMarket) % 300;
    return masterCrops.map(crop => {
      const mod = ((seed % 200) - 100);
      return {
        ...crop,
        today: Math.max(1, crop.today + mod),
        yesterday: Math.max(1, crop.yesterday + mod),
        lastWeek: Math.max(1, crop.lastWeek + mod),
        lastMonth: Math.max(1, crop.lastMonth + mod),
        last3Months: Math.max(1, crop.last3Months + mod),
        last6Months: Math.max(1, crop.last6Months + mod),
        lastYear: Math.max(1, crop.lastYear + mod),
        last2Years: Math.max(1, crop.last2Years + mod),
      };
    });
  }, [selectedMarket]);

  // Always compare Today vs selected period
  const getSelectedPeriodPrice = (crop: CropData): number => {
    switch (selectedPeriod) {
      case 'today': return crop.yesterday;
      case 'yesterday': return crop.yesterday;
      case 'last_week': return crop.lastWeek;
      case 'last_month': return crop.lastMonth;
      case 'last_3_months': return crop.last3Months;
      case 'last_6_months': return crop.last6Months;
      case 'last_year': return crop.lastYear;
      case 'last_2_years': return crop.last2Years;
      default: return crop.yesterday;
    }
  };

  const getSelectedPeriodLabel = (): string => {
    if (selectedPeriod === 'today') {
      const l = datePeriodLabels['yesterday'];
      return language === 'te' ? l.te : language === 'hi' ? l.hi : l.en;
    }
    const l = datePeriodLabels[selectedPeriod];
    return language === 'te' ? l.te : language === 'hi' ? l.hi : l.en;
  };

  const getName = (p: { en: string; te: string; hi: string }) =>
    language === 'te' ? p.te : language === 'hi' ? p.hi : p.en;

  // Summary calculations
  const summary = useMemo(() => {
    const todayPrices = displayData.map(c => c.today);
    const prevPrices = displayData.map(c => getSelectedPeriodPrice(c));
    const avgToday = Math.round(todayPrices.reduce((a, b) => a + b, 0) / todayPrices.length);
    const avgPrev = Math.round(prevPrices.reduce((a, b) => a + b, 0) / prevPrices.length);
    return { total: displayData.length, avgToday, avgPrev };
  }, [displayData, selectedPeriod]);

  const t = (en: string, te: string, hi: string) =>
    language === 'te' ? te : language === 'hi' ? hi : en;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdf4]">
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('Market', 'మార్కెట్', 'मार्केट')}{' '}
            <span className="text-green-600">{t('Rates', 'ధరలు', 'दरें')}</span>
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 sm:mb-6">
          <div className="relative flex-1 min-w-[140px] max-w-[220px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 pointer-events-none" />
            <select
              value={selectedMarket}
              onChange={e => setSelectedMarket(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-green-200 bg-white text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <option value="All Markets">{t('All Markets', 'అన్ని మార్కెట్లు', 'सभी बाज़ार')}</option>
              {markets.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 pointer-events-none" />
          </div>
          <div className="relative flex-1 min-w-[140px] max-w-[220px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 pointer-events-none" />
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value as DatePeriod)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-green-200 bg-white text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              {(Object.keys(datePeriodLabels) as DatePeriod[]).map(key => (
                <option key={key} value={key}>{getName(datePeriodLabels[key])}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-green-600 text-white font-semibold text-xs sm:text-sm">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-3">
              <Sprout className="w-4 h-4 hidden sm:block" />
              <span>{t('Crop', 'పంట', 'फसल')}</span>
            </div>
            <div className="px-2 sm:px-4 py-3 text-center">
              <div>{getSelectedPeriodLabel()}</div>
              <div className="text-[10px] sm:text-xs font-normal opacity-80">(₹/{t('Quintal', 'క్వింటల్', 'क्विंटल')})</div>
            </div>
            <div className="px-2 sm:px-4 py-3 text-center">
              <div>{t('Today', 'ఈ రోజు', 'आज')}</div>
              <div className="text-[10px] sm:text-xs font-normal opacity-80">(₹/{t('Quintal', 'క్వింటల్', 'क्विंटल')})</div>
            </div>
            <div className="px-2 sm:px-4 py-3 text-center">
              <div>{t('Change', 'మార్పు', 'बदलाव')}</div>
              <div className="text-[10px] sm:text-xs font-normal opacity-80">₹ & %</div>
            </div>
          </div>

          {/* Table Rows */}
          {displayData.map((crop, idx) => {
            const todayPrice = crop.today;
            const periodPrice = getSelectedPeriodPrice(crop);
            const diff = todayPrice - periodPrice;
            const pct = periodPrice > 0 ? ((diff / periodPrice) * 100).toFixed(1) : '0.0';
            const isUp = diff > 0;
            const isDown = diff < 0;
            const IconComp = cropIconMap[crop.product.en];

            return (
              <div
                key={idx}
                className={`grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-green-50 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-green-50/30'
                } hover:bg-green-50 transition-colors`}
              >
                {/* Crop name */}
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4">
                  {IconComp && <IconComp />}
                  <span className="font-medium text-xs sm:text-base text-foreground truncate">
                    {getName(crop.product)}
                  </span>
                </div>
                {/* Period Price */}
                <div className="px-1 sm:px-4 py-3 text-center text-xs sm:text-base text-muted-foreground">
                  ₹{periodPrice.toLocaleString('en-IN')}
                </div>
                {/* Today Price */}
                <div className={`px-1 sm:px-4 py-3 text-center text-xs sm:text-base font-bold ${isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-foreground'}`}>
                  ₹{todayPrice.toLocaleString('en-IN')}
                </div>
                {/* Change */}
                <div className="px-1 sm:px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    {isUp ? (
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                    ) : isDown ? (
                      <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    )}
                    <span className={`text-[10px] sm:text-sm font-semibold ${isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {isUp ? '+' : ''}₹{Math.abs(diff).toLocaleString('en-IN')}
                    </span>
                    <span className={`text-[9px] sm:text-xs ${isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-muted-foreground'}`}>
                      ({isUp ? '+' : ''}{pct}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mt-4 sm:mt-6">
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-3 sm:p-4 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
              <Users className="w-4 h-4 text-green-600" />
              <span>{t('Total Crops', 'మొత్తం పంటలు', 'कुल फसलें')}</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-foreground">{summary.total}</span>
          </div>
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-3 sm:p-4 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>{t('Avg. Today', 'సగటు ఈరోజు', 'औसत आज')}</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-green-600">₹{summary.avgToday.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-3 sm:p-4 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <span>{t('Avg. Previous', 'సగటు గతం', 'औसत पिछला')}</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-foreground">₹{summary.avgPrev.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </main>

      <div className="h-20 lg:hidden" />
      <Footer />
    </div>
  );
};

export default MarketDetails;
