// Supported app UI languages (Phase 1 — metadata only; picker wired in Phase 2).

export const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGE_CODES = ['en', 'mr'];

/** @type {{ code: string; label: string }[]} */
export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'mr', label: 'मराठी' },
];

export const isSupportedLanguage = (code) =>
  SUPPORTED_LANGUAGE_CODES.includes(code);
