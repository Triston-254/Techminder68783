const ALLOWED_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name', 'pro',
  'io', 'co', 'uk', 'us', 'au', 'ca', 'de', 'fr', 'in', 'za', 'ng', 'gh', 'tz', 'ug', 'rw',
  'me', 'tv', 'cc', 'xyz', 'online', 'site', 'store', 'tech', 'app', 'dev', 'cloud',
  'ke', 'co.ke', 'ac.ke', 'go.ke', 'ne.ke', 'or.ke', 'sc.ke', 'me.ke',
  'co.za', 'co.ng', 'co.tz', 'co.ug',
]);

const INCOMPLETE_TLD_PREFIXES = new Set(['c', 'co', 'or', 'ne', 'ed', 'go', 'in']);

function parseEmail(value) {
  if (!value || typeof value !== 'string') return null;

  const email = value.trim();
  if (!email || email.includes(' ')) return null;

  const at = email.lastIndexOf('@');
  if (at <= 0 || at !== email.indexOf('@')) return null;

  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();

  if (!local || !domain) return null;
  if (!/^[a-zA-Z0-9._%+-]+$/.test(local) || local.length > 64) return null;
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return null;
  if (!/^[a-z0-9.-]+$/.test(domain)) return null;

  const labels = domain.split('.');
  for (const label of labels) {
    if (!label || label.length > 63) return null;
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)) return null;
  }

  return { local, domain, labels };
}

function getRegisteredTld(labels) {
  if (labels.length >= 2) {
    const compound = `${labels[labels.length - 2]}.${labels[labels.length - 1]}`;
    if (ALLOWED_TLDS.has(compound)) return compound;
  }

  const single = labels[labels.length - 1];
  if (ALLOWED_TLDS.has(single)) return single;

  return null;
}

export function shouldDeferValidCheck(value) {
  const parsed = parseEmail(value);
  if (!parsed) return true;

  const lastLabel = parsed.labels[parsed.labels.length - 1];
  if (INCOMPLETE_TLD_PREFIXES.has(lastLabel)) return true;

  return !getRegisteredTld(parsed.labels);
}

export function isValidEmail(value) {
  const parsed = parseEmail(value);
  if (!parsed) return false;

  const registeredTld = getRegisteredTld(parsed.labels);
  if (!registeredTld) return false;

  const tldLabels = registeredTld.split('.').length;
  const hostnameLabels = parsed.labels.slice(0, parsed.labels.length - tldLabels);
  if (hostnameLabels.length < 1) return false;

  return true;
}

export function hasEmailInput(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
