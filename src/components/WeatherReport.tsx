import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Cloud, CloudRain, Sun, CloudSun, MapPin, Loader2, Wind, Droplets, Sunrise, RefreshCw } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  rainChance: number;
  humidity: number;
  wind: number;
  sunrise: string;
  lastUpdated: string;
  forecast: {
    day: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

const WeatherIcon = ({ condition, size = 'md' }: { condition: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = size === 'lg' ? 'h-12 w-12' : size === 'md' ? 'h-8 w-8' : 'h-6 w-6';
  const color = condition.includes('Rain') || condition.includes('Drizzle')
    ? 'text-blue-500'
    : condition.includes('Cloud')
    ? 'text-gray-400'
    : 'text-yellow-400';

  if (condition.includes('Rain') || condition.includes('Drizzle')) {
    return <CloudRain className={`${sizeClass} ${color}`} />;
  }
  if (condition.includes('Partly') || condition.includes('partly')) {
    return <CloudSun className={`${sizeClass} text-yellow-400`} />;
  }
  if (condition.includes('Cloud') || condition.includes('Overcast')) {
    return <Cloud className={`${sizeClass} ${color}`} />;
  }
  return <Sun className={`${sizeClass} text-yellow-400`} />;
};

const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'Sunny';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Cloudy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain';
  if (code <= 86) return 'Snow';
  return 'Sunny';
};

const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const AUTO_REFRESH_MS = 30 * 60 * 1000; // 30 minutes

const WeatherReport: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState('Your Location');
  const coordsRef = useRef<{ lat: number; lon: number }>({ lat: 17.385, lon: 78.4867 });

  const fetchWeather = useCallback(async (lat: number, lon: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=en`,
          { headers: { 'User-Agent': 'AgriCaptainApp/1.0' } }
        );
        const geoData = await geoRes.json();
        const addr = geoData.address || {};
        setLocationName(addr.city || addr.town || addr.state_district || addr.state || 'Your Location');
      } catch { /* ignore */ }

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise&timezone=auto&forecast_days=6`
      );
      const data = await res.json();
      const current = data.current;
      const daily = data.daily;

      setWeather({
        temperature: Math.round(current.temperature_2m),
        condition: getWeatherCondition(current.weather_code),
        rainChance: daily.precipitation_probability_max?.[0] ?? 0,
        humidity: current.relative_humidity_2m,
        wind: Math.round(current.wind_speed_10m),
        sunrise: new Date(daily.sunrise[0]).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        lastUpdated: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        forecast: daily.weather_code.slice(1, 6).map((code: number, i: number) => ({
          day: getDayName(daily.time[i + 1]),
          high: Math.round(daily.temperature_2m_max[i + 1]),
          low: Math.round(daily.temperature_2m_min[i + 1]),
          condition: getWeatherCondition(code),
        })),
      });
    } catch (err) {
      console.error('Weather fetch failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    // Try to get fresh GPS location on each refresh
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          coordsRef.current = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          fetchWeather(pos.coords.latitude, pos.coords.longitude, true);
        },
        () => fetchWeather(coordsRef.current.lat, coordsRef.current.lon, true),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(coordsRef.current.lat, coordsRef.current.lon, true);
    }
  }, [fetchWeather]);

  useEffect(() => {
    // Initial fetch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          coordsRef.current = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => fetchWeather(17.385, 78.4867),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(17.385, 78.4867);
    }

    // Auto-refresh every 30 minutes
    const interval = setInterval(() => {
      fetchWeather(coordsRef.current.lat, coordsRef.current.lon, true);
    }, AUTO_REFRESH_MS);

    return () => clearInterval(interval);
  }, [fetchWeather]);

  if (loading) {
    return (
      <div className="w-full px-2 md:px-4 py-4">
        <div className="bg-card rounded-xl shadow-sm p-6 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading live weather...</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="w-full px-2 md:px-4 py-3">
      <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-[hsl(142,60%,35%)] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-yellow-300" />
            <h3 className="text-white font-bold text-base md:text-lg">Weather Report</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              title="Refresh weather"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-white/90 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-1 text-white/90 text-xs md:text-sm">
              <MapPin className="h-3.5 w-3.5" />
              <span>{locationName}</span>
            </div>
          </div>
        </div>

        {/* Current Weather */}
        <div className="p-4 flex flex-col sm:flex-row">
          <div className="flex-1 flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-4">
            <div className="flex flex-col items-center">
              <WeatherIcon condition={weather.condition} size="lg" />
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">{weather.temperature}°C</div>
              <div className="text-sm text-muted-foreground">{weather.condition}</div>
            </div>
            <div className="ml-auto sm:ml-4 flex flex-col items-end gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Sunrise className="h-4 w-4 text-orange-400" />
                <span>Sunrise: <strong className="text-foreground">{weather.sunrise}</strong></span>
              </div>
              <span className="text-[10px] text-muted-foreground">Updated: {weather.lastUpdated}</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2 pt-3 sm:pt-0 sm:pl-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span className="text-xs md:text-sm text-muted-foreground">Rain Chance: <strong className="text-foreground">{weather.rainChance}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Humidity: <strong className="text-foreground">{weather.humidity}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs md:text-sm text-muted-foreground">Wind: <strong className="text-foreground">{weather.wind} km/h</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-orange-400" />
              <span className="text-xs md:text-sm text-muted-foreground">Sunrise: <strong className="text-foreground">{weather.sunrise}</strong></span>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="px-4 pb-1">
          <span className="inline-block bg-muted text-muted-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Next 5 Days Forecast
          </span>
        </div>
        <div className="grid grid-cols-5 gap-0 mx-2 mb-3 mt-2 bg-card rounded-lg border border-border overflow-hidden">
          {weather.forecast.map((day, i) => (
            <div
              key={day.day}
              className={`flex flex-col items-center py-3 px-1 ${i < 4 ? 'border-r border-border' : ''}`}
            >
              <span className="font-semibold text-xs md:text-sm text-foreground">{day.day}</span>
              <span className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                {day.high}° / {day.low}°
              </span>
              <div className="my-1.5">
                <WeatherIcon condition={day.condition} size="sm" />
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground">{day.condition}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherReport;
