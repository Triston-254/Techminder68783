const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

async function parseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || `Request failed (${response.status})`);
  }
}

export async function apiRequest(endpoint, data) {
  const response = await fetch(`${API_BASE}/auth.php?action=${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action: endpoint, ...data }),
  });
  return parseResponse(response);
}

async function jobsRequest(action, data = {}) {
  const response = await fetch(`${API_BASE}/jobs.php?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action, ...data }),
  });
  return parseResponse(response);
}

async function notificationsRequest(action, data = {}) {
  const response = await fetch(`${API_BASE}/notifications.php?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action, ...data }),
  });
  return parseResponse(response);
}

export const authAPI = {
  signup: (data) => apiRequest('signup', data),
  login: (data) => apiRequest('login', data),
  me: () => apiRequest('me', {}),
  requestPasswordReset: (data) => apiRequest('request_password_reset', data),
  resetPassword: (data) => apiRequest('reset_password', data),
  logout: () => apiRequest('logout', {}),
  updateProfile: (data) => apiRequest('update_profile', data),
  changePassword: (data) => apiRequest('change_password', data),
};

export const jobsAPI = {
  list: () => jobsRequest('list'),
  get: (id) => jobsRequest('get', { id }),
  myJobs: () => jobsRequest('my_jobs'),
  create: (data) => jobsRequest('create', data),
  update: (data) => jobsRequest('update', data),
  close: (id) => jobsRequest('close', { id }),
  delete: (id) => jobsRequest('delete', { id }),
  stats: () => jobsRequest('stats'),
  react: (data) => jobsRequest('react', data),
  toggleSave: (id) => jobsRequest('toggle_save', { id }),
  savedJobs: () => jobsRequest('saved_jobs'),
  apply: (data) => jobsRequest('apply', data),
  myApplications: () => jobsRequest('my_applications'),
  jobApplicants: (jobId) => jobsRequest('job_applicants', { jobId }),
  updateApplicationStatus: (data) => jobsRequest('update_application_status', data),
  withdrawApplication: (id) => jobsRequest('withdraw_application', { id }),
};

export const notificationsAPI = {
  list: () => notificationsRequest('list'),
  markRead: (id) => notificationsRequest('mark_read', { id }),
  markAllRead: () => notificationsRequest('mark_all_read'),
  archive: (id) => notificationsRequest('archive', { id }),
};

async function subscriptionsRequest(action, data = {}) {
  const response = await fetch(`${API_BASE}/subscriptions.php?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action, ...data }),
  });
  return parseResponse(response);
}

export const subscriptionsAPI = {
  subscribe: (email) => subscriptionsRequest('subscribe', { email }),
};
