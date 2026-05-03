import { Storage } from './storage';
import api from '../constants/Api';

export interface User {
  email: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', { username, email, password });
    await Storage.setItem(TOKEN_KEY, data.access_token);
    await Storage.setItem(USER_KEY, JSON.stringify({ email, username }));
    return data;
  },

  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    const formBody = `username=${encodeURIComponent(emailOrUsername)}&password=${encodeURIComponent(password)}`;
    const { data } = await api.post('/auth/login', formBody, {
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    await Storage.setItem(TOKEN_KEY, data.access_token);
    await Storage.setItem(USER_KEY, JSON.stringify({ email: emailOrUsername, username: emailOrUsername }));
    return data;
  },

  async logout(): Promise<void> {
    await Storage.removeItem(TOKEN_KEY);
    await Storage.removeItem(USER_KEY);
  },

  async getToken(): Promise<string | null> {
    return Storage.getItem(TOKEN_KEY);
  },

  async getUser(): Promise<User | null> {
    try {
      const raw = await Storage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await Storage.getItem(TOKEN_KEY);
    return !!token;
  },
};
