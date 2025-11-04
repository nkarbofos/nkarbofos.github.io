import React, { useState, useEffect } from 'react';
import type { WeatherLocation } from '../../types/weather';

interface LocationInfoProps {
  location: WeatherLocation | null;
  language: 'en' | 'ru';
}

export function LocationInfo({ location, language }: LocationInfoProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDayOfWeek = (date: Date) => {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU', {
      weekday: 'long'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="card p-6 h-full">
      <div className="text-center space-y-4">
        {/* City Name */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {location ? location.name : 'No Location Selected'}
          </h2>
          {location && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {location.state ? `${location.state}, ` : ''}{location.country}
            </p>
          )}
        </div>

        {/* Current Time */}
        <div className="space-y-2">
          <div className="text-4xl font-mono font-bold text-primary-600 dark:text-primary-400">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Day of Week and Date */}
        <div className="space-y-1">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
            {formatDayOfWeek(currentTime)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
    </div>
  );
}
