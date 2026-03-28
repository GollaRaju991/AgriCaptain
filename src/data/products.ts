export interface Variant {
  variant: string;
  sku: string;
  price: number;
  originalPrice: number;
  discount: number;
  inStock: boolean;
  tag?: string;
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
  usage?: string;
  crops?: string;
  dosage?: string;
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
    image: "https://ik.imagekit.io/nsi7x5p2x/saaho-to-3251-tomato-seeds-file-20104_b81f8c6b-f8f3-42bc-9295-789101668f23.webp?tr=w-800,q-auto,f-auto",
    images: [
  "https://ik.imagekit.io/nsi7x5p2x/saaho-to-3251-tomato-seeds-file-20103_56dd106d-6fd3-44af-b893-e94d62c50d48.webp?tr=w-800,q-auto,f-auto",
  "https://ik.imagekit.io/nsi7x5p2x/saaho-to-3251-tomato-seeds-file-20104_b81f8c6b-f8f3-42bc-9295-789101668f23.webp?tr=w-800,q-auto,f-auto"
],
    rating: 4.5,
    reviews: 3,
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
    name: 'HPH 5531 Chilli Seeds – High Yield, Medium Pungency Hybrid',
    brand: 'Syngenta',
    category: 'seeds',
    image: 'https://ik.imagekit.io/wadwvg0en/hph-5531-chilli-2-file-2220.webp?tr=w-800,q-auto,f-auto',
    images: ['https://ik.imagekit.io/wadwvg0en/hph-5531-chilli-2-file-2220.webp?tr=w-800,q-auto,f-auto', '', '', ''],
    rating: 4.6,
    reviews: 3,
    description: 'High-yielding hybrid chilli seeds suitable for various soil types',
    forUse: 'Commercial chilli farming',
    variants: [
      { variant: '500g', sku: 'SEED-CHL-10G-001', price: 960, originalPrice: 1200, discount: 24, inStock: true },
      { variant: '1kg', sku: 'SEED-CHL-50G-001', price: 1400, originalPrice: 1800, discount: 22, inStock: true },
      { variant: '2kg', sku: 'SEED-CHL-100G-001', price: 2500, originalPrice: 3200, discount: 22, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P103',
    name: 'Cotton Seeds – Indo US 955',
    brand: 'Indo US',
    category: 'seeds',
    image: 'https://ik.imagekit.io/wadwvg0en/COTTON-INDO-US-955-PLUS.png?tr=w-800,q-auto,f-auto',
    images: ['https://ik.imagekit.io/wadwvg0en/COTTON-INDO-US-955-PLUS.png?tr=w-800,q-auto,f-auto', '', '', ''],
    rating: 4.7,
    reviews: 3,
    description: 'High-quality hybrid cotton seeds for superior fiber production',
    forUse: 'Cotton farming and fiber production',
    variants: [
      { variant: '450g', sku: 'SEED-COT-450G-001', price: 850, originalPrice: 1050, discount: 19, inStock: true },
      { variant: '1kg', sku: 'SEED-COT-1KG-001', price: 1700, originalPrice: 2100, discount: 19, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P104',
    name: 'Syngenta Lucky Cauliflower Seeds – High Yield, Compact Dome Shaped Curd',
    brand: 'Syngenta',
    category: 'seeds',
    image: 'https://ik.imagekit.io/wadwvg0en/urja-kalyani-onion-seeds-file-14323.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/urja-kalyani-onion-seeds-file-14323.webp', '', '', ''],
    rating: 4.4,
    reviews: 145,
    description: `Lucky Cauliflower is a temperate variety with strong vigor and blue-green foliage.
    Produces white, compact, dome-shaped dense curds.
    Excellent self-cover ensures superior curd quality.
    Suitable for cool climate conditions.`,
    forUse: 'Cauliflower cultivation',

    variants: [
      { variant: '500g', sku: 'SEED-ONI-500G-001', price: 480, originalPrice: 600, discount: 20, inStock: true },
      { variant: '1kg', sku: 'SEED-ONI-1KG-001', price: 900, originalPrice: 1100, discount: 18, inStock: true },
      { variant: '2kg', sku: 'SEED-ONI-2KG-001', price: 1700, originalPrice: 2100, discount: 19, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P105',
    name: 'VNR 212 Brinjal Seeds - F1 Hybrid, High Yield & Premium Quality',
    brand: 'VNR Seeds',
    category: 'seeds',
   image: "https://ik.imagekit.io/nsi7x5p2x/212-f1-hybrid-brinjal-seeds-file-20043.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/212-f1-hybrid-brinjal-seeds-file-20043.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/vnr-212-brinjal-file-2782.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/212-f1-hybrid-brinjal-seeds-file-20045.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/212-f1-hybrid-brinjal-seeds-file-20044.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/212-f1-hybrid-brinjal-seeds-file-20043.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.4,
  reviews: 3,
  description: `High-yielding hybrid brinjal variety with dark violet oblong fruits.
Early maturity with first harvest in 42–45 days.
Suitable for all seasons and high productivity farming.`,
  
  forUse: 'Vegetable cultivation',
    variants: [
      { variant: '1kg', sku: 'SEED-RIC-1KG-001', price: 350, originalPrice: 420, discount: 17, inStock: true },
      { variant: '5kg', sku: 'SEED-RIC-5KG-001', price: 1200, originalPrice: 1450, discount: 17, inStock: true },
      { variant: '10kg', sku: 'SEED-RIC-10KG-001', price: 2200, originalPrice: 2700, discount: 19, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P106',
    name: 'VNR 145 F1 Hybrid Chilli Seeds - High Yield, Early Maturity & Pungent',
    brand: 'VNR',
    category: 'seeds',
    image: "https://ik.imagekit.io/nsi7x5p2x/vnr-145-chilli-seeds-file-1961.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/vnr-145-chilli-seeds-file-1961.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.5,
  reviews: 95,

  description: `VNR-145 is a high-yielding F1 hybrid chilli variety with parrot green, smooth and glossy fruits.
Fruits are 12–16 cm long with high pungency and strong plant vigor.
Suitable for multiple climatic conditions with consistent productivity.`,

  forUse: 'Chilli cultivation',
    variants: [
      { variant: '1kg', sku: 'SEED-WHT-1KG-001', price: 180, originalPrice: 220, discount: 18, inStock: true },
      { variant: '5kg', sku: 'SEED-WHT-5KG-001', price: 550, originalPrice: 680, discount: 19, inStock: true },
      { variant: '10kg', sku: 'SEED-WHT-10KG-001', price: 900, originalPrice: 1100, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P107',
    name: 'Indra Hybrid Capsicum Seeds - High Yield, Heat & Cold Set',
    brand: 'Syngenta',
    category: 'seeds',
   image: "https://ik.imagekit.io/nsi7x5p2x/capsicum-syngenta-file-271.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/capsicum-syngenta-file-271.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/capsicum-syngenta-file-272.avif?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.4,
  reviews: 85,

  description: `High-yield hybrid capsicum variety with uniform green fruits.
Strong plant vigor and adaptable to different climatic conditions.
Suitable for open field and protected cultivation.`,

  forUse: 'Capsicum cultivation',
    variants: [
      { variant: '500g', sku: 'SEED-SUN-500G-001', price: 250, originalPrice: 300, discount: 17, inStock: true },
      { variant: '1kg', sku: 'SEED-SUN-1KG-001', price: 420, originalPrice: 500, discount: 16, inStock: true },
      { variant: '2kg', sku: 'SEED-SUN-2KG-001', price: 780, originalPrice: 950, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P108',
    name: 'NS 3 F1 Hybrid Ridge Gourd Seeds – High Yield & Early Harvest Variety by Namdhari',
    brand: 'Namdhari Seeds',
    category: 'seeds',
    image: "https://ik.imagekit.io/nsi7x5p2x/ns-3-file-1340.avif?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/ns-3-file-1340.avif?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.3,
  reviews: 70,

  description: `NS-3 is a high-yielding hybrid seed variety with strong plant vigor.
Produces uniform fruits with good market demand.
Suitable for multiple seasons and adaptable to Indian conditions.`,

  forUse: 'Vegetable cultivation',

    variants: [
      { variant: '1kg', sku: 'SEED-MAZ-1KG-001', price: 250, originalPrice: 300, discount: 17, inStock: true },
      { variant: '4kg', sku: 'SEED-MAZ-4KG-001', price: 680, originalPrice: 820, discount: 17, inStock: true },
      { variant: '10kg', sku: 'SEED-MAZ-10KG-001', price: 1500, originalPrice: 1800, discount: 17, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P109',
    name: 'NS 3 F1 Hybrid Ridge Gourd Seeds – High Yield & Early Harvest Variety by Namdhari',
    brand: 'Ashoka Seeds',
    category: 'seeds',
    image: "https://ik.imagekit.io/nsi7x5p2x/ashoka-beans-seeds-1-file-467.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/ashoka-beans-seeds-1-file-467.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/ashoka-beans-seeds-1-file-468.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/ashoka-beans-seeds-1-file-469.avif?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.4,
  reviews: 110,

  description: `High-yield hybrid beans variety with tender, stringless pods.
Strong plant growth and excellent disease tolerance.
Suitable for all-season cultivation with consistent productivity.`,

  forUse: 'Beans cultivation',

    variants: [
      { variant: '1kg', sku: 'SEED-MAZ-1KG-001', price: 250, originalPrice: 300, discount: 17, inStock: true },
      { variant: '4kg', sku: 'SEED-MAZ-4KG-001', price: 680, originalPrice: 820, discount: 17, inStock: true },
      { variant: '10kg', sku: 'SEED-MAZ-10KG-001', price: 1500, originalPrice: 1800, discount: 17, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P110',
    name: 'NS 295 Watermelon Seeds - F1 Hybrid & High Quality',
    brand: 'Namdhari Seeds',
    category: 'seeds',
    image: "https://ik.imagekit.io/nsi7x5p2x/ns-295-file-1265.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/ns-295-file-1265.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/ns-295-file-1266.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/ns-295-file-1267.avif?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.5,
  reviews: 150,

  description: `NS-295 is a high-yielding hybrid watermelon variety producing oval to oblong fruits with dark green stripes.
Fruits have deep red flesh, excellent sweetness, and strong shelf life.
Suitable for all seasons and performs well in Indian climatic conditions.`,

  forUse: 'Watermelon cultivation',


    variants: [
      { variant: '1kg', sku: 'SEED-MAZ-1KG-001', price: 250, originalPrice: 300, discount: 17, inStock: true },
      { variant: '4kg', sku: 'SEED-MAZ-4KG-001', price: 680, originalPrice: 820, discount: 17, inStock: true },
      { variant: '10kg', sku: 'SEED-MAZ-10KG-001', price: 1500, originalPrice: 1800, discount: 17, inStock: true },
    ],
  }),

  // ─── Pesticides / Crop Protection ───
  defineProduct({
    id: 'P301',
    name: 'Bayer Roundup Herbicide (Glyphosate 41% SL) for Non-Selective Weed Control',
    brand: 'Bayer',
    category: 'Pesticides',
    image: "https://ik.imagekit.io/nsi7x5p2x/roundup-herbicide-file-2203.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/roundup-herbicide-file-2203.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/roundup-herbicide-file-2204.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/roundup-herbicide-file-2206.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/roundup-herbicide-file-2207.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.6,
  reviews: 200,

  description: `Roundup is a non-selective systemic herbicide used for effective weed control.
It kills weeds from leaves to roots and is widely used in Pesticides for broad-spectrum weed management.`,

  forUse: 'Weed control in crops, bunds, and open fields',

    variants: [
      { variant: '250ml', sku: 'PEST-NEEM-250ML-001', price: 150, originalPrice: 190, discount: 21, inStock: true },
      { variant: '500ml', sku: 'PEST-NEEM-500ML-001', price: 250, originalPrice: 300, discount: 17, inStock: true },
      { variant: '1L', sku: 'PEST-NEEM-1L-001', price: 450, originalPrice: 550, discount: 18, inStock: true },
      { variant: '5L', sku: 'PEST-NEEM-5L-001', price: 1800, originalPrice: 2200, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
    id: 'P302',
    name: 'Sumitomo Glycel Herbicide – Glyphosate 41% SL IPA Salt For Effective and Reliable Weed Control',
    brand: 'Sumitomo',
    category: 'Pesticides',
    image: "https://ik.imagekit.io/nsi7x5p2x/glycel-herbicide-1-file-5004.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/glycel-herbicide-1-file-5004.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/glycel-herbicide-1-file-5005.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/glycel-herbicide-1-file-5006.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/glycel-herbicide-1-file-5011.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.5,
  reviews: 160,

  description: `Glycel is a systemic non-selective herbicide used for effective weed control.
It penetrates through leaves and destroys weeds from roots, ensuring long-lasting control.`,

  forUse: 'Weed control in agricultural fields, orchards, and bund areas',

    variants: [
  { variant: '500ml', sku: 'PEST-GLY-500ML-001', price: 299, originalPrice: 429, discount: 30, inStock: true },
  { variant: '1L', sku: 'PEST-GLY-1L-001', price: 549, originalPrice: 815, discount: 33, inStock: true },
  { variant: '5L', sku: 'PEST-GLY-5L-001', price: 2799, originalPrice: 3975, discount: 30, inStock: true },
],
  }),
  defineProduct({
    id: 'P304',
    name: 'Exponus Insecticide by BASF (Broflanilide 300G/L SC) for Effective Pest Control',
    brand: 'BASF',
    category: 'Pesticides',
    image: 'https://ik.imagekit.io/nsi7x5p2x/exponus-insecticide-file-20296.webp?tr=w-800,q-auto,f-auto',
    images: [
  "https://ik.imagekit.io/nsi7x5p2x/exponus-insecticide-file-20296.webp?tr=w-800,q-auto,f-auto",
  "https://ik.imagekit.io/nsi7x5p2x/exponus-insecticide-file-20297.webp?tr=w-800,q-auto,f-auto",
  "https://ik.imagekit.io/nsi7x5p2x/exponus-insecticide-file-20298.webp?tr=w-800,q-auto,f-auto",
  "https://ik.imagekit.io/nsi7x5p2x/exponus-insecticide-file-20299.webp?tr=w-800,q-auto,f-auto"
],
    rating: 4.5,
    reviews: 95,
    description: 'Effective insecticide for sucking and chewing pests',
    forUse: 'Cotton, vegetables, paddy',
    variants: [
  // 🔹 Single Pack
  { variant: '34 ml', sku: 'PEST-IMP-34ML-001', price: 1590, originalPrice: 2482, discount: 35, inStock: true, tag: 'Best Seller' },
  { variant: '8.5 ml', sku: 'PEST-IMP-8.5ML-001', price: 565, originalPrice: 731, discount: 20, inStock: true },
  { variant: '17 ml', sku: 'PEST-IMP-17ML-001', price: 910, originalPrice: 1326, discount: 30, inStock: true },

  // 🔹 Multi Pack
  { variant: '68 ml (34 ml x 2)', sku: 'PEST-IMP-68ML-001', price: 3280, originalPrice: 4964, discount: 34, inStock: true, tag: 'Value Pack' },
  { variant: '136 ml (34 ml x 4)', sku: 'PEST-IMP-136ML-001', price: 6560, originalPrice: 9928, discount: 34, inStock: true },
  { variant: '34 ml (17 ml x 2)', sku: 'PEST-IMP-34ML-002', price: 1830, originalPrice: 2652, discount: 30, inStock: true },
],
  }),
  defineProduct({
    id: 'P305',
  name: 'Solomon Insecticide (Beta-cyfluthrin + Imidacloprid)',
  brand: 'Bayer',
  category: 'Pesticides',

  image: "https://ik.imagekit.io/nsi7x5p2x/solomon-file-779.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/solomon-file-779.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/solomon-file-780.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/solomon-file-781.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/solomon-file-782.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.4,
  reviews:3 ,

  description: `Solomon is a powerful broad-spectrum insecticide that effectively controls sucking and chewing pests.
It provides quick knockdown action and long-lasting protection, improving crop health and yield.
Suitable for modern farming practices with reliable performance across various crops.`,

  forUse: 'Pest control in cotton, paddy, vegetables and other crops',

  usage: 'Spray evenly on affected crop areas during early pest infestation',

  crops: 'Cotton, Paddy, Vegetables, Chilli',

  dosage: '0.5 ml per liter of water | 100–150 ml per acre',

  variants: [
    // 🔹 Single Pack
    { variant: '100 ml', sku: 'PEST-SOL-100ML-001', price: 302, originalPrice: 450, discount: 33, inStock: true, tag: 'Best Seller' },
    { variant: '250 ml', sku: 'PEST-SOL-250ML-001', price: 660, originalPrice: 1050, discount: 37, inStock: true },
    { variant: '500 ml', sku: 'PEST-SOL-500ML-001', price: 1140, originalPrice: 2000, discount: 43, inStock: true },

    // 🔹 Multi Pack
    { variant: '2 L (1 L x 2)', sku: 'PEST-SOL-2L-001', price: 4442, originalPrice: 7800, discount: 43, inStock: true, tag: 'Value Pack' },
    { variant: '5 L (1 L x 5)', sku: 'PEST-SOL-5L-001', price: 11039, originalPrice: 19500, discount: 43, inStock: true },
    { variant: '1000 ml (500 ml x 2)', sku: 'PEST-SOL-1000ML-001', price: 2271, originalPrice: 4000, discount: 43, inStock: true },
  ],
  }),
  defineProduct({
  id: 'P307',
  name: 'Admire Insecticide (Imidacloprid 70% WG)',
  brand: 'Bayer',
  category: 'Pesticides',

  image: "https://ik.imagekit.io/nsi7x5p2x/admire-insecticide-file-20004.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/admire-insecticide-file-20004.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/admire-insecticide-file-20005.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/admire-insecticide-file-20006.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/admire-insecticide-file-20007.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.4,
  reviews: 103,

  description: `Admire is a highly effective systemic insecticide used to control sucking pests.
It provides long-lasting protection and improves crop health by eliminating harmful insects.`,

  forUse: 'Control of sucking pests in crops',

  usage: 'Spray evenly on crops during early pest infestation',

  crops: 'Cotton, Paddy, Vegetables, Chilli',

  dosage: '0.3 gm per liter of water | 60–80 gm per acre',

  variants: [
    // 🔹 Single Pack (same as screenshot)
    { variant: '30 gms', sku: 'INSEC-ADM-30G-001', price: 379, originalPrice: 480, discount: 21, inStock: true, tag: 'Best Seller' },
    { variant: '2 gms', sku: 'INSEC-ADM-2G-001', price: 35, originalPrice: 41, discount: 15, inStock: true },
    { variant: '75 gms', sku: 'INSEC-ADM-75G-001', price: 999, originalPrice: 1160, discount: 14, inStock: true }
  ]
}),
  defineProduct({
  id: 'P308',
  name: 'Topper 77 Herbicide (Glyphosate 71% SG)',
  brand: 'Crystal Crop Protection',
  category: 'Pesticides',

  image: "https://ik.imagekit.io/nsi7x5p2x/topper-77-file-11270.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/topper-77-file-11270.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/topper-77-herbicide-file-20290.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/topper-77-herbicide-file-20291.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/topper-77-herbicide-file-20291%20(1).webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.3,
  reviews: 139,

  description: `Topper 77 is a non-selective systemic herbicide used for effective weed control.
It penetrates through leaves and destroys weeds from root level, ensuring long-lasting control.
Suitable for use in non-crop areas and pre-planting weed management.`,

  forUse: 'Weed control in non-crop areas, bunds, and pre-sowing applications',

  usage: 'Spray uniformly on actively growing weeds',

  crops: 'Cotton, Paddy, Plantation crops, Open fields',

  dosage: '1–2 gm per liter of water | 200–300 gm per acre',

  variants: [
    // 🔹 Single Pack (like UI)
    { variant: '1 kg', sku: 'HERB-TOP-1KG-001', price: 639, originalPrice: 1690, discount: 62, inStock: true, tag: 'Best Seller' },
    { variant: '100 gms', sku: 'HERB-TOP-100G-001', price: 129, originalPrice: 180, discount: 28, inStock: true },

    // 🔹 Multi Pack
    { variant: '2 kg (1 kg x 2)', sku: 'HERB-TOP-2KG-001', price: 1493, originalPrice: 3380, discount: 56, inStock: true, tag: 'Value Pack' },
    { variant: '3 kg (1 kg x 3)', sku: 'HERB-TOP-3KG-001', price: 2236, originalPrice: 5070, discount: 56, inStock: true },
    { variant: '5 kg (1 kg x 5)', sku: 'HERB-TOP-5KG-001', price: 3708, originalPrice: 8450, discount: 56, inStock: true }
  ]
}),
 defineProduct({
  id: 'P309',
  name: 'Antracol Fungicide (Propineb 70% WP)',
  brand: 'Bayer',
  category: 'Pesticides',

  image: "https://ik.imagekit.io/nsi7x5p2x/antracol-file-659.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/antracol-file-659.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Antracol_01.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Antracol_02.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Antracol_03.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Antracol_04.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.4,
  reviews: 186,

  description: `Antracol is a broad-spectrum contact fungicide used to control multiple fungal diseases.
It protects crops from leaf spots, blights, and mildew, ensuring healthy plant growth and higher yield.`,

  forUse: 'Control of fungal diseases in crops',

  usage: 'Spray uniformly on crop foliage at early disease stage',

  crops: 'Potato, Tomato, Grapes, Vegetables',

  dosage: '2–2.5 gm per liter of water | 500–700 gm per acre',

  variants: [
    // 🔹 Single Pack
    { variant: '250 gms', sku: 'FUNG-ANT-250G-001', price: 261, originalPrice: 350, discount: 25, inStock: true, tag: 'Best Seller' },
    { variant: '500 gms', sku: 'FUNG-ANT-500G-001', price: 451, originalPrice: 600, discount: 25, inStock: true },
    { variant: '1 kg', sku: 'FUNG-ANT-1KG-001', price: 769, originalPrice: 1160, discount: 34, inStock: true },

    // 🔹 Multi Pack
    { variant: '2 kg (1 kg x 2)', sku: 'FUNG-ANT-2KG-001', price: 1577, originalPrice: 2320, discount: 32, inStock: true, tag: 'Value Pack' },
    { variant: '3 kg (1 kg x 3)', sku: 'FUNG-ANT-3KG-001', price: 2362, originalPrice: 3480, discount: 32, inStock: true },
    { variant: '10 kg (1 kg x 10)', sku: 'FUNG-ANT-10KG-001', price: 7796, originalPrice: 11600, discount: 33, inStock: true }
  ]
}),
  defineProduct({
  id: 'P310',
  name: 'Merivon Fungicide (Fluxapyroxad + Pyraclostrobin)',
  brand: 'BASF',
  category: 'Pesticides',

  image: "https://ik.imagekit.io/nsi7x5p2x/merivon-fungicide-file-4633.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/merivon-fungicide-file-4633.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/merivon-fungicide-file-4634.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/merivon-fungicide-file-4635.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/merivon-fungicide-file-4636.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.4,
  reviews: 28,

  description: `Merivon is a premium fungicide combining Fluxapyroxad and Pyraclostrobin for superior disease control.
It provides long-lasting protection against fungal infections and improves crop quality and yield.`,

  forUse: 'Control of fungal diseases in fruits and vegetables',

  usage: 'Spray uniformly on crops at early disease stage',

  crops: 'Grapes, Tomato, Chilli, Vegetables',

  dosage: '1 ml per liter of water | 200 ml per acre',

  variants: [
    // 🔹 Single Pack (like UI)
    { variant: '40 ml', sku: 'FUNG-MER-40ML-001', price: 560, originalPrice: 849, discount: 34, inStock: true, tag: 'Best Seller' },
    { variant: '80 ml', sku: 'FUNG-MER-80ML-001', price: 1037, originalPrice: 1682, discount: 38, inStock: true },
    { variant: '250 ml', sku: 'FUNG-MER-250ML-001', price: 3470, originalPrice: 4810, discount: 28, inStock: true },

    // 🔹 Multi Pack
    { variant: '160 ml (80 ml x 2)', sku: 'FUNG-MER-160ML-001', price: 2066, originalPrice: 3364, discount: 39, inStock: true, tag: 'Value Pack' }
  ]
}),
  defineProduct({
  id: 'P311',
  name: 'Lesenta Insecticide (Imidacloprid 17.8% SL)',
  brand: 'Bayer',
  category: 'Pesticides',

  image: "https://ik.imagekit.io/nsi7x5p2x/lesenta-file-784.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/lesenta-file-784.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/lesenta-file-785.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/lesenta-file-787.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.3,
  reviews: 38,

  description: `Lesenta is a broad-spectrum insecticide effective against sucking and chewing pests.
It provides fast action and long-lasting protection, ensuring healthy crop growth and improved yield.`,

  forUse: 'Control of sucking pests in crops',

  usage: 'Spray uniformly on affected crops during early pest infestation',

  crops: 'Cotton, Paddy, Vegetables, Chilli',

  dosage: '0.3 ml per liter of water | 60–80 ml per acre',

  variants: [
    // 🔹 Single Pack
    { variant: '100 gms', sku: 'INSEC-LES-100G-001', price: 1064, originalPrice: 1900, discount: 44, inStock: true, tag: 'Best Seller' },
    { variant: '40 gms', sku: 'INSEC-LES-40G-001', price: 478, originalPrice: 770, discount: 38, inStock: true },

    // 🔹 Multi Pack
    { variant: '400 gms (40 gms x 10)', sku: 'INSEC-LES-400G-001', price: 4561, originalPrice: 7700, discount: 41, inStock: true, tag: 'Value Pack' }
  ]
}),defineProduct({
  id: 'P312',
  name: 'Geolife No Virus Chilli Special',
  brand: 'Geolife Agritech India Pvt Ltd',
  category: 'Pesticides',

  image: "https://ik.imagekit.io/nsi7x5p2x/Reserved_ImageAttachment__13___ProductImage1_32___e728d54c1d884b3d93bdc2ba6e0f3744_1___1.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/Reserved_ImageAttachment__13___ProductImage1_32___e728d54c1d884b3d93bdc2ba6e0f3744_1___1.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Reserved_ImageAttachment__6___Image2_32___ab189b122fb54c898a25113112bb6f9d_1___3.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Reserved_ImageAttachment__13___ProductImage8_32___da442959fd354f2c80e94056911ca176_2___15.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.4,
  reviews: 74,

  description: `Geolife No Virus is a plant growth promoter specially designed for chilli crops.
It enhances plant immunity, improves resistance against viral diseases, and boosts overall crop yield.`,

  forUse: 'Improve plant immunity and growth in chilli crops',

  usage: 'Spray on crop foliage during early growth and stress stages',

  crops: 'Chilli, Vegetables',

  dosage: '2 ml per liter of water | 200–300 ml per acre',

  variants: [
    // 🔹 Single Pack
    { variant: '500 ml', sku: 'PLANT-GEO-500ML-001', price: 531, originalPrice: 1500, discount: 65, inStock: true, tag: 'Best Seller' },
    { variant: '1 ltr', sku: 'PLANT-GEO-1L-001', price: 999, originalPrice: 2600, discount: 62, inStock: true },
    { variant: '250 ml', sku: 'PLANT-GEO-250ML-001', price: 329, originalPrice: 800, discount: 59, inStock: true },

    // 🔹 Multi Pack
    { variant: '1000 ml (500 ml x 2)', sku: 'PLANT-GEO-1000ML-001', price: 1049, originalPrice: 3000, discount: 65, inStock: true, tag: 'Value Pack' }
  ]
}),
  // ─── Farm Tools & Farm Tools & Equipment & Farm Tools & Equipment ───
  defineProduct({
  id: 'P401',
  name: 'Tapas Pahalwaan 101 Battery Sprayer 12x8',
  brand: 'Tapas',
  category: 'Farm Farm Tools',

  image: "https://ik.imagekit.io/nsi7x5p2x/tapas-pahalwaan-101-single-motor-battery-sprayer-12x8-file-14622.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/tapas-pahalwaan-101-single-motor-battery-sprayer-12x8-file-14622.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/tapas-pahalwaan-101-single-motor-battery-sprayer-12x8-file-14623.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/tapas-pahalwaan-101-single-motor-battery-sprayer-12x8-file-14624.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/tapas-pahalwaan-101-single-motor-battery-sprayer-12x8-file-14628.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.2,
  reviews: 70,

  description: `Tapas Pahalwaan 101 is a powerful battery-operated sprayer designed for efficient spraying in agriculture.
It ensures uniform spray coverage and reduces manual effort, making it ideal for large farms and gardens.`,

  forUse: 'Spraying pesticides, fertilizers, and disinfectants',

  usage: 'Fill tank, charge battery, and spray evenly on crops',

  variants: [
    {
      variant: '1 unit',
      sku: 'TOOL-SPRAYER-001',
      price: 2599,
      originalPrice: 4999,
      discount: 48,
      inStock: true,
      tag: 'Best Seller'
    }
  ]
}),
  defineProduct({
  id: 'P402',
  name: 'Mipatex Heavy Duty Tarpaulin Sheet',
  brand: 'Mipatex',
  category: 'Farm Tools & Equipment',

  image: "https://ik.imagekit.io/nsi7x5p2x/mipatex-tarpaulin-sheet-waterproof-heavy-duty-yellow-blue-silver-file-6127.avif?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/mipatex-tarpaulin-sheet-waterproof-heavy-duty-yellow-blue-silver-file-6127.avif?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/mipatex-tarpaulin-sheet-waterproof-heavy-duty-yellow-blue-silver-file-6129.avif?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.5,
  reviews: 7,

  description: `Mipatex tarpaulin is a heavy-duty waterproof sheet designed for all-weather protection.
It is UV resistant, durable, and suitable for agricultural, industrial, and household use.`,

  forUse: 'Crop protection, storage cover, rain and weather protection',

  usage: 'Spread over crops, goods, or equipment for protection',

  variants: [
    // 🔹 Single Pack (like UI)
    {
      variant: '200 gsm / 12 ft x 10 ft',
      sku: 'TARP-200GSM-12X10-001',
      price: 1199,
      originalPrice: 2160,
      discount: 44,
      inStock: true,
      tag: 'Best Seller'
    },
    {
      variant: '130 gsm / 12 ft x 12 ft',
      sku: 'TARP-130GSM-12X12-001',
      price: 1170,
      originalPrice: 1872,
      discount: 38,
      inStock: true
    },
    {
      variant: '150 gsm / 12 ft x 12 ft',
      sku: 'TARP-150GSM-12X12-001',
      price: 1210,
      originalPrice: 2160,
      discount: 44,
      inStock: true
    }
  ]
}),
  defineProduct({
  id: 'P403',
  name: 'Siddhi Round Drip Irrigation Pipe (300m Roll)',
  brand: 'Siddhi Agritech',
  category: 'Farm Tools & Equipment',

  image: "https://ik.imagekit.io/nsi7x5p2x/siddhi-round-online-plane-drip-irrigation-pipe-lateral-for-plant-gardening-roll-0-4mm-thickness-length-300-meter-file-14141.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/siddhi-round-online-plane-drip-irrigation-pipe-lateral-for-plant-gardening-roll-0-4mm-thickness-length-300-meter-file-14141.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/siddhi-round-online-plane-drip-irrigation-pipe-lateral-for-plant-gardening-roll-0-4mm-thickness-length-300-meter-file-14142.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/siddhi-round-online-plane-drip-irrigation-pipe-lateral-for-plant-gardening-roll-0-4mm-thickness-length-300-meter-file-14143.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.2,
  reviews: 11,

  description: `High-quality drip irrigation pipe designed for efficient water distribution.
Ensures uniform watering, saves water, and improves crop yield.`,

  forUse: 'Drip irrigation for farms, gardens, and plantations',

  usage: 'Connect to water source and lay across crop rows for controlled irrigation',

  variants: [
    // 🔹 Single Pack (like UI)
    {
      variant: '12 mm (300m)',
      sku: 'DRIP-12MM-300M-001',
      price: 1699,
      originalPrice: 1699,
      discount: 0,
      inStock: true,
      tag: 'Best Seller'
    },
    {
      variant: '20 mm (300m)',
      sku: 'DRIP-20MM-300M-001',
      price: 3700,
      originalPrice: 3999,
      discount: 7,
      inStock: true
    },
    {
      variant: '16 mm (300m)',
      sku: 'DRIP-16MM-300M-001',
      price: 3000,
      originalPrice: 3100,
      discount: 3,
      inStock: true
    }
  ]
}),
  defineProduct({
  id: 'P404',
  name: 'MG Green 12V 10W Solar Panel',
  brand: 'MG Green',
  category: 'Farm Tools & Equipment',

  image: "https://ik.imagekit.io/nsi7x5p2x/mg-green-12v-10w-solar-panel-file-11670.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/mg-green-12v-10w-solar-panel-file-11670.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 5.0,
  reviews: 2,

  description: `Compact and efficient solar panel designed for reliable power generation.
Ideal for small-scale applications with durable build and long-lasting performance.`,

  forUse: 'Battery charging, lighting systems, small farm and home applications',

  usage: 'Place in direct sunlight and connect to battery or device for power supply',

  variants: [
    {
      variant: '1 unit',
      sku: 'SOLAR-10W-001',
      price: 899,
      originalPrice: 1299,
      discount: 31,
      inStock: true,
      tag: 'Best Seller'
    }
  ]
}),
 defineProduct({
  id: 'P405',
  name: 'Neptune CS-58 58CC Petrol Chain Saw (22 Inch)',
  brand: 'Neptune',
  category: 'Farm Tools & Equipment',

  image: "https://ik.imagekit.io/nsi7x5p2x/thumbnail_89b125b9-44fe-407f-8604-2f467a5a032e.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/thumbnail_89b125b9-44fe-407f-8604-2f467a5a032e.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 5.0,
  reviews: 1,

  description: `High-performance petrol chain saw designed for efficient wood cutting and farm use.
It delivers strong cutting power, smooth operation, and durability for long-term usage.`,

  forUse: 'Wood cutting, tree trimming, farm and garden maintenance',

  variants: [
    {
      variant: '1 unit',
      sku: 'CHAIN-CS58-001',
      price: 11700,          // ✅ reduced ₹50
      originalPrice: 15000,
      discount: 22,
      inStock: true,
      tag: 'Best Seller'
    }
  ]
}),

  // ─── Irrigation & Farm Tools & Equipment ───
  defineProduct({
  id: 'P501',
  name: 'Farmsmart GX 35 4-Stroke Power Sprayer (25L)',
  brand: 'Farmsmart',
  category: 'Farm Tools & Equipment',

  image: "https://ik.imagekit.io/nsi7x5p2x/Reserved_ImageAttachment__13___ProductImage1_32___0a54445967c8433a823fb70346f93c96_1___1.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/Reserved_ImageAttachment__13___ProductImage1_32___0a54445967c8433a823fb70346f93c96_1___1.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Reserved_ImageAttachment__6___Image2_32___73a8cfd422d1412eb434e18fe6f825e9_1___3.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Reserved_ImageAttachment__13___ProductImage3_32___2c14092e206143db85d6bcd44070d20b_1___7.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.75,
  reviews: 4,

  description: `Powerful 4-stroke knapsack sprayer with petrol engine.
Designed for large-scale farming with strong pressure and wide spray coverage.`,

  forUse: 'Pesticide spraying, fertilizer spraying, crop protection',

  usage: 'Fill tank, start engine, and spray uniformly across crops',

  variants: [
    {
      variant: '1 unit',
      sku: 'SPRAYER-GX35-001',
      price: 10700,
      originalPrice: 15500,
      discount: 31,
      inStock: true,
      tag: 'Best Seller'
    }
  ]
}),
  defineProduct({
    id: 'P502',
    name: 'Sprinkler System',
    brand: 'Jain Irrigation',
    category: 'Farm Tools & Equipment',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/71bWbrmAuML._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/71bWbrmAuML._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.5,
    reviews: 8,
    description: 'Rain-gun style sprinkler system for even water distribution',
    forUse: 'Field irrigation',
    variants: [
      { variant: '50m Coverage', sku: 'EQUIP-SPRK-50M-001', price: 1800, originalPrice: 2200, discount: 18, inStock: true },
    ],
  }),
  defineProduct({
  id: 'P503',
  name: 'Bharat Axe (15cm / 6 Inch) with Handle – 60 cm',
  brand: 'Bharat Agrotech',
  category: 'Farm Tools & Equipment',

  image: "https://ik.imagekit.io/nsi7x5p2x/bharat-axe-6-inch-with-handle-60-cm-file-13680.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/bharat-axe-6-inch-with-handle-60-cm-file-13680.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.4,
  reviews: 2,

  description: `Strong and durable axe designed for cutting wood and farm use.
Built with a sharp blade and sturdy handle for efficient performance and long-lasting use.`,

  forUse: 'Wood cutting, farming, and general outdoor work',

  usage: 'Use for cutting wood, branches, and agricultural tasks',

  variants: [
    {
      variant: '1 unit',
      sku: 'AXE-6IN-001',
      price: 832,
      originalPrice: 899,
      discount: 7,
      inStock: true,
      tag: 'Best Seller'
    }
  ]
}),
  defineProduct({
    id: 'P504',
    name: 'UNO Minda TL-6509M Tail Light For Tractor for Mahindra Mahindra Di 265',
    brand: 'Agro Shield',
    category: 'Farm Tools & Equipment',
    image: 'https://ik.imagekit.io/wadwvg0en/Work/91+NWBqm3ML._AC_UL480_FMwebp_QL65_.webp',
    images: ['https://ik.imagekit.io/wadwvg0en/Work/91+NWBqm3ML._AC_UL480_FMwebp_QL65_.webp', '', '', ''],
    rating: 4.5,
    reviews: 78,
    description: 'UV-treated green shade net for nursery and polyhouse',
    forUse: 'Nursery protection and shade',
    variants: [
      { variant: '5m × 3m', sku: 'EQUIP-GNET-5X3-001', price: 800, originalPrice: 1050, discount: 19, inStock: true },
      { variant: '10m × 3m', sku: 'EQUIP-GNET-10X3-001', price: 1500, originalPrice: 1850, discount: 19, inStock: true },
    ],
  }),
 defineProduct({
  id: 'P505',
  name: 'Soil Testing Kit (NPK, pH & Moisture)',
  brand: 'Agritech',
  category: 'Farm Tools & Equipment',

  image: "https://ik.imagekit.io/wadwvg0en/Work/51z5-QPDAHL._AC_UL480_FMwebp_QL65_.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/wadwvg0en/Work/51z5-QPDAHL._AC_UL480_FMwebp_QL65_.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.3,
  reviews: 55,

  description: `Easy-to-use soil testing kit that helps measure NPK levels, pH, and moisture content.
Ideal for farmers and gardeners to improve soil health and increase crop productivity.`,

  forUse: 'Soil testing for farming, gardening, and crop planning',

  usage: 'Insert probes into soil and read values for pH, nutrients, and moisture',

  variants: [
    {
      variant: '1 unit',
      sku: 'SOIL-KIT-001',
      price: 980,
      originalPrice: 1200,
      discount: 18,
      inStock: true,
      tag: 'Best Seller'
    }
  ]
}),
  defineProduct({
    id: 'P506',
    name: 'Water Pump – 1HP',
    brand: 'Kirloskar',
    category: 'Farm Tools & Equipment',
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

  // ─── Specialty / Growth Promoters ───
defineProduct({
  id: 'P601',
  name: 'Tractor Head Lamp Set (LH & RH) for Mahindra 275 / 575',
  brand: 'All Parts Source',
  category: 'Farm Tools & Equipment',

  image: "https://ik.imagekit.io/nsi7x5p2x/81A76OJm59L._SL1500_.jpg?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/81A76OJm59L._SL1500_.jpg?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/61O02-nkw5L._SL1500_.jpg?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/61CCs6V6MoL._SL1500_.jpg?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.2,
  reviews: 10,

  description: `Durable head lamp set designed for tractors, providing clear visibility during night operations.
Suitable for Mahindra 275 and 575 models with easy installation and long-lasting performance.`,

  forUse: 'Tractor front lighting and visibility',

  usage: 'Install on tractor front (LH & RH sides) for proper illumination',

  variants: [
    {
      variant: 'Set of 2 (LH & RH)',
      sku: 'HEADLIGHT-SET-001',
      price: 1599,
      originalPrice: 1890,
      discount: 15,
      inStock: true,
      tag: 'Best Seller'
    }
  ]
}),
  defineProduct({
  id: 'P605',
  name: 'Neptune NF-767 4-Stroke Power Sprayer (25L)',
  brand: 'Neptune',
  category: 'Farm Tools & Equipment',

  image: "https://ik.imagekit.io/nsi7x5p2x/3_YatishReddy24.webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/3_YatishReddy24.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/5_YatishReddy21.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/4_YatishReddy23.webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.75,
  reviews: 4,

  description: `High-performance 4-stroke power sprayer with petrol engine.
Provides powerful spraying for large farms with uniform coverage and efficiency.`,

  forUse: 'Pesticide spraying, fertilizer spraying, crop protection',

  usage: 'Fill tank, start engine, and spray evenly across crops',

  variants: [
    {
      variant: '1 unit',
      sku: 'SPRAYER-NF767-001',
      price: 12500,
      originalPrice: 16500,
      discount: 18,
      inStock: true,
      tag: 'Best Seller'
    }
  ]
}),
];
