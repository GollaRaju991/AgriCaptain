import { useState, useCallback } from 'react';

const SEARCH_HISTORY_KEY = 'agrizin_search_history';
const MAX_HISTORY = 10;

export const getSearchHistory = (): string[] => {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addToSearchHistory = (query: string) => {
  if (!query.trim()) return;
  const history = getSearchHistory();
  const filtered = history.filter((item) => item.toLowerCase() !== query.trim().toLowerCase());
  const updated = [query.trim(), ...filtered].slice(0, MAX_HISTORY);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
};

export const clearSearchHistory = () => {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
};

export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>(getSearchHistory);

  const addSearch = useCallback((query: string) => {
    addToSearchHistory(query);
    setHistory(getSearchHistory());
  }, []);

  const clearHistory = useCallback(() => {
    clearSearchHistory();
    setHistory([]);
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getSearchHistory());
  }, []);

  return { history, addSearch, clearHistory, refreshHistory };
};
