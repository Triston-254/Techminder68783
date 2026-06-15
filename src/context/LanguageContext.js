import { createContext, useContext, useMemo, useState } from 'react';
import { content } from '../content';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const page = useMemo(() => content[lang], [lang]);

  const value = useMemo(() => ({ lang, setLang, page }), [lang, page]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
