import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import apiService from '../../services/api.js'

const CommunityDashboard = ({ user, onNavigate }) => {
  const [patients, setPatients] = useState([])
  const [rides, setRides] = useState([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingRides: 0,
    completedThisMonth: 0
  })
  const [showMenu, setShowMenu] = useState(false)
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
            name: 'นาย สมศักดิ์ ดีใจ',
            age: 72,
            condition: 'ไตเสื่อม',
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
            destination: 'โรงพยาบาลบางพลี',
            appointmentTime: '2025-09-26T10:00:00',
            status: 'ASSIGNED'
          },
          {
            id: 2,
            patientName: 'นาง สมหญิง รักดี',
            destination: 'โรงพยาบาลสมุทรปราการ',
            appointmentTime: '2025-09-26T14:30:00',
            status: 'PENDING'
          }
        ])
      }

      // Load statistics
      try {
        const statsData = await apiService.getCommunityStats(user.id)
        setStats(statsData || {
          totalPatients: 3,
          pendingRides: 2,
          completedThisMonth: 8
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
        // Fallback to mock data
        setStats({
          totalPatients: 3,
          pendingRides: 2,
          completedThisMonth: 8
        })
      }
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Event Handlers
  const handleRegisterNewPatient = () => {
    onNavigate('register-patient')
  }

  const handleBookRideForPatient = () => {
    onNavigate('book-ride')
  }

  const handleRequestRide = (patientId) => {
    onNavigate('book-ride', { patientId })
  }

  const handleEditPatient = (patientId) => {
    onNavigate('edit-patient', { patientId })
  }

  const handleCallPatient = (phone) => {
    window.open(`tel:${phone}`)
  }

  const handleTrackStatus = (rideId) => {
    onNavigate('track-ride', { rideId })
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
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${showMenu ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">เมนู</h2>
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
            <button
              onClick={handlePersonalInfo}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-3 text-gray-700 hover:text-gray-900"
            >
              <span className="text-lg">👤</span>
              <span>จัดการข้อมูลส่วนบุคคล</span>
            </button>
            <button
              onClick={handleServiceHistory}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-3 text-gray-700 hover:text-gray-900"
            >
              <span className="text-lg">📋</span>
              <span>ประวัติการใช้บริการ</span>
            </button>
            <button
              onClick={handleNotifications}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-3 text-gray-700 hover:text-gray-900"
            >
              <span className="text-lg">🔔</span>
              <span>การแจ้งเตือน</span>
            </button>
            <button
              onClick={handleContactStaff}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-3 text-gray-700 hover:text-gray-900"
            >
              <span className="text-lg">📞</span>
              <span>ติดต่อเจ้าหน้าที่</span>
            </button>
            <button
              onClick={handleUserGuide}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-3 text-gray-700 hover:text-gray-900"
            >
              <span className="text-lg">📖</span>
              <span>คู่มือการใช้งาน</span>
            </button>
            <button
              onClick={handleNotificationSettings}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-3 text-gray-700 hover:text-gray-900"
            >
              <span className="text-lg">⚙️</span>
              <span>ตั้งค่าการแจ้งเตือน</span>
            </button>
            <button
              onClick={handleStatistics}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-3 text-gray-700 hover:text-gray-900"
            >
              <span className="text-lg">📊</span>
              <span>รายงานสถิติ</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowMenu(true)}
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                >
                  <span className="text-lg">☰</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    สวัสดี, {user.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    ยินดีต้อนรับสู่ระบบจัดการผู้ป่วยในชุมชน
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-2xl">📊</div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">รวมทั้งหมด</p>
                    <p className="text-xl font-bold text-gray-900">{stats.totalPatients + stats.pendingRides + stats.completedThisMonth}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-2xl">✅</div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">เสร็จสิ้น</p>
                    <p className="text-xl font-bold text-gray-900">{stats.completedThisMonth}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-2xl">❌</div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">ยกเลิก</p>
                    <p className="text-xl font-bold text-gray-900">1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          การดำเนินการด่วน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handleRegisterNewPatient}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            + ลงทะเบียนผู้ป่วยใหม่
          </Button>
          <Button 
            onClick={handleBookRideForPatient}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            📅 จองรถสำหรับผู้ป่วย
          </Button>
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            ผู้ป่วยในความดูแล
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <div key={patient.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {patient.name}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">อายุ:</span> {patient.age} ปี
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">อาการ:</span> {patient.condition}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">เยี่ยมครั้งล่าสุด:</span> {new Date(patient.lastVisit).toLocaleDateString('th-TH')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">โทรศัพท์:</span> {patient.phone}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-6">
                  <Button
                    onClick={() => handleRequestRide(patient.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    จองรถ
                  </Button>
                  <Button
                    onClick={() => handleEditPatient(patient.id)}
                    variant="outline"
                    size="sm"
                  >
                    แก้ไขข้อมูล
                  </Button>
                  <Button
                    onClick={() => handleCallPatient(patient.phone)}
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    โทรหา
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Rides */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            การเดินทางล่าสุด
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {rides.map((ride) => (
            <div key={ride.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {ride.patientName}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ride.status)}`}>
                      {getStatusText(ride.status)}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">จุดหมาย:</span> {ride.destination}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">เวลานัด:</span> {new Date(ride.appointmentTime).toLocaleString('th-TH')}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-6">
                  <Button
                    onClick={() => handleTrackStatus(ride.id)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    ติดตามสถานะ
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {rides.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            ไม่มีการเดินทางในขณะนี้
          </div>
        )}
      </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityDashboard
