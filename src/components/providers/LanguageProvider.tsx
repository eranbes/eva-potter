'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { translations, type Language } from '@/lib/i18n/translations';

const STORAGE_KEY = 'eva_potter_language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tArray: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') {
      setLanguageState(stored);
      setCookie(STORAGE_KEY, stored);
    }
  }, []);

  // Sync the <html lang> attribute whenever the language changes
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    setCookie(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[language];
      let value = dict[key];

      // Fallback to English if key not found in current language
      if (value === undefined) {
        value = translations.en[key];
      }

      // If still not found, return the key itself
      if (value === undefined) return key;

      // If it's an array (like feedback messages), return a random one
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }

      let result = value as string;

      // Replace params like {name}, {points}, etc.
      if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        }
      }

      return result;
    },
    [language]
  );

  const tArray = useCallback(
    (key: string): string[] => {
      const dict = translations[language];
      const value = dict[key] ?? translations.en[key];
      if (Array.isArray(value)) return value;
      return [];
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tArray }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
