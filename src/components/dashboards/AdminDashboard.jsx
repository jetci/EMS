import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

const AdminDashboard = ({ user }) => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalRides: 0,
    activeDrivers: 0,
    totalPatients: 0,
    ridesThisMonth: 0,
    revenue: 0
  })

  const [recentActivity, setRecentActivity] = useState([])
  const [users, setUsers] = useState([])

  // Mock data for demonstration
  useEffect(() => {
    setSystemStats({
      totalUsers: 45,
      totalRides: 234,
      activeDrivers: 8,
      totalPatients: 156,
      ridesThisMonth: 67,
      revenue: 45600
    })

    setRecentActivity([
      {
        id: 1,
        type: 'ride_completed',
        description: 'การเดินทางของ นาย สมชาย ใจดี เสร็จสิ้น',
        timestamp: '2025-09-26T09:30:00',
        user: 'คนขับ: นาย สมศักดิ์ ขับดี'
      },
      {
        id: 2,
        type: 'user_registered',
        description: 'ผู้ใช้ใหม่ลงทะเบียน',
        timestamp: '2025-09-26T08:15:00',
        user: 'ชุมชน: นาง สมใส ดูแล'
      },
      {
        id: 3,
        type: 'ride_requested',
        description: 'คำขอการเดินทางใหม่',
        timestamp: '2025-09-26T07:45:00',
        user: 'ชุมชน: ชุมชนบางพลี'
      }
    ])

    setUsers([
      {
        id: 1,
        name: 'นาย สมศักดิ์ ขับดี',
        email: 'driver1@wecare.dev',
        role: 'driver',
        status: 'active',
        lastLogin: '2025-09-26T09:00:00'
      },
      {
        id: 2,
        name: 'ชุมชนบางพลี',
        email: 'community1@wecare.dev',
        role: 'community',
        status: 'active',
        lastLogin: '2025-09-26T08:30:00'
      },
      {
        id: 3,
        name: 'เจ้าหน้าที่โรงพยาบาล',
        email: 'office1@wecare.dev',
        role: 'office',
        status: 'active',
        lastLogin: '2025-09-26T07:15:00'
      }
    ])
  }, [])

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'driver': return 'คนขับรถ'
      case 'community': return 'ชุมชน'
      case 'office': return 'เจ้าหน้าที่'
      case 'admin': return 'ผู้ดูแลระบบ'
      default: return role
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'ใช้งานได้'
      case 'inactive': return 'ไม่ใช้งาน'
      case 'suspended': return 'ระงับการใช้งาน'
      default: return status
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'ride_completed': return '✅'
      case 'ride_requested': return '🚗'
      case 'user_registered': return '👤'
      case 'system_alert': return '⚠️'
      default: return '📝'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          สวัสดี, {user.name}
        </h1>
        <p className="text-gray-600 mt-1">
          ยินดีต้อนรับสู่ระบบจัดการสำหรับผู้ดูแลระบบ
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">👥</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">🚗</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">การเดินทางทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalRides}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">👨‍💼</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">คนขับที่ใช้งาน</p>
              <p className="text-2xl font-bold text-green-600">{systemStats.activeDrivers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">🏥</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ผู้ป่วยทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">📅</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">เดือนนี้</p>
              <p className="text-2xl font-bold text-blue-600">{systemStats.ridesThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">💰</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">รายได้</p>
              <p className="text-2xl font-bold text-green-600">฿{systemStats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          การจัดการระบบ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            👥 จัดการผู้ใช้
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            🚗 จัดการคนขับ
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            📊 รายงานระบบ
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            ⚙️ ตั้งค่าระบบ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              กิจกรรมล่าสุด
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.user}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString('th-TH')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200">
            <Button variant="outline" className="w-full">
              ดูกิจกรรมทั้งหมด
            </Button>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              ผู้ใช้ในระบบ
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {user.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        ({getRoleDisplayName(user.role)})
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </div>
                    
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-gray-600">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        เข้าสู่ระบบล่าสุด: {new Date(user.lastLogin).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      แก้ไข
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      ระงับ
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200">
            <Button variant="outline" className="w-full">
              จัดการผู้ใช้ทั้งหมด
            </Button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          สถานะระบบ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🟢</div>
            <p className="text-sm font-medium text-gray-900">API Server</p>
            <p className="text-xs text-green-600">ปกติ</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🟢</div>
            <p className="text-sm font-medium text-gray-900">Database</p>
            <p className="text-xs text-green-600">ปกติ</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🟡</div>
            <p className="text-sm font-medium text-gray-900">SMS Service</p>
            <p className="text-xs text-yellow-600">ช้า</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🟢</div>
            <p className="text-sm font-medium text-gray-900">Map Service</p>
            <p className="text-xs text-green-600">ปกติ</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
