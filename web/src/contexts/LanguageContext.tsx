import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../i18n/i18n';

interface LanguageContextType {
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'fr'>(
    (localStorage.getItem('hb_language') as 'en' | 'fr') || 'en'
  );

  const setLanguage = (lang: 'en' | 'fr') => {
    setLanguageState(lang);
    localStorage.setItem('hb_language', lang);
    i18n.changeLanguage(lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
