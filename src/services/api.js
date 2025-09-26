// API Service for EMS Backend Integration
const API_BASE_URL = 'https://nghki1cjo3pn.manus.space/api'

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token')
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication
  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      
      if (response.token) {
        this.token = response.token
        localStorage.setItem('auth_token', response.token)
      }
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async register(userData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      
      return {
        success: true,
        user: response.user,
        message: response.message || 'สมัครสมาชิกสำเร็จ'
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
      }
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      this.token = null
      localStorage.removeItem('auth_token')
    }
  }

  // User management
  async getCurrentUser() {
    return this.request('/auth/me')
  }

  async getUsers() {
    return this.request('/users')
  }

  // Patient management
  async getPatients() {
    return this.request('/patients')
  }

  async createPatient(patientData) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    })
  }

  async updatePatient(patientId, patientData) {
    return this.request(`/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    })
  }

  // Ride management
  async getRides() {
    return this.request('/rides')
  }

  async createRide(rideData) {
    return this.request('/rides', {
      method: 'POST',
      body: JSON.stringify(rideData),
    })
  }

  async updateRideStatus(rideId, status) {
    return this.request(`/rides/${rideId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async assignDriver(rideId, driverId) {
    return this.request(`/rides/${rideId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ driver_id: driverId }),
    })
  }

  // Driver management
  async getDrivers() {
    return this.request('/drivers')
  }

  async getAvailableDrivers() {
    return this.request('/drivers/available')
  }

  async updateDriverStatus(driverId, status) {
    return this.request(`/drivers/${driverId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Community management
  async getCommunities() {
    return this.request('/communities')
  }

  async getCommunityPatients(communityId) {
    return this.request(`/communities/${communityId}/patients`)
  }

  // Statistics and reports
  async getSystemStats() {
    return this.request('/stats/system')
  }

  async getUserStats(userId) {
    return this.request(`/stats/user/${userId}`)
  }

  async getDriverStats(driverId) {
    return this.request(`/stats/driver/${driverId}`)
  }

  // Email Verification
  async sendVerificationEmail(userId) {
    try {
      const response = await this.request('/email/send-verification', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      })
      
      return {
        success: true,
        message: response.message || 'ส่งอีเมลยืนยันเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('Send verification email failed:', error)
      return {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน'
      }
    }
  }

  async resendVerificationEmail(email) {
    try {
      const response = await this.request('/email/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      
      return {
        success: true,
        message: response.message || 'ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('Resend verification email failed:', error)
      return {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน'
      }
    }
  }

  async verifyEmail(token) {
    try {
      const response = await this.request('/email/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
      
      return {
        success: true,
        user: response.user,
        message: response.message || 'ยืนยันอีเมลสำเร็จ'
      }
    } catch (error) {
      console.error('Email verification failed:', error)
      return {
        success: false,
        message: error.message || 'การยืนยันอีเมลล้มเหลว'
      }
    }
  }

  // Real-time updates (for future WebSocket integration)
  async getRideUpdates(rideId) {
    return this.request(`/rides/${rideId}/updates`)
  }

  // Notifications
  async getNotifications(userId) {
    return this.request(`/notifications/${userId}`)
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
  }

  async markAllNotificationsAsRead(userId) {
    return this.request(`/notifications/${userId}/read-all`, {
      method: 'PUT',
    })
  }

  // Notification Settings
  async getNotificationSettings(userId) {
    return this.request(`/users/${userId}/notification-settings`)
  }

  async updateNotificationSettings(userId, settings) {
    return this.request(`/users/${userId}/notification-settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // Service History
  async getServiceHistory(userId) {
    return this.request(`/users/${userId}/service-history`)
  }

  // Contact and Messages
  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    })
  }

  async getStaffContacts() {
    return this.request('/staff/contacts')
  }

  // User Profile
  async updateUserProfile(userId, profileData) {
    return this.request(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // Ride Tracking
  async getRideDetails(rideId) {
    return this.request(`/rides/${rideId}/details`)
  }

  async getRideLocation(rideId) {
    return this.request(`/rides/${rideId}/location`)
  }

  // Statistics (Enhanced)
  async getCommunityStats(userId, period = 'month') {
    return this.request(`/stats/community/${userId}?period=${period}`)
  }

  async getPatientStats(patientId) {
    return this.request(`/stats/patient/${patientId}`)
  }

  // Destinations
  async getDestinations() {
    return this.request('/destinations')
  }

  async getPopularDestinations() {
    return this.request('/destinations/popular')
  }
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService

// Export individual methods for convenience
export const {
  login,
  register,
  logout,
  getCurrentUser,
  getUsers,
  getPatients,
  createPatient,
  updatePatient,
  getRides,
  createRide,
  updateRideStatus,
  assignDriver,
  getDrivers,
  getAvailableDrivers,
  updateDriverStatus,
  getCommunities,
  getCommunityPatients,
  getSystemStats,
  getUserStats,
  getDriverStats,
  getRideUpdates,
  sendVerificationEmail,
  resendVerificationEmail,
  verifyEmail,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationSettings,
  updateNotificationSettings,
  getServiceHistory,
  sendMessage,
  getStaffContacts,
  updateUserProfile,
  getRideDetails,
  getRideLocation,
  getCommunityStats,
  getPatientStats,
  getDestinations,
  getPopularDestinations,
} = apiService
