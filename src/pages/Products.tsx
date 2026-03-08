import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from "@/components/MobileBottomNav";
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const mockProducts = [
  {
    id: '1',
    name: 'Hybrid Tomato Seeds',
    price: 299,
    originalPrice: 399,
    image: 'https://i.postimg.cc/BQHGZv2C/katyayani-npk-20-20-20-fertilizer-with-2-sample-mix-micronutrients-and-organic-humic-acid-file-10642.jpg',
    category: 'seeds',
    rating: 4.5,
    reviews: 124,
    discount: 25,
    inStock: true,
    description: 'Premium quality hybrid tomato seeds for high-yield farming with excellent disease resistance',
    forUse: 'Vegetable farming and kitchen gardens'
  },
  {
    id: '2',
    name: 'Organic Compost Fertilizer',
    price: 599,
    originalPrice: 799,
    image: 'https://i.postimg.cc/gkwfS2MW/Compost.png',
    category: 'fertilizers',
    rating: 4.8,
    reviews: 89,
    discount: 25,
    inStock: true,
    description: 'Organic compost fertilizer for sustainable farming and improved soil health',
    forUse: 'All crops and soil improvement'
  },
  {
    id: '3',
    name: 'Garden Pruning Tool',
    price: 1299,
    originalPrice: 1599,
    image: 'https://i.postimg.cc/dtDsjvPM/bayer-nativo-fungicide-file-9643.png',
    category: 'tools',
    rating: 4.3,
    reviews: 56,
    discount: 19,
    inStock: true,
    description: 'Professional grade pruning tools for efficient garden maintenance and plant care',
    forUse: 'Tree pruning and garden maintenance'
  },
  {
    id: '4',
    name: 'Drip Irrigation Kit',
    price: 2499,
    originalPrice: 2999,
    image: 'https://i.postimg.cc/cJ7tGZL9/roundup-herbicide-file-2203.jpg',
    category: 'equipment',
    rating: 4.7,
    reviews: 78,
    discount: 17,
    inStock: true,
    description: 'Complete drip irrigation system for water-efficient farming and precise crop hydration',
    forUse: 'Water-efficient crop irrigation'
  },
  {
    id: '5',
    name: 'Wheat Seeds Premium Quality',
    price: 450,
    originalPrice: 550,
    image: 'https://i.postimg.cc/tgFv016K/Screenshot-2025-07-19-182830.png',
    category: 'seeds',
    rating: 4.6,
    reviews: 203,
    discount: 18,
    inStock: true,
    description: 'High-yielding wheat seeds suitable for various soil types and weather conditions',
    forUse: 'Commercial wheat farming'
  },
  {
    id: '6',
    name: 'Bio Fertilizer Mix',
    price: 799,
    originalPrice: 999,
    image: 'https://i.postimg.cc/3RPsjMgh/antracol-file-659.jpg',
    category: 'fertilizers',
    rating: 4.4,
    reviews: 145,
    discount: 20,
    inStock: false,
    description: 'Advanced bio-fertilizer blend for enhanced plant growth and soil enrichment',
    forUse: 'Organic farming and soil enhancement'
  },
  {
    id: '7',
    name: 'Tractor - Mahindra 475 DI',
    price: 550,
    originalPrice: 580,
    image: 'https://i.postimg.cc/ncVyv1mC/tractor.png',
    category: 'equipment',
    rating: 4.9,
    reviews: 312,
    discount: 5,
    inStock: true,
    description: 'Powerful 47 HP tractor ideal for farming operations, plowing, and heavy-duty agricultural work',
    forUse: 'Large-scale farming and heavy agricultural work'
  },
  {
    id: '8',
    name: 'Rice Seeds - Basmati',
    price: 380,
    originalPrice: 450,
    image: 'https://i.postimg.cc/bv6gfQJF/rice-bag.png',
    category: 'seeds',
    rating: 4.7,
    reviews: 189,
    discount: 16,
    inStock: true,
    description: 'Premium basmati rice seeds for aromatic long-grain rice cultivation',
    forUse: 'Rice cultivation and paddy farming'
  },
  {
    id: '9',
    name: 'Pesticide Spray - Organic',
    price: 299,
    originalPrice: 350,
    image: 'https://i.postimg.cc/FH5nTgdy/Adhitya.png',
    category: 'agriculture',
    rating: 4.5,
    reviews: 98,
    discount: 15,
    inStock: true,
    description: 'Organic pesticide spray for natural pest control without harmful chemicals',
    forUse: 'Pest control for organic farming'
  },
  {
    id: '10',
    name: 'Harvester Machine',
    price: 120,
    originalPrice: 200,
    image: 'https://i.postimg.cc/W4vSwWkr/exylon-qsar-herbicide-file-20897.png',
    category: 'equipment',
    rating: 4.8,
    reviews: 67,
    discount: 11,
    inStock: true,
    description: 'Advanced combine harvester for efficient crop harvesting and grain separation',
    forUse: 'Large-scale crop harvesting'
  },
  {
    id: '11',
    name: 'Cotton Seeds - Hybrid',
    price: 520,
    originalPrice: 620,
    image: 'https://i.postimg.cc/KzLq21MX/admire-insecticide-file-20004.jpg',
    category: 'seeds',
    rating: 4.6,
    reviews: 234,
    discount: 16,
    inStock: true,
    description: 'High-quality hybrid cotton seeds for superior fiber production and disease resistance',
    forUse: 'Cotton farming and fiber production'
  },
  {
    id: '12',
    name: 'NPK Fertilizer Complex',
    price: 899,
    originalPrice: 1099,
    image: 'https://i.postimg.cc/0Q24pk6h/Fertilizer.png',
    category: 'fertilizers',
    rating: 4.7,
    reviews: 156,
    discount: 18,
    inStock: true,
    description: 'Balanced NPK fertilizer complex for complete plant nutrition and optimal growth',
    forUse: 'All crops requiring balanced nutrition'
  },
  {
    id: '13',
    name: 'Cultivator Equipment',
    price: 450,
    originalPrice: 520,
    image: 'https://i.postimg.cc/VLNq9SkY/exylon-dynemo-file-20821.png',
    category: 'equipment',
    rating: 4.4,
    reviews: 899,
    discount: 13,
    inStock: true,
    description: 'Heavy-duty cultivator for soil preparation, weed control, and field cultivation',
    forUse: 'Soil preparation and field cultivation'
  },
  {
    id: '14',
    name: 'Sunflower Seeds - Premium',
    price: 420,
    originalPrice: 500,
    image: 'https://i.postimg.cc/zfptDsd7/Brafe.png',
    category: 'seeds',
    rating: 4.5,
    reviews: 145,
    discount: 16,
    inStock: true,
    description: 'Premium sunflower seeds for oil production and ornamental purposes',
    forUse: 'Oil production and ornamental farming'
  },
  {
    id: '15',
    name: 'Insecticide Spray',
    price: 350,
    originalPrice: 420,
    image: 'https://i.postimg.cc/kXt4d9jQ/velum-prime-nematicide-file-4770.jpg',
    category: 'agriculture',
    rating: 4.3,
    reviews: 112,
    discount: 17,
    inStock: true,
    description: 'Effective insecticide spray for comprehensive pest management and crop protection',
    forUse: 'Insect control and crop protection'
  }
];

const categories = ['seeds', 'fertilizers', 'tools', 'equipment', 'agriculture'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = mockProducts;

    // Enhanced search functionality - search in name, description, and category
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max;
        }
        return product.price >= min;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'discount':
          return b.discount - a.discount;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange('all');
    setSortBy('name');
    setCurrentPage(1);
  };

  const removeFilter = (type: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(type);
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Count active filters
  const activeFilterCount = [searchQuery, selectedCategory, priceRange !== 'all' ? priceRange : ''].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* === MOBILE LAYOUT === */}
      <div className="md:hidden">
        {/* Page Title */}
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-bold text-foreground">
            {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'All Products'}
          </h1>
        </div>

        {/* Filter & Sort Bar */}
        <div className="px-4 pb-3 flex gap-3">
          {/* Filters Button */}
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

          {/* Sort Button */}
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

        {/* Products Count */}
        <div className="mx-4 mb-3 bg-muted/40 rounded-xl py-2.5 px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
          </p>
        </div>

        {/* Active Filter Badges */}
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

        {/* Mobile Products Grid */}
        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 px-4 mb-6">
              {currentProducts.map(product => (
                <ProductCard key={product.id} product={product} variant="grid" />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pb-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page} className="cursor-pointer">
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if ((page === currentPage - 2 && currentPage > 3) || (page === currentPage + 2 && currentPage < totalPages - 2)) {
                        return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>;
                      }
                      return null;
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            <Button className="mt-4" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}

        {/* Mobile Filter Bottom Sheet */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold">Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-4 overflow-y-auto">
              {/* Categories */}
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

              {/* Price Range */}
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
            {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'All Products'}
          </h1>
          {(searchQuery || selectedCategory) && (
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
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
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

          {/* Desktop Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 bg-card p-4 rounded-lg shadow-sm">
              <p className="text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
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

            {currentProducts.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {currentProducts.map(product => (
                    <ProductCard key={product.id} product={product} variant="grid" />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page} className="cursor-pointer">
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if ((page === currentPage - 2 && currentPage > 3) || (page === currentPage + 2 && currentPage < totalPages - 2)) {
                            return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>;
                          }
                          return null;
                        })}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
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
