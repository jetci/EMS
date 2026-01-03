import { apiRequest } from './api';

export const dashboardService = {
  // Office Dashboard
  getOfficeDashboard: async () => {
    return apiRequest('/office/dashboard');
  },

  getUrgentRides: async () => {
    return apiRequest('/office/rides/urgent');
  },

  getTodaysSchedule: async () => {
    return apiRequest('/office/rides/today');
  },

  getAvailableDrivers: async () => {
    return apiRequest('/drivers/available');
  },

  assignDriver: async (rideId: string, driverId: string) => {
    return apiRequest(`/office/rides/${rideId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ driver_id: driverId }),
    });
  },

  // Admin Dashboard
  getAdminDashboard: async () => {
    return apiRequest('/dashboard/admin');
  },

  getSystemStats: async () => {
    return apiRequest('/admin/stats');
  },

  // Driver Dashboard
  getDriverDashboard: async () => {
    return apiRequest('/driver/dashboard');
  },

  getDriverJobs: async () => {
    return apiRequest('/driver/jobs');
  },

  // Community Dashboard
  getCommunityDashboard: async () => {
    return apiRequest('/community/dashboard');
  },

  // Executive Dashboard
  getExecutiveDashboard: async () => {
    return apiRequest('/executive/dashboard');
  },

  // Patients
  getPatients: async () => {
    return apiRequest('/office/patients');
  },

  getPatientById: async (id: string) => {
    return apiRequest(`/office/patients/${id}`);
  },

  createPatient: async (data: any) => {
    return apiRequest('/office/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePatient: async (id: string, data: any) => {
    return apiRequest(`/office/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePatient: async (id: string) => {
    return apiRequest(`/office/patients/${id}`, {
      method: 'DELETE',
    });
  },

  // Rides
  getRides: async () => {
    return apiRequest('/office/rides');
  },

  getRideById: async (id: string) => {
    return apiRequest(`/office/rides/${id}`);
  },

  createRide: async (data: any) => {
    return apiRequest('/office/rides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRide: async (id: string, data: any) => {
    return apiRequest(`/office/rides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteRide: async (id: string) => {
    return apiRequest(`/office/rides/${id}`, {
      method: 'DELETE',
    });
  },

  // Drivers
  getDrivers: async () => {
    return apiRequest('/drivers');
  },

  getDriverById: async (id: string) => {
    return apiRequest(`/drivers/${id}`);
  },

  // Vehicles
  getVehicles: async () => {
    return apiRequest('/vehicles');
  },

  // News
  getNews: async () => {
    return apiRequest('/news');
  },

  getNewsById: async (id: string) => {
    return apiRequest(`/news/${id}`);
  },

  createNews: async (data: any) => {
    return apiRequest('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateNews: async (id: string, data: any) => {
    return apiRequest(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteNews: async (id: string) => {
    return apiRequest(`/news/${id}`, {
      method: 'DELETE',
    });
  },

  // Users
  getUsers: async () => {
    return apiRequest('/admin/users');
  },

  createUser: async (data: any) => {
    return apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: async (id: string, data: any) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: string) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Audit Logs
  getAuditLogs: async () => {
    return apiRequest('/admin/audit-logs');
  },
};
