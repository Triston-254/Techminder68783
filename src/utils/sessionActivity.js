export const SESSION_KEY = 'sjk_session';
export const LAST_ACTIVITY_KEY = 'sjk_last_activity';
export const INACTIVITY_MS = 5 * 60 * 1000;

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function touchSessionActivity() {
  if (!getSession()) return;
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function initSessionActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function isSessionExpired() {
  const session = getSession();
  if (!session) return false;

  const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
  if (!last) return true;

  return Date.now() - last > INACTIVITY_MS;
}

export function clearSessionStorage() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}
