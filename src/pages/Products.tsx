import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
import { Filter, X } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb and Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'All Products'}
          </h1>
          
          {/* Active Filters */}
          {(searchQuery || selectedCategory) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('search')}
                  />
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {selectedCategory}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('category')}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Categories */}
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
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
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

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-2 sm:mb-0">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
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

            {/* Products Grid */}
            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {currentProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
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
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            (page === currentPage - 2 && currentPage > 3) ||
                            (page === currentPage + 2 && currentPage < totalPages - 2)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
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
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <Button className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav />

      <Footer />
    </div>
  );
};

export default Products;
