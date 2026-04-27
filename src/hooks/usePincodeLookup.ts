import { useState, useCallback, useEffect } from 'react';

export interface PostOffice {
  Name: string;
  District: string;
  State: string;
  Block?: string;
  Circle?: string;
  Pincode: string;
}

export interface PincodeData {
  state: string;
  district: string;
  city: string; // first locality (Block/Name)
  localities: string[]; // all post office names under this pin
}

const cache = new Map<string, PincodeData>();

export const usePincodeLookup = (pincode: string) => {
  const [data, setData] = useState<PincodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPincode = useCallback(async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) {
      setData(null);
      setError(null);
      return;
    }
    if (cache.has(pin)) {
      setData(cache.get(pin)!);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const json = await res.json();
      const entry = Array.isArray(json) ? json[0] : null;
      if (!entry || entry.Status !== 'Success' || !entry.PostOffice?.length) {
        setError('Invalid PIN code');
        setData(null);
        setLoading(false);
        return;
      }
      const offices: PostOffice[] = entry.PostOffice;
      const first = offices[0];
      const result: PincodeData = {
        state: first.State,
        district: first.District,
        city: first.Block && first.Block !== 'NA' ? first.Block : first.Name,
        localities: offices.map((o) => o.Name),
      };
      cache.set(pin, result);
      setData(result);
    } catch (e) {
      setError('Could not fetch PIN details');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pincode && pincode.length === 6) {
      fetchPincode(pincode);
    } else {
      setData(null);
      setError(null);
    }
  }, [pincode, fetchPincode]);

  return { data, loading, error };
};
