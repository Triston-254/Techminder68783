import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getDashboardPath } from '../utils/dashboard';
import { authAPI } from '../utils/api';

export function useRoleSession(expectedRole) {
  const navigate = useNavigate();
  const { page } = useLanguage();
  const { showToast } = useToast();
  const [session, setSession] = useState(null);

  const refresh = () => {
    const raw = localStorage.getItem('sjk_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    setSession(parsed);
    return parsed;
  };

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const raw = localStorage.getItem('sjk_session');
      if (!raw) {
        navigate('/login', { replace: true });
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        localStorage.removeItem('sjk_session');
        navigate('/login', { replace: true });
        return;
      }

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

        if (result.user.role !== expectedRole) {
          navigate(getDashboardPath(result.user.role), { replace: true });
          return;
        }

        setSession(syncedSession);
      } catch {
        if (cancelled) return;
        if (parsed.role !== expectedRole) {
          navigate(getDashboardPath(parsed.role), { replace: true });
          return;
        }
        setSession(parsed);
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, [navigate, expectedRole]);

  const logout = async () => {
    await authAPI.logout();
    localStorage.removeItem('sjk_session');
    showToast(page.employerLogoutSuccess);
    navigate('/login', { state: { fromLogout: true } });
  };

  return { session, refresh, logout, ready: !!session };
}
