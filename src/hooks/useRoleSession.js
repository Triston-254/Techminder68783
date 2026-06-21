import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSION_EXPIRED_EVENT } from '../components/SessionExpiredPrompt';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getDashboardPath } from '../utils/dashboard';
import { authAPI } from '../utils/api';
import {
  clearSessionStorage,
  isSessionExpired,
  touchSessionActivity,
} from '../utils/sessionActivity';

function readStoredSession() {
  const raw = localStorage.getItem('sjk_session');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('sjk_session');
    return null;
  }
}

export function useRoleSession(expectedRole) {
  const navigate = useNavigate();
  const { page } = useLanguage();
  const { showToast } = useToast();
  const [session, setSession] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [ready, setReady] = useState(false);

  const markExpiredIfNeeded = useCallback((parsed) => {
    if (!isSessionExpired()) return false;
    setSession(parsed);
    setSessionExpired(true);
    setReady(true);
    return true;
  }, []);

  const refresh = useCallback(() => {
    const parsed = readStoredSession();
    if (!parsed) return null;
    if (markExpiredIfNeeded(parsed)) return parsed;
    setSession(parsed);
    setSessionExpired(false);
    return parsed;
  }, [markExpiredIfNeeded]);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const parsed = readStoredSession();
      if (!parsed) {
        navigate('/login', { replace: true });
        return;
      }

      if (markExpiredIfNeeded(parsed)) return;

      try {
        const result = await authAPI.me();
        if (cancelled) return;

        if (!result.success) {
          localStorage.removeItem('sjk_session');
          navigate('/login', { replace: true });
          return;
        }

        const syncedSession = {
          ...parsed,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          phone: result.user.phone || parsed.phone || '',
          profilePicture: result.user.profilePicture || parsed.profilePicture || null,
        };
        localStorage.setItem('sjk_session', JSON.stringify(syncedSession));
        touchSessionActivity();

        if (result.user.role !== expectedRole) {
          navigate(getDashboardPath(result.user.role), { replace: true });
          return;
        }

        setSession(syncedSession);
        setSessionExpired(false);
        setReady(true);
      } catch {
        if (cancelled) return;
        if (parsed.role !== expectedRole) {
          navigate(getDashboardPath(parsed.role), { replace: true });
          return;
        }
        setSession(parsed);
        setSessionExpired(false);
        setReady(true);
        touchSessionActivity();
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, [navigate, expectedRole, markExpiredIfNeeded]);

  useEffect(() => {
    const handleExpired = () => {
      const parsed = readStoredSession();
      if (!parsed) return;
      setSession(parsed);
      setSessionExpired(true);
      setReady(true);
    };

    const handleFocus = () => {
      const parsed = readStoredSession();
      if (parsed && isSessionExpired()) handleExpired();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const logout = async () => {
    await authAPI.logout();
    clearSessionStorage();
    showToast(page.employerLogoutSuccess);
    navigate('/login', { state: { fromLogout: true } });
  };

  return {
    session,
    user: session,
    sessionExpired,
    refresh,
    logout,
    ready,
  };
}
