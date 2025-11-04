import { useState, useEffect } from 'react';
import { WeatherAPI } from '../services/weather';
import type { CurrentWeather, ForecastData, AirPollution, WeatherLocation } from '../types/weather';

interface WeatherState {
  current: CurrentWeather | null;
  forecast: ForecastData | null;
  airPollution: AirPollution | null;
  loading: boolean;
  error: string | null;
}

export function useWeather(
  location: WeatherLocation | null,
  units: 'metric' | 'imperial' = 'metric',
  language: 'en' | 'ru' = 'en'
): WeatherState {
  const [state, setState] = useState<WeatherState>({
    current: null,
    forecast: null,
    airPollution: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!location) {
      setState({
        current: null,
        forecast: null,
        airPollution: null,
        loading: false,
        error: null,
      });
      return;
    }

    const fetchWeatherData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const [current, forecast, airPollution] = await Promise.all([
          WeatherAPI.getCurrentWeather(location.lat, location.lon, units, language),
          WeatherAPI.getForecast(location.lat, location.lon, units, language),
          WeatherAPI.getAirPollution(location.lat, location.lon),
        ]);

        setState({
          current,
          forecast,
          airPollution,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        }));
      }
    };

    fetchWeatherData();
  }, [location, units, language]);

  return state;
}
