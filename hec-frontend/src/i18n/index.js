import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import commonEN from './locales/en/common.json';
import projectsEN from './locales/en/projects.json';
import interviewsEN from './locales/en/interviews.json';
import reclamationsEN from './locales/en/reclamations.json';
import homeEN from './locales/en/home.json';
import aboutEN from './locales/en/about.json';
import contactEN from './locales/en/contact.json';

import commonFR from './locales/fr/common.json';
import projectsFR from './locales/fr/projects.json';
import interviewsFR from './locales/fr/interviews.json';
import reclamationsFR from './locales/fr/reclamations.json';
import homeFR from './locales/fr/home.json';
import aboutFR from './locales/fr/about.json';
import contactFR from './locales/fr/contact.json';

// Resources object containing all translations
const resources = {
  en: {
    common: commonEN,
    projects: projectsEN,
    interviews: interviewsEN,
    reclamations: reclamationsEN,
    home: homeEN,
    about: aboutEN,
    contact: contactEN
  },
  fr: {
    common: commonFR,
    projects: projectsFR,
    interviews: interviewsFR,
    reclamations: reclamationsFR,
    home: homeFR,
    about: aboutFR,
    contact: contactFR
  }
};

i18n
  // Load translations using http backend for production
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Common namespace used around the full app
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: true,
    },
  });

export default i18n;
