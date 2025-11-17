import axios from 'axios';
import { getApiBaseUrl } from '@/lib/apiConfig';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role: number;
}

interface UpdateUserPayload {
  email?: string;
  password?: string;
  name?: string;
  role?: number | string;
}

interface AuthResponse {
  role?: number;
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  id?: string;
  has_onboarded?: boolean;
}

const API_URL = getApiBaseUrl();

export const authService = {
  // ---------------- LOGIN ----------------
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response.data;

      const token = data.token || data.access_token || null;
      if (token) localStorage.setItem('token', token);

      // Notify app that auth state changed
      try { window.dispatchEvent(new Event('authChange')); } catch (e) { /* for build */ }

      const id = String(data.id || data.user?.id || '');
      const role = Number(data.role ?? data.user?.role ?? 0);
      const has_onboarded = Boolean(data.has_onboarded ?? false);

      if (id) localStorage.setItem('userId', id);
      localStorage.setItem('role', String(role));
      if (data?.user?.name) localStorage.setItem('username', data.user.name);

      return {
        success: true,
        token,
        id,
        role,
        user: data.user,
        has_onboarded, // <-- return to frontend
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error occurred',
      };
    }
  },

  // ---------------- REGISTER ----------------
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Send password to backend (do not hash on client)
      const payload = {
        ...credentials,
        password: credentials.password,
        role: Number(credentials.role),
      };

      const response = await axios.post(`${API_URL}/auth/register`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response.data;

      const token = data.token || data.access_token || null;
      if (token) localStorage.setItem('token', token);

      const id = String(data.id || data.user?.id || '');
      const role = Number(data.role ?? data.user?.role ?? 0);

      try { window.dispatchEvent(new Event('authChange')); } catch (e) { /* noop */ }

      return {
        success: true,
        token,
        id,
        role,
        user: data.user,
      };
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error occurred',
      };
    }
  },

  // ---------------- LOGOUT ----------------
  logout() {
    localStorage.clear();
    // Notify app that auth state changed
    try { window.dispatchEvent(new Event('authChange')); } catch (e) { /* noop */ }
  },

  // ---------------- HELPERS ----------------
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getRole() {
    const r = localStorage.getItem('role');
    if (!r) return null;
    const n = Number(r);
    return Number.isNaN(n) ? null : n;
  },

  // ---------------- FETCH USER ----------------
  async fetchUserById(id: string): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await axios.get(`${API_URL}/auth/${encodeURIComponent(id)}`, {
      headers,
    });

    return response.data;
  },

  async updateUser(id: string, updates: UpdateUserPayload): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await axios.put(
      `${API_URL}/auth/${encodeURIComponent(id)}`,
      updates,
      { 
        headers 
      },
    );

    const data = response.data;
    const updatedUser = data?.user ?? data;

    if (updatedUser?.id) {
      localStorage.setItem('userId', String(updatedUser.id));
      localStorage.setItem('role', String(updatedUser.role ?? localStorage.getItem('role') ?? ''));
      if (updatedUser.name) localStorage.setItem('username', updatedUser.name);
    }

    if (data?.token || data?.access_token) {
      localStorage.setItem('token', data.token || data.access_token);
    }

    // Notify app that auth state changed
    try { window.dispatchEvent(new Event('authChange')); } catch (e) { /* noop */ }

    return data;
  },
};
