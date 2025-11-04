import { useState } from 'react';

type Language = 'en' | 'ru';

interface I18nHook {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'app.title': 'Weather App',
    'app.loading': 'Loading...',
    'weather.airQuality': 'Air Quality',
  },
  ru: {
    'app.title': 'Погодное Приложение',
    'app.loading': 'Загрузка...',
    'weather.airQuality': 'Качество Воздуха',
  },
};

export function useSimpleI18n(): I18nHook {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'en';
  });

  const t = (key: string): string => {
    const langTranslations = translations[language];
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  const updateLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return {
    language,
    setLanguage: updateLanguage,
    t,
  };
}
