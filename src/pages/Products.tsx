import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from "@/components/MobileBottomNav";
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { products as allStaticProducts } from '@/data/products';
import { removeDuplicates } from '@/data/products';
import { getProductsByCategory } from '@/data/productLoader';

const categories = ['seeds', 'pesticides', 'farm-tools', 'equipment'];

const categoryDisplayNames: Record<string, string> = {
  seeds: 'Seeds',
  pesticides: 'Pesticides',
  'farm-tools': 'Farm Tools & Equipment',
  agriculture: 'Pesticides',
  'plant-growth': 'Plant Growth',
  tools: 'Farm Tools',
  equipment: 'Equipment',
};

const mapSellerCategory = (cat: string): string => {
  const lower = cat.toLowerCase();
  if (lower.includes('seed')) return 'seeds';
  if (lower.includes('fertiliz')) return 'agriculture';
  if (lower.includes('pesticid') || lower.includes('insecticid') || lower.includes('herbicid') || lower.includes('fungicid')) return 'agriculture';
  if (lower.includes('tool')) return 'tools';
  if (lower.includes('irrigat') || lower.includes('equip') || lower.includes('tractor') || lower.includes('harvest')) return 'equipment';
  return 'agriculture';
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';

  useEffect(() => {
    const fetchSellerProducts = async () => {
      const { data } = await (supabase.from('seller_products') as any)
        .select('*')
        .eq('status', 'active');
      if (data) {
        const mapped = data.map((p: any) => ({
          id: `sp-${p.id}`,
          name: p.product_name,
          price: p.selling_price,
          originalPrice: p.mrp_price,
          image: p.product_images?.[0] || 'https://via.placeholder.com/200',
          category: mapSellerCategory(p.category),
          rating: 4.0,
          reviews: 0,
          discount: p.discount_percent || Math.round(((p.mrp_price - p.selling_price) / p.mrp_price) * 100),
          inStock: p.stock_quantity > 0,
          description: p.description || p.product_name,
          forUse: p.sub_category || p.category,
        }));
        setSellerProducts(mapped);
      }
    };
    fetchSellerProducts();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    // Use category-based loader if a category is selected
    let baseProducts = selectedCategory
      ? getProductsByCategory(selectedCategory)
      : allStaticProducts;
    
    let filtered = removeDuplicates([...baseProducts, ...sellerProducts]);

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory && !['seeds', 'pesticides', 'farm-tools', 'agriculture', 'plant-growth', 'tools', 'equipment'].includes(selectedCategory)) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedBrand) {
      filtered = filtered.filter(product => 
        (product as any).brand?.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) return product.price >= min && product.price <= max;
        return product.price >= min;
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'discount': return b.discount - a.discount;
        default: return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, sortBy, sellerProducts]);

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange('all');
    setSortBy('name');
  };

  const removeFilter = (type: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(type);
    setSearchParams(newParams);
  };

  const activeFilterCount = [searchQuery, selectedCategory, selectedBrand, priceRange !== 'all' ? priceRange : ''].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* === MOBILE LAYOUT === */}
      <div className="md:hidden">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-bold text-foreground">
            {selectedBrand ? `${selectedBrand} Products` : selectedCategory ? `${categoryDisplayNames[selectedCategory] || selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'All Products'}
          </h1>
        </div>

        <div className="px-4 pb-3 flex gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 rounded-xl py-3 px-4 text-primary font-semibold text-base relative"
          >
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex-1">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full bg-muted/50 border border-border rounded-xl py-3 px-4 h-auto text-base font-semibold text-foreground">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                  <span>Sort by</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mx-4 mb-3 bg-muted/40 rounded-xl py-2.5 px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Showing {filteredAndSortedProducts.length} products
          </p>
        </div>

        {(searchQuery || selectedCategory) && (
          <div className="flex flex-wrap items-center gap-2 px-4 mb-3">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1 rounded-full px-3 py-1">
                Search: {searchQuery}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('search')} />
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1 rounded-full px-3 py-1">
                {selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('category')} />
              </Badge>
            )}
            <button onClick={clearFilters} className="text-xs text-destructive font-medium">
              Clear all
            </button>
          </div>
        )}

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 px-4 mb-6">
            {filteredAndSortedProducts.map(product => (
              <ProductCard key={product.id} product={product} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            <Button className="mt-4" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}

        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold">Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-4 overflow-y-auto">
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Categories</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => {
                          if (selectedCategory === category) {
                            removeFilter('category');
                          } else {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set('category', category);
                            setSearchParams(newParams);
                          }
                        }}
                        className="rounded border-border"
                      />
                      <span className="text-sm capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-foreground">Price Range</h4>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-500">Under ₹500</SelectItem>
                    <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                    <SelectItem value="1000-50000">₹1,000 - ₹50,000</SelectItem>
                    <SelectItem value="50000-500000">₹50,000 - ₹5,00,000</SelectItem>
                    <SelectItem value="500000">Above ₹5,00,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* === DESKTOP LAYOUT === */}
      <div className="hidden md:block container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {selectedBrand ? `${selectedBrand} Products` : selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'All Products'}
          </h1>
          {(searchQuery || selectedCategory || selectedBrand) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('search')} />
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {selectedCategory}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('category')} />
                </Badge>
              )}
              {selectedBrand && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Brand: {selectedBrand}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('brand')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          <div className="w-64">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => {
                            if (selectedCategory === category) {
                              removeFilter('category');
                            } else {
                              const newParams = new URLSearchParams(searchParams);
                              newParams.set('category', category);
                              setSearchParams(newParams);
                            }
                          }}
                          className="rounded border-border"
                        />
                        <span className="text-sm capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Price Range</h4>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-500">Under ₹500</SelectItem>
                      <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                      <SelectItem value="1000-50000">₹1,000 - ₹50,000</SelectItem>
                      <SelectItem value="50000-500000">₹50,000 - ₹5,00,000</SelectItem>
                      <SelectItem value="500000">Above ₹5,00,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 bg-card p-4 rounded-lg shadow-sm">
              <p className="text-muted-foreground">
                Showing {filteredAndSortedProducts.length} products
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {filteredAndSortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} variant="grid" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
                <Button className="mt-4" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-20 lg:hidden"></div>
      <Footer />
    </div>
  );
};

export default Products;
