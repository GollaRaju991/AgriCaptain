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
  "https://ik.imagekit.io/wadwvg0en/saaho-to-3251-tomato-seeds-file-20102_fa8e4f1b-8208-424b-8580-c611341fcb08.webp?tr=c-at_max,w-400,h-300", // Garden Tools
  "https://ik.imagekit.io/wadwvg0en/urja-kalyani-onion-seeds-file-14323.webp", // Drip Irrigation
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-glyphosafe-herbicide-file-21319.png", // Wheat Seeds
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-dronex-insecticide-file-20820.png", // Bio Fertilizer
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-impactor-insecticide-file-20844.png", // Hybrid Chilli
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-garud-41-herbicide-file-20893.png", // Pesticide Spray
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-tebuspark-fungicide-file-20885.png", // Battery Sprayer
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-tebuspark-fungicide-file-20885.png", // Insecticide
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-thiaapex-insecticide-file-20856.png", // Onion Seeds
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-mectimax-5-insecticide-file-20827.png", // Neem Oil
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-pyrithrin-insecticide-file-20980.png", // Mulching Film
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-thunder-insecticide-file-20859.png", // Water Pump
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-qsar-herbicide-file-20897.png", // Greenhouse Net
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-flybird-insecticide-file-20839.png", // Soil Testing
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-venus-fungicide-file-20891.png", // Pruning Shears
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-cyclone-50-insecticide-file-20811.png", // Seedling Tray
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/Untitleddesign-2025-05-20T154249.470_AkanshaSingh.png", // Compost Maker
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-crypton-insecticide-file-20803.png", // Vermicompost
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-burst-24-herbicide-file-20895.png", // Fungicide
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-exypride-20-insecticide-file-20807.png", // Micro Nutrients
  "https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-cypher-insecticide-file-20815.png", // Potato Seeds
  "https://ik.imagekit.io/wadwvg0en/saaho-to-3251-tomato-seeds-file-20103_56dd106d-6fd3-44af-b893-e94d62c50d48.webp", // Maize Seeds
  "https://ik.imagekit.io/wadwvg0en/Work/Kraft%20Seeds%20Hand%20Cultivator%20-%201%20PC%20%20Cultivator%20Agriculture%20Tool%20for%20Home%20Gardening%20%20Farming%20Tiller%20for%20Plants%20in%20Garden%20Durable%20Hand%20Cultivator%20for%20Garden%20(Red%20Handle,%20Black%20Metal)%20%20Garden%20Tiller.webp", // Rice Seeds
  "https://ik.imagekit.io/wadwvg0en/Work/61g8uKD8JoL._AC_UL480_FMwebp_QL65_.webp", // Sugarcane
  "https://ik.imagekit.io/wadwvg0en/Work/71dJiDl1rAL._AC_UL480_FMwebp_QL65_.webp", // Cotton Seeds
  "https://ik.imagekit.io/wadwvg0en/Work/71cTTKlTkYL._AC_UL480_FMwebp_QL65_.webp", // Soybean Seeds
  "https://ik.imagekit.io/wadwvg0en/Work/71cTTKlTkYL._AC_UL480_FMwebp_QL65_.webp", // Mustard Seeds
  "https://ik.imagehttps://ik.imagekit.io/wadwvg0en/Work/51qQZU1dqaL._AC_UL480_FMwebp_QL65_.webpkit.io/wadwvg0en/Work/51wNzLotEbL._AC_UL480_FMwebp_QL65_.webp", // Groundnut Seeds
  "https://ik.imagekit.io/wadwvg0en/Work/51EB9-p-WrL._AC_UL480_FMwebp_QL65_.webp", // Sunflower Seeds
  "https://ik.imagekit.io/wadwvg0en/Work/51z5-QPDAHL._AC_UL480_FMwebp_QL65_.webp", // Coriander Seeds
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
  "Tomoto seeds",
  "Onion Seeds",
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
