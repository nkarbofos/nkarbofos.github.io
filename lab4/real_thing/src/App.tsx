import React, { useState, useEffect } from 'react';
import { useSimpleI18n } from './hooks/useI18n';
import { useUnits } from './hooks/useUnits';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useGeolocation } from './hooks/useGeolocation';
import { useHistory } from './hooks/useHistory';
import { WeatherAPI } from './services/weather';
import type { WeatherLocation, CurrentWeather, ForecastData, AirPollution } from './types/weather';
import { CurrentWeatherDetails } from './components/weather/CurrentWeatherDetails';
import { FiveDayForecast } from './components/weather/FiveDayForecast';
import { HourlyForecast } from './components/weather/HourlyForecast';
import { LocationInfo } from './components/common/LocationInfo';
import { SearchBar } from './components/search/SearchBar';

function App() {
  const { language, setLanguage, t } = useSimpleI18n();
  const [units, setUnits] = useUnits();
  const isOnline = useOnlineStatus();
  const { location, error: locationError } = useGeolocation();
  const { history, addToHistory, clearHistory } = useHistory();
  
  const [currentLocation, setCurrentLocation] = useState<WeatherLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [airPollution, setAirPollution] = useState<AirPollution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOnline) {
      setError('No internet connection');
      return;
    }
    setError(null);
  }, [isOnline]);

  useEffect(() => {
    if (location) {
      fetchCurrentLocation();
    }
  }, [location]);

  useEffect(() => {
    if (selectedLocation) {
      fetchWeatherData();
    }
  }, [selectedLocation, units.temperature, language]);

  const fetchCurrentLocation = async () => {
    if (!location) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const locations = await WeatherAPI.reverseGeocode(location.latitude, location.longitude);
      if (locations.length > 0) {
        setCurrentLocation(locations[0]);
        setSelectedLocation(locations[0]);
        addToHistory(locations[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherData = async () => {
    if (!selectedLocation) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [weatherData, forecastData, airData] = await Promise.all([
        WeatherAPI.getCurrentWeather(selectedLocation.lat, selectedLocation.lon, units.temperature, language),
        WeatherAPI.getForecast(selectedLocation.lat, selectedLocation.lon, units.temperature, language),
        WeatherAPI.getAirPollution(selectedLocation.lat, selectedLocation.lon)
      ]);
      
      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setAirPollution(airData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location: WeatherLocation) => {
    setSelectedLocation(location);
    setCurrentLocation(location);
    addToHistory(location);
    setError(null);
  };

  const handleCurrentLocation = () => {
    if (location) {
      fetchCurrentLocation();
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  const toggleUnits = () => {
    setUnits({ temperature: units.temperature === 'metric' ? 'imperial' : 'metric' });
  };

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('app.title')}
          </h1>
          <p className="text-red-600 dark:text-red-400">No internet connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 p-4">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-6">
        {/* Search Bar - Top Center */}
        <div className="flex-1 flex justify-center">
          <SearchBar
            onLocationSelect={handleLocationSelect}
            onCurrentLocation={handleCurrentLocation}
            loading={isLoading}
          />
        </div>
        
        {/* Language/Units Toggle - Top Right */}
        <div className="flex space-x-2 ml-4">
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={toggleUnits}
            className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {units.temperature === 'metric' ? '°C' : '°F'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('app.loading')}</p>
        </div>
      )}

      {/* Main Dashboard Grid */}
      {currentLocation && !isLoading && (
        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-120px)]">
          {/* Location Info Card - Top Left */}
          <LocationInfo 
            location={selectedLocation}
            language={language}
          />

          {/* Current Weather Card - Top Right */}
          {currentWeather && (
            <CurrentWeatherDetails 
              weather={currentWeather}
              units={units.temperature}
              language={language}
            />
          )}

          {/* 5-Day Forecast Card - Bottom Left */}
          {forecast && (
            <FiveDayForecast
              forecast={forecast}
              units={units.temperature}
              language={language}
            />
          )}

          {/* Hourly Forecast Card - Bottom Right */}
          {forecast && (
            <HourlyForecast
              forecast={forecast}
              units={units.temperature}
              language={language}
            />
          )}
        </div>
      )}

      {/* No Location State */}
      {!currentLocation && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-400">
            <p>No location selected</p>
            <p className="mt-2 text-sm">Use the search bar above or the Current Location button</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
