
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

interface AuthResponse {
  role?: number;
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  id?: string;
  has_onboarded?: boolean;
}

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  // ---------------- LOGIN ----------------
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed',
        };
      }

      const token = data.token || data.access_token || null;
      if (token) localStorage.setItem('token', token);

      // Notify app that auth state changed
      try { window.dispatchEvent(new Event('authChange')); } catch (e) { /* for build */ }

      const id = String(data.id || data.user?.id || '');
      const role = Number(data.role ?? data.user?.role ?? 0);
      const has_onboarded = Boolean(data.has_onboarded ?? false); // <-- extract from backend

      if (id) localStorage.setItem('userId', id);
      localStorage.setItem('role', String(role));

      return {
        success: true,
        token,
        id,
        role,
        user: data.user,
        has_onboarded, // <-- return to frontend
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error occurred',
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

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Registration failed',
        };
      }

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
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Network error occurred',
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

    const res = await fetch(`${API_URL}/auth/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) throw new Error(`Failed to fetch user ${id}: HTTP ${res.status}`);

    return await res.json();
  },
};
