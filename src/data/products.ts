export interface Variant {
  variant: string;
  sku: string;
  price: number;
  originalPrice: number;
  discount: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  description: string;
  forUse?: string;
  variants: Variant[];
  // Backward-compat computed fields from first variant
  variant: string;
  sku: string;
  price: number;
  originalPrice: number;
  discount: number;
  inStock: boolean;
}

// Helper to build a Product with variants (auto-fills compat fields from first variant)
function defineProduct(p: Omit<Product, 'variant' | 'sku' | 'price' | 'originalPrice' | 'discount' | 'inStock'>): Product {
  const v0 = p.variants[0];
  return {
    ...p,
    variant: v0.variant,
    sku: v0.sku,
    price: v0.price,
    originalPrice: v0.originalPrice,
    discount: v0.discount,
    inStock: v0.inStock,
  };
}

// ── Duplicate prevention utilities ──

export const addProduct = (existing: Product[], newProduct: Product): Product[] => {
  const isDuplicate = existing.some(
    (p) =>
      p.sku === newProduct.sku ||
      (p.name === newProduct.name && p.variant === newProduct.variant)
  );
  if (isDuplicate) {
    throw new Error('Duplicate product: same name + variant or SKU already exists');
  }
  return [...existing, newProduct];
};

export const removeDuplicates = (list: Product[]): Product[] => {
  const seen = new Map<string, Product>();
  for (const p of list) {
    const key = `${p.name.toLowerCase().trim()}-${p.id}`;
    if (!seen.has(key)) seen.set(key, p);
  }
  return Array.from(seen.values());
};

export const isDuplicateVariant = (product: Product, newVariant: Variant): boolean => {
  return product.variants.some(
    v => v.sku === newVariant.sku || v.variant === newVariant.variant
  );
};

export const getDefaultVariant = (product: Product): Variant => product.variants[0];

// ── Curated product catalogue ──

export const products: Product[] = [
  // ─── Seeds ───
  defineProduct({
    id: 'P101',
    name: 'Saaho (TO-3251) Tomato Seeds | High Yield Hybrid Seed by Syngenta',
    brand: 'Syngenta',
    category: 'seeds',
    image: 'https://ik.imagekit.io/wadwvg0en/saaho-to-3251-tomato-seeds-file-20102_fa8e4f1b-8208-424b-8580-c611341fcb08.webp?tr=c-at_max,w-400,h-300',
    images: ['https://ik.imagekit.io/wadwvg0en/saaho-to-3251-tomato-seeds-file-20102_fa8e4f1b-8208-424b-8580-c611341fcb08.webp?tr=c-at_max,w-400,h-300', 'https://ik.imagekit.io/nsi7x5p2x/saaho-to-3251-tomato-seeds-file-20103_56dd106d-6fd3-44af-b893-e94d62c50d48.webp', 'https://ik.imagekit.io/nsi7x5p2x/saaho-to-3251-tomato-seeds-file-20104_b81f8c6b-f8f3-42bc-9295-789101668f23.webp'],
    rating: 4.5,
    reviews: 124,
    description: 'Premium quality hybrid tomato seeds for high-yield farming with excellent disease resistance',
    forUse: 'Vegetable farming and kitchen gardens',
    variants: [
      { variant: '250g', sku: 'SEED-TOM-10G-001', price: 299, originalPrice: 399, discount: 25, inStock: true },
      { variant: '500g', sku: 'SEED-TOM-50G-001', price: 1200, originalPrice: 1600, discount: 25, inStock: true },
      { variant: '1kg', sku: 'SEED-TOM-100G-001', price: 2200, originalPrice: 2900, discount: 24, inStock: true },
      { variant: '2kg', sku: 'SEED-TOM-500G-001', price: 9500, originalPrice: 12500, discount: 24, inStock: false },
    ],
  }),
  defineProduct({
    id: 'P102',
    name: 'Hybrid Chilli Seeds',
    brand: 'Syngenta',
    category: 'seeds',
    image: 'https://ik.imagekit.io/wadwvg0en/hph-5531-chilli-2-file-2220.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/hph-5531-chilli-2-file-2220.webp', '', '', ''],
    rating: 4.6,
    reviews: 203,
    description: 'High-yielding hybrid chilli seeds suitable for various soil types',
    forUse: 'Commercial chilli farming',
    variants: [
      { variant: '10g', sku: 'SEED-CHL-10G-001', price: 320, originalPrice: 420, discount: 24, inStock: true },
      { variant: '50g', sku: 'SEED-CHL-50G-001', price: 1400, originalPrice: 1800, discount: 22, inStock: true },
      { variant: '100g', sku: 'SEED-CHL-100G-001', price: 2500, originalPrice: 3200, discount: 22, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P103',
    name: 'Cotton Seeds – Indo US 955',
    brand: 'Indo US',
    category: 'seeds',
    image: 'https://ik.imagekit.io/wadwvg0en/COTTON-INDO-US-955-PLUS.png?tr=c-at_max,w-400,h-300',
    images: ['https://ik.imagekit.io/wadwvg0en/COTTON-INDO-US-955-PLUS.png?tr=c-at_max,w-400,h-300', '', '', ''],
    rating: 4.7,
    reviews: 312,
    description: 'High-quality hybrid cotton seeds for superior fiber production',
    forUse: 'Cotton farming and fiber production',
    variants: [
      { variant: '450g', sku: 'SEED-COT-450G-001', price: 850, originalPrice: 1050, discount: 19, inStock: true },
      { variant: '1kg', sku: 'SEED-COT-1KG-001', price: 1700, originalPrice: 2100, discount: 19, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P104',
    name: 'Onion Seeds – Kalyani',
    brand: 'Urja',
    category: 'seeds',
    image: 'https://ik.imagekit.io/wadwvg0en/urja-kalyani-onion-seeds-file-14323.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/urja-kalyani-onion-seeds-file-14323.webp', '', '', ''],
    rating: 4.4,
    reviews: 145,
    description: 'Premium onion seeds with high germination rate and uniform bulb size',
    forUse: 'Onion cultivation',
    variants: [
      { variant: '500g', sku: 'SEED-ONI-500G-001', price: 480, originalPrice: 600, discount: 20, inStock: true },
      { variant: '1kg', sku: 'SEED-ONI-1KG-001', price: 900, originalPrice: 1100, discount: 18, inStock: true },
      { variant: '2kg', sku: 'SEED-ONI-2KG-001', price: 1700, originalPrice: 2100, discount: 19, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P105',
    name: 'Rice Seeds – Basmati',
    brand: 'VNR Seeds',
    category: 'seeds',
    image: 'https://i.postimg.cc/bv6gfQJF/rice-bag.png',
    images: ['https://i.postimg.cc/bv6gfQJF/rice-bag.png', '', '', ''],
    rating: 4.7,
    reviews: 189,
    description: 'Premium basmati rice seeds for aromatic long-grain rice cultivation',
    forUse: 'Rice cultivation and paddy farming',
    variants: [
      { variant: '1kg', sku: 'SEED-RIC-1KG-001', price: 350, originalPrice: 420, discount: 17, inStock: true },
      { variant: '5kg', sku: 'SEED-RIC-5KG-001', price: 1200, originalPrice: 1450, discount: 17, inStock: true },
      { variant: '10kg', sku: 'SEED-RIC-10KG-001', price: 2200, originalPrice: 2700, discount: 19, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P106',
    name: 'Wheat Seeds – Premium',
    brand: 'Syngenta',
    category: 'seeds',
    image: 'https://i.postimg.cc/tgFv016K/Screenshot-2025-07-19-182830.png',
    images: ['https://i.postimg.cc/tgFv016K/Screenshot-2025-07-19-182830.png', '', '', ''],
    rating: 4.6,
    reviews: 203,
    description: 'High-yielding wheat seeds suitable for various soil types and weather conditions',
    forUse: 'Commercial wheat farming',
    variants: [
      { variant: '1kg', sku: 'SEED-WHT-1KG-001', price: 180, originalPrice: 220, discount: 18, inStock: true },
      { variant: '5kg', sku: 'SEED-WHT-5KG-001', price: 550, originalPrice: 680, discount: 19, inStock: true },
      { variant: '10kg', sku: 'SEED-WHT-10KG-001', price: 900, originalPrice: 1100, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P107',
    name: 'Sunflower Seeds – Premium',
    brand: 'East-West Seed',
    category: 'seeds',
    image: 'https://i.postimg.cc/zfptDsd7/Brafe.png',
    images: ['https://i.postimg.cc/zfptDsd7/Brafe.png', '', '', ''],
    rating: 4.5,
    reviews: 145,
    description: 'Premium sunflower seeds for oil production and ornamental purposes',
    forUse: 'Oil production and ornamental farming',
    variants: [
      { variant: '500g', sku: 'SEED-SUN-500G-001', price: 250, originalPrice: 300, discount: 17, inStock: true },
      { variant: '1kg', sku: 'SEED-SUN-1KG-001', price: 420, originalPrice: 500, discount: 16, inStock: true },
      { variant: '2kg', sku: 'SEED-SUN-2KG-001', price: 780, originalPrice: 950, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P108',
    name: 'Maize Seeds – Hybrid',
    brand: 'Namdhari Seeds',
    category: 'seeds',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/71dJiDl1rAL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/71dJiDl1rAL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.3,
    reviews: 98,
    description: 'High-yield hybrid maize seeds for all soil conditions',
    forUse: 'Commercial maize farming',
    variants: [
      { variant: '1kg', sku: 'SEED-MAZ-1KG-001', price: 250, originalPrice: 300, discount: 17, inStock: true },
      { variant: '4kg', sku: 'SEED-MAZ-4KG-001', price: 680, originalPrice: 820, discount: 17, inStock: true },
      { variant: '10kg', sku: 'SEED-MAZ-10KG-001', price: 1500, originalPrice: 1800, discount: 17, inStock: true },
    ],
  }),

  // ─── Fertilizers ───
  defineProduct({
    id: 'P201',
    name: 'Organic Compost Fertilizer',
    brand: 'Multiplex',
    category: 'fertilizers',
    image: 'https://i.postimg.cc/gkwfS2MW/Compost.png',
    images: ['https://i.postimg.cc/gkwfS2MW/Compost.png', '', '', ''],
    rating: 4.8,
    reviews: 89,
    description: 'Organic compost fertilizer for sustainable farming and improved soil health',
    forUse: 'All crops and soil improvement',
    variants: [
      { variant: '5kg', sku: 'FERT-COMP-5KG-001', price: 199, originalPrice: 280, discount: 29, inStock: true },
      { variant: '10kg', sku: 'FERT-COMP-10KG-001', price: 350, originalPrice: 480, discount: 27, inStock: true },
      { variant: '25kg', sku: 'FERT-COMP-25KG-001', price: 599, originalPrice: 799, discount: 25, inStock: true },
      { variant: '50kg', sku: 'FERT-COMP-50KG-001', price: 999, originalPrice: 1350, discount: 26, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P202',
    name: 'NPK Fertilizer Complex (20:20:20)',
    brand: 'Katyayani',
    category: 'fertilizers',
    image: 'https://i.postimg.cc/BQHGZv2C/katyayani-npk-20-20-20-fertilizer-with-2-sample-mix-micronutrients-and-organic-humic-acid-file-10642.jpg',
    images: ['https://i.postimg.cc/BQHGZv2C/katyayani-npk-20-20-20-fertilizer-with-2-sample-mix-micronutrients-and-organic-humic-acid-file-10642.jpg', '', '', ''],
    rating: 4.7,
    reviews: 156,
    description: 'Balanced NPK fertilizer complex for complete plant nutrition and optimal growth',
    forUse: 'All crops requiring balanced nutrition',
    variants: [
      { variant: '1kg', sku: 'FERT-NPK-1KG-001', price: 450, originalPrice: 550, discount: 18, inStock: true },
      { variant: '5kg', sku: 'FERT-NPK-5KG-001', price: 1800, originalPrice: 2200, discount: 18, inStock: true },
      { variant: '25kg', sku: 'FERT-NPK-25KG-001', price: 7500, originalPrice: 9200, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P204',
    name: 'Urea Fertilizer',
    brand: 'IFFCO',
    category: 'fertilizers',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/61F+U3KPoyL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/61F+U3KPoyL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.6,
    reviews: 340,
    description: 'Nitrogen-rich fertilizer for crops – promotes vigorous growth',
    forUse: 'All crops – top dressing',
    variants: [
      { variant: '5kg', sku: 'FERT-UREA-5KG-001', price: 180, originalPrice: 220, discount: 18, inStock: true },
      { variant: '25kg', sku: 'FERT-UREA-25KG-001', price: 650, originalPrice: 780, discount: 17, inStock: true },
      { variant: '50kg', sku: 'FERT-UREA-50KG-001', price: 1200, originalPrice: 1400, discount: 14, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P205',
    name: 'Bio Fertilizer Mix',
    brand: 'Dhanuka',
    category: 'fertilizers',
    image: 'https://i.postimg.cc/3RPsjMgh/antracol-file-659.jpg',
    images: ['https://i.postimg.cc/3RPsjMgh/antracol-file-659.jpg', '', '', ''],
    rating: 4.4,
    reviews: 145,
    description: 'Advanced bio-fertilizer blend for enhanced plant growth and soil enrichment',
    forUse: 'Organic farming and soil enhancement',
    variants: [
      { variant: '500g', sku: 'FERT-BIO-500G-001', price: 450, originalPrice: 560, discount: 20, inStock: true },
      { variant: '1kg', sku: 'FERT-BIO-1KG-001', price: 799, originalPrice: 999, discount: 20, inStock: true },
      { variant: '5kg', sku: 'FERT-BIO-5KG-001', price: 3500, originalPrice: 4400, discount: 20, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P206',
    name: 'Vermicompost Organic Manure',
    brand: 'GreenEarth',
    category: 'fertilizers',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/41NF5NVbZNL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/41NF5NVbZNL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.5,
    reviews: 120,
    description: '100% organic vermicompost for soil conditioning and plant nutrition',
    forUse: 'All crops – organic farming',
    variants: [
      { variant: '5kg', sku: 'FERT-VERM-5KG-001', price: 199, originalPrice: 260, discount: 23, inStock: true },
      { variant: '10kg', sku: 'FERT-VERM-10KG-001', price: 350, originalPrice: 450, discount: 22, inStock: true },
      { variant: '25kg', sku: 'FERT-VERM-25KG-001', price: 750, originalPrice: 950, discount: 21, inStock: true },
    ],
  }),

  // ─── Pesticides / Crop Protection ───
  defineProduct({
    id: 'P301',
    name: 'Neem Oil – Organic Insecticide',
    brand: 'Geolife',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-dronex-insecticide-file-20820.png',
    images: ['https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-dronex-insecticide-file-20820.png', '', '', ''],
    rating: 4.5,
    reviews: 120,
    description: 'Organic neem oil insecticide for pest control without harmful chemicals',
    forUse: 'Pest control for organic farming',
    variants: [
      { variant: '250ml', sku: 'PEST-NEEM-250ML-001', price: 150, originalPrice: 190, discount: 21, inStock: true },
      { variant: '500ml', sku: 'PEST-NEEM-500ML-001', price: 250, originalPrice: 300, discount: 17, inStock: true },
      { variant: '1L', sku: 'PEST-NEEM-1L-001', price: 450, originalPrice: 550, discount: 18, inStock: true },
      { variant: '5L', sku: 'PEST-NEEM-5L-001', price: 1800, originalPrice: 2200, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P303',
    name: 'Glyphosafe Herbicide',
    brand: 'Exylon',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-glyphosafe-herbicide-file-21319.png',
    images: ['https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-glyphosafe-herbicide-file-21319.png', '', '', ''],
    rating: 4.3,
    reviews: 78,
    description: 'Non-selective herbicide for effective weed control',
    forUse: 'Weed control – all crops',
    variants: [
      { variant: '500ml', sku: 'PEST-GLY-500ML-001', price: 350, originalPrice: 420, discount: 17, inStock: true },
      { variant: '1L', sku: 'PEST-GLY-1L-001', price: 620, originalPrice: 750, discount: 17, inStock: true },
      { variant: '5L', sku: 'PEST-GLY-5L-001', price: 2800, originalPrice: 3400, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P304',
    name: 'Tebuspark Fungicide',
    brand: 'Exylon',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-tebuspark-fungicide-file-20885.png',
    images: ['https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-tebuspark-fungicide-file-20885.png', '', '', ''],
    rating: 4.6,
    reviews: 112,
    description: 'Broad-spectrum fungicide for crops prone to fungal diseases',
    forUse: 'Fungal disease management',
    variants: [
      { variant: '100ml', sku: 'PEST-TEB-100ML-001', price: 280, originalPrice: 340, discount: 18, inStock: true },
      { variant: '250ml', sku: 'PEST-TEB-250ML-001', price: 580, originalPrice: 700, discount: 17, inStock: true },
      { variant: '500ml', sku: 'PEST-TEB-500ML-001', price: 1050, originalPrice: 1280, discount: 18, inStock: true },
      { variant: '1L', sku: 'PEST-TEB-1L-001', price: 1900, originalPrice: 2300, discount: 17, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P305',
    name: 'Impactor Insecticide',
    brand: 'Exylon',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-impactor-insecticide-file-20844.png',
    images: ['https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-impactor-insecticide-file-20844.png', '', '', ''],
    rating: 4.5,
    reviews: 95,
    description: 'Effective insecticide for sucking and chewing pests',
    forUse: 'Cotton, vegetables, paddy',
    variants: [
      { variant: '250ml', sku: 'PEST-IMP-250ML-001', price: 280, originalPrice: 340, discount: 18, inStock: true },
      { variant: '500ml', sku: 'PEST-IMP-500ML-001', price: 490, originalPrice: 600, discount: 18, inStock: true },
      { variant: '1L', sku: 'PEST-IMP-1L-001', price: 900, originalPrice: 1100, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P306',
    name: 'Thunder Insecticide',
    brand: 'Exylon',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-thunder-insecticide-file-20859.png',
    images: ['https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-thunder-insecticide-file-20859.png', '', '', ''],
    rating: 4.4,
    reviews: 67,
    description: 'Fast-acting insecticide for caterpillar and stem borer control',
    forUse: 'Paddy, maize, sugarcane',
    variants: [
      { variant: '100ml', sku: 'PEST-THN-100ML-001', price: 180, originalPrice: 220, discount: 18, inStock: true },
      { variant: '250ml', sku: 'PEST-THN-250ML-001', price: 380, originalPrice: 460, discount: 17, inStock: true },
      { variant: '500ml', sku: 'PEST-THN-500ML-001', price: 700, originalPrice: 850, discount: 18, inStock: true },
      { variant: '1L', sku: 'PEST-THN-1L-001', price: 1300, originalPrice: 1580, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P307',
    name: 'Garud 41 Herbicide',
    brand: 'Exylon',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-garud-41-herbicide-file-20893.png',
    images: ['https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-garud-41-herbicide-file-20893.png', '', '', ''],
    rating: 4.3,
    reviews: 88,
    description: 'Systemic herbicide for broad-leaf and grassy weeds',
    forUse: 'Non-crop areas and pre-sowing',
    variants: [
      { variant: '500ml', sku: 'PEST-GAR-500ML-001', price: 300, originalPrice: 370, discount: 19, inStock: true },
      { variant: '1L', sku: 'PEST-GAR-1L-001', price: 520, originalPrice: 650, discount: 20, inStock: true },
      { variant: '5L', sku: 'PEST-GAR-5L-001', price: 2200, originalPrice: 2800, discount: 21, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P308',
    name: 'Venus Fungicide',
    brand: 'Exylon',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-venus-fungicide-file-20891.png',
    images: ['https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-venus-fungicide-file-20891.png', '', '', ''],
    rating: 4.7,
    reviews: 103,
    description: 'Systemic fungicide for downy mildew and late blight',
    forUse: 'Grapes, potato, tomato',
    variants: [
      { variant: '250ml', sku: 'PEST-VEN-250ML-001', price: 380, originalPrice: 460, discount: 17, inStock: true },
      { variant: '500ml', sku: 'PEST-VEN-500ML-001', price: 680, originalPrice: 820, discount: 17, inStock: true },
      { variant: '1L', sku: 'PEST-VEN-1L-001', price: 1250, originalPrice: 1500, discount: 17, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P309',
    name: 'Adhitya Pesticide Spray',
    brand: 'FMC',
    category: 'agriculture',
    image: 'https://i.postimg.cc/FH5nTgdy/Adhitya.png',
    images: ['https://i.postimg.cc/FH5nTgdy/Adhitya.png', '', '', ''],
    rating: 4.5,
    reviews: 98,
    description: 'Organic pesticide spray for natural pest control',
    forUse: 'Pest control for organic farming',
    variants: [
      { variant: '250ml', sku: 'PEST-ADH-250ML-001', price: 180, originalPrice: 220, discount: 18, inStock: true },
      { variant: '500ml', sku: 'PEST-ADH-500ML-001', price: 299, originalPrice: 350, discount: 15, inStock: true },
      { variant: '1L', sku: 'PEST-ADH-1L-001', price: 550, originalPrice: 650, discount: 15, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P310',
    name: 'Crypton Insecticide',
    brand: 'Exylon',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-crypton-insecticide-file-20803.png',
    images: ['https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-crypton-insecticide-file-20803.png', '', '', ''],
    rating: 4.3,
    reviews: 56,
    description: 'Contact and systemic insecticide for whitefly and jassid control',
    forUse: 'Cotton, chilli, vegetables',
    variants: [
      { variant: '100ml', sku: 'PEST-CRP-100ML-001', price: 200, originalPrice: 250, discount: 20, inStock: true },
      { variant: '250ml', sku: 'PEST-CRP-250ML-001', price: 420, originalPrice: 520, discount: 19, inStock: true },
      { variant: '500ml', sku: 'PEST-CRP-500ML-001', price: 780, originalPrice: 960, discount: 19, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P311',
    name: 'Flybird Insecticide',
    brand: 'Exylon',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-flybird-insecticide-file-20839.png',
    images: ['https://ik.imagekit.io/wadwvg0en/_%20BigHaat_files/exylon-flybird-insecticide-file-20839.png', '', '', ''],
    rating: 4.2,
    reviews: 45,
    description: 'Targeted insecticide for fruit fly and aphid management',
    forUse: 'Mango, guava, vegetables',
    variants: [
      { variant: '100ml', sku: 'PEST-FLY-100ML-001', price: 280, originalPrice: 340, discount: 18, inStock: true },
      { variant: '250ml', sku: 'PEST-FLY-250ML-001', price: 520, originalPrice: 640, discount: 19, inStock: true },
      { variant: '500ml', sku: 'PEST-FLY-500ML-001', price: 950, originalPrice: 1150, discount: 17, inStock: true },
    ],
  }),

  // ─── Coragen ───
  defineProduct({
    id: 'P312',
    name: 'Coragen Insecticide – Chlorantraniliprole 18.5% SC',
    brand: 'FMC',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/coragen-dupont-file-1135.webp',
    images: [
      'https://ik.imagekit.io/wadwvg0en/coragen-dupont-file-1135.webp',
      'https://ik.imagekit.io/wadwvg0en/Coragen_02.webp',
      'https://ik.imagekit.io/wadwvg0en/Coragen_03.webp',
      'https://ik.imagekit.io/wadwvg0en/Coragen_04.webp',
    ],
    rating: 4.8,
    reviews: 450,
    description: 'Safe, effective pest control with Chlorantraniliprole 18.5% SC for bollworm, stem borer, and fruit borer',
    forUse: 'Cotton, paddy, vegetables, fruits',
    variants: [
      { variant: '60ml', sku: 'PEST-COR-60ML-001', price: 480, originalPrice: 580, discount: 17, inStock: true },
      { variant: '150ml', sku: 'PEST-COR-150ML-001', price: 1100, originalPrice: 1350, discount: 19, inStock: true },
      { variant: '300ml', sku: 'PEST-COR-300ML-001', price: 2100, originalPrice: 2550, discount: 18, inStock: true },
    ],
  }),

  // ─── Tools & Equipment ───
  defineProduct({
    id: 'P401',
    name: 'Hand Cultivator – Garden Tool',
    brand: 'Kraft Seeds',
    category: 'tools',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/Kraft%20Seeds%20Hand%20Cultivator%20-%201%20PC%20%20Cultivator%20Agriculture%20Tool%20for%20Home%20Gardening%20%20Farming%20Tiller%20for%20Plants%20in%20Garden%20Durable%20Hand%20Cultivator%20for%20Garden%20(Red%20Handle,%20Black%20Metal)%20%20Garden%20Tiller.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/Kraft%20Seeds%20Hand%20Cultivator%20-%201%20PC%20%20Cultivator%20Agriculture%20Tool%20for%20Home%20Gardening%20%20Farming%20Tiller%20for%20Plants%20in%20Garden%20Durable%20Hand%20Cultivator%20for%20Garden%20(Red%20Handle,%20Black%20Metal)%20%20Garden%20Tiller.webp', '', '', ''],
    rating: 4.3,
    reviews: 230,
    description: 'Durable hand cultivator for home gardening and farming',
    forUse: 'Home gardening and farming',
    variants: [
      { variant: 'Standard', sku: 'TOOL-CULT-STD-001', price: 350, originalPrice: 450, discount: 22, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P402',
    name: 'Battery Sprayer – 16L',
    brand: 'Neptune',
    category: 'tools',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/61g8uKD8JoL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/61g8uKD8JoL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.6,
    reviews: 178,
    description: 'Rechargeable battery-powered sprayer for effortless spraying',
    forUse: 'Pesticide and fertilizer spraying',
    variants: [
      { variant: '16L', sku: 'TOOL-SPRY-16L-001', price: 2800, originalPrice: 3500, discount: 20, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P403',
    name: 'Pruning Shears – Professional',
    brand: 'Falcon',
    category: 'tools',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/71cTTKlTkYL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/71cTTKlTkYL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.5,
    reviews: 134,
    description: 'Professional grade pruning shears for clean cuts',
    forUse: 'Tree pruning and garden maintenance',
    variants: [
      { variant: '8 inch', sku: 'TOOL-PRUNE-8IN-001', price: 450, originalPrice: 580, discount: 22, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P404',
    name: 'Seedling Tray – 98 Cells',
    brand: 'TrustBasket',
    category: 'tools',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/51qQZU1dqaL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/51qQZU1dqaL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.4,
    reviews: 89,
    description: '98-cell seedling tray for germination and nursery use',
    forUse: 'Nursery and seed germination',
    variants: [
      { variant: '5 Pack', sku: 'TOOL-STRAY-5PK-001', price: 320, originalPrice: 400, discount: 20, inStock: true },
      { variant: '10 Pack', sku: 'TOOL-STRAY-10PK-001', price: 580, originalPrice: 750, discount: 23, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P405',
    name: 'Garden Tools Set',
    brand: 'Kraft Seeds',
    category: 'tools',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/51EB9-p-WrL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/51EB9-p-WrL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.6,
    reviews: 210,
    description: 'Complete 5-piece gardening tool set for home and farm',
    forUse: 'Home gardening and small farms',
    variants: [
      { variant: '5-Piece', sku: 'TOOL-SET-5PC-001', price: 750, originalPrice: 950, discount: 21, inStock: true },
    ],
  }),

  // ─── Irrigation & Equipment ───
  defineProduct({
    id: 'P501',
    name: 'Drip Irrigation Kit',
    brand: 'Jain Irrigation',
    category: 'equipment',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/71rZ7-bV0iL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/71rZ7-bV0iL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.7,
    reviews: 156,
    description: 'Complete drip irrigation system for water-efficient farming',
    forUse: 'Water-efficient crop irrigation',
    variants: [
      { variant: '50 Plants', sku: 'EQUIP-DRIP-50P-001', price: 1499, originalPrice: 1799, discount: 17, inStock: true },
      { variant: '100 Plants', sku: 'EQUIP-DRIP-100P-001', price: 2499, originalPrice: 2999, discount: 17, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P502',
    name: 'Sprinkler System',
    brand: 'Jain Irrigation',
    category: 'equipment',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/71bWbrmAuML._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/71bWbrmAuML._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.5,
    reviews: 98,
    description: 'Rain-gun style sprinkler system for even water distribution',
    forUse: 'Field irrigation',
    variants: [
      { variant: '50m Coverage', sku: 'EQUIP-SPRK-50M-001', price: 1800, originalPrice: 2200, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P503',
    name: 'Mulching Film – Black',
    brand: 'Agro Shield',
    category: 'equipment',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/419Y8gbtBxL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/419Y8gbtBxL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.4,
    reviews: 67,
    description: 'UV-stabilized black mulching film for weed suppression and moisture retention',
    forUse: 'Vegetable and fruit farming',
    variants: [
      { variant: '1m × 100m', sku: 'EQUIP-MULCH-100M-001', price: 1200, originalPrice: 1450, discount: 17, inStock: true },
      { variant: '1m × 400m', sku: 'EQUIP-MULCH-400M-001', price: 3200, originalPrice: 3800, discount: 16, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P504',
    name: 'Greenhouse Net – UV Treated',
    brand: 'Agro Shield',
    category: 'equipment',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/91+NWBqm3ML._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/91+NWBqm3ML._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.5,
    reviews: 78,
    description: 'UV-treated green shade net for nursery and polyhouse',
    forUse: 'Nursery protection and shade',
    variants: [
      { variant: '5m × 3m', sku: 'EQUIP-GNET-5X3-001', price: 850, originalPrice: 1050, discount: 19, inStock: true },
      { variant: '10m × 3m', sku: 'EQUIP-GNET-10X3-001', price: 1500, originalPrice: 1850, discount: 19, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P505',
    name: 'Soil Testing Kit',
    brand: 'Agritech',
    category: 'equipment',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/51z5-QPDAHL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/51z5-QPDAHL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.3,
    reviews: 55,
    description: 'Test NPK, pH and moisture levels of your soil at home',
    forUse: 'Soil analysis for precision farming',
    variants: [
      { variant: 'Standard', sku: 'EQUIP-SOIL-STD-001', price: 980, originalPrice: 1200, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P506',
    name: 'Water Pump – 1HP',
    brand: 'Kirloskar',
    category: 'equipment',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/71qB0+lIfkL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/71qB0+lIfkL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.8,
    reviews: 245,
    description: 'Self-priming monoblock pump for agricultural water supply',
    forUse: 'Farm irrigation and water supply',
    variants: [
      { variant: '0.5HP', sku: 'EQUIP-PUMP-05HP-001', price: 2800, originalPrice: 3400, discount: 18, inStock: true },
      { variant: '1HP', sku: 'EQUIP-PUMP-1HP-001', price: 4500, originalPrice: 5500, discount: 18, inStock: true },
      { variant: '2HP', sku: 'EQUIP-PUMP-2HP-001', price: 7200, originalPrice: 8800, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P507',
    name: 'Tractor – Mahindra 475 DI',
    brand: 'Mahindra',
    category: 'equipment',
    image: 'https://i.postimg.cc/ncVyv1mC/tractor.png',
    images: ['https://i.postimg.cc/ncVyv1mC/tractor.png', '', '', ''],
    rating: 4.9,
    reviews: 312,
    description: 'Powerful 47 HP tractor ideal for farming operations and heavy-duty agricultural work',
    forUse: 'Large-scale farming and heavy agricultural work',
    variants: [
      { variant: '47HP', sku: 'EQUIP-TRAC-47HP-001', price: 625000, originalPrice: 650000, discount: 4, inStock: true },
    ],
  }),

  // ─── Specialty / Growth Promoters ───
  defineProduct({
    id: 'P601',
    name: 'Humic Acid – Growth Promoter',
    brand: 'Aries Agro',
    category: 'fertilizers',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/61UF33H+5BL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/61UF33H+5BL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.5,
    reviews: 130,
    description: 'Concentrated humic acid for root development and nutrient uptake',
    forUse: 'All crops – growth promotion',
    variants: [
      { variant: '500ml', sku: 'SPEC-HUM-500ML-001', price: 320, originalPrice: 400, discount: 20, inStock: true },
      { variant: '1L', sku: 'SPEC-HUM-1L-001', price: 550, originalPrice: 680, discount: 19, inStock: true },
      { variant: '5L', sku: 'SPEC-HUM-5L-001', price: 2200, originalPrice: 2700, discount: 19, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P602',
    name: 'Micro Nutrients – Chelated',
    brand: 'Multiplex',
    category: 'fertilizers',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/718mIygx+2L._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/718mIygx+2L._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.4,
    reviews: 88,
    description: 'Complete chelated micronutrient mix for deficiency correction',
    forUse: 'Foliar spray – all crops',
    variants: [
      { variant: '250g', sku: 'SPEC-MICRO-250G-001', price: 220, originalPrice: 280, discount: 21, inStock: true },
      { variant: '500g', sku: 'SPEC-MICRO-500G-001', price: 380, originalPrice: 480, discount: 21, inStock: true },
      { variant: '1kg', sku: 'SPEC-MICRO-1KG-001', price: 700, originalPrice: 880, discount: 20, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P603',
    name: 'Seed Treatment Solution',
    brand: 'Bayer',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/51ZLAhr3u4L._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/51ZLAhr3u4L._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.6,
    reviews: 72,
    description: 'Systemic seed treatment for early pest and disease protection',
    forUse: 'Seed treatment before sowing',
    variants: [
      { variant: '100ml', sku: 'SPEC-SEED-100ML-001', price: 180, originalPrice: 220, discount: 18, inStock: true },
      { variant: '250ml', sku: 'SPEC-SEED-250ML-001', price: 340, originalPrice: 420, discount: 19, inStock: true },
      { variant: '500ml', sku: 'SPEC-SEED-500ML-001', price: 620, originalPrice: 780, discount: 21, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P604',
    name: 'Plant Growth Regulator',
    brand: 'Dhanuka',
    category: 'agriculture',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/61dUSrKEQTL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/61dUSrKEQTL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.3,
    reviews: 65,
    description: 'Regulates plant growth for uniform flowering and fruiting',
    forUse: 'Fruit crops, cotton, vegetables',
    variants: [
      { variant: '50ml', sku: 'SPEC-PGR-50ML-001', price: 160, originalPrice: 200, discount: 20, inStock: true },
      { variant: '100ml', sku: 'SPEC-PGR-100ML-001', price: 290, originalPrice: 360, discount: 19, inStock: true },
      { variant: '250ml', sku: 'SPEC-PGR-250ML-001', price: 650, originalPrice: 800, discount: 19, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P605',
    name: 'Rose Plant – Grafted',
    brand: 'Ugaoo',
    category: 'seeds',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/81auo7w93cL._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/81auo7w93cL._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.7,
    reviews: 340,
    description: 'Grafted hybrid rose plant – blooms in multiple colors',
    forUse: 'Home garden and landscaping',
    variants: [
      { variant: '1 Plant', sku: 'PLANT-ROSE-1PC-001', price: 199, originalPrice: 280, discount: 29, inStock: true },
      { variant: '3 Plants', sku: 'PLANT-ROSE-3PC-001', price: 499, originalPrice: 750, discount: 33, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P606',
    name: 'Tulsi Plant – Holy Basil',
    brand: 'Ugaoo',
    category: 'seeds',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/61+u3uGpTWL._AC_SX416_CB1169409_QL70_.jpg',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/61+u3uGpTWL._AC_SX416_CB1169409_QL70_.jpg', '', '', ''],
    rating: 4.8,
    reviews: 420,
    description: 'Medicinal holy basil plant – easy to grow',
    forUse: 'Home garden and medicinal use',
    variants: [
      { variant: '1 Plant', sku: 'PLANT-TULS-1PC-001', price: 99, originalPrice: 150, discount: 34, inStock: true },
      { variant: '3 Plants', sku: 'PLANT-TULS-3PC-001', price: 249, originalPrice: 400, discount: 38, inStock: true },
    ],
  }),
];
