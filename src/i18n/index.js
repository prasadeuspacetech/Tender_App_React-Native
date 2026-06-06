// i18n bootstrap — UI translation only; SQLite / user data stay untranslated.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE, isSupportedLanguage } from './languages';
import { resolveInitialLanguage, saveLanguage } from './storage';

import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enCorrespondence from './locales/en/correspondence.json';
import enDashboard from './locales/en/dashboard.json';
import enNavigation from './locales/en/navigation.json';
import enReports from './locales/en/reports.json';
import enSettings from './locales/en/settings.json';
import enWorks from './locales/en/works.json';
import enWorkflow from './locales/en/workflow.json';
import enErrors from './locales/en/errors.json';
import enHelp from './locales/en/help.json';
import mrAuth from './locales/mr/auth.json';
import mrCommon from './locales/mr/common.json';
import mrCorrespondence from './locales/mr/correspondence.json';
import mrDashboard from './locales/mr/dashboard.json';
import mrNavigation from './locales/mr/navigation.json';
import mrReports from './locales/mr/reports.json';
import mrSettings from './locales/mr/settings.json';
import mrWorks from './locales/mr/works.json';
import mrWorkflow from './locales/mr/workflow.json';
import mrErrors from './locales/mr/errors.json';
import mrHelp from './locales/mr/help.json';

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    settings: enSettings,
    dashboard: enDashboard,
    works: enWorks,
    reports: enReports,
    correspondence: enCorrespondence,
    auth: enAuth,
    workflow: enWorkflow,
    errors: enErrors,
    help: enHelp,
  },
  mr: {
    common: mrCommon,
    navigation: mrNavigation,
    settings: mrSettings,
    dashboard: mrDashboard,
    works: mrWorks,
    reports: mrReports,
    correspondence: mrCorrespondence,
    auth: mrAuth,
    workflow: mrWorkflow,
    errors: mrErrors,
    help: mrHelp,
  },
};

const NAMESPACES = [
  'common',
  'navigation',
  'settings',
  'dashboard',
  'works',
  'reports',
  'correspondence',
  'auth',
  'workflow',
  'errors',
  'help',
];

let initPromise = null;

/**
 * Initialize i18next before first render.
 * First launch always defaults to English unless user saved a preference.
 */
export const initI18n = async () => {
  if (i18n.isInitialized) return i18n;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const lng = await resolveInitialLanguage();

    await i18n.use(initReactI18next).init({
      resources,
      lng,
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS: 'common',
      ns: NAMESPACES,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      compatibilityJSON: 'v4',
      saveMissing: __DEV__,
      missingKeyHandler: __DEV__
        ? (lngs, ns, key) => {
            console.warn(`[i18n] missing key: ${ns}:${key} (lng: ${lngs.join(',')})`);
          }
        : undefined,
    });

    if (__DEV__) {
      console.log('[i18n] ready — language:', i18n.language);
    }

    return i18n;
  })();

  return initPromise;
};

/** Change UI language and persist (Settings picker). */
export const changeAppLanguage = async (language) => {
  if (!isSupportedLanguage(language)) return;
  await i18n.changeLanguage(language);
  await saveLanguage(language);
};

export { saveLanguage, resolveInitialLanguage };
export { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS, SUPPORTED_LANGUAGE_CODES } from './languages';
export default i18n;
