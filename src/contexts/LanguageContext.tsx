import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations as allTranslations } from '@/data/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translations: Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('agricaptain_language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('agricaptain_language', lang);
    localStorage.setItem('agricaptain_language_selected', 'true');
  };

  const currentTranslations = allTranslations[language] || allTranslations.en;

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      translations: currentTranslations
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
