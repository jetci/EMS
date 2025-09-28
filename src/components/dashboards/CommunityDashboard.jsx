import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import CommunityLayout from '../layouts/CommunityLayout.jsx'
import apiService from '../../services/api.js'

const CommunityDashboard = ({ user, onNavigate }) => {
  const [patients, setPatients] = useState([])
  const [rides, setRides] = useState([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingRides: 0,
    completedThisMonth: 0
  })
  const [loading, setLoading] = useState(true)

  // Load data from API
  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load patients data
      try {
        const patientsData = await apiService.getPatients()
        setPatients(patientsData || [])
      } catch (error) {
        console.error('Failed to load patients:', error)
        // Fallback to mock data
        setPatients([
          {
            id: 1,
            name: 'นาย สมชาย ใจดี',
            age: 65,
            condition: 'เบาหวาน, ความดันโลหิตสูง',
            lastVisit: '2025-09-20',
            phone: '081-234-5678'
          },
          {
            id: 2,
            name: 'นาง สมหญิง รักดี',
            age: 58,
            condition: 'โรคหัวใจ',
            lastVisit: '2025-09-18',
            phone: '082-345-6789'
          },
          {
            id: 3,
            name: 'นาย วิชัย สุขใส',
            age: 72,
            condition: 'ความดันโลหิตสูง',
            lastVisit: '2025-09-15',
            phone: '083-456-7890'
          }
        ])
      }

      // Load rides data
      try {
        const ridesData = await apiService.getRides()
        setRides(ridesData || [])
      } catch (error) {
        console.error('Failed to load rides:', error)
        // Fallback to mock data
        setRides([
          {
            id: 1,
            patientName: 'นาย สมชาย ใจดี',
            destination: 'โรงพยาบาลจุฬาลงกรณ์',
            scheduledTime: '2025-09-28T10:00:00',
            status: 'PENDING'
          },
          {
            id: 2,
            patientName: 'นาง สมหญิง รักดี',
            destination: 'โรงพยาบาลศิริราช',
            scheduledTime: '2025-09-27T14:30:00',
            status: 'COMPLETED'
          }
        ])
      }

      // Calculate stats
      const totalPatients = patients.length
      const pendingRides = rides.filter(ride => ride.status === 'PENDING').length
      const completedThisMonth = rides.filter(ride => 
        ride.status === 'COMPLETED' && 
        new Date(ride.scheduledTime).getMonth() === new Date().getMonth()
      ).length

      setStats({
        totalPatients,
        pendingRides,
        completedThisMonth
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePersonalInfo = () => {
    onNavigate('personal-info')
  }

  const handleServiceHistory = () => {
    onNavigate('service-history')
  }

  const handleNotifications = () => {
    onNavigate('notifications')
  }

  const handleContactStaff = () => {
    onNavigate('contact-staff')
  }

  const handleUserGuide = () => {
    onNavigate('user-guide')
  }

  const handleNotificationSettings = () => {
    onNavigate('notification-settings')
  }

  const handleStatistics = () => {
    onNavigate('statistics')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'รอจัดรถ'
      case 'ASSIGNED': return 'จัดรถแล้ว'
      case 'IN_PROGRESS': return 'กำลังเดินทาง'
      case 'COMPLETED': return 'เสร็จสิ้น'
      default: return status
    }
  }

  if (loading) {
    return (
      <CommunityLayout user={user} onNavigate={onNavigate} currentPage="dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
        </div>
      </CommunityLayout>
    )
  }

  return (
    <CommunityLayout user={user} onNavigate={onNavigate} currentPage="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              สวัสดี, {user.name}
            </h1>
            <p className="text-gray-600 mt-1">
              ยินดีต้อนรับสู่ระบบจัดการผู้ป่วยในชุมชน
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl">📊</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">รวมทั้งหมด</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalPatients + stats.pendingRides + stats.completedThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl">✅</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">เสร็จสิ้น</p>
                <p className="text-xl font-bold text-gray-900">{stats.completedThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl">⏱️</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">รอดำเนินการ</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendingRides}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">การดำเนินการด่วน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => onNavigate('register-patient')}
              className="bg-blue-600 hover:bg-blue-700 text-white h-20 flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-2xl">👤</span>
              <span>ลงทะเบียนผู้ป่วยใหม่</span>
            </Button>
            <Button
              onClick={() => onNavigate('track-ride')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-2xl">🚑</span>
              <span>ติดตามรถพยาบาล</span>
            </Button>
            <Button
              onClick={handleServiceHistory}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-2xl">📋</span>
              <span>ประวัติการใช้บริการ</span>
            </Button>
            <Button
              onClick={handleNotifications}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-2xl">🔔</span>
              <span>การแจ้งเตือน</span>
            </Button>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">ผู้ป่วยล่าสุด</h2>
            <Button
              onClick={() => onNavigate('register-patient')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + เพิ่มผู้ป่วยใหม่
            </Button>
          </div>
          
          {patients.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">👥</div>
              <p className="text-gray-600">ยังไม่มีข้อมูลผู้ป่วย</p>
              <Button
                onClick={() => onNavigate('register-patient')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                ลงทะเบียนผู้ป่วยคนแรก
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อ-นามสกุล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      อายุ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      อาการ/โรค
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เยี่ยมล่าสุด
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.slice(0, 5).map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.age} ปี
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.condition}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(patient.lastVisit).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => onNavigate('track-ride')}
                          size="sm"
                          variant="outline"
                        >
                          จองรถ
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Rides */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">การเดินทางล่าสุด</h2>
          
          {rides.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🚑</div>
              <p className="text-gray-600">ยังไม่มีประวัติการเดินทาง</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rides.slice(0, 3).map((ride) => (
                <div key={ride.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{ride.patientName}</h3>
                      <p className="text-sm text-gray-600">{ride.destination}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(ride.scheduledTime).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ride.status)}`}>
                      {getStatusText(ride.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CommunityLayout>
  )
}

export default CommunityDashboard
