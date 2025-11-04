import React from 'react';
import { WeatherAPI } from '../../services/weather';
import type { CurrentWeather } from '../../types/weather';

interface CurrentWeatherDetailsProps {
  weather: CurrentWeather;
  units: 'metric' | 'imperial';
  language: 'en' | 'ru';
}

export function CurrentWeatherDetails({ weather, units, language }: CurrentWeatherDetailsProps) {
  const formatTemp = (temp: number) => WeatherAPI.formatTemperature(temp, units);
  const formatWind = (speed: number) => WeatherAPI.formatWindSpeed(speed, units);
  const formatPressure = (pressure: number) => WeatherAPI.formatPressure(pressure);
  const formatHumidity = (humidity: number) => WeatherAPI.formatHumidity(humidity);
  const formatDateTime = (timestamp: number) => new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get UV index (approximation based on cloud cover and time)
  const getUVIndex = () => {
    const now = new Date();
    const hour = now.getHours();
    const cloudCover = weather.clouds.all;
    
    // Simple UV estimation (this would need a more sophisticated calculation in a real app)
    let uvBase = 0;
    if (hour >= 6 && hour <= 18) {
      uvBase = 10 - (cloudCover / 10);
    }
    
    return Math.max(0, Math.min(uvBase, 11));
  };

  const getUVLevel = (uv: number) => {
    if (uv <= 2) return { label: 'Low', color: 'text-green-500' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-500' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-500' };
    if (uv <= 10) return { label: 'Very High', color: 'text-red-500' };
    return { label: 'Extreme', color: 'text-purple-500' };
  };

  const uvIndex = getUVIndex();
  const uvLevel = getUVLevel(uvIndex);

  const weatherIcon = weather.weather[0]?.icon || '01d';
  const iconUrl = WeatherAPI.getWeatherIconUrl(weatherIcon, '4x');

  return (
    <div className="card p-4 h-full">
      <div className="text-center space-y-3">
        {/* Weather Icon and Main Temperature */}
        <div className="flex items-center justify-center space-x-3">
          <img 
            src={iconUrl} 
            alt={weather.weather[0]?.description || 'Weather'} 
            className="w-12 h-12"
          />
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatTemp(weather.main.temp)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {weather.weather[0]?.description || 'Clear'}
            </div>
          </div>
        </div>

        {/* Main Weather Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Feels Like */}
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {formatTemp(weather.main.feels_like)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Feels Like</div>
          </div>

          {/* Humidity */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            <div className="font-semibold text-blue-600 dark:text-blue-400">
              {formatHumidity(weather.main.humidity)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Humidity</div>
          </div>

          {/* Wind Speed */}
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="font-semibold text-green-600 dark:text-green-400">
              {formatWind(weather.wind.speed)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Wind</div>
          </div>

          {/* Pressure */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
            <div className="font-semibold text-indigo-600 dark:text-indigo-400">
              {formatPressure(weather.main.pressure)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Pressure</div>
          </div>
        </div>

        {/* Sun Times and UV */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Sunrise */}
          <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
            <div className="font-semibold text-orange-600 dark:text-orange-400 text-xs">
              {formatDateTime(weather.sys.sunrise)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Sunrise</div>
          </div>

          {/* Sunset */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
            <div className="font-semibold text-purple-600 dark:text-purple-400 text-xs">
              {formatDateTime(weather.sys.sunset)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Sunset</div>
          </div>

          {/* UV Index */}
          <div className={`bg-opacity-20 p-2 rounded ${uvLevel.color}`}>
            <div className={`font-semibold text-xs`}>
              {uvIndex}
            </div>
            <div className="text-gray-600 dark:text-gray-400">UV Index</div>
          </div>
        </div>
      </div>
    </div>
  );
}
