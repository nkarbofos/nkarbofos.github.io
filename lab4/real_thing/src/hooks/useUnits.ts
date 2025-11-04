import { useState, useEffect } from 'react';
import type { Units } from '../types/weather';

const DEFAULT_UNITS: Units = {
  temperature: 'metric',
  wind: 'kmh',
  pressure: 'hPa',
};

export function useUnits(): [Units, (units: Partial<Units>) => void] {
  const [units, setUnits] = useState<Units>(() => {
    const stored = localStorage.getItem('weather-units');
    return stored ? JSON.parse(stored) : DEFAULT_UNITS;
  });

  const updateUnits = (newUnits: Partial<Units>) => {
    const updated = { ...units, ...newUnits };
    setUnits(updated);
    localStorage.setItem('weather-units', JSON.stringify(updated));
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', false); // Will be managed by a separate theme hook
  }, []);

  return [units, updateUnits];
}
