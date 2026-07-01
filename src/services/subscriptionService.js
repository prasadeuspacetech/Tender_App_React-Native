// src/services/subscriptionService.js
//
// Firebase RTDB subscription activation — admin teammate logic (source of truth).
// Phase 1: service layer only; UI wires in Phase 2 (splash/ActivationScreen.jsx).

import { db, ref, query, orderByChild, equalTo, get } from './firebase';

/** Fixed subscription key length (admin panel). */
export const SUBSCRIPTION_KEY_LENGTH = 16;

/** User-facing mobile input length (10 digits; stored in RTDB as plain 10-digit). */
export const MOBILE_NUMBER_LENGTH = 10;

/** Stable error codes for i18n mapping in Activation UI (Phase 2). */
export const ACTIVATION_ERROR_CODES = {
  INVALID_MOBILE: 'INVALID_MOBILE',
  INVALID_KEY: 'INVALID_KEY',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EXPIRED: 'EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

const USERS_PATH = 'users';

/**
 * Strip non-digits and cap at 10 digits for UI input handling.
 * @param {string} value
 * @returns {string}
 */
export const sanitizeMobileInput = (value) =>
  String(value ?? '').replace(/\D/g, '').slice(0, MOBILE_NUMBER_LENGTH);

/**
 * Uppercase alphanumeric subscription key input (max 16 chars).
 * @param {string} value
 * @returns {string}
 */
export const sanitizeSubscriptionKeyInput = (value) =>
  String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, SUBSCRIPTION_KEY_LENGTH);

/**
 * Normalize mobile for RTDB query.
 * The Admin Panel stores the plain 10-digit mobile number (no country code),
 * so the query value is always the 10-digit local number. A 12-digit
 * 91-prefixed input is still accepted from the UI for convenience, but it is
 * reduced to its 10-digit local form before querying.
 * @param {string} mobile
 * @returns {{ valid: boolean, queryValue?: string, localTen?: string }}
 */
export const normalizeMobileForQuery = (mobile) => {
  const digits = String(mobile ?? '').replace(/\D/g, '');

  if (digits.length === MOBILE_NUMBER_LENGTH) {
    return {
      valid: true,
      localTen: digits,
      queryValue: digits,
    };
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    const localTen = digits.slice(2);
    return {
      valid: true,
      localTen,
      queryValue: localTen,
    };
  }

  return { valid: false };
};

/**
 * @param {string} expiresAtIso
 * @returns {boolean}
 */
export const isSubscriptionExpired = (expiresAtIso) => {
  if (!expiresAtIso) return true;
  const expiry = new Date(expiresAtIso);
  if (Number.isNaN(expiry.getTime())) return true;
  return expiry < new Date();
};

/**
 * @param {string} expiresAtIso
 * @returns {number}
 */
export const calculateDaysLeft = (expiresAtIso) => {
  const expiry = new Date(expiresAtIso);
  const now = new Date();
  const diffMs = expiry - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Client-side input validation before Firebase call.
 * @returns {{ ok: true } | { ok: false, code: string, message: string }}
 */
export const validateActivationInput = (mobile, subscriptionKey) => {
  const mobileNorm = normalizeMobileForQuery(mobile);
  if (!mobileNorm.valid) {
    return {
      ok: false,
      code: ACTIVATION_ERROR_CODES.INVALID_MOBILE,
      message: 'Please enter a valid 10-digit mobile number.',
    };
  }

  const key = sanitizeSubscriptionKeyInput(subscriptionKey);
  if (key.length !== SUBSCRIPTION_KEY_LENGTH) {
    return {
      ok: false,
      code: ACTIVATION_ERROR_CODES.INVALID_KEY,
      message: `Please enter a valid ${SUBSCRIPTION_KEY_LENGTH}-character subscription key.`,
    };
  }

  return { ok: true, mobileQuery: mobileNorm.queryValue, subscriptionKey: key };
};

/**
 * Look up a user by mobile in RTDB (`users`, indexed on `mobile`).
 * @param {string} mobileQueryValue — plain 10-digit, e.g. "9876543210"
 * @returns {Promise<{ userId: string, user: object } | null>}
 */
export const findUserByMobile = async (mobileQueryValue) => {
  const usersRef = ref(db, USERS_PATH);
  const mobileQuery = query(
    usersRef,
    orderByChild('mobile'),
    equalTo(mobileQueryValue),
  );
  const snapshot = await get(mobileQuery);
  const usersData = snapshot.val();

  if (!usersData) return null;

  const userId = Object.keys(usersData)[0];
  return { userId, user: usersData[userId] };
};

/**
 * Activate subscription — mirrors admin handleLogin flow.
 *
 * @param {string} mobile — 10-digit or 91-prefixed mobile
 * @param {string} subscriptionKey — 16-character key
 * @returns {Promise<
 *   | { success: true, userData: object, subscription: object }
 *   | { success: false, code: string, message: string }
 * >}
 */
export const activateSubscription = async (mobile, subscriptionKey) => {
  const inputCheck = validateActivationInput(mobile, subscriptionKey);
  if (!inputCheck.ok) {
    return {
      success: false,
      code: inputCheck.code,
      message: inputCheck.message,
    };
  }

  try {
    const found = await findUserByMobile(inputCheck.mobileQuery);
    if (!found) {
      return {
        success: false,
        code: ACTIVATION_ERROR_CODES.USER_NOT_FOUND,
        message: 'No account found with this mobile number.',
      };
    }

    const { userId, user } = found;
    const subscription = user.subscription;

    if (!subscription || subscription.key !== inputCheck.subscriptionKey) {
      return {
        success: false,
        code: ACTIVATION_ERROR_CODES.INVALID_KEY,
        message: 'Invalid subscription key.',
      };
    }

    if (isSubscriptionExpired(subscription.expiresAt)) {
      return {
        success: false,
        code: ACTIVATION_ERROR_CODES.EXPIRED,
        message: 'Subscription has expired.',
      };
    }

    const daysLeft = calculateDaysLeft(subscription.expiresAt);

    return {
      success: true,
      userData: {
        id: userId,
        name: user.name || 'User',
        mobile: user.mobile,
        email: user.email || '',
      },
      subscription: {
        key: subscription.key,
        expiresAt: subscription.expiresAt,
        daysLeft,
        durationValue: subscription.durationValue ?? null,
        durationUnit: subscription.durationUnit ?? null,
      },
    };
  } catch (error) {
    console.error('[subscriptionService] activateSubscription failed:', error);
    return {
      success: false,
      code: ACTIVATION_ERROR_CODES.NETWORK_ERROR,
      message: 'Network error. Please try again.',
    };
  }
};
