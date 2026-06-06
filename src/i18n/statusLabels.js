// Display-only status labels — DB values (Pending, In Progress, etc.) stay unchanged.

import { useTranslation } from 'react-i18next';
import i18n from './index';

const FALLBACK = {
  all: 'All',
  pending: 'Pending',
  progress: 'Progress',
  completed: 'Completed',
};

const statusTranslationKey = (statusKey) => `status.${statusKey}`;

const fallbackLabel = (statusKey) =>
  FALLBACK[statusKey] ?? FALLBACK.pending;

/** Non-React callers only — prefer useStatusLabel in components. */
export const getStatusLabel = (statusKey) =>
  i18n.t(statusTranslationKey(statusKey), {
    ns: 'common',
    defaultValue: fallbackLabel(statusKey),
  });

/** Reactive status label for UI — re-renders when language changes. */
export const useStatusLabel = (statusKey) => {
  const { t } = useTranslation('common');
  return t(statusTranslationKey(statusKey), {
    defaultValue: fallbackLabel(statusKey),
  });
};
