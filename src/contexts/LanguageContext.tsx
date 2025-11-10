
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translations: Record<string, string>;
}

const translations = {
  en: {
    // Header
    'seeds': 'Seeds',
    'fertilizers': 'Fertilizers',
    'agriculture_products': 'Agriculture Products',
    'brands': 'Brands',
    'animalHusbandry' : 'AnimalHusbandry',
    'farm_worker': 'Farm Worker',
    'rent_vehicles': 'Rent Vehicles',
    'loans': 'Loans',
    'login': 'Login',
    'cart': 'Cart',
    'profile': 'Profile',
    
    // Market Details
    'market_details': 'Market Details',
    'market_details_description': 'Current agricultural commodity prices and market rates',
    'sno': 'S.No',
    'agriculture_product': 'Agriculture Product',
    'avg_rate_2024_2025': '2024-2025 Avg Rate (₹/quintal)',
    'avg_rate_2025_2026': '2025-2026 Avg Rate (₹/quintal)',
    'yesterday_rate': 'Yesterday Rate (₹/quintal)',
    'today_rate': 'Today Rate (₹/quintal)',
    'newly_added_today': 'Newly Added Today',
    
    // Main Page
    'welcome_to_agrizin': 'Welcome to Agrizin',
    'your_farming_partner': 'Your Ultimate Farming Partner',
    'quality_seeds': 'Quality Seeds for Better Harvest',
    'organic_fertilizers': 'Organic Fertilizers',
    'modern_equipment': 'Modern Farm Equipment',
    'expert_advice': 'Expert Agricultural Advice',
    'browse_products': 'Browse Products',
    'get_started': 'Get Started',
    'featured_products': 'Featured Products',
    'categories': 'Categories',
    'special_offers': 'Special Offers',
    'why_choose_us': 'Why Choose AgriCaptain?',
    'trusted_by_farmers': 'Trusted by 10,000+ Farmers',
    'free_delivery': 'Free Delivery All Over India',
    'quality_guarantee': '100% Quality Guarantee',
    'expert_support': '24/7 Expert Support',
    
    // Common
    'search': 'Search',
    'add_to_cart': 'Add to Cart',
    'buy_now': 'Buy Now',
    'price': 'Price',
    'discount': 'Discount',
    'total': 'Total',
    'continue_shopping': 'Continue Shopping',
    'checkout': 'Checkout',
    'payment': 'Payment',
    'delivery': 'Delivery',
    
    // UPI Payment
    'upi_payment_confirmation': 'UPI Payment Confirmation',
    'complete_payment_get_discount': 'Complete UPI payment now and get 10% discount!',
    'scan_qr_or_pay': 'Scan QR code or use UPI ID to complete payment',
    'yes_pay_now': 'Yes, Pay Now (10% Off)',
    'no_regular_payment': 'No, Regular Payment',
    'payment_completed': 'Payment Completed Successfully!',
    'payment_failed': 'Payment Failed. Please try again.',
    
    // Cart & Checkout
    'shopping_cart': 'Shopping Cart',
    'order_summary': 'Order Summary',
    'subtotal': 'Subtotal',
    'delivery_charges': 'Delivery Charges',
    'platform_charges': 'Platform Charges',
    'discount_amount': 'Discount Amount',
    'upi_discount': 'UPI Discount (10%)',
    'place_order': 'Place Order',
    'pay_with_upi': 'Pay with UPI',
    'pay_with_emi': 'Pay with EMI',
    'cash_on_delivery': 'Cash on Delivery',
    
    // Address
    'shipping_address': 'Shipping Address',
    'full_name': 'Full Name',
    'phone_number': 'Phone Number',
    'pincode': 'PIN Code',
    'address': 'Address',
    'city': 'City',
    'state': 'State',
    'get_location': 'Get Current Location'
  },
  
  te: {
    // Header
    'seeds': 'విత్తనాలు',
    'fertilizers': 'ఎరువులు',
    'agriculture_products': 'వ్యవసాయ ఉత్పత్తులు',
    'brands': 'బ్రాండ్లు',
    'farm_worker': 'వ్యవసాయ కార్మికుడు',
    'rent_vehicles': 'వాహనాలు అద్దెకు',
    'loans': 'రుణాలు',
    'login': 'లాగిన్',
    'cart': 'కార్ట్',
    'profile': 'ప్రొఫైల్',
    
    // Market Details
    'market_details': 'మార్కెట్ వివరాలు',
    'market_details_description': 'ప్రస్తుత వ్యవసాయ వస్తువుల ధరలు మరియు మార్కెట్ రేట్లు',
    'sno': 'క్ర.సం',
    'agriculture_product': 'వ్యవసాయ ఉత్పత్తి',
    'avg_rate_2024_2025': '2024-2025 సగటు ధర (₹/క్వింటాల్)',
    'avg_rate_2025_2026': '2025-2026 సగటు ధర (₹/క్వింటాల్)',
    'yesterday_rate': 'నిన్న ధర (₹/క్వింటాల్)',
    'today_rate': 'నేటి ధర (₹/క్వింటాల్)',
    'newly_added_today': 'ఈరోజు కొత్తగా జోడించబడింది',
    
    // Main Page
    'welcome_to_agricaptain': 'అగ్రికాప్టెన్‌కు స్వాగతం',
    'your_farming_partner': 'మీ అంతిమ వ్యవసాయ భాగస్వామి',
    'quality_seeds': 'మంచి పంట కోసం నాణ్యమైన విత్తనాలు',
    'organic_fertilizers': 'సేంద్రీయ ఎరువులు',
    'modern_equipment': 'ఆధునిక వ్యవసాయ పరికరాలు',
    'expert_advice': 'నిపుణుల వ్యవసాయ సలహా',
    'browse_products': 'ఉత్పత్తులను చూడండి',
    'get_started': 'ప్రారంభించండి',
    'featured_products': 'ప్రత్యేక ఉత్పత్తులు',
    'categories': 'వర్గాలు',
    'special_offers': 'ప్రత్యేక ఆఫర్లు',
    'why_choose_us': 'అగ్రికాప్టెన్ ఎందుకు ఎంచుకోవాలి?',
    'trusted_by_farmers': '10,000+ రైతుల నమ్మకం',
    'free_delivery': 'భారతదేశం అంతటా ఉచిత డెలివరీ',
    'quality_guarantee': '100% నాణ్యత హామీ',
    'expert_support': '24/7 నిపుణుల మద్దతు',
    
    // Common
    'search': 'వెతకండి',
    'add_to_cart': 'కార్ట్‌కు జోడించండి',
    'buy_now': 'ఇప్పుడే కొనండి',
    'price': 'ధర',
    'discount': 'తగ్గింపు',
    'total': 'మొత్తం',
    'continue_shopping': 'షాపింగ్ కొనసాగించండి',
    'checkout': 'చెక్‌అవుట్',
    'payment': 'చెల్లింపు',
    'delivery': 'డెలివరీ',
    
    // UPI Payment
    'upi_payment_confirmation': 'UPI చెల్లింపు నిర్ధారణ',
    'complete_payment_get_discount': 'ఇప్పుడే UPI చెల్లింపు పూర్తి చేసి 10% తగ్గింపు పొందండి!',
    'scan_qr_or_pay': 'QR కోడ్ స్కాన్ చేయండి లేదా UPI ID ఉపయోగించి చెల్లింపు పూర్తి చేయండి',
    'yes_pay_now': 'అవును, ఇప్పుడు చెల్లించండి (10% తగ్గింపు)',
    'no_regular_payment': 'లేదు, సాధారణ చెల్లింపు',
    'payment_completed': 'చెల్లింపు విజయవంతంగా పూర్తైంది!',
    'payment_failed': 'చెల్లింపు విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    
    // Cart & Checkout
    'shopping_cart': 'షాపింగ్ కార్ట్',
    'order_summary': 'ఆర్డర్ సారాంశం',
    'subtotal': 'ఉప మొత్తం',
    'delivery_charges': 'డెలివరీ ఛార్జీలు',
    'platform_charges': 'ప్లాట్‌ఫారమ్ ఛార్జీలు',
    'discount_amount': 'తగ్గింపు మొత్తం',
    'upi_discount': 'UPI తగ్గింపు (10%)',
    'place_order': 'ఆర్డర్ చేయండి',
    'pay_with_upi': 'UPI తో చెల్లించండి',
    'pay_with_emi': 'EMI తో చెల్లించండి',
    'cash_on_delivery': 'డెలివరీలో నగదు',
    
    // Address
    'shipping_address': 'షిప్పింగ్ చిరునామా',
    'full_name': 'పూర్తి పేరు',
    'phone_number': 'ఫోన్ నంబర్',
    'pincode': 'పిన్ కోడ్',
    'address': 'చిరునామా',
    'city': 'నగరం',
    'state': 'రాష్ట్రం',
    'get_location': 'ప్రస్తుత స్థానం పొందండి'
  },
  
  hi: {
    // Header
    'seeds': 'बीज',
    'fertilizers': 'उर्वरक',
    'agriculture_products': 'कृषि उत्पाद',
    'brands': 'ब्रांड्स',
    'farm_worker': 'खेत मजदूर',
    'rent_vehicles': 'वाहन किराए पर',
    'loans': 'ऋण',
    'login': 'लॉगिन',
    'cart': 'कार्ट',
    'profile': 'प्रोफाइल',
    
    // Market Details
    'market_details': 'बाजार विवरण',
    'market_details_description': 'वर्तमान कृषि वस्तुओं की कीमतें और बाजार दरें',
    'sno': 'क्र.सं.',
    'agriculture_product': 'कृषि उत्पाद',
    'avg_rate_2024_2025': '2024-2025 औसत दर (₹/क्विंटल)',
    'avg_rate_2025_2026': '2025-2026 औसत दर (₹/क्विंटल)',
    'yesterday_rate': 'कल की दर (₹/क्विंटल)',
    'today_rate': 'आज की दर (₹/क्विंटल)',
    'newly_added_today': 'आज नया जोड़ा गया',
    
    // Main Page
    'welcome_to_agricaptain': 'एग्रीकैप्टन में आपका स्वागत है',
    'your_farming_partner': 'आपका अंतिम कृषि साझेदार',
    'quality_seeds': 'बेहतर फसल के लिए गुणवत्ता वाले बीज',
    'organic_fertilizers': 'जैविक उर्वरक',
    'modern_equipment': 'आधुनिक कृषि उपकरण',
    'expert_advice': 'विशेषज्ञ कृषि सलाह',
    'browse_products': 'उत्पाद देखें',
    'get_started': 'शुरू करें',
    'featured_products': 'विशेष उत्पाद',
    'categories': 'श्रेणियां',
    'special_offers': 'विशेष ऑफर',
    'why_choose_us': 'एग्रीकैप्टन क्यों चुनें?',
    'trusted_by_farmers': '10,000+ किसानों का भरोसा',
    'free_delivery': 'पूरे भारत में मुफ्त डिलीवरी',
    'quality_guarantee': '100% गुणवत्ता की गारंटी',
    'expert_support': '24/7 विशेषज्ञ सहायता',
    
    // Common
    'search': 'खोजें',
    'add_to_cart': 'कार्ट में जोड़ें',
    'buy_now': 'अभी खरीदें',
    'price': 'मूल्य',
    'discount': 'छूट',
    'total': 'कुल',
    'continue_shopping': 'खरीदारी जारी रखें',
    'checkout': 'चेकआउट',
    'payment': 'भुगतान',
    'delivery': 'डिलीवरी',
    
    // UPI Payment
    'upi_payment_confirmation': 'UPI भुगतान पुष्टि',
    'complete_payment_get_discount': 'अभी UPI भुगतान पूरा करें और 10% छूट पाएं!',
    'scan_qr_or_pay': 'QR कोड स्कैन करें या UPI ID का उपयोग करके भुगतान पूरा करें',
    'yes_pay_now': 'हां, अभी भुगतान करें (10% छूट)',
    'no_regular_payment': 'नहीं, नियमित भुगतान',
    'payment_completed': 'भुगतान सफलतापूर्वक पूरा हुआ!',
    'payment_failed': 'भुगतान विफल। कृपया फिर से कोशिश करें।',
    
    // Cart & Checkout
    'shopping_cart': 'शॉपिंग कार्ट',
    'order_summary': 'ऑर्डर सारांश',
    'subtotal': 'उप योग',
    'delivery_charges': 'डिलीवरी शुल्क',
    'platform_charges': 'प्लेटफॉर्म शुल्क',
    'discount_amount': 'छूट राशि',
    'upi_discount': 'UPI छूट (10%)',
    'place_order': 'ऑर्डर करें',
    'pay_with_upi': 'UPI से भुगतान करें',
    'pay_with_emi': 'EMI से भुगतान करें',
    'cash_on_delivery': 'डिलीवरी पर नकद',
    
    // Address
    'shipping_address': 'शिपिंग पता',
    'full_name': 'पूरा नाम',
    'phone_number': 'फोन नंबर',
    'pincode': 'पिन कोड',
    'address': 'पता',
    'city': 'शहर',
    'state': 'राज्य',
    'get_location': 'वर्तमान स्थान प्राप्त करें'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('agricaptain_language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('agricaptain_language', lang);
    localStorage.setItem('agricaptain_language_selected', 'true');
  };

  const currentTranslations = translations[language as keyof typeof translations] || translations.en;

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      translations: currentTranslations
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
