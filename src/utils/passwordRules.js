export function getPasswordChecks(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password) {
  const checks = getPasswordChecks(password);
  return Object.values(checks).every(Boolean);
}

export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return false;
  }
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (/^\+254/.test(cleaned)) {
    cleaned = '0' + cleaned.slice(4);
  }
  return /^0[17][0-9]{8}$/.test(cleaned);
}
