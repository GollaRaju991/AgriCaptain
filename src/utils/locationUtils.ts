// Haversine formula to calculate distance between two lat/lon points in km
export const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const formatDistance = (km: number): string => {
  if (km < 1) return '< 1 km';
  return `${km} km`;
};

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

// IP-based geolocation fallback (works when GPS is denied/blocked, e.g. inside iframes)
const detectLocationByIP = async (): Promise<UserLocation> => {
  // Try multiple providers for resilience
  const providers = [
    async () => {
      const res = await fetch('https://ipapi.co/json/');
      const d = await res.json();
      if (!d.latitude || !d.longitude) throw new Error('ipapi: no coords');
      return {
        latitude: Number(d.latitude),
        longitude: Number(d.longitude),
        address: [d.city, d.region, d.country_name].filter(Boolean).join(', '),
      };
    },
    async () => {
      const res = await fetch('https://ipwho.is/');
      const d = await res.json();
      if (!d.success || !d.latitude || !d.longitude) throw new Error('ipwho: failed');
      return {
        latitude: Number(d.latitude),
        longitude: Number(d.longitude),
        address: [d.city, d.region, d.country].filter(Boolean).join(', '),
      };
    },
  ];
  let lastErr: any;
  for (const p of providers) {
    try { return await p(); } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('IP geolocation failed');
};

export const detectUserLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    const tryIPFallback = (gpsErrorMsg: string) => {
      detectLocationByIP()
        .then(resolve)
        .catch(() => reject(new Error(gpsErrorMsg)));
    };

    if (!navigator.geolocation) {
      tryIPFallback('Geolocation not supported on this device. Please add your location manually.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
          { headers: { 'User-Agent': 'AgriCaptainApp/1.0' } }
        )
          .then(res => res.json())
          .then(data => {
            const addr = data.address || {};
            const address = [addr.village || addr.town || addr.city, addr.state_district || addr.county, addr.state]
              .filter(Boolean).join(', ');
            resolve({ latitude, longitude, address });
          })
          .catch(() => {
            resolve({ latitude, longitude });
          });
      },
      (error) => {
        console.warn('Geolocation error, falling back to IP:', error.code, error.message);
        const msg =
          error.code === 1 ? 'Location permission denied. Please enable location access in your browser settings, or add your location manually.' :
          error.code === 2 ? 'GPS unavailable. Please check your network/GPS, or add your location manually.' :
          error.code === 3 ? 'Location request timed out. Please try again or add your location manually.' :
          'Could not detect location. Please add it manually.';
        tryIPFallback(msg);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  });
};
