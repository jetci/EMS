import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import CommunityLayout from '../layouts/CommunityLayout.jsx'

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
        actionData: { rideId: 'R001' }
      },
      {
        id: 2,
        title: 'อัปเดตสถานะการเดินทาง',
        message: 'รถพยาบาลกำลังเดินทางไปรับผู้ป่วย คาดว่าจะถึงจุดหมายในอีก 15 นาที',
        type: 'info',
        isRead: true,
        createdAt: '2025-09-25T14:20:00',
        actionType: 'track_ride',
        actionData: { rideId: 'R002' }
      }
    ]
    
    setNotifications(mockNotifications)
    setLoading(false)
  }, [])

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

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead
    if (filter === 'read') return notif.isRead
    return true
  })

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <CommunityLayout user={user} onNavigate={onNavigate} currentPage="notifications">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">กำลังโหลด...</div>
        </div>
      </CommunityLayout>
    )
  }

  return (
    <CommunityLayout user={user} onNavigate={onNavigate} currentPage="notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">การแจ้งเตือน</h1>
              <p className="text-gray-600 mt-1">ข้อความและการแจ้งเตือนจากระบบ</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
              >
                อ่านทั้งหมด
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
              ทั้งหมด ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ยังไม่อ่าน ({notifications.filter(n => !n.isRead).length})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              อ่านแล้ว ({notifications.filter(n => n.isRead).length})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📭</div>
              <p className="text-gray-600">ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                  notification.isRead 
                    ? 'border-gray-300' 
                    : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${
                        notification.isRead ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`mt-2 ${
                      notification.isRead ? 'text-gray-600' : 'text-gray-800'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="mt-4 flex space-x-2">
                      {!notification.isRead && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          variant="outline"
                          size="sm"
                        >
                          ทำเครื่องหมายว่าอ่านแล้ว
                        </Button>
                      )}
                      {notification.actionType === 'track_ride' && (
                        <Button
                          onClick={() => onNavigate('track-ride')}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          ติดตามการเดินทาง
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </CommunityLayout>
  )
}

export default NotificationsScreen
