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
 "https://ik.imagekit.io/wadwvg0en/Work/51EB9-p-WrL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/51EB9-p-WrL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/71rZ7-bV0iL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/71bWbrmAuML._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/71bWbrmAuML._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/419Y8gbtBxL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/91+NWBqm3ML._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/61F+U3KPoyL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/41NF5NVbZNL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/71qB0+lIfkL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/61UF33H+5BL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/718mIygx+2L._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/718mIygx+2L._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/51ZLAhr3u4L._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/61dUSrKEQTL._AC_UL480_FMwebp_QL65_.webp", // Garlic Bulbs
  "https://ik.imagekit.io/wadwvg0en/Work/81auo7w93cL._AC_UL480_FMwebp_QL65_.webp", // Flowering Plant
  "https://ik.imagekit.io/wadwvg0en/Work/51ZLAhr3u4L._AC_UL480_FMwebp_QL65_.webp", // Rose Plant
  "https://ik.imagekit.io/wadwvg0en/Work/61+u3uGpTWL._AC_SX416_CB1169409_QL70_.jpg",
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
 "https://ik.imagekit.io/wadwvg0en/Work/51EB9-p-WrL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/51EB9-p-WrL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/71rZ7-bV0iL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/71bWbrmAuML._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/71bWbrmAuML._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/419Y8gbtBxL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/91+NWBqm3ML._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/61F+U3KPoyL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/41NF5NVbZNL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/71qB0+lIfkL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/61UF33H+5BL._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/718mIygx+2L._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/718mIygx+2L._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/51ZLAhr3u4L._AC_UL480_FMwebp_QL65_.webp",
"https://ik.imagekit.io/wadwvg0en/Work/61dUSrKEQTL._AC_UL480_FMwebp_QL65_.webp", // Garlic Bulbs
  "https://ik.imagekit.io/wadwvg0en/Work/81auo7w93cL._AC_UL480_FMwebp_QL65_.webp", // Flowering Plant
  "https://ik.imagekit.io/wadwvg0en/Work/51ZLAhr3u4L._AC_UL480_FMwebp_QL65_.webp", // Rose Plant
  "https://ik.imagekit.io/wadwvg0en/Work/61+u3uGpTWL._AC_SX416_CB1169409_QL70_.jpg",// Tulsi Plant
];

const productNames = [
 "Mirch Seeds",
"Cotton Seeds",
"Tomato Seeds",
"Onion Seeds",
"Wheat Seeds",
"Bio Fertilizer",
"Hybrid Chilli",
"Pesticide Spray",
"Battery Sprayer",
"Insecticide",
"Onion Seeds",
"Neem Oil",
"Mulching Film",
"Water Pump",
"Greenhouse Net",
"Soil Testing",
"Pruning Shears",
"Seedling Tray",
"Compost Maker",
"Vermicompost",
"Fungicide",
"Micro Nutrients",
"Potato Seeds",
"Maize Seeds",
"Rice Seeds",
"Sugarcane",
"Cotton Seeds",
"Soybean Seeds",
"Mustard Seeds",
"Groundnut Seeds",
"Sunflower Seeds",
"Coriander Seeds",
"Coriander Seeds",
"Coriander Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Garlic Bulbs",
"Flowering Plant",
"Rose Plant",
"Plant",
  "Mirch Seeds",
"Cotton Seeds",
"Tomato Seeds",
"Onion Seeds",
"Wheat Seeds",
"Bio Fertilizer",
"Hybrid Chilli",
"Pesticide Spray",
"Battery Sprayer",
"Insecticide",
"Onion Seeds",
"Neem Oil",
"Mulching Film",
"Water Pump",
"Greenhouse Net",
"Soil Testing",
"Pruning Shears",
"Seedling Tray",
"Compost Maker",
"Vermicompost",
"Fungicide",
"Micro Nutrients",
"Potato Seeds",
"Maize Seeds",
"Rice Seeds",
"Sugarcane",
"Cotton Seeds",
"Soybean Seeds",
"Mustard Seeds",
"Groundnut Seeds",
"Sunflower Seeds",
"Coriander Seeds",
"Coriander Seeds",
"Coriander Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Seeds",
"Garlic Bulbs",
"Flowering Plant",
"Rose Plant",
"Plant",
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

export const products: Product[] = Array.from({ length: 500 }, (_, index) => {
  const basePrice = Math.floor(Math.random() * 3000) + 199;
  const discount = Math.floor(Math.random() * 30) + 10;
  const originalPrice = Math.floor(basePrice / (1 - discount / 100));
  
  return {
    id: String(index + 1),
    name: `${productNames[index % productNames.length]} - ${Math.floor(index / productNames.length) + 1}`,
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
