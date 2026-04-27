// Static fallback mirror of the public.category_vendors table.
// Kept in sync with the seeded rows so synchronous consumers (e.g. PDF invoice)
// can resolve a vendor without an async DB call.

export interface CategoryVendor {
  vendorName: string;
  address: string;
  licenseNumber: string;
  category: string;
}

const VENDORS: CategoryVendor[] = [
  {
    vendorName: 'Laxmi Narayana',
    address: 'Jogulamba Gadwal, Telangana',
    licenseNumber: 'TG-AGRI-87456321',
    category: 'Pesticides',
  },
  {
    vendorName: 'Ramesh Reddy',
    address: 'Jogulamba Gadwal, Telangana',
    licenseNumber: 'TG-AGRI-65892347',
    category: 'Seeds',
  },
  {
    vendorName: 'Suresh Kumar',
    address: 'Jogulamba Gadwal, Telangana',
    licenseNumber: 'TG-AGRI-92345678',
    category: 'Agriculture Products',
  },
];

/**
 * Resolve a vendor for a given product category.
 * Matching is case-insensitive and falls back to the
 * generic "Agriculture Products" vendor when no specific match exists.
 */
export const getVendorForCategory = (category?: string | null): CategoryVendor => {
  const fallback = VENDORS[2]; // Agriculture Products
  if (!category) return fallback;

  const c = category.toLowerCase().trim();

  if (c.includes('pesticide') || c.includes('insecticide') || c.includes('herbicide') || c.includes('fungicide')) {
    return VENDORS[0];
  }
  if (c.includes('seed')) {
    return VENDORS[1];
  }
  return fallback;
};

export const ALL_CATEGORY_VENDORS = VENDORS;
