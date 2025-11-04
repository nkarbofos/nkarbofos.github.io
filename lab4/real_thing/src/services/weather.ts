import type { 
  WeatherLocation, 
  CurrentWeather, 
  ForecastData, 
  AirPollution 
} from '../types/weather';

const API_KEY = import.meta.env.VITE_OWM_API_KEY;
const BASE_URL = 'https://api.openweathermap.org';

if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
  console.warn('Please set VITE_OWM_API_KEY environment variable with your OpenWeatherMap API key');
}

export class WeatherAPI {
  private static async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key is invalid or missing');
        }
        if (response.status === 404) {
          throw new Error('Location not found');
        }
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again later');
        }
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async geocodeCity(cityName: string): Promise<WeatherLocation[]> {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${API_KEY}`;
    return this.fetchWithErrorHandling<WeatherLocation[]>(url);
  }

  static async reverseGeocode(lat: number, lon: number): Promise<WeatherLocation[]> {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    const url = `${BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    return this.fetchWithErrorHandling<WeatherLocation[]>(url);
  }

  static async getCurrentWeather(
    lat: number, 
    lon: number, 
    units: 'metric' | 'imperial' = 'metric',
    lang: 'en' | 'ru' = 'en'
  ): Promise<CurrentWeather> {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${API_KEY}`;
    return this.fetchWithErrorHandling<CurrentWeather>(url);
  }

  static async getForecast(
    lat: number, 
    lon: number, 
    units: 'metric' | 'imperial' = 'metric',
    lang: 'en' | 'ru' = 'en'
  ): Promise<ForecastData> {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${API_KEY}`;
    return this.fetchWithErrorHandling<ForecastData>(url);
  }

  static async getAirPollution(lat: number, lon: number): Promise<AirPollution> {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    const url = `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    return this.fetchWithErrorHandling<AirPollution>(url);
  }

  static getWeatherIconUrl(iconCode: string, size: '2x' | '4x' = '2x'): string {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  }

  static formatTemperature(temp: number, units: 'metric' | 'imperial'): string {
    const symbol = units === 'metric' ? '°C' : '°F';
    return `${Math.round(temp)}${symbol}`;
  }

  static formatWindSpeed(speed: number, units: 'metric' | 'imperial'): string {
    const unit = units === 'metric' ? 'km/h' : 'mph';
    return `${Math.round(speed)} ${unit}`;
  }

  static formatPressure(pressure: number): string {
    return `${Math.round(pressure)} hPa`;
  }

  static formatHumidity(humidity: number): string {
    return `${Math.round(humidity)}%`;
  }

  static formatVisibility(visibility: number): string {
    const km = (visibility / 1000).toFixed(1);
    return `${km} km`;
  }

  static formatDateTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static getAQIMeasurement(aqi: number) {
    const levels = {
      1: { label: 'Good', description: 'Air quality is satisfactory', color: 'text-green-500' },
      2: { label: 'Fair', description: 'Air quality is acceptable', color: 'text-yellow-500' },
      3: { label: 'Moderate', description: 'Air quality is acceptable', color: 'text-orange-500' },
      4: { label: 'Poor', description: 'Air quality is poor', color: 'text-red-500' },
      5: { label: 'Very Poor', description: 'Air quality is very poor', color: 'text-purple-500' }
    };
    
    return levels[aqi as keyof typeof levels] || levels[1];
  }
}
