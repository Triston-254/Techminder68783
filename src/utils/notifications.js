const NOTIFICATIONS_KEY = 'sjk_notifications';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(data));
}

function userKey(email) {
  return email.toLowerCase();
}

function activeNotifications(list) {
  return list.filter((n) => !n.archived);
}

export function getNotifications(email) {
  const all = readAll();
  const list = all[userKey(email)] || [];
  return activeNotifications(list).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getUnreadCount(email) {
  return getNotifications(email).filter((n) => !n.read).length;
}

export function addNotification(email, { title, message, type = 'info' }) {
  const all = readAll();
  const key = userKey(email);
  const list = all[key] || [];
  const notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };
  all[key] = [notification, ...list];
  writeAll(all);
  return notification;
}

export function markAsRead(email, notificationId) {
  const all = readAll();
  const key = userKey(email);
  const list = all[key] || [];
  all[key] = list.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  writeAll(all);
}

export function markAllAsRead(email) {
  const all = readAll();
  const key = userKey(email);
  const list = all[key] || [];
  all[key] = list.map((n) => (n.archived ? n : { ...n, read: true }));
  writeAll(all);
}

const PENDING_WELCOME_KEY = 'sjk_pending_welcome';

export function addWelcomeNotification(email, { title, message }) {
  addNotification(email, { title, message, type: 'welcome' });
}

export function setPendingWelcome({ email, name, role }) {
  sessionStorage.setItem(PENDING_WELCOME_KEY, JSON.stringify({ email, name, role }));
}

export function getPendingWelcome(email) {
  try {
    const raw = sessionStorage.getItem(PENDING_WELCOME_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw);
    if (pending.email?.toLowerCase() !== email.toLowerCase()) return null;
    return pending;
  } catch {
    return null;
  }
}

export function clearPendingWelcome() {
  sessionStorage.removeItem(PENDING_WELCOME_KEY);
}

export function archiveNotification(email, notificationId) {
  const all = readAll();
  const key = userKey(email);
  const list = all[key] || [];
  all[key] = list.map((n) => (
    n.id === notificationId ? { ...n, archived: true, read: true } : n
  ));
  writeAll(all);
}
