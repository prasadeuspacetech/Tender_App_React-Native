/**
 * Human-readable subscription expiry labels for Settings / status UI.
 */

export const getSubscriptionTimeLeftText = (expiresAtIso) => {
  if (!expiresAtIso) return '';

  const expiry = new Date(expiresAtIso);
  if (Number.isNaN(expiry.getTime())) return '';

  const now = new Date();
  const diffMs = expiry - now;

  if (diffMs <= 0) return '';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes} minutes left`;
};

export const formatSubscriptionExpiryDate = (expiresAtIso, locale = 'en-IN') => {
  if (!expiresAtIso) return '';

  const expiry = new Date(expiresAtIso);
  if (Number.isNaN(expiry.getTime())) return '';

  return expiry.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
