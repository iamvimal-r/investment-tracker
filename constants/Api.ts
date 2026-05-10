/**
 * API client using native fetch – no axios dependency needed.
 * Replace with axios once 'npm install axios' is run.
 */
import { Storage } from '../services/storage';

// Reads from .env → EXPO_PUBLIC_API_URL (set that file and restart the bundler)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

async function getHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await Storage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    await Storage.removeItem('auth_token');
    await Storage.removeItem('auth_user');
  }
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || body.message || detail;
    } catch { }
    const err: any = new Error(detail);
    err.response = { status: res.status, data: { detail } };
    throw err;
  }
  return res.json();
}

const api = {
  async get(path: string, params?: Record<string, string>) {
    try {
      const url = new URL(API_BASE_URL + path);
      if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      const res = await fetch(url.toString(), { headers: await getHeaders() });
      return { data: await handleResponse(res) };
    } catch (err: any) {
      if (!err.response) err.isNetworkError = true;
      throw err;
    }
  },

  async post(path: string, body?: any, extraHeaders?: Record<string, string>) {
    try {
      const isForm = extraHeaders?.['Content-Type']?.includes('x-www-form-urlencoded');
      const res = await fetch(API_BASE_URL + path, {
        method: 'POST',
        headers: await getHeaders(extraHeaders || {}),
        body: isForm ? body : JSON.stringify(body),
      });
      return { data: await handleResponse(res) };
    } catch (err: any) {
      if (!err.response) err.isNetworkError = true;
      throw err;
    }
  },

  async put(path: string, body?: any) {
    try {
      const res = await fetch(API_BASE_URL + path, {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(body),
      });
      return { data: await handleResponse(res) };
    } catch (err: any) {
      if (!err.response) err.isNetworkError = true;
      throw err;
    }
  },

  async delete(path: string) {
    try {
      const res = await fetch(API_BASE_URL + path, {
        method: 'DELETE',
        headers: await getHeaders(),
      });
      if (!res.ok && res.status !== 204) await handleResponse(res);
      return {};
    } catch (err: any) {
      if (!err.response) err.isNetworkError = true;
      throw err;
    }
  },
};

export default api;
