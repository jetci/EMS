// Centralized API client using Vite env with fallbacks
// Priority:
// 1) window.__API_BASE__ (set in main.tsx) for browser runtime
// 2) Vite env: import.meta.env.VITE_API_BASE_URL (for SSR/test when window not available)
// 3) Default: /api (via Vite proxy to backend)

import { PaginatedResponse, PaginationParams, buildPaginationQuery } from '../types/pagination';

const getApiBaseUrl = (): string => {
  // Try to read Vite env safely without direct import.meta (which breaks in Jest/CJS)
  let viteBaseUrl: string | undefined;
  try {
    // eslint-disable-next-line no-eval
    viteBaseUrl =
      (0, eval)('import.meta?.env?.VITE_API_URL') ||
      (0, eval)('import.meta?.env?.VITE_API_BASE_URL');
  } catch {
    viteBaseUrl =
      (typeof process !== 'undefined' && (process.env?.VITE_API_URL || process.env?.VITE_API_BASE_URL)) ||
      undefined;
  }

  // Prefer window.__API_BASE__ if available (set by main.tsx)
  const apiBaseFromWindow = (typeof window !== 'undefined') ? (window as any).__API_BASE__ : undefined;
  if (apiBaseFromWindow) return apiBaseFromWindow;

  const runtimeBase = (typeof window !== 'undefined') ? (window as any).__BASE_PATH__ : undefined;
  const nodeEnv = (typeof process !== 'undefined' && process.env?.NODE_ENV) ? process.env.NODE_ENV : undefined;
  const isDev = nodeEnv === 'development';
  if (isDev && typeof runtimeBase === 'string' && /^https?:\/\//i.test(runtimeBase)) {
    return `${runtimeBase.replace(/\/$/, '')}/api-proxy`;
  }

  // Fall back to vite env or default
  return viteBaseUrl || '/api';
};

const API_BASE_URL = getApiBaseUrl();

// CSRF Token management
let csrfToken: string | null = null;

const shouldDisableAutoReload = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('noreload')) return true;
  } catch { }
  try {
    return (window as any).__DISABLE_AUTO_RELOAD__ === true;
  } catch { }
  return false;
};

const clearAuthState = () => {
  localStorage.removeItem('wecare_token');
  localStorage.removeItem('wecare_user');
  clearCsrfToken();
};

const reloadOnceOrThrow = (message: string) => {
  if (typeof window === 'undefined') throw new Error(message);
  if (shouldDisableAutoReload()) throw new Error(message);
  const key = '__wecare_reload_once__';
  try {
    const alreadyReloaded = sessionStorage.getItem(key);
    if (alreadyReloaded) throw new Error(message);
    sessionStorage.setItem(key, '1');
    window.location.reload();
    return;
  } catch {
    throw new Error(message);
  }
};

const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) return csrfToken;

  try {
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      credentials: 'include' // Important for cookies
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
    }
    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return '';
  }
};

// Clear CSRF token on logout
export const clearCsrfToken = () => {
  csrfToken = null;
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('wecare_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  // If sending FormData, let browser set Content-Type with boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Add CSRF token for non-GET requests
  const method = options.method?.toUpperCase() || 'GET';
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrf = await getCsrfToken();
    if (csrf) {
      headers['X-XSRF-TOKEN'] = csrf;
    }
  }

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`📤 API Request: ${method} ${fullUrl}`);

  // Rate limit retry with exponential backoff
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include', // Important for CSRF cookies
    });

    console.log(`📥 API Response: ${res.status} ${res.statusText}`);

    // If rate limited, wait and retry
    if (res.status === 429 && retryCount < maxRetries - 1) {
      retryCount++;
      const delayMs = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
      console.warn(`⏳ Rate limited. Retrying in ${delayMs}ms (attempt ${retryCount}/${maxRetries - 1})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      continue;
    }

    // Process response
    if (!res.ok) {
      // Handle 401 - token expired or invalid
      if (res.status === 401) {
        let detail: any = null;
        try { detail = await res.json(); } catch { }

        if (endpoint.includes('/auth/login')) {
          clearAuthState();
          throw new Error(detail?.error || 'Invalid credentials');
        }

        const hadToken = !!token;
        clearAuthState();

        if (hadToken) {
          reloadOnceOrThrow('Session expired. Please login again.');
        }

        throw new Error(detail?.error || detail?.message || 'Unauthorized');
      }

      // Handle 403 - CSRF token invalid
      if (res.status === 403) {
        let detail: any = null;
        try { detail = await res.json(); } catch { }

        if (detail?.error?.includes('CSRF')) {
          csrfToken = null;
          throw new Error('Security token expired. Please refresh the page.');
        }
      }

      let detail: any = null;
      try { detail = await res.json(); } catch { }
      throw new Error(detail?.error || detail?.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    // Some endpoints may return 204
    if (res.status === 204) return null;

    // Get response text first to check if it's HTML
    const text = await res.text();

    // Check if response is HTML (error page) - but NOT for auth endpoints
    const isAuthEndpoint = endpoint.includes('/auth/');
    if (!isAuthEndpoint && (text.includes('<!DOCTYPE') || text.includes('<html'))) {
      clearAuthState();
      reloadOnceOrThrow('Authentication error. Please login again.');
    }

    // Parse as JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid response from server');
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts`);
};

// --- Auth API ---
export const authAPI = {
  login: (email: string, password: string) => {
    console.log('🔑 authAPI.login called:', { email, endpoint: '/auth/login' });
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProfile: () => apiRequest('/auth/me'),
  updateProfile: (data: { name?: string; phone?: string }) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  changePassword: (userId: string, currentPassword: string, newPassword: string) =>
    apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    }),
  // New: Upload profile image using FormData with CSRF and Authorization handled by apiRequest
  uploadProfileImage: (file: File) => {
    const fd = new FormData();
    fd.append('profile_image', file);
    return apiRequest('/auth/upload-profile-image', {
      method: 'POST',
      body: fd,
    });
  },
};

// --- Patients API ---
export const patientsAPI = {
  getPatients: (params?: PaginationParams): Promise<PaginatedResponse<any>> => {
    const query = buildPaginationQuery(params);
    return apiRequest(`/patients${query}`);
  },
  getPatientById: (id: string) => apiRequest(`/patients/${id}`),
  createPatient: (data: any) =>
    apiRequest('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: string, data: any) =>
    apiRequest(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id: string) =>
    apiRequest(`/patients/${id}`, { method: 'DELETE' }),
};

// --- Drivers API ---
export const driversAPI = {
  getDrivers: () => apiRequest('/drivers'),
  getAvailableDrivers: () => apiRequest('/drivers/available'),
  getMyRides: () => apiRequest('/drivers/my-rides'),
  getMyProfile: () => apiRequest('/drivers/my-profile'),
  updateMyProfile: (data: any) =>
    apiRequest('/drivers/my-profile', { method: 'PUT', body: JSON.stringify(data) }),
  getMyHistory: () => apiRequest('/drivers/my-history'),
  createDriver: (data: any) =>
    apiRequest('/drivers', { method: 'POST', body: JSON.stringify(data) }),
  updateDriver: (id: string, data: any) =>
    apiRequest(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDriver: (id: string) =>
    apiRequest(`/drivers/${id}`, { method: 'DELETE' }),
  updateLocation: (driverId: string, latitude: number, longitude: number, status?: string) =>
    apiRequest(`/driver-locations/${driverId}`, {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude, status })
    }),
};

// --- Rides API ---
export const ridesAPI = {
  getRides: (params?: PaginationParams): Promise<PaginatedResponse<any>> => {
    const query = buildPaginationQuery(params);
    return apiRequest(`/rides${query}`);
  },
  getRideById: (id: string) => apiRequest(`/rides/${id}`),
  updateRideStatus: (id: string, status: string, driver_id?: string) =>
    apiRequest(`/rides/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, driver_id }),
    }),
  createRide: (data: any) =>
    apiRequest('/rides', { method: 'POST', body: JSON.stringify(data) }),
  cancelRide: (id: string) =>
    apiRequest(`/rides/${id}`, { method: 'DELETE' }),
};

// --- Teams API ---
export const teamsAPI = {
  getTeams: () => apiRequest('/teams'),
  getTeamById: (id: string) => apiRequest(`/teams/${id}`),
  createTeam: (data: any) =>
    apiRequest('/teams', { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id: string, data: any) =>
    apiRequest(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeam: (id: string) =>
    apiRequest(`/teams/${id}`, { method: 'DELETE' }),
};
