export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  discount: number;
  inStock: boolean;
  description: string;
  reviews: number;
}

// Unique images for each product - mapped by index
const productImages = [
  "https://ik.imagekit.io/wadwvg0en/hph-5531-chilli-2-file-2220.webp", // mirch Seeds
  "https://ik.imagekit.io/wadwvg0en/COTTON-INDO-US-955-PLUS.png?tr=c-at_max,w-400,h-300", // cutton seeds
  "https://images.unsplash.com/photo-1416453072034-c8dbfa2856b5?w=400", // Garden Tools
  "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a4?w=400", // Drip Irrigation
  "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400", // Wheat Seeds
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400", // Bio Fertilizer
  "https://images.unsplash.com/photo-1518977676601-b53f82ber33?w=400", // Hybrid Chilli
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400", // Pesticide Spray
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400", // Battery Sprayer
  "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400", // Insecticide
  "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400", // Onion Seeds
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400", // Neem Oil
  "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400", // Mulching Film
  "https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?w=400", // Water Pump
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400", // Greenhouse Net
  "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400", // Soil Testing
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400", // Pruning Shears
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400", // Seedling Tray
  "https://images.unsplash.com/photo-1492496913980-501348b61469?w=400", // Compost Maker
  "https://images.unsplash.com/photo-1558906510-a309e62b2b2c?w=400", // Vermicompost
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400", // Fungicide
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400", // Micro Nutrients
  "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400", // Potato Seeds
  "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400", // Maize Seeds
  "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400", // Rice Seeds
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", // Sugarcane
  "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=400", // Cotton Seeds
  "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400", // Soybean Seeds
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400", // Mustard Seeds
  "https://images.unsplash.com/photo-1567892320421-1c657571ea4a?w=400", // Groundnut Seeds
  "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400", // Sunflower Seeds
  "https://images.unsplash.com/photo-1506073881649-4eb68f884a5a?w=400", // Coriander Seeds
  "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400", // Spinach Seeds
  "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400", // Cabbage Seeds
  "https://images.unsplash.com/photo-1568702846914-96b305d2ead1?w=400", // Cauliflower Seeds
  "https://images.unsplash.com/photo-1615477550927-6ec413c00c5e?w=400", // Brinjal Seeds
  "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=400", // Ladyfinger Seeds
  "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400", // Cucumber Seeds
  "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400", // Bitter Gourd
  "https://images.unsplash.com/photo-1621959601441-4e4c7bca45db?w=400", // Bottle Gourd
  "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400", // Pumpkin Seeds
  "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400", // Carrot Seeds
  "https://images.unsplash.com/photo-1588391980265-a7acac7b8f8e?w=400", // Radish Seeds
  "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=400", // Beetroot Seeds
  "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400", // Ginger Rhizomes
  "https://images.unsplash.com/photo-1615485291234-9d694218aeb3?w=400", // Turmeric Rhizomes
  "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400", // Garlic Bulbs
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400", // Flowering Plant
  "https://images.unsplash.com/photo-1518882605630-8a6d9c23d6fd?w=400", // Rose Plant
  "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400", // Tulsi Plant
];

const productNames = [
  "Mirchi Seeds",
  "Cutton seeds",
  "Garden Tools Set",
  "Drip Irrigation Kit",
  "Wheat Seeds Premium",
  "Bio Fertilizer Mix",
  "Hybrid Chilli Seeds",
  "Pesticide Spray",
  "Battery Sprayer 12L",
  "Insecticide Powder",
  "Onion Seeds Pack",
  "Neem Oil Organic",
  "Mulching Film Roll",
  "Water Pump Motor",
  "Greenhouse Net",
  "Soil Testing Kit",
  "Pruning Shears",
  "Seedling Tray Set",
  "Compost Maker",
  "Vermicompost 5kg",
  "Fungicide Spray",
  "Micro Nutrients Mix",
  "Potato Seeds Certified",
  "Maize Hybrid Seeds",
  "Rice Seeds Premium",
  "Sugarcane Set",
  "Cotton Seeds BT",
  "Soybean Seeds",
  "Mustard Seeds Pack",
  "Groundnut Seeds",
  "Sunflower Seeds",
  "Coriander Seeds Organic",
  "Spinach Seeds Pack",
  "Cabbage Hybrid Seeds",
  "Cauliflower Seeds",
  "Brinjal Seeds Purple",
  "Ladyfinger Seeds",
  "Cucumber Seeds Hybrid",
  "Bitter Gourd Seeds",
  "Bottle Gourd Seeds",
  "Pumpkin Seeds Orange",
  "Carrot Seeds Red",
  "Radish Seeds White",
  "Beetroot Seeds",
  "Ginger Rhizomes",
  "Turmeric Rhizomes",
  "Garlic Bulbs Pack",
  "Flowering Plant Seeds",
  "Rose Plant Sapling",
  "Tulsi Plant Set",
];

const descriptions = [
  "High-quality hybrid seeds for excellent yield and disease resistance",
  "Complete nutrition fertilizer for healthy plant growth and better yield",
  "Professional grade tools for efficient farming and gardening",
  "Water-efficient system for precise and economical watering",
  "High-yielding seeds suitable for various soil conditions",
  "Organic bio-fertilizer for sustainable farming and soil health",
  "Premium quality product for maximum agricultural productivity",
  "Advanced formula for superior crop protection and growth",
  "Durable and reliable equipment for modern farming needs",
  "Specially formulated for Indian agricultural conditions",
];

export const products: Product[] = Array.from({ length: 50 }, (_, index) => {
  const basePrice = Math.floor(Math.random() * 3000) + 199;
  const discount = Math.floor(Math.random() * 30) + 10;
  const originalPrice = Math.floor(basePrice / (1 - discount / 100));
  
  return {
    id: String(index + 1),
    name: productNames[index],
    price: basePrice,
    originalPrice: originalPrice,
    image: productImages[index],
    rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
    discount: discount,
    inStock: Math.random() > 0.15,
    description: descriptions[index % descriptions.length],
    reviews: Math.floor(Math.random() * 300) + 10,
  };
});
