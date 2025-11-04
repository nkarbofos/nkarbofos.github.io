import React, { useState, useEffect } from 'react';
import { WeatherAPI } from '../../services/weather';
import type { WeatherLocation } from '../../types/weather';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBarProps {
  onLocationSelect: (location: WeatherLocation) => void;
  onCurrentLocation: () => void;
  loading?: boolean;
}

export function SearchBar({ onLocationSelect, onCurrentLocation, loading = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<WeatherLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      searchCities(debouncedQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  const searchCities = async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) return;
    
    setIsLoading(true);
    try {
      const results = await WeatherAPI.geocodeCity(searchQuery);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to search cities:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (location: WeatherLocation) => {
    setQuery(`${location.name}, ${location.country}`);
    setShowSuggestions(false);
    onLocationSelect(location);
  };

  const handleCurrentLocation = () => {
    setQuery('');
    setShowSuggestions(false);
    onCurrentLocation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a city..."
            className="w-full px-4 py-3 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-l-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     placeholder-gray-500 dark:placeholder-gray-400"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
            </div>
          )}
        </div>
        <button
          onClick={handleCurrentLocation}
          disabled={loading}
          className="px-4 py-3 text-sm bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                   border-l-0 border-gray-300 dark:border-gray-600"
        >
          Current Location
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 
                       border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((location, index) => (
            <button
              key={index}
              onClick={() => handleSelectLocation(location)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 
                       transition-colors duration-150 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
            >
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {location.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {location.state ? `${location.state}, ` : ''}{location.country}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
