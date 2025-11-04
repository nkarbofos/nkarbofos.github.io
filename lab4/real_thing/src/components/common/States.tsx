import React from 'react';
import type { LoaderProps, ErrorStateProps, EmptyStateProps } from '../../types/weather';

export function Loader({ size = 'md', text }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}></div>
      {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry, language }: ErrorStateProps) {
  const translations = {
    en: { retry: 'Retry', error: 'Error' },
    ru: { retry: 'Повторить', error: 'Ошибка' }
  };

  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t.error}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="btn-primary"
        >
          {t.retry}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message, language }: EmptyStateProps) {
  const translations = {
    en: { empty: 'No data available' },
    ru: { empty: 'Нет данных' }
  };

  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t.empty}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{message}</p>
    </div>
  );
}
