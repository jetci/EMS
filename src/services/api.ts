// Centralized API client using Vite env with fallbacks
// Priority:
// 1) Vite env: import.meta.env.VITE_API_BASE_URL
// 2) Window runtime base configured in index.tsx: window.__BASE_PATH__ + '/api-proxy' (dev proxy)
// 3) Default: http://localhost:3001/api (direct to backend)

const getApiBaseUrl = (): string => {
  const viteEnv = (import.meta as any).env?.VITE_API_BASE_URL;
  if (viteEnv) return viteEnv;

  // Fallback to window.__API_BASE__ or default
  return (window as any).__API_BASE__ || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('wecare_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail: any = null;
    try { detail = await res.json(); } catch {}
    throw new Error(detail?.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  // Some endpoints may return 204
  if (res.status === 204) return null;
  return res.json();
};

// --- Auth API ---
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// --- Patients API ---
export const patientsAPI = {
  getPatients: () => apiRequest('/office/patients'),
  getPatientById: (id: string) => apiRequest(`/office/patients/${id}`),
  createPatient: (data: any) =>
    apiRequest('/office/patients', { method: 'POST', body: JSON.stringify(data) }),
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
  createDriver: (data: any) =>
    apiRequest('/drivers', { method: 'POST', body: JSON.stringify(data) }),
  updateDriver: (id: string, data: any) =>
    apiRequest(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDriver: (id: string) =>
    apiRequest(`/drivers/${id}`, { method: 'DELETE' }),
};

// --- Rides API ---
export const ridesAPI = {
  getRides: () => apiRequest('/rides'),
  getRideById: (id: string) => apiRequest(`/rides/${id}`),
  updateRideStatus: (id: string, status: string, driver_id?: string) =>
    apiRequest(`/rides/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, driver_id }),
    }),
  createRide: (data: any) =>
    apiRequest('/rides', { method: 'POST', body: JSON.stringify(data) }),
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
