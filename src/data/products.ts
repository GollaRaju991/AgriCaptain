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

const productImages = [
  "https://i.postimg.cc/FKpwqR68/Tomato-Seeds.png",
  "https://i.postimg.cc/4y7Mm13R/Pestiside.png",
  "https://i.postimg.cc/bNby5x95/ns-404-file-1319.jpg",
  "https://i.postimg.cc/vmPbn3G4/balwaan-shakti-battery-sprayer-12x8-file-7234.jpg",
  "https://i.postimg.cc/dtMvG7cj/glycel-herbicide-1-file-5004.png",
  "https://i.postimg.cc/s22R375s/katyayani-thioxam-thiamethoxam-25-wg-insecticide-file-10409.png",
];

const productNames = [
  "Premium Tomato Seeds",
  "Organic NPK Fertilizer",
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

export const products: Product[] = Array.from({ length: 100 }, (_, index) => {
  const basePrice = Math.floor(Math.random() * 3000) + 199;
  const discount = Math.floor(Math.random() * 30) + 10;
  const originalPrice = Math.floor(basePrice / (1 - discount / 100));
  
  return {
    id: String(index + 1),
    name: productNames[index % productNames.length] + (index >= 50 ? ` - Pack ${Math.floor(index / 50) + 1}` : ""),
    price: basePrice,
    originalPrice: originalPrice,
    image: productImages[index % productImages.length],
    rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
    discount: discount,
    inStock: Math.random() > 0.15,
    description: descriptions[index % descriptions.length],
    reviews: Math.floor(Math.random() * 300) + 10,
  };
});
