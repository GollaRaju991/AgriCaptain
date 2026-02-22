import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationData {
  country: string;
  state: string;
  district: string;
  division?: string;
  mandal?: string;
  village?: string;
}

interface LocationDetectorProps {
  enabled?: boolean;
  onLocationDetected: (location: LocationData) => void;
}

const LocationDetector: React.FC<LocationDetectorProps> = ({ enabled = false, onLocationDetected }) => {
  const [isDetecting, setIsDetecting] = useState(false);

  const reverseGeocode = async (lat: number, lon: number): Promise<LocationData> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=en`,
        { headers: { 'User-Agent': 'AgriCaptainApp/1.0' } }
      );
      const data = await response.json();
      const addr = data.address || {};

      return {
        country: addr.country || 'India',
        state: addr.state || '',
        district: addr.state_district || addr.county || '',
        division: addr.suburb || addr.city_district || addr.town || '',
        mandal: addr.village || addr.hamlet || addr.neighbourhood || '',
        village: addr.hamlet || addr.isolated_dwelling || '',
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {
        country: 'India',
        state: 'Telangana',
        district: 'Hyderabad',
        division: 'Secunderabad',
        mandal: '',
        village: '',
      };
    }
  };

  const detectLocation = async () => {
    setIsDetecting(true);

    if (!navigator.geolocation) {
      onLocationDetected({ country: 'India', state: 'Telangana', district: 'Hyderabad' });
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = await reverseGeocode(latitude, longitude);
        console.log('Location detected:', locationData);
        onLocationDetected(locationData);
        setIsDetecting(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        onLocationDetected({ country: 'India', state: 'Telangana', district: 'Hyderabad' });
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={detectLocation}
      disabled={isDetecting}
      className="text-primary border-primary hover:bg-primary/10 gap-2"
    >
      {isDetecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Detecting Location...
        </>
      ) : (
        <>
          <MapPin className="h-4 w-4" />
          Add Current Location
        </>
      )}
    </Button>
  );
};

export default LocationDetector;
