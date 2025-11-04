import { useState, useEffect } from 'react';
import type { WeatherLocation } from '../types/weather';

interface HistoryHook {
  history: WeatherLocation[];
  addToHistory: (location: WeatherLocation) => void;
  clearHistory: () => void;
}

const HISTORY_KEY = 'weather-history';
const MAX_HISTORY_ITEMS = 10;

export function useHistory(): HistoryHook {
  const [history, setHistory] = useState<WeatherLocation[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const addToHistory = (location: WeatherLocation) => {
    setHistory(prevHistory => {
      // Create a unique key for comparison
      const locationKey = `${location.name}-${location.lat}-${location.lon}-${location.country}`;
      // Remove if already exists
      const filtered = prevHistory.filter(item => {
        const itemKey = `${item.name}-${item.lat}-${item.lon}-${item.country}`;
        return itemKey !== locationKey;
      });
      // Add to beginning
      const newHistory = [location, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      // Store in localStorage
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return { history, addToHistory, clearHistory };
}
