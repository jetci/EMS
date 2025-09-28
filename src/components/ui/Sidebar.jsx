import React from 'react'
import { Button } from '@/components/ui/button.jsx'

const Sidebar = ({ showMenu, setShowMenu, onNavigate, currentPage = 'dashboard' }) => {
  const handlePersonalInfo = () => {
    onNavigate('personal-info')
    setShowMenu(false)
  }

  const handleServiceHistory = () => {
    onNavigate('service-history')
    setShowMenu(false)
  }

  const handleNotifications = () => {
    onNavigate('notifications')
    setShowMenu(false)
  }

  const handleContactStaff = () => {
    onNavigate('contact-staff')
    setShowMenu(false)
  }

  const handleUserGuide = () => {
    onNavigate('user-guide')
    setShowMenu(false)
  }

  const handleNotificationSettings = () => {
    onNavigate('notification-settings')
    setShowMenu(false)
  }

  const handleStatistics = () => {
    onNavigate('statistics')
    setShowMenu(false)
  }

  const handleDashboard = () => {
    onNavigate('dashboard')
    setShowMenu(false)
  }

  const handleRegisterPatient = () => {
    onNavigate('register-patient')
    setShowMenu(false)
  }

  const handleTrackRide = () => {
    onNavigate('track-ride')
    setShowMenu(false)
  }

  const menuItems = [
    {
      id: 'dashboard',
      icon: '🏠',
      label: 'หน้าหลัก',
      onClick: handleDashboard
    },
    {
      id: 'register-patient',
      icon: '👥',
      label: 'ลงทะเบียนผู้ป่วย',
      onClick: handleRegisterPatient
    },
    {
      id: 'track-ride',
      icon: '🚑',
      label: 'ติดตามรถพยาบาล',
      onClick: handleTrackRide
    },
    {
      id: 'personal-info',
      icon: '👤',
      label: 'จัดการข้อมูลส่วนบุคคล',
      onClick: handlePersonalInfo
    },
    {
      id: 'service-history',
      icon: '📋',
      label: 'ประวัติการใช้บริการ',
      onClick: handleServiceHistory
    },
    {
      id: 'notifications',
      icon: '🔔',
      label: 'การแจ้งเตือน',
      onClick: handleNotifications
    },
    {
      id: 'contact-staff',
      icon: '📞',
      label: 'ติดต่อเจ้าหน้าที่',
      onClick: handleContactStaff
    },
    {
      id: 'user-guide',
      icon: '📖',
      label: 'คู่มือการใช้งาน',
      onClick: handleUserGuide
    },
    {
      id: 'notification-settings',
      icon: '⚙️',
      label: 'ตั้งค่าการแจ้งเตือน',
      onClick: handleNotificationSettings
    },
    {
      id: 'statistics',
      icon: '📊',
      label: 'รายงานสถิติ',
      onClick: handleStatistics
    }
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        showMenu ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">เมนู</h2>
          <Button
            onClick={() => setShowMenu(false)}
            variant="ghost"
            size="sm"
            className="lg:hidden"
          >
            ✕
          </Button>
        </div>
        
        <nav className="mt-6">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-3 transition-colors ${
                  currentPage === item.id 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}

export default Sidebar
