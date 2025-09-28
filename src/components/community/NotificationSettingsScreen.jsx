import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import CommunityLayout from '../layouts/CommunityLayout.jsx'

const NotificationSettingsScreen = ({ user, onNavigate }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  })

  return (
    <CommunityLayout user={user} onNavigate={onNavigate} currentPage="notification-settings">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ตั้งค่าการแจ้งเตือน</h1>
          <p className="text-gray-600">จัดการการรับการแจ้งเตือนจากระบบ</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>การแจ้งเตือนทางอีเมล</span>
              <input 
                type="checkbox" 
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>การแจ้งเตือนทาง SMS</span>
              <input 
                type="checkbox" 
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
              />
            </div>
          </div>
        </div>
      </div>
    </CommunityLayout>
  )
}

export default NotificationSettingsScreen
