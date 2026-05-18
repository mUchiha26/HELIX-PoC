/* =============================================================
   HELIX PLATFORM — API.JS
   Centralized API client for backend communication
   ============================================================= */

const API_BASE = '/api';

/**
 * Core fetch wrapper with session cookie handling and error routing
 */
async function apiFetch(path, options = {}) {
  const defaults = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };

  const res = await fetch(`${API_BASE}${path}`, { ...defaults, ...options });

  if (res.status === 401) {
    window.location.href = '/login.html';
    return null;
  }

  if (res.status === 403) {
    showToast('Access denied. Insufficient permissions.', 'error');
    return null;
  }

  return await res.json();
}

/**
 * Named HTTP method helpers
 */
const api = {
  get: (path) => apiFetch(path),

  post: (path, body) =>
    apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),

  put: (path, body) =>
    apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: (path) => apiFetch(path, { method: 'DELETE' }),
};

/**
 * Auth API endpoints
 */
const authApi = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),

  logout: () => api.post('/auth/logout', {}),

  me: () => api.get('/auth/me'),
};

/**
 * Dashboard API endpoints
 */
const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
};

/**
 * Alerts API endpoints
 */
const alertsApi = {
  list: (limit = 50, offset = 0) =>
    api.get(`/alerts?limit=${limit}&offset=${offset}`),

  get: (id) => api.get(`/alerts/${id}`),

  updateStatus: (id, status, assignedTo = null) =>
    api.put(`/alerts/${id}/status`, { status, assigned_to: assignedTo }),
};

/**
 * Logs API endpoints
 */
const logsApi = {
  list: (limit = 50, offset = 0) =>
    api.get(`/logs?limit=${limit}&offset=${offset}`),

  get: (id) => api.get(`/logs/${id}`),

  upload: (formData) =>
    apiFetch('/logs/upload', {
      method: 'POST',
      body: formData,
      headers: {},
    }),
};

/**
 * Scanner API endpoints
 */
const scannerApi = {
  scan: (target, port, protocol) =>
    api.post('/scanner/scan', { target, port, protocol }),

  results: () => api.get('/scanner/results'),
};

/**
 * AI Chat API endpoints
 */
const aiApi = {
  chat: (message, alertId = null) =>
    api.post('/ai/chat', { message, alert_id: alertId }),

  history: (alertId = null) =>
    api.get(`/ai/history${alertId ? `?alert_id=${alertId}` : ''}`),
};

/**
 * Admin / User Management API endpoints
 */
const adminApi = {
  list: (limit = 50, offset = 0) =>
    api.get(`/users?limit=${limit}&offset=${offset}`),

  stats: () => api.get('/users/stats'),

  changeRole: (id, role) =>
    api.put(`/users/${id}/role`, { role }),

  toggleActive: (id) =>
    api.post(`/users/${id}/toggle`, {}),

  delete: (id) =>
    api.delete(`/users/${id}`),
};
