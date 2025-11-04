// Weather API types
export interface WeatherLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface CurrentWeather {
  coord: {
    lat: number;
    lon: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    "1h"?: number;
    "3h"?: number;
  };
  snow?: {
    "1h"?: number;
    "3h"?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  visibility: number;
  pop: number;
  rain?: {
    "3h": number;
  };
  snow?: {
    "3h": number;
  };
  sys: {
    pod: string;
  };
  dt_txt: string;
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface AirPollution {
  coord: {
    lon: number;
    lat: number;
  };
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }>;
}

export interface AQILevel {
  level: number;
  label: string;
  description: string;
  color: string;
}

// Custom hook types
export interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  location: GeolocationPosition | null;
  error: string | null;
  loading: boolean;
}

export interface Units {
  temperature: 'metric' | 'imperial';
  wind: 'kmh' | 'mph';
  pressure: 'hPa' | 'inHg';
}

export interface LocalStorageData<T> {
  value: T;
  timestamp: number;
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface Translations {
  en: Translation;
  ru: Translation;
}

// Component props types
export interface SearchBarProps {
  onLocationSelect: (location: WeatherLocation) => void;
  loading?: boolean;
}

export interface SearchSuggestionsProps {
  suggestions: WeatherLocation[];
  onSelect: (location: WeatherLocation) => void;
  isVisible: boolean;
  loading?: boolean;
}

export interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  units: Units;
  language: 'en' | 'ru';
}

export interface WeatherMetricsProps {
  weather: CurrentWeather;
  units: Units;
  language: 'en' | 'ru';
}

export interface SunCycleProps {
  weather: CurrentWeather;
  language: 'en' | 'ru';
}

export interface ForecastDayCardProps {
  date: Date;
  items: ForecastItem[];
  units: Units;
  language: 'en' | 'ru';
}

export interface ForecastListProps {
  forecast: ForecastData;
  units: Units;
  language: 'en' | 'ru';
}

export interface AQICardProps {
  airPollution: AirPollution | null;
  language: 'en' | 'ru';
}

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  language: 'en' | 'ru';
}

export interface EmptyStateProps {
  message: string;
  language: 'en' | 'ru';
}
