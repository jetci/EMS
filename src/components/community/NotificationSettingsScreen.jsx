import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

const NotificationSettingsScreen = ({ user, onNavigate }) => {
  const [settings, setSettings] = useState({
    // Notification types
    bookingConfirmation: true,
    statusUpdates: true,
    reminderNotifications: true,
    emergencyAlerts: true,
    systemUpdates: false,
    
    // Notification channels
    inAppNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    
    // Timing settings
    reminderTiming: 60, // minutes before appointment
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    
    // Contact preferences
    preferredLanguage: 'th',
    contactEmail: user.email || '',
    contactPhone: user.phone || ''
  })
  
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    // Load user's current notification settings
    // This would typically come from an API call
    setSettings(prev => ({
      ...prev,
      contactEmail: user.email || '',
      contactPhone: user.phone || ''
    }))
  }, [user])

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Here you would typically save to backend API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setSaveMessage('บันทึกการตั้งค่าเรียบร้อยแล้ว')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const resetToDefaults = () => {
    setSettings({
      bookingConfirmation: true,
      statusUpdates: true,
      reminderNotifications: true,
      emergencyAlerts: true,
      systemUpdates: false,
      inAppNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      reminderTiming: 60,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      preferredLanguage: 'th',
      contactEmail: user.email || '',
      contactPhone: user.phone || ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ตั้งค่าการแจ้งเตือน
            </h1>
            <p className="text-gray-600 mt-1">
              จัดการการแจ้งเตือนและช่องทางการติดต่อ
            </p>
          </div>
          <Button
            onClick={() => onNavigate('dashboard')}
            variant="outline"
          >
            ← กลับหน้าหลัก
          </Button>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Notification Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            ประเภทการแจ้งเตือน
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">การยืนยันการจอง</h3>
                <p className="text-sm text-gray-600">แจ้งเตือนเมื่อการจองรถได้รับการยืนยัน</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.bookingConfirmation}
                  onChange={(e) => handleSettingChange('bookingConfirmation', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">อัปเดตสถานะ</h3>
                <p className="text-sm text-gray-600">แจ้งเตือนเมื่อสถานะการเดินทางเปลี่ยนแปลง</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.statusUpdates}
                  onChange={(e) => handleSettingChange('statusUpdates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">การแจ้งเตือนล่วงหน้า</h3>
                <p className="text-sm text-gray-600">แจ้งเตือนก่อนเวลานัดหมาย</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminderNotifications}
                  onChange={(e) => handleSettingChange('reminderNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">การแจ้งเตือนฉุกเฉิน</h3>
                <p className="text-sm text-gray-600">แจ้งเตือนสำหรับเหตุการณ์ฉุกเฉิน</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emergencyAlerts}
                  onChange={(e) => handleSettingChange('emergencyAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">อัปเดตระบบ</h3>
                <p className="text-sm text-gray-600">แจ้งเตือนเกี่ยวกับการอัปเดตระบบ</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.systemUpdates}
                  onChange={(e) => handleSettingChange('systemUpdates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            ช่องทางการแจ้งเตือน
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">การแจ้งเตือนในระบบ</h3>
                <p className="text-sm text-gray-600">แสดงการแจ้งเตือนในระบบ</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.inAppNotifications}
                  onChange={(e) => handleSettingChange('inAppNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">อีเมล</h3>
                <p className="text-sm text-gray-600">ส่งการแจ้งเตือนทางอีเมล</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">SMS</h3>
                <p className="text-sm text-gray-600">ส่งการแจ้งเตือนทาง SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Timing Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            การตั้งค่าเวลา
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เวลาแจ้งเตือนล่วงหน้า (นาที)
              </label>
              <select
                value={settings.reminderTiming}
                onChange={(e) => handleSettingChange('reminderTiming', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 นาที</option>
                <option value={30}>30 นาที</option>
                <option value={60}>1 ชั่วโมง</option>
                <option value={120}>2 ชั่วโมง</option>
                <option value={1440}>1 วัน</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">เปิดใช้งานโหมดเงียบ</h3>
                <p className="text-sm text-gray-600">ไม่ส่งการแจ้งเตือนในช่วงเวลาที่กำหนด</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.quietHoursEnabled}
                  onChange={(e) => handleSettingChange('quietHoursEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {settings.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เริ่มเวลาเงียบ
                  </label>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => handleSettingChange('quietHoursStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สิ้นสุดเวลาเงียบ
                  </label>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => handleSettingChange('quietHoursEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            ข้อมูลการติดต่อ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมายเลขโทรศัพท์
              </label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="081-234-5678"
              />
            </div>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`p-4 rounded-md ${
            saveMessage.includes('เรียบร้อย') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={resetToDefaults}
              variant="outline"
              className="text-gray-600 hover:text-gray-700"
            >
              รีเซ็ตเป็นค่าเริ่มต้น
            </Button>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={() => onNavigate('dashboard')}
                variant="outline"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NotificationSettingsScreen
