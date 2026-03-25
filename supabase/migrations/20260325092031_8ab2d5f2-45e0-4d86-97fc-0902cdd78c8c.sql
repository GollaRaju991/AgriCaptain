-- Insert Coragen product into seller_products
INSERT INTO seller_products (
  seller_id, user_id, product_name, category, sub_category, brand, product_type,
  mrp_price, selling_price, discount_percent, stock_quantity, unit_type,
  description, crop_type, season, shelf_life, delivery_available, delivery_charge,
  delivery_days, product_images, status
) VALUES (
  'a6536844-bd3f-4cc1-b107-eb478bc6b0e6',
  '0c8da4d3-3de9-4447-bae1-5d60d5a7542d',
  'Coragen Insecticide – Chlorantraniliprole 18.5% SC – Safe, Effective Pest Control',
  'Pesticides',
  'Insecticides',
  'FMC',
  'Insecticide',
  1800,
  1550,
  14,
  50,
  '150 ml',
  'Coragen is a premium insecticide by FMC containing Chlorantraniliprole 18.5% w/w SC. It provides long-lasting protection against a wide range of lepidopteran pests including stem borer, leaf folder, fruit borer, shoot borer, armyworm, bollworm and caterpillars. It stops pests from feeding right away, controls lepidopteran pests effectively, reduces crop damage and yield loss, promotes healthier crop growth, provides long-lasting protection, and is safe for beneficial insects when used as directed.

Suitable for field crops like Rice, Sugarcane, Maize, Cotton and vegetables like Tomato, Chilli, Brinjal, Cabbage, Cauliflower, Okra.

Dosage: 0.4 ml per liter of water (60 ml per acre). Apply as foliar spray using knapsack or power sprayer. First application at pest appearance, repeat after 15-20 days if needed.

Safety: Wear protective clothing, gloves and mask during application. Wash hands thoroughly after use. Keep away from children and animals. Do not contaminate water sources.',
  'Cotton',
  'Kharif',
  '24 months',
  true,
  0,
  '3-5 days',
  ARRAY[
    '/products/coragen-main.webp',
    '/products/coragen-benefits.webp',
    '/products/coragen-crops.webp',
    '/products/coragen-pests.webp',
    '/products/coragen-before-after.webp'
  ],
  'active'
);

-- Insert product specifications (we need the product id, so use a subquery)
INSERT INTO product_specifications (
  product_id, user_id,
  active_ingredients, composition, target_pests, suitable_crops,
  dosage, application_method, frequency_of_use,
  safety_instructions, protective_equipment,
  waiting_period, storage_instructions,
  expiry_date, manufacturing_date, package_size
) VALUES (
  (SELECT id FROM seller_products WHERE product_name LIKE 'Coragen Insecticide%' AND user_id = '0c8da4d3-3de9-4447-bae1-5d60d5a7542d' LIMIT 1),
  '0c8da4d3-3de9-4447-bae1-5d60d5a7542d',
  'Chlorantraniliprole 18.5% w/w SC',
  'Chlorantraniliprole 18.5% w/w SC (Suspension Concentrate)',
  ARRAY['Stem Borer', 'Leaf Folder', 'Fruit Borer', 'Shoot Borer', 'Armyworm', 'Bollworm', 'Caterpillars'],
  ARRAY['Rice', 'Sugarcane', 'Maize', 'Cotton', 'Tomato', 'Chilli', 'Brinjal', 'Cabbage', 'Cauliflower', 'Okra'],
  '0.4 ml per liter of water (60 ml per acre)',
  'Foliar spray using knapsack or power sprayer',
  'First application at pest appearance, repeat after 15-20 days if needed',
  'Wear protective clothing during application. Wash hands thoroughly after use. Keep away from children and animals. Do not contaminate water sources. In case of accidental ingestion, consult a physician immediately.',
  'Gloves, Face Mask, Protective Clothing, Safety Goggles',
  '7 days before harvest',
  'Store in a cool, dry place away from direct sunlight. Keep in original container tightly closed. Store away from food and feed.',
  '2027-12-31',
  '2025-01-15',
  '150 ml'
);

-- Insert vendor details for this seller
INSERT INTO vendor_details (
  seller_id, user_id, vendor_name, license_number, shop_address,
  village, mandal, district, state, phone
) VALUES (
  'a6536844-bd3f-4cc1-b107-eb478bc6b0e6',
  '0c8da4d3-3de9-4447-bae1-5d60d5a7542d',
  'Sri Lakshmi Agri Store',
  'LIC/AP/2024/INS/1234',
  'Main Road, Near Bus Stand, Nalgonda',
  'Nalgonda Town',
  'Nalgonda',
  'Nalgonda',
  'Telangana',
  '9876543210'
) ON CONFLICT DO NOTHING;