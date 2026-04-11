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
      (position) => {
        const { latitude, longitude } = position.coords;
        // Reverse geocode for address - done inside the callback to stay in gesture context
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
        console.error('Geolocation error:', error.code, error.message);
        reject(new Error(
          error.code === 1 ? 'Location permission denied. Please enable location access in your browser/device settings.' :
          error.code === 2 ? 'Location unavailable. Please check your GPS/network settings.' :
          error.code === 3 ? 'Location request timed out. Please try again.' :
          'Could not detect location'
        ));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  });
};
