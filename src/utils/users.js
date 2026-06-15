const USERS_KEY = 'sjk_users';
const SESSION_KEY = 'sjk_session';

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function syncSession(patch) {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const session = JSON.parse(raw);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, ...patch }));
  } catch {
    /* ignore */
  }
}

export function getUserByEmail(email) {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function updateUser(email, patch) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return null;

  const updated = { ...users[idx], ...patch };
  users[idx] = updated;
  writeUsers(users);

  const sessionPatch = {};
  if (patch.name !== undefined) sessionPatch.name = patch.name;
  if (patch.email !== undefined) sessionPatch.email = patch.email;
  if (patch.phone !== undefined) sessionPatch.phone = patch.phone;
  if (patch.profilePicture !== undefined) sessionPatch.profilePicture = patch.profilePicture;
  if (Object.keys(sessionPatch).length) syncSession(sessionPatch);

  return updated;
}

export function changePassword(email, currentPassword, newPassword) {
  const user = getUserByEmail(email);
  if (!user || user.password !== currentPassword) return { ok: false, error: 'wrong_current' };
  if (newPassword.length < 8) return { ok: false, error: 'too_short' };
  updateUser(email, { password: newPassword });
  return { ok: true };
}

export function buildSessionFromUser(user) {
  return {
    email: user.email,
    name: user.name,
    phone: user.phone || '',
    role: user.role,
    profilePicture: user.profilePicture || null,
  };
}
