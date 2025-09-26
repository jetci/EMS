import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

const DriverDashboard = ({ user }) => {
  const [rides, setRides] = useState([])
  const [stats, setStats] = useState({
    pendingRides: 0,
    completedToday: 0,
    totalEarnings: 0
  })

  // Mock data for demonstration
  useEffect(() => {
    setRides([
      {
        id: 1,
        patientName: 'นาย สมชาย ใจดี',
        pickup: 'บ้านเลขที่ 123 หมู่ 5 ตำบลบางพลี',
        destination: 'โรงพยาบาลบางพลี',
        appointmentTime: '2025-09-26T10:00:00',
        status: 'ASSIGNED',
        distance: '5.2 กม.'
      },
      {
        id: 2,
        patientName: 'นาง สมหญิง รักดี',
        pickup: 'บ้านเลขที่ 456 หมู่ 3 ตำบลบางพลี',
        destination: 'โรงพยาบาลสมุทรปราการ',
        appointmentTime: '2025-09-26T14:30:00',
        status: 'PENDING',
        distance: '12.8 กม.'
      }
    ])

    setStats({
      pendingRides: 2,
      completedToday: 3,
      totalEarnings: 1250
    })
  }, [])

  const handleAcceptRide = (rideId) => {
    setRides(rides.map(ride => 
      ride.id === rideId 
        ? { ...ride, status: 'ACCEPTED' }
        : ride
    ))
  }

  const handleStartRide = (rideId) => {
    setRides(rides.map(ride => 
      ride.id === rideId 
        ? { ...ride, status: 'IN_PROGRESS' }
        : ride
    ))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'รอการยืนยัน'
      case 'ASSIGNED': return 'ได้รับมอบหมาย'
      case 'ACCEPTED': return 'ยืนยันแล้ว'
      case 'IN_PROGRESS': return 'กำลังเดินทาง'
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
          ยินดีต้อนรับสู่ระบบจัดการการเดินทางสำหรับคนขับรถ
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">🚗</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">งานที่รอดำเนินการ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRides}</p>
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">💰</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">รายได้วันนี้</p>
              <p className="text-2xl font-bold text-gray-900">฿{stats.totalEarnings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rides List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            งานที่ได้รับมอบหมาย
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
                      <span className="font-medium">จุดรับ:</span> {ride.pickup}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">จุดหมาย:</span> {ride.destination}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">เวลานัด:</span> {new Date(ride.appointmentTime).toLocaleString('th-TH')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">ระยะทาง:</span> {ride.distance}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-6">
                  {ride.status === 'ASSIGNED' && (
                    <Button
                      onClick={() => handleAcceptRide(ride.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      ยืนยันรับงาน
                    </Button>
                  )}
                  
                  {ride.status === 'ACCEPTED' && (
                    <Button
                      onClick={() => handleStartRide(ride.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      เริ่มเดินทาง
                    </Button>
                  )}
                  
                  {ride.status === 'IN_PROGRESS' && (
                    <div className="space-y-2">
                      <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                      >
                        ถึงจุดรับแล้ว
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                      >
                        ติดต่อผู้ป่วย
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    ดูแผนที่
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {rides.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            ไม่มีงานที่ได้รับมอบหมายในขณะนี้
          </div>
        )}
      </div>
    </div>
  )
}

export default DriverDashboard
