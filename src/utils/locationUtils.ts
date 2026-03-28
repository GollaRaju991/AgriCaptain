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

export const detectUserLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Try reverse geocode for address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
            { headers: { 'User-Agent': 'AgriCaptainApp/1.0' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const address = [addr.village || addr.town || addr.city, addr.state_district || addr.county, addr.state]
            .filter(Boolean).join(', ');
          resolve({ latitude, longitude, address });
        } catch {
          resolve({ latitude, longitude });
        }
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};
