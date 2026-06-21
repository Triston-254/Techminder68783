import { useEffect } from 'react';
import { SESSION_EXPIRED_EVENT } from '../components/SessionExpiredPrompt';
import {
  getSession,
  isSessionExpired,
  touchSessionActivity,
} from '../utils/sessionActivity';

function throttle(fn, wait) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    }
  };
}

export function useSessionInactivity() {
  useEffect(() => {
    const notifyIfExpired = () => {
      if (!getSession() || !isSessionExpired()) return;
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    };

    notifyIfExpired();

    const intervalId = window.setInterval(notifyIfExpired, 60 * 1000);
    const recordActivity = throttle(() => {
      if (getSession() && !isSessionExpired()) touchSessionActivity();
    }, 30000);

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true });
    });

    return () => {
      window.clearInterval(intervalId);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity);
      });
    };
  }, []);
}
