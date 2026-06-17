import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { isSubscriptionExpired } from '../services/subscriptionService';

/**
 * Poll subscription expiry and invoke onExpired once when it lapses.
 * Matches admin teammate hook behaviour (60s interval).
 */
const useSubscriptionExpiry = (expiresAt, onExpired) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let fired = false;

    const checkExpiry = () => {
      if (!expiresAt) {
        setTimeLeft('');
        setIsExpired(false);
        return;
      }

      const now = new Date();
      const expiry = new Date(expiresAt);

      if (Number.isNaN(expiry.getTime())) {
        setTimeLeft('');
        setIsExpired(false);
        return;
      }

      if (expiry <= now) {
        setIsExpired(true);
        setTimeLeft('Expired');
        if (!fired) {
          fired = true;
          onExpired?.();
        }
        return;
      }

      setIsExpired(false);

      const diffMs = expiry - now;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) setTimeLeft(`${days}d ${hours}h left`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m left`);
      else setTimeLeft(`${minutes} minutes left`);
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000);

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkExpiry();
    });

    return () => {
      clearInterval(interval);
      appStateSub.remove();
    };
  }, [expiresAt, onExpired]);

  return { timeLeft, isExpired };
};

export default useSubscriptionExpiry;
