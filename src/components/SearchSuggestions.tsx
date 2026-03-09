import React, { useMemo } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { products } from '@/data/products';
import { mockProducts } from '@/data/mockProducts';

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
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    // Collect unique product names from both data sources
    const allNames = new Set<string>();
    products.forEach((p) => allNames.add(p.name));
    mockProducts.forEach((p) => allNames.add(p.name));

    // Also add category keywords
    const categories = [
      'Seeds', 'Fertilizers', 'Pesticides', 'Insecticide', 'Fungicide',
      'Herbicide', 'Sprayer', 'Tools', 'Irrigation', 'Neem Oil',
      'Cotton', 'Tomato', 'Onion', 'Chilli', 'Wheat', 'Rice',
      'Maize', 'Potato', 'Soybean', 'Mustard', 'Sugarcane',
      'Groundnut', 'Sunflower', 'Coriander', 'Bio Fertilizer',
      'Vermicompost', 'Compost', 'Mulching', 'Greenhouse',
    ];
    categories.forEach((c) => allNames.add(c));

    const matches = Array.from(allNames)
      .filter((name) => name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts || a.localeCompare(b);
      })
      .slice(0, 8);

    return matches;
  }, [query]);

  if (!visible) return null;

  const showTrending = !query.trim();
  const items = showTrending ? trendingSearches : suggestions;

  if (items.length === 0 && !showTrending) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white rounded-b-xl shadow-lg border border-t-0 border-gray-200 z-[60] max-h-72 overflow-y-auto">
      {showTrending && (
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-1.5 border-b border-gray-100">
          <TrendingUp className="h-3 w-3" />
          Trending Searches
        </div>
      )}
      {items.map((item, i) => (
        <button
          key={`${item}-${i}`}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-green-50 transition-colors text-sm text-foreground"
          onMouseDown={(e) => {
            e.preventDefault(); // prevent blur before click
            onSelect(item);
          }}
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
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
