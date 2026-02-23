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
      if (detail?.error && Array.isArray(detail?.details) && detail.details.length > 0) {
        const msg = detail.details
          .map((d: any) => d?.message || d?.error || d?.detail || d)
          .filter((m: any) => typeof m === 'string' && m.trim().length > 0)
          .join('\n');
        if (msg) throw new Error(msg);
      }
      const coerceErrorMessage = (v: any): string | null => {
        if (!v) return null;
        if (typeof v === 'string') return v;
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        if (typeof v === 'object') {
          if (typeof v.message === 'string' && v.message.trim()) return v.message;
          try { return JSON.stringify(v); } catch { return String(v); }
        }
        return String(v);
      };
      const msg =
        coerceErrorMessage(detail?.error) ||
        coerceErrorMessage(detail?.message) ||
        `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(msg);
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
    updateProfile: (data: { name?: string; phone?: string; profileImageUrl?: string; address?: Address }) =>
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
  getPatientById: async (id: string) => {
    try {
      return await apiRequest(`/patients/${id}`);
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (!/404|not found|ไม่พบ/i.test(msg)) throw e;

      const list = await apiRequest('/patients?limit=200&page=1');
      const items = Array.isArray(list)
        ? list
        : (list?.data || list?.patients || list?.items || list?.results || []);
      const found = (items || []).find((p: any) => String(p?.id) === String(id));
      if (found) return found;
      throw e;
    }
  },
  createPatient: (data: any) => {
    if (data instanceof FormData) {
      return apiRequest('/patients', { method: 'POST', body: data });
    }
    return apiRequest('/patients', { method: 'POST', body: JSON.stringify(data) });
  },
  updatePatient: (id: string, data: any) => {
    if (data instanceof FormData) {
      return apiRequest(`/patients/${id}`, { method: 'PUT', body: data });
    }

    const fd = new FormData();
    const appendIfPresent = (key: string, value: any) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'string' && value.trim() === '') return;
      if (typeof value === 'number' && !Number.isFinite(value)) return;
      fd.append(key, typeof value === 'string' ? value : String(value));
    };

    const appendJsonIfPresent = (key: string, value: any) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'string') {
        if (value.trim() === '') return;
        fd.append(key, value);
        return;
      }
      try {
        fd.append(key, JSON.stringify(value));
      } catch {
        return;
      }
    };

    const fullName = data?.fullName ?? data?.full_name;
    const nationalId = data?.nationalId ?? data?.national_id;
    const dob = data?.dob ?? data?.birthDate ?? data?.date_of_birth ?? data?.dateOfBirth;
    const age = data?.age;
    const gender = data?.gender ?? data?.sex;
    const bloodType = data?.bloodType ?? data?.blood_type;
    const rhFactor = data?.rhFactor ?? data?.rh_factor;
    const healthCoverage = data?.healthCoverage ?? data?.health_coverage;
    const contactPhone = data?.contactPhone ?? data?.contact_phone ?? data?.phone;
    const landmark = data?.landmark;
    const latitude = data?.latitude ?? data?.lat;
    const longitude = data?.longitude ?? data?.lng;
    const profileImageUrl = data?.profileImageUrl ?? data?.profile_image_url;

    const emergencyContactName =
      data?.emergencyContactName ?? data?.emergency_contact_name ?? data?.emergencyContact?.name;
    const emergencyContactPhone =
      data?.emergencyContactPhone ?? data?.emergency_contact_phone ?? data?.emergencyContact?.phone;
    const emergencyContactRelation =
      data?.emergencyContactRelation ?? data?.emergency_contact_relation ?? data?.emergencyContact?.relation;

    const keyInfo = data?.keyInfo ?? data?.key_info;
    const caregiverName = data?.caregiverName ?? data?.caregiver_name;
    const caregiverPhone = data?.caregiverPhone ?? data?.caregiver_phone;

    appendIfPresent('title', data?.title ?? data?.prefix);
    appendIfPresent('fullName', fullName);
    appendIfPresent('nationalId', nationalId);
    appendIfPresent('dob', dob);
    appendIfPresent('age', age);
    appendIfPresent('gender', gender);
    appendIfPresent('bloodType', bloodType);
    appendIfPresent('rhFactor', rhFactor);
    appendIfPresent('healthCoverage', healthCoverage);
    appendIfPresent('keyInfo', keyInfo);
    appendIfPresent('contactPhone', contactPhone);
    appendIfPresent('landmark', landmark);
    appendIfPresent('latitude', latitude);
    appendIfPresent('longitude', longitude);
    appendIfPresent('profileImageUrl', profileImageUrl);

    appendIfPresent('emergencyContactName', emergencyContactName);
    appendIfPresent('emergencyContactPhone', emergencyContactPhone);
    appendIfPresent('emergencyContactRelation', emergencyContactRelation);
    appendIfPresent('caregiverName', caregiverName);
    appendIfPresent('caregiverPhone', caregiverPhone);

    appendJsonIfPresent('currentAddress', data?.currentAddress ?? data?.current_address ?? data?.address);
    appendJsonIfPresent('idCardAddress', data?.idCardAddress ?? data?.id_card_address ?? data?.registeredAddress ?? data?.registered_address);

    const patientTypes = data?.patientTypes ?? data?.patient_types;
    const chronicDiseases = data?.chronicDiseases ?? data?.chronic_diseases;
    const allergies = data?.allergies;

    appendJsonIfPresent('patientTypes', patientTypes);
    appendJsonIfPresent('chronicDiseases', chronicDiseases);
    appendJsonIfPresent('allergies', allergies);

    return apiRequest(`/patients/${id}`, { method: 'PUT', body: fd });
  },
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
    apiRequest(`/rides/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'CANCELLED' }),
    }),
};

// --- Facilities API ---
export const facilitiesAPI = {
  getFacilities: () => apiRequest('/facilities'),
  createFacility: (data: { name: string; lat: number; lng: number; facilityType?: string; isActive?: boolean }) =>
    apiRequest('/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFacility: (id: string, data: Partial<{ name: string; lat: number; lng: number; facilityType?: string; isActive: boolean }>) =>
    apiRequest(`/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteFacility: (id: string) =>
    apiRequest(`/facilities/${id}`, {
      method: 'DELETE',
    }),
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

// --- Team Shifts API ---
export const teamShiftsAPI = {
  getByMonth: (year: number, month: number) =>
    apiRequest(`/team-shifts?year=${year}&month=${month}`),
  upsert: (payload: { teamId: string; date: string; status: string; vehicleId?: string }) =>
    apiRequest('/team-shifts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  delete: (teamId: string, date: string) =>
    apiRequest('/team-shifts', {
      method: 'DELETE',
      body: JSON.stringify({ teamId, date }),
    }),
};

// --- Driver Shifts API ---
export const driverShiftsAPI = {
  getByWeekStart: (weekStart: string) =>
    apiRequest(`/driver-shifts?weekStart=${weekStart}`),
  upsert: (payload: { driverId: string; date: string; status: string }) =>
    apiRequest('/driver-shifts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  delete: (driverId: string, date: string) =>
    apiRequest('/driver-shifts', {
      method: 'DELETE',
      body: JSON.stringify({ driverId, date }),
    }),
};
