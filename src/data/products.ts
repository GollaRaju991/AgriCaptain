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
    category: 'agriculture',
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
It kills weeds from leaves to roots and is widely used in agriculture for broad-spectrum weed management.`,

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
    category: 'agriculture',
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
    id: 'P303',
    name: 'Coragen Insecticide (Chlorantraniliprole 18.5% SC)',
  brand: 'FMC (DuPont)',
  category: 'agriculture',

  image: "https://ik.imagekit.io/nsi7x5p2x/coragen-dupont-file-1135%20(1).webp?tr=w-800,q-auto,f-auto",

  images: [
    "https://ik.imagekit.io/nsi7x5p2x/coragen-dupont-file-1135%20(1).webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Coragen_01.webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Coragen_02%20(1).webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Coragen_03%20(1).webp?tr=w-800,q-auto,f-auto",
    "https://ik.imagekit.io/nsi7x5p2x/Coragen_04%20(1).webp?tr=w-800,q-auto,f-auto"
  ],

  rating: 4.7,
  reviews: 220,

  description: `Coragen is a highly effective insecticide used to control caterpillars and borers.
It provides long-lasting protection and improves crop yield with minimal environmental impact.`,

  forUse: 'Control of lepidopteran pests in crops',

    variants: [
  { variant: '10ml', sku: 'CORAGEN-10ML-001', price: 129, originalPrice: 220, discount: 41, inStock: true },
  { variant: '60ml', sku: 'CORAGEN-60ML-001', price: 549, originalPrice: 1130, discount: 51, inStock: true },
  { variant: '150ml', sku: 'CORAGEN-150ML-001', price: 1129, originalPrice: 2792, discount: 60, inStock: true },
],
  }),
  defineProduct({
    id: 'P304',
    name: 'Exponus Insecticide by BASF (Broflanilide 300G/L SC) for Effective Pest Control',
    brand: 'BASF',
    category: 'agriculture',
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
  category: 'agriculture',

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
  category: 'agriculture',

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
  category: 'agriculture',

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
  category: 'agriculture',

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
  category: 'agriculture',

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
  category: 'agriculture',

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
  category: 'plant-growth',

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

  // ─── tools ───
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
    id: 'P605',
    name: 'Rose Plant – Grafted',
    brand: 'Ugaoo',
    category: 'equipment',
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
    category: 'equipment',
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
