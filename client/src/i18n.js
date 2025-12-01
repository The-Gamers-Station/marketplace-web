import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Don't force a language, let the detector handle it
    supportedLngs: ['ar', 'en'],
    fallbackLng: 'ar', // Arabic as default
    debug: false,
    
    // Detection options - check localStorage first
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18nextLng',
      checkWhitelist: true,
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
      // Add request caching
      requestOptions: {
        cache: 'default',
      },
      // Add reload strategy
      reloadInterval: false,
      allowMultiLoading: false,
      crossDomain: false,
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
      // Add format caching
      skipOnVariables: false,
    },
    
    // Set default namespace
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Performance optimizations
    load: 'languageOnly', // Don't load country-specific variations
    cleanCode: true,
    nonExplicitSupportedLngs: false,
    
    // React optimizations
    react: {
      useSuspense: true, // Enable suspense for better loading
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
    
    // Cache settings
    partialBundledLanguages: true,
    simplifyPluralSuffix: true,
    postProcess: false,
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;