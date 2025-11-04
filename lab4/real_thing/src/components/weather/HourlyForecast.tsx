import React, { useMemo } from 'react';
import { WeatherAPI } from '../../services/weather';
import type { ForecastData } from '../../types/weather';

interface HourlyForecastProps {
  forecast: ForecastData;
  units: 'metric' | 'imperial';
  language: 'en' | 'ru';
}

interface HourlyItem {
  time: string;
  icon: string;
  cloudiness: number;
  windDirection: number;
  windSpeed: number;
}

export function HourlyForecast({ forecast, units, language }: HourlyForecastProps) {
  const formatWind = (speed: number) => WeatherAPI.formatWindSpeed(speed, units);
  const getWeatherIconUrl = (icon: string) => WeatherAPI.getWeatherIconUrl(icon, '2x');

  const hourlyData = useMemo((): HourlyItem[] => {
    // Target times: 12:00, 15:00, 18:00, 21:00, 00:00
    const targetHours = [12, 15, 18, 21, 0];
    const hourlyItems: HourlyItem[] = [];
    
    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Process forecast data to find closest times to our targets
    const relevantItems = forecast.list.filter(item => {
      const itemDate = new Date(item.dt * 1000);
      const diffTime = Math.abs(itemDate.getTime() - today.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 1; // Include today and tomorrow
    });

    for (const targetHour of targetHours) {
      // Find the closest item to this target time
      let closestItem = relevantItems[0];
      let minDiff = Number.MAX_VALUE;
      
      for (const item of relevantItems) {
        const itemDate = new Date(item.dt * 1000);
        const itemHour = itemDate.getHours();
        
        // Calculate difference in hours, accounting for day wrap-around
        let diff = Math.abs(itemHour - targetHour);
        if (diff > 12) {
          diff = 24 - diff; // Handle wrap-around (e.g., 23 vs 1)
        }
        
        if (diff < minDiff) {
          minDiff = diff;
          closestItem = item;
        }
      }
      
      if (closestItem) {
        const itemDate = new Date(closestItem.dt * 1000);
        const timeString = itemDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        hourlyItems.push({
          time: timeString,
          icon: closestItem.weather[0]?.icon || '01d',
          cloudiness: closestItem.clouds.all,
          windDirection: closestItem.wind.deg,
          windSpeed: closestItem.wind.speed
        });
      }
    }
    
    return hourlyItems.slice(0, 5); // Ensure we only have 5 items
  }, [forecast, units, language]);

  const getCloudinessIcon = (cloudiness: number) => {
    if (cloudiness < 25) return '☀️';
    if (cloudiness < 50) return '🌤️';
    if (cloudiness < 75) return '⛅';
    if (cloudiness < 90) return '☁️';
    return '🌫️';
  };

  const getWindDirectionArrow = (degrees: number) => {
    // Convert degrees to arrow direction
    // 0° = North, 90° = East, 180° = South, 270° = West
    const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
    const index = Math.round(degrees / 45) % 8;
    return arrows[index];
  };

  if (hourlyData.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4">Hourly Forecast</h3>
        <div className="text-center text-gray-500 dark:text-gray-400">
          No hourly forecast data available
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-6">Hourly Forecast</h3>
      
      <div className="grid grid-cols-5 gap-4">
        {hourlyData.map((item, index) => (
          <div 
            key={index}
            className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {/* Time */}
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              {item.time}
            </div>
            
            {/* Cloudiness Icon */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <img 
                  src={getWeatherIconUrl(item.icon)} 
                  alt="Weather" 
                  className="w-10 h-10"
                />
                <span className="absolute -top-1 -right-1 text-sm">
                  {getCloudinessIcon(item.cloudiness)}
                </span>
              </div>
            </div>
            
            {/* Wind Direction Arrow */}
            <div className="text-2xl text-gray-600 dark:text-gray-300 mb-2 transform" 
                 style={{ 
                   transform: `rotate(${item.windDirection}deg)`,
                   display: 'inline-block'
                 }}>
              ↑
            </div>
            
            {/* Wind Speed */}
            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
              {formatWind(item.windSpeed)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        ↑ Wind Direction • 🌤️ Cloudiness • {formatWind(0)} Wind Speed
      </div>
    </div>
  );
}
