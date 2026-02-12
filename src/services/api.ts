// Centralized API client using Vite env with fallbacks
// Priority:
// 1) Vite env: import.meta.env.VITE_API_BASE_URL
// 2) Window runtime base configured in index.tsx: window.__BASE_PATH__ + '/api-proxy' (dev proxy)
// 3) Default: http://localhost:3001/api (direct to backend)

import { PaginatedResponse, PaginationParams, buildPaginationQuery } from '../types-dir/pagination';

const getApiBaseUrl = (): string => {
  const viteEnv = (import.meta as any).env?.VITE_API_BASE_URL;
  if (viteEnv) return viteEnv;

  // Force relative path '/api' to ensure Vite proxy is used
  // This bypasses CORS issues in development
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// CSRF Token management
let csrfToken: string | null = null;

const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) return csrfToken;

  try {
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      credentials: 'include' // Important for cookies
    });
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

  const res = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include', // Important for CSRF cookies
  });

  console.log(`📥 API Response: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    // Handle 401 - token expired or invalid
    if (res.status === 401) {
      localStorage.removeItem('wecare_token');
      localStorage.removeItem('wecare_user');
      clearCsrfToken();

      if (endpoint.includes('/auth/login')) {
        let detail: any = null;
        try { detail = await res.json(); } catch { }
        throw new Error(detail?.error || 'Invalid credentials');
      }

      window.location.reload();
      throw new Error('Session expired. Please login again.');
    }

    // Handle 403 - CSRF token invalid
    if (res.status === 403) {
      let detail: any = null;
      try { detail = await res.json(); } catch { }

      // If CSRF error, clear token and retry once
      if (detail?.error?.includes('CSRF')) {
        csrfToken = null;
        // Don't retry automatically to avoid infinite loop
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
    localStorage.removeItem('wecare_token');
    localStorage.removeItem('wecare_user');
    clearCsrfToken();
    window.location.reload();
    throw new Error('Authentication error. Please login again.');
  }

  // Parse as JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid response from server');
  }
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
};

// --- Patients API ---
export const patientsAPI = {
  getPatients: (params?: PaginationParams): Promise<PaginatedResponse<any>> => {
    const query = buildPaginationQuery(params);
    return apiRequest(`/patients${query}`);
  },
  getPatientById: (id: string) => apiRequest(`/patients/${id}`),
  createPatient: (data: any) =>
    apiRequest('/patients/json', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: string, data: any) =>
    apiRequest(`/patients/json/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
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

// --- Schedules API ---
export const schedulesAPI = {
  getSchedules: (month: string, teamId?: string) => {
    let url = `/schedules?month=${month}`;
    if (teamId) url += `&teamId=${teamId}`;
    return apiRequest(url);
  },
  saveSchedule: (data: { teamId: string; date: string; status: string; vehicleId?: string; shiftType?: string }) =>
    apiRequest('/schedules', { method: 'POST', body: JSON.stringify(data) }),
  deleteSchedule: (teamId: string, date: string) =>
    apiRequest('/schedules', { method: 'DELETE', body: JSON.stringify({ teamId, date }) }),
};

// --- System API ---
export const systemAPI = {
  getHealth: () => apiRequest('/health'),
};
