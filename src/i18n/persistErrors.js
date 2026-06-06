/**
 * Maps thrown persist/validation messages to translated UI copy.
 * Repository throws stay in English for logs; only user-facing alerts use this.
 */

import i18n from './index';

const MESSAGE_TO_KEY = {
  'Work ID not found. Please complete Work Details first.': 'workIdMissing',
  'Save failed. Please try again.': 'saveFailedGeneric',
  'appendPaymentInstallment: amount_paid must be positive': 'payment.amountMustBePositive',
};

/** Translate a known persist error message; pass through unknown messages as-is. */
export const translatePersistError = (message) => {
  const raw = String(message ?? '').trim();
  if (!raw) {
    return i18n.t('saveFailedGeneric', { ns: 'errors' });
  }

  const key = MESSAGE_TO_KEY[raw];
  if (key) {
    return i18n.t(key, { ns: 'errors' });
  }

  if (__DEV__) {
    console.warn('[i18n] untranslated persist error:', raw);
  }

  return raw;
};
