import { useState, useEffect, useCallback } from 'react';

export interface SavedFormAddress {
  id: string;
  label: string;
  country: string;
  state: string;
  district: string;
  division: string;
  mandal: string;
  village: string;
  workType: string;
  category: string;
  createdAt: string;
}

const STORAGE_KEY = 'saved_form_addresses';
const MAX_ADDRESSES = 10;

const loadAddresses = (): SavedFormAddress[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistAddresses = (addresses: SavedFormAddress[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
};

export const useSavedFormAddresses = () => {
  const [addresses, setAddresses] = useState<SavedFormAddress[]>(loadAddresses);

  useEffect(() => {
    persistAddresses(addresses);
  }, [addresses]);

  const saveAddress = useCallback((address: Omit<SavedFormAddress, 'id' | 'createdAt' | 'label'>) => {
    setAddresses(prev => {
      // Check for duplicate (same location + workType + category)
      const isDuplicate = prev.some(
        a => a.country === address.country && a.state === address.state &&
          a.district === address.district && a.division === address.division &&
          a.workType === address.workType && a.category === address.category
      );
      if (isDuplicate) return prev;
      if (prev.length >= MAX_ADDRESSES) return prev; // limit reached

      const label = [address.district, address.state].filter(Boolean).join(', ') || 'Saved Address';
      const newAddr: SavedFormAddress = {
        ...address,
        id: crypto.randomUUID(),
        label,
        createdAt: new Date().toISOString(),
      };
      return [newAddr, ...prev];
    });
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  }, []);

  const isLimitReached = addresses.length >= MAX_ADDRESSES;

  return { addresses, saveAddress, deleteAddress, isLimitReached };
};
