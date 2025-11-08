import React, { useEffect, useState } from 'react';

interface LocationData {
  country: string;
  state: string;
  district: string;
  division?: string;
  mandal?: string;
}

interface LocationDetectorProps {
  enabled?: boolean;
  onLocationDetected: (location: LocationData) => void;
}

const LocationDetector: React.FC<LocationDetectorProps> = ({ enabled = false, onLocationDetected }) => {
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = async () => {
    setIsDetecting(true);
    
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // Mock location data for India
              const mockLocationData: LocationData = {
                country: 'India',
                state: 'Telangana',
                district: 'Hyderabad',
                division: 'Secunderabad',
                mandal: 'Begumpet'
              };
              
              console.log('Location detected:', mockLocationData);
              onLocationDetected(mockLocationData);
            } catch (error) {
              console.error('Error in reverse geocoding:', error);
              onLocationDetected({
                country: 'India',
                state: 'Telangana',
                district: 'Hyderabad'
              });
            }
            setIsDetecting(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            onLocationDetected({
              country: 'India',
              state: 'Telangana',
              district: 'Hyderabad'
            });
            setIsDetecting(false);
          }
        );
      } else {
        onLocationDetected({
          country: 'India',
          state: 'Telangana',
          district: 'Hyderabad'
        });
        setIsDetecting(false);
      }
    } catch (error) {
      console.error('Location detection error:', error);
      onLocationDetected({
        country: 'India',
        state: 'Telangana',
        district: 'Hyderabad'
      });
      setIsDetecting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={detectLocation}
      disabled={isDetecting}
      className="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
    >
      {isDetecting ? '📍 Detecting...' : '📍 Use My Location'}
    </button>
  );
};

export default LocationDetector;