import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

const NotificationsScreen = ({ user, onNavigate }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, read

  useEffect(() => {
    // Mock data for notifications
    const mockNotifications = [
      {
        id: 1,
        title: 'การจองรถสำเร็จ',
        message: 'การจองรถสำหรับ นาย สมชาย ใจดี วันที่ 26 ก.ย. 2025 เวลา 10:00 น. ได้รับการยืนยันแล้ว',
        type: 'success',
        isRead: false,
        createdAt: '2025-09-26T08:30:00',
        actionType: 'track_ride',
        actionData: { rideId: 1 }
      },
      {
        id: 2,
        title: 'คนขับกำลังเดินทางไป',
        message: 'คนขับ นาย สมศักดิ์ ขับดี กำลังเดินทางไปรับ นาย สมชาย ใจดี ประมาณ 15 นาที',
        type: 'info',
        isRead: false,
        createdAt: '2025-09-26T09:45:00',
        actionType: 'track_ride',
        actionData: { rideId: 1 }
      },
      {
        id: 3,
        title: 'การเดินทางเสร็จสิ้น',
        message: 'การเดินทางของ นาง สมหญิง รักดี ไปโรงพยาบาลสมุทรปราการ เสร็จสิ้นแล้ว',
        type: 'success',
        isRead: true,
        createdAt: '2025-09-25T16:30:00',
        actionType: 'view_history',
        actionData: { historyId: 2 }
      },
      {
        id: 4,
        title: 'การจองถูกยกเลิก',
        message: 'การจองรถสำหรับ นาย สมศักดิ์ ดีใจ วันที่ 24 ก.ย. 2025 ถูกยกเลิกเนื่องจากไม่มีรถว่าง',
        type: 'warning',
        isRead: true,
        createdAt: '2025-09-24T14:20:00',
        actionType: 'book_ride',
        actionData: { patientName: 'นาย สมศักดิ์ ดีใจ' }
      },
      {
        id: 5,
        title: 'แจ้งเตือนการนัดหมาย',
        message: 'อย่าลืมการนัดหมายของ นาย สมชาย ใจดี ในวันพรุ่งนี้ เวลา 10:00 น.',
        type: 'reminder',
        isRead: true,
        createdAt: '2025-09-24T18:00:00',
        actionType: 'view_appointment',
        actionData: { appointmentId: 1 }
      }
    ]
    
    setNotifications(mockNotifications)
    setLoading(false)
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      case 'warning': return '⚠️'
      case 'reminder': return '⏰'
      default: return '📢'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50'
      case 'info': return 'border-l-blue-500 bg-blue-50'
      case 'warning': return 'border-l-yellow-500 bg-yellow-50'
      case 'reminder': return 'border-l-purple-500 bg-purple-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    )
  }

  const handleNotificationAction = (notification) => {
    markAsRead(notification.id)
    
    switch (notification.actionType) {
      case 'track_ride':
        onNavigate('track-ride', notification.actionData)
        break
      case 'view_history':
        onNavigate('service-history')
        break
      case 'book_ride':
        onNavigate('book-ride', notification.actionData)
        break
      case 'view_appointment':
        onNavigate('dashboard')
        break
      default:
        break
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.isRead
    if (filter === 'read') return notif.isRead
    return true
  })

  const getFilterCount = (filterType) => {
    if (filterType === 'all') return notifications.length
    if (filterType === 'unread') return notifications.filter(n => !n.isRead).length
    if (filterType === 'read') return notifications.filter(n => n.isRead).length
    return 0
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return `${diffInMinutes} นาทีที่แล้ว`
    } else if (diffInHours < 24) {
      return `${diffInHours} ชั่วโมงที่แล้ว`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} วันที่แล้ว`
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">กำลังโหลดการแจ้งเตือน...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              การแจ้งเตือน
            </h1>
            <p className="text-gray-600 mt-1">
              ดูการแจ้งเตือนและข้อมูลสำคัญทั้งหมด
            </p>
          </div>
          <div className="flex space-x-3">
            {getFilterCount('unread') > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
              >
                อ่านทั้งหมด
              </Button>
            )}
            <Button
              onClick={() => onNavigate('dashboard')}
              variant="outline"
            >
              ← กลับหน้าหลัก
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ทั้งหมด ({getFilterCount('all')})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ยังไม่อ่าน ({getFilterCount('unread')})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'read'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            อ่านแล้ว ({getFilterCount('read')})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            รายการแจ้งเตือน ({filteredNotifications.length} รายการ)
          </h2>
        </div>
        
        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            ไม่มีการแจ้งเตือน
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <h3 className={`text-lg font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ใหม่
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    {notification.actionType && (
                      <Button
                        onClick={() => handleNotificationAction(notification)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        ดูรายละเอียด
                      </Button>
                    )}
                    {!notification.isRead && (
                      <Button
                        onClick={() => markAsRead(notification.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-700"
                      >
                        ทำเครื่องหมายว่าอ่านแล้ว
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          การดำเนินการด่วน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={() => onNavigate('notification-settings')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            ⚙️ ตั้งค่าการแจ้งเตือน
          </Button>
          <Button 
            onClick={() => onNavigate('book-ride')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            📅 จองรถใหม่
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotificationsScreen
