import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import en from '../locales/en';
import ko from '../locales/ko';

const translations = { en, ko };

const LanguageContext = createContext();

const getFromPath = (path, locale) => {
  return path.split('.').reduce((value, key) => {
    if (value && Object.prototype.hasOwnProperty.call(value, key)) {
      return value[key];
    }
    return null;
  }, locale);
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ko');

  const t = useCallback(
    (path) => {
      const selectedLocale = translations[language] || translations.ko;
      const fallbackLocale = translations.en;
      const value = getFromPath(path, selectedLocale);
      if (value !== null && value !== undefined) {
        return value;
      }
      const fallback = getFromPath(path, fallbackLocale);
      return fallback !== null && fallback !== undefined ? fallback : path;
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      availableLanguages: Object.keys(translations),
    }),
    [language, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
