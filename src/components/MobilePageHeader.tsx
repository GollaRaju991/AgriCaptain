import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import SearchSuggestions from '@/components/SearchSuggestions';

interface MobilePageHeaderProps {
  title: string;
  showSearch?: boolean;
  showCart?: boolean;
  bgColor?: string;
  textColor?: string;
  fallbackPath?: string;
  rightContent?: React.ReactNode;
}

const MobilePageHeader: React.FC<MobilePageHeaderProps> = ({
  title,
  showSearch = true,
  showCart = true,
  bgColor = 'bg-white',
  textColor = 'text-foreground',
  fallbackPath = '/',
  rightContent,
}) => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    if (searchActive) {
      setSearchActive(false);
      setSearchQuery('');
      return;
    }
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setSearchActive(false);
      setSearchQuery('');
    }
  };

  return (
    <div className={`lg:hidden sticky top-0 z-50 ${bgColor} shadow-sm`}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Back button */}
        <button onClick={handleBack} className="p-1 flex-shrink-0">
          <ArrowLeft className={`h-5 w-5 ${textColor}`} />
        </button>

        {/* Search bar or title */}
        {showSearch ? (
          <div className="flex-1 relative">
            {searchActive ? (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(searchQuery);
                  }}
                  placeholder="Search for products..."
                  className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="!min-h-0 !min-w-0">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setSearchActive(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className="w-full flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{title}</span>
              </button>
            )}
            {searchActive && (
              <SearchSuggestions
                query={searchQuery}
                onSelect={(suggestion) => handleSearch(suggestion)}
                visible={showSuggestions}
              />
            )}
          </div>
        ) : (
          <h1 className={`flex-1 text-base font-semibold ${textColor} truncate`}>{title}</h1>
        )}

        {/* Right icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {rightContent}
          {showCart && (
            <button onClick={() => navigate('/cart')} className="p-1.5 relative">
              <ShoppingCart className={`h-5 w-5 ${textColor}`} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobilePageHeader;
