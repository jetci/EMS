import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'

// Import role-specific dashboards
import DriverDashboard from './dashboards/DriverDashboard.jsx'
import CommunityDashboard from './dashboards/CommunityDashboard.jsx'
import OfficeDashboard from './dashboards/OfficeDashboard.jsx'
import AdminDashboard from './dashboards/AdminDashboard.jsx'

// Import community-specific components
import RegisterPatientScreen from './community/RegisterPatientScreen.jsx'
import BookRideScreen from './community/BookRideScreen.jsx'
import PersonalInfoScreen from './community/PersonalInfoScreen.jsx'
import ServiceHistoryScreen from './community/ServiceHistoryScreen.jsx'
import NotificationsScreen from './community/NotificationsScreen.jsx'
import ContactStaffScreen from './community/ContactStaffScreen.jsx'
import UserGuideScreen from './community/UserGuideScreen.jsx'
import NotificationSettingsScreen from './community/NotificationSettingsScreen.jsx'
import StatisticsScreen from './community/StatisticsScreen.jsx'
import TrackRideScreen from './community/TrackRideScreen.jsx'

const AuthenticatedLayout = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [pageData, setPageData] = useState(null)

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page)
    setPageData(data)
  }

  const renderContent = () => {
    if (user.role === 'community') {
      switch (currentPage) {
        case 'dashboard':
          return <CommunityDashboard user={user} onNavigate={handleNavigate} />
        case 'register-patient':
          return <RegisterPatientScreen user={user} onNavigate={handleNavigate} />
        case 'book-ride':
          return <BookRideScreen user={user} onNavigate={handleNavigate} pageData={pageData} />
        case 'personal-info':
          return <PersonalInfoScreen user={user} onNavigate={handleNavigate} />
        case 'edit-patient':
          return <RegisterPatientScreen user={user} onNavigate={handleNavigate} pageData={pageData} editMode={true} />
        case 'service-history':
          return <ServiceHistoryScreen user={user} onNavigate={handleNavigate} />
        case 'notifications':
          return <NotificationsScreen user={user} onNavigate={handleNavigate} />
        case 'contact-staff':
          return <ContactStaffScreen user={user} onNavigate={handleNavigate} />
        case 'user-guide':
          return <UserGuideScreen user={user} onNavigate={handleNavigate} />
        case 'notification-settings':
          return <NotificationSettingsScreen user={user} onNavigate={handleNavigate} />
        case 'statistics':
          return <StatisticsScreen user={user} onNavigate={handleNavigate} />
        case 'track-ride':
          return <TrackRideScreen user={user} onNavigate={handleNavigate} pageData={pageData} />
        default:
          return <CommunityDashboard user={user} onNavigate={handleNavigate} />
      }
    }

    // For other roles, use the original dashboard logic
    switch (user.role) {
      case 'driver':
        return <DriverDashboard user={user} />
      case 'office':
        return <OfficeDashboard user={user} />
      case 'admin':
        return <AdminDashboard user={user} />
      default:
        return <div>ไม่พบบทบาทที่ถูกต้อง</div>
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'driver': return 'คนขับรถ'
      case 'community': return 'ชุมชน'
      case 'office': return 'เจ้าหน้าที่'
      case 'admin': return 'ผู้ดูแลระบบ'
      default: return role
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">
                WeCare
              </div>
              <div className="text-sm text-gray-600">
                {getRoleDisplayName(user.role)} Dashboard
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                สวัสดี, {user.name}
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="text-gray-700 hover:text-gray-900"
              >
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  )
}

export default AuthenticatedLayout
