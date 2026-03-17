import React, { useMemo } from 'react';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { products } from '@/data/products';
import { mockProducts } from '@/data/mockProducts';
import { getSearchHistory, clearSearchHistory } from '@/hooks/useSearchHistory';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: string) => void;
  visible: boolean;
}

const trendingSearches = [
  'Cotton Seeds', 'Tomato Seeds', 'Fertilizer', 'Pesticide',
  'Onion Seeds', 'Neem Oil', 'Sprayer', 'Fungicide',
];

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ query, onSelect, visible }) => {
  const searchHistory = useMemo(() => getSearchHistory(), [visible]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const allNames = new Set<string>();
    products.forEach((p) => allNames.add(p.name));
    mockProducts.forEach((p) => allNames.add(p.name));

    const categories = [
      'Seeds', 'Pesticides', 'Insecticide', 'Fungicide',
      'Herbicide', 'Sprayer', 'Tools', 'Irrigation', 'Neem Oil',
      'Cotton', 'Tomato', 'Onion', 'Chilli', 'Wheat', 'Rice',
      'Maize', 'Potato', 'Soybean', 'Mustard', 'Sugarcane',
      'Groundnut', 'Sunflower', 'Coriander', 'Bio Fertilizer',
      'Vermicompost', 'Compost', 'Mulching', 'Greenhouse',
    ];
    categories.forEach((c) => allNames.add(c));

    return Array.from(allNames)
      .filter((name) => name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts || a.localeCompare(b);
      })
      .slice(0, 8);
  }, [query]);

  if (!visible) return null;

  const showTrending = !query.trim();
  const hasHistory = showTrending && searchHistory.length > 0;
  const items = showTrending ? trendingSearches : suggestions;

  if (items.length === 0 && !showTrending && !hasHistory) return null;

  const handleClearHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearSearchHistory();
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-white rounded-b-xl shadow-lg border border-t-0 border-gray-200 z-[60] max-h-80 overflow-y-auto">
      {/* Recent Searches */}
      {hasHistory && (
        <>
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Recent Searches
            </div>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleClearHistory(e);
              }}
              className="text-blue-600 hover:text-blue-800 text-[11px] font-medium"
            >
              Clear All
            </button>
          </div>
          {searchHistory.slice(0, 5).map((item, i) => (
            <button
              key={`history-${item}-${i}`}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors text-sm text-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
            >
              <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="truncate flex-1">{item}</span>
            </button>
          ))}
        </>
      )}

      {/* Trending Searches */}
      {showTrending && (
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-1.5 border-b border-gray-100">
          <TrendingUp className="h-3 w-3" />
          Trending Searches
        </div>
      )}

      {/* Items */}
      {items.map((item, i) => (
        <button
          key={`${item}-${i}`}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-green-50 transition-colors text-sm text-foreground"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(item);
          }}
        >
          {showTrending ? (
            <TrendingUp className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
          ) : (
            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          )}
          <span className="truncate">{highlightMatch(item, query)}</span>
        </button>
      ))}
    </div>
  );
};

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-green-700">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default SearchSuggestions;
