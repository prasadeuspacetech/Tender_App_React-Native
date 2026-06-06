// Persists user-selected UI language (not SQLite — app preference only).

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
} from './languages';

export const LANGUAGE_STORAGE_KEY = '@tender_app/language';

/**
 * Returns saved language code, or null when none stored.
 * Callers default to DEFAULT_LANGUAGE ('en') — never device locale on first launch.
 */
export const getStoredLanguage = async () => {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (value && isSupportedLanguage(value)) return value;
  } catch (error) {
    console.warn('[i18n] getStoredLanguage failed:', error);
  }
  return null;
};

/** @param {string} language — 'en' | 'mr' */
export const saveLanguage = async (language) => {
  if (!isSupportedLanguage(language)) return;
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('[i18n] saveLanguage failed:', error);
  }
};

/** Resolved language for i18next bootstrap: stored preference or English. */
export const resolveInitialLanguage = async () => {
  const stored = await getStoredLanguage();
  return stored ?? DEFAULT_LANGUAGE;
};
