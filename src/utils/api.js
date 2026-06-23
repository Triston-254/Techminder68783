function getApiBase() {
  const configuredBase = process.env.REACT_APP_API_URL?.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return configuredBase || 'http://localhost:8000';
    }

    return configuredBase || '/api';
  }

  return configuredBase || '/api';
}

export { getApiBase };
export const API_BASE = getApiBase();

function requestHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (getApiBase().includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) {
    throw new Error(`Backend returned an empty response (${response.status}). Check that InfinityFree hosting is online.`);
  }

  // Many proxy/rewrite failures return HTML pages; avoid masking them as generic JSON errors.
  const contentType = response.headers?.get?.('content-type') || '';
  const looksLikeHtml = text.trimStart().startsWith('<') || contentType.includes('text/html');

  // Helpful debug details to show the *actual* response coming back.
  // (This makes it obvious if the request is hitting an HTML 404/403 page.)
  const debugDetails = {
    status: response.status,
    url: response.url,
    contentType,
  };


  try {
    const data = JSON.parse(text);
    if (data?.message === 'Server error' && data?.errorMessage) {
      data.message = data.errorMessage;
    }
    return data;
  } catch (e) {
    const preview = text.replace(/\s+/g, ' ').trim().slice(0, 220);
    if (looksLikeHtml) {
      throw new Error(
        `Backend returned HTML instead of JSON (${response.status}). ` +
          `This usually means your /api rewrite is routing to the frontend (or a 404/403 page). ` +
          `Preview: ${preview}`
      );
    }

    throw new Error(
      `Invalid backend response (${response.status}). ${e instanceof Error ? e.message : 'Unknown parse error'}: ${preview}`
    );
  }
}


export async function apiRequest(endpoint, data) {
  const response = await fetch(`${getApiBase()}/auth.php?action=${endpoint}`, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify({ action: endpoint, ...data }),
  });
  return parseResponse(response);
}

async function jobsRequest(action, data = {}) {
  // backend/jobs.php only allows POST. Ensure we always send POST.
  const response = await fetch(`${getApiBase()}/jobs.php?action=${action}`, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify({ action, ...data }),
  });

  return parseResponse(response);
}


async function notificationsRequest(action, data = {}) {
  const response = await fetch(`${getApiBase()}/notifications.php?action=${action}`, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify({ action, ...data }),
  });
  return parseResponse(response);
}

async function adminRequest(action, data = {}) {
  const response = await fetch(`${getApiBase()}/admin.php?action=${action}`, {
    method: 'POST',
    headers: requestHeaders(),
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

export const adminAPI = {
  stats: () => adminRequest('stats', {}),
  listUsers: (data = {}) => adminRequest('list_users', data),
  listJobs: (data = {}) => adminRequest('list_jobs', data),
  listApplications: (data = {}) => adminRequest('list_applications', data),
  listContactMessages: (data = {}) => adminRequest('list_contact_messages', data),
  updateContactMessageStatus: (data) => adminRequest('update_contact_message_status', data),
  deleteContactMessage: (id) => adminRequest('delete_contact_message', { id }),
  getJob: (jobId) => adminRequest('get_job', { jobId }),
  getJobApplicants: (jobId) => adminRequest('get_job_applicants', { jobId }),
  sendNotification: (data) => adminRequest('send_notification', data),
  updateUser: (data) => adminRequest('update_user', data),
  deleteUser: (id) => adminRequest('delete_user', { id }),
  manageUser: (data) => adminRequest('manage_user', data),
};

export const adminJobsAPI = {
  closeJob: (data) => fetch(`${getApiBase()}/admin_job_actions.php?action=admin_close_job`, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(parseResponse),
};

async function subscriptionsRequest(action, data = {}) {
  const response = await fetch(`${getApiBase()}/subscriptions.php?action=${action}`, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify({ action, ...data }),
  });
  return parseResponse(response);
}

export const subscriptionsAPI = {
  subscribe: (email) => subscriptionsRequest('subscribe', { email }),
};

async function chatRequest(action, data = {}) {
  const response = await fetch(`${getApiBase()}/chat.php?action=${action}`, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify({ action, ...data }),
  });
  return parseResponse(response);
}

export const chatAPI = {
  send: (data) => chatRequest('send', data),
  context: () => chatRequest('context', {}),
};

async function contactRequest(action, data = {}) {
  const response = await fetch(`${getApiBase()}/contact.php?action=${action}`, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify({ action, ...data }),
  });
  return parseResponse(response);
}

export const contactAPI = {
  sendMessage: (data) => contactRequest('send_message', data),
};
