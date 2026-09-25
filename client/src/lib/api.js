/**
 * Everything that talks to the Express API goes through here.
 *
 * In development Vite proxies /api and /uploads to the server on port 4000,
 * and in production the same server hosts the built site — so a relative base
 * URL is correct either way. VITE_API_URL is only needed if the two are
 * deployed to different domains.
 */

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

const TOKEN_KEY = 'dipisha-admin-token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing — the session just will not be remembered */
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  const isFormData = body instanceof FormData;

  if (body && !isFormData) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'Could not reach the server. Is it running on port 4000?',
      0,
    );
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401 && auth) setToken(null);
    throw new ApiError(
      payload?.error ?? `Request failed (${response.status}).`,
      response.status,
    );
  }

  return payload;
}

/* ------------------------------------------------------------------ public */

export const api = {
  content: () => request('/content'),
  project: (slug) => request(`/projects/${encodeURIComponent(slug)}`),
  sendMessage: (body) => request('/messages', { method: 'POST', body }),

  /* -------------------------------------------------------------- auth */
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me', { auth: true }),

  /* ------------------------------------------------------------- admin */
  adminProfile: () => request('/admin/profile', { auth: true }),
  saveProfile: (body) =>
    request('/admin/profile', { method: 'PUT', body, auth: true }),

  adminSections: () => request('/admin/sections', { auth: true }),
  saveSection: (key, body) =>
    request(`/admin/sections/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      body,
      auth: true,
    }),

  list: (table) => request(`/admin/${table}`, { auth: true }),
  create: (table, body) =>
    request(`/admin/${table}`, { method: 'POST', body, auth: true }),
  update: (table, id, body) =>
    request(`/admin/${table}/${id}`, { method: 'PATCH', body, auth: true }),
  remove: (table, id) =>
    request(`/admin/${table}/${id}`, { method: 'DELETE', auth: true }),

  messages: () => request('/admin/inbox/messages', { auth: true }),
  markMessage: (id, read) =>
    request(`/admin/inbox/messages/${id}`, {
      method: 'PATCH',
      body: { read },
      auth: true,
    }),
  deleteMessage: (id) =>
    request(`/admin/inbox/messages/${id}`, { method: 'DELETE', auth: true }),

  /* ------------------------------------------------------------- media */
  media: (folder) =>
    request(`/media${folder ? `?folder=${encodeURIComponent(folder)}` : ''}`, {
      auth: true,
    }),
  upload: (files, folder = 'uploads') => {
    const form = new FormData();
    for (const file of files) form.append('files', file);
    form.append('folder', folder);
    return request('/media', { method: 'POST', body: form, auth: true });
  },
  deleteMedia: (id) => request(`/media/${id}`, { method: 'DELETE', auth: true }),
};
