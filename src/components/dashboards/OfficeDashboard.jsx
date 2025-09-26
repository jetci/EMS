import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

const OfficeDashboard = ({ user }) => {
  const [rides, setRides] = useState([])
  const [drivers, setDrivers] = useState([])
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeRides: 0,
    availableDrivers: 0,
    completedToday: 0
  })

  // Mock data for demonstration
  useEffect(() => {
    setRides([
      {
        id: 1,
        patientName: 'นาย สมชาย ใจดี',
        requester: 'ชุมชนบางพลี',
        pickup: 'บ้านเลขที่ 123 หมู่ 5',
        destination: 'โรงพยาบาลบางพลี',
        appointmentTime: '2025-09-26T10:00:00',
        status: 'PENDING',
        priority: 'HIGH'
      },
      {
        id: 2,
        patientName: 'นาง สมหญิง รักดี',
        requester: 'ชุมชนบางพลี',
        pickup: 'บ้านเลขที่ 456 หมู่ 3',
        destination: 'โรงพยาบาลสมุทรปราการ',
        appointmentTime: '2025-09-26T14:30:00',
        status: 'ASSIGNED',
        priority: 'MEDIUM',
        driverName: 'นาย สมศักดิ์ ขับดี'
      }
    ])

    setDrivers([
      {
        id: 1,
        name: 'นาย สมศักดิ์ ขับดี',
        phone: '081-111-2222',
        status: 'BUSY',
        currentLocation: 'บางพลี',
        rating: 4.8
      },
      {
        id: 2,
        name: 'นาย สมปอง ขับเก่ง',
        phone: '082-333-4444',
        status: 'AVAILABLE',
        currentLocation: 'สมุทรปราการ',
        rating: 4.9
      },
      {
        id: 3,
        name: 'นาง สมใส ขับดี',
        phone: '083-555-6666',
        status: 'AVAILABLE',
        currentLocation: 'บางนา',
        rating: 4.7
      }
    ])

    setStats({
      pendingRequests: 1,
      activeRides: 1,
      availableDrivers: 2,
      completedToday: 5
    })
  }, [])

  const handleAssignDriver = (rideId, driverId) => {
    const driver = drivers.find(d => d.id === driverId)
    setRides(rides.map(ride => 
      ride.id === rideId 
        ? { ...ride, status: 'ASSIGNED', driverName: driver.name }
        : ride
    ))
    setDrivers(drivers.map(driver => 
      driver.id === driverId 
        ? { ...driver, status: 'BUSY' }
        : driver
    ))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-red-100 text-red-800'
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'HIGH': return 'ด่วนมาก'
      case 'MEDIUM': return 'ปกติ'
      case 'LOW': return 'ไม่ด่วน'
      default: return priority
    }
  }

  const getDriverStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'BUSY': return 'bg-red-100 text-red-800'
      case 'OFFLINE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDriverStatusText = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'พร้อมรับงาน'
      case 'BUSY': return 'ไม่ว่าง'
      case 'OFFLINE': return 'ออฟไลน์'
      default: return status
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
          ยินดีต้อนรับสู่ระบบจัดการการเดินทางสำหรับเจ้าหน้าที่
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">⏳</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">รอจัดรถ</p>
              <p className="text-2xl font-bold text-red-600">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">🚗</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">กำลังเดินทาง</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeRides}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">👨‍💼</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">คนขับพร้อมรับงาน</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableDrivers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">✅</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">เสร็จสิ้นวันนี้</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            คำขอที่รอการจัดรถ
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {rides.filter(ride => ride.status === 'PENDING').map((ride) => (
            <div key={ride.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {ride.patientName}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ride.priority)}`}>
                      {getPriorityText(ride.priority)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ride.status)}`}>
                      {getStatusText(ride.status)}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">ผู้ขอ:</span> {ride.requester}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">จุดรับ:</span> {ride.pickup}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">จุดหมาย:</span> {ride.destination}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">เวลานัด:</span> {new Date(ride.appointmentTime).toLocaleString('th-TH')}
                    </p>
                  </div>
                </div>
                
                <div className="ml-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">เลือกคนขับ:</p>
                    {drivers.filter(driver => driver.status === 'AVAILABLE').map((driver) => (
                      <Button
                        key={driver.id}
                        onClick={() => handleAssignDriver(ride.id, driver.id)}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                      >
                        {driver.name} ({driver.currentLocation})
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {rides.filter(ride => ride.status === 'PENDING').length === 0 && (
          <div className="p-6 text-center text-gray-500">
            ไม่มีคำขอที่รอการจัดรถ
          </div>
        )}
      </div>

      {/* Active Rides */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            การเดินทางที่กำลังดำเนินการ
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {rides.filter(ride => ride.status !== 'PENDING' && ride.status !== 'COMPLETED').map((ride) => (
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
                      <span className="font-medium">คนขับ:</span> {ride.driverName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">จุดรับ:</span> {ride.pickup}
                    </p>
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
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    ติดตามสถานะ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    ติดต่อคนขับ
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {rides.filter(ride => ride.status !== 'PENDING' && ride.status !== 'COMPLETED').length === 0 && (
          <div className="p-6 text-center text-gray-500">
            ไม่มีการเดินทางที่กำลังดำเนินการ
          </div>
        )}
      </div>

      {/* Drivers Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            สถานะคนขับรถ
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {drivers.map((driver) => (
            <div key={driver.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {driver.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDriverStatusColor(driver.status)}`}>
                      {getDriverStatusText(driver.status)}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">โทรศัพท์:</span> {driver.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">ตำแหน่งปัจจุบัน:</span> {driver.currentLocation}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">คะแนนรีวิว:</span> ⭐ {driver.rating}/5.0
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    โทรหา
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    ดูตำแหน่ง
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OfficeDashboard
