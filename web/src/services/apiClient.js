import { tokenStore } from './tokenStore';
import { refreshToken } from './authService';

const BASE = 'http://localhost:8080/api';

async function request(method, path, body, retry = true) {
  const token = tokenStore.getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry) {
    try {
      const data = await refreshToken();
      tokenStore.setAccessToken(data.accessToken);
      return request(method, path, body, false); // retry once with new token
    } catch {
      tokenStore.forceLogout();
      throw new Error('Sesija je istekla, molimo prijavite se ponovo.');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Greška ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};
