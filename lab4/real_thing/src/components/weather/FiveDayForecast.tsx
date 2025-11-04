import React, { useMemo } from 'react';
import { WeatherAPI } from '../../services/weather';
import type { ForecastData } from '../../types/weather';

interface FiveDayForecastProps {
  forecast: ForecastData;
  units: 'metric' | 'imperial';
  language: 'en' | 'ru';
}

interface DailyForecast {
  date: string;
  dayName: string;
  icon: string;
  minTemp: number;
  maxTemp: number;
  description: string;
  cloudiness: number;
}

export function FiveDayForecast({ forecast, units, language }: FiveDayForecastProps) {
  const formatTemp = (temp: number) => WeatherAPI.formatTemperature(temp, units);
  const getWeatherIconUrl = (icon: string) => WeatherAPI.getWeatherIconUrl(icon, '2x');
  const formatCloudiness = (cloudiness: number) => `${Math.round(cloudiness)}%`;

  const dailyForecasts = useMemo(() => {
    const dailyData: { [date: string]: DailyForecast } = {};

    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyData[date]) {
        const dateObj = new Date(item.dt * 1000);
        const dayName = dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU', {
          weekday: 'long',
          day: 'numeric',
          month: 'short'
        });
        
        dailyData[date] = {
          date,
          dayName,
          icon: item.weather[0]?.icon || '01d',
          minTemp: item.main.temp,
          maxTemp: item.main.temp,
          description: item.weather[0]?.description || 'Clear',
          cloudiness: item.clouds.all
        };
      } else {
        // Update min/max temperatures
        dailyData[date].minTemp = Math.min(dailyData[date].minTemp, item.main.temp);
        dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, item.main.temp);
        
        // Use the weather from around midday (12:00) if available
        const hour = new Date(item.dt * 1000).getHours();
        if (hour >= 11 && hour <= 13) {
          dailyData[date].icon = item.weather[0]?.icon || dailyData[date].icon;
          dailyData[date].description = item.weather[0]?.description || dailyData[date].description;
          dailyData[date].cloudiness = item.clouds.all;
        }
      }
    });

    // Convert to array and take only 5 days (skip today)
    const days = Object.values(dailyData);
    if (days.length > 5) {
      days.splice(0, 1); // Remove today (first day)
      return days.slice(0, 5);
    }
    
    return days.slice(0, 5);
  }, [forecast, units, language]);

  const getCloudinessIcon = (cloudiness: number) => {
    if (cloudiness < 25) return '☀️';
    if (cloudiness < 50) return '🌤️';
    if (cloudiness < 75) return '⛅';
    if (cloudiness < 90) return '☁️';
    return '🌫️';
  };

  if (dailyForecasts.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4">5 Days Forecast</h3>
        <div className="text-center text-gray-500 dark:text-gray-400">
          No forecast data available
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">5 Days Forecast</h3>
      <div className="space-y-3">
        {dailyForecasts.map((day, index) => (
          <div 
            key={day.date} 
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {/* Date */}
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {index === 0 ? 'Tomorrow' : day.dayName}
              </div>
            </div>

            {/* Cloudiness Icon */}
            <div className="flex-shrink-0 mx-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getCloudinessIcon(day.cloudiness)}</span>
                <img 
                  src={getWeatherIconUrl(day.icon)} 
                  alt={day.description}
                  className="w-8 h-8"
                />
              </div>
            </div>

            {/* Weather Description */}
            <div className="flex-1 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {day.description}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {formatCloudiness(day.cloudiness)} clouds
              </div>
            </div>

            {/* Temperature Range */}
            <div className="flex-1 text-right">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {formatTemp(day.maxTemp)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatTemp(day.minTemp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
