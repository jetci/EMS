import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

const TrackRideScreen = ({ user, onNavigate, pageData }) => {
  const [rideData, setRideData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadRideData()
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(loadRideData, 30000)
    return () => clearInterval(interval)
  }, [pageData])

  const loadRideData = async () => {
    if (!refreshing) setLoading(true)
    
    // Mock data for ride tracking
    const mockRideData = {
      id: pageData?.rideId || 1,
      patientName: 'นาย สมชาย ใจดี',
      patientPhone: '081-234-5678',
      destination: 'โรงพยาบาลบางพลี',
      appointmentTime: '2025-09-26T10:00:00',
      status: 'IN_PROGRESS',
      driver: {
        name: 'นาย สมศักดิ์ ขับดี',
        phone: '082-345-6789',
        photo: null,
        rating: 4.8,
        experience: '5 ปี'
      },
      vehicle: {
        type: 'รถตู้ปรับอากาศ',
        licensePlate: 'กข-1234',
        color: 'ขาว',
        model: 'Toyota Hiace',
        equipment: ['เครื่องช่วยหายใจ', 'เปลนอน', 'ชุดปฐมพยาบาล']
      },
      timeline: [
        {
          time: '09:30',
          status: 'ASSIGNED',
          description: 'จัดรถและคนขับเรียบร้อย',
          completed: true
        },
        {
          time: '09:45',
          status: 'DRIVER_DEPARTED',
          description: 'คนขับออกเดินทางไปรับผู้ป่วย',
          completed: true
        },
        {
          time: '10:00',
          status: 'ARRIVED_PICKUP',
          description: 'คนขับมาถึงจุดรับผู้ป่วยแล้ว',
          completed: true
        },
        {
          time: '10:15',
          status: 'PATIENT_ONBOARD',
          description: 'ผู้ป่วยขึ้นรถเรียบร้อย กำลังเดินทางไปโรงพยาบาล',
          completed: true
        },
        {
          time: '10:45',
          status: 'ARRIVED_DESTINATION',
          description: 'มาถึงโรงพยาบาลแล้ว',
          completed: false,
          estimated: true
        },
        {
          time: '11:00',
          status: 'COMPLETED',
          description: 'ส่งผู้ป่วยเรียบร้อย',
          completed: false,
          estimated: true
        }
      ],
      location: {
        currentLocation: 'กำลังเดินทางบนถนนบางนา-ตราด กม.15',
        estimatedArrival: '10:45',
        distanceRemaining: '8.5 กม.',
        trafficCondition: 'ปกติ'
      },
      notes: 'ผู้ป่วยต้องการเก้าอี้รถเข็น เตรียมไว้ที่โรงพยาบาลแล้ว',
      emergencyContact: {
        name: 'นาง สมใจ ใจดี',
        relation: 'ภรรยา',
        phone: '081-987-6543'
      }
    }
    
    setRideData(mockRideData)
    setLoading(false)
    setRefreshing(false)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadRideData()
  }

  const handleCallDriver = () => {
    if (rideData?.driver?.phone) {
      window.open(`tel:${rideData.driver.phone}`)
    }
  }

  const handleCallPatient = () => {
    if (rideData?.patientPhone) {
      window.open(`tel:${rideData.patientPhone}`)
    }
  }

  const handleCallEmergency = () => {
    if (rideData?.emergencyContact?.phone) {
      window.open(`tel:${rideData.emergencyContact.phone}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'รอจัดรถ'
      case 'ASSIGNED': return 'จัดรถแล้ว'
      case 'IN_PROGRESS': return 'กำลังเดินทาง'
      case 'COMPLETED': return 'เสร็จสิ้น'
      case 'CANCELLED': return 'ยกเลิก'
      default: return status
    }
  }

  const getCurrentStep = () => {
    if (!rideData?.timeline) return 0
    return rideData.timeline.findIndex(step => !step.completed)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">กำลังโหลดข้อมูลการเดินทาง...</div>
      </div>
    )
  }

  if (!rideData) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">ไม่พบข้อมูลการเดินทาง</div>
        <Button onClick={() => onNavigate('dashboard')} variant="outline">
          กลับหน้าหลัก
        </Button>
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
              ติดตามการเดินทาง
            </h1>
            <p className="text-gray-600 mt-1">
              รหัสการเดินทาง: #{rideData.id.toString().padStart(6, '0')}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={refreshing}
            >
              {refreshing ? '🔄 กำลังอัปเดต...' : '🔄 อัปเดต'}
            </Button>
            <Button
              onClick={() => onNavigate('dashboard')}
              variant="outline"
            >
              ← กลับหน้าหลัก
            </Button>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">สถานะปัจจุบัน</h2>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(rideData.status)}`}>
            {getStatusText(rideData.status)}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">ข้อมูลการเดินทาง</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">ผู้ป่วย:</span> {rideData.patientName}</p>
              <p><span className="font-medium">จุดหมาย:</span> {rideData.destination}</p>
              <p><span className="font-medium">เวลานัด:</span> {new Date(rideData.appointmentTime).toLocaleString('th-TH')}</p>
              {rideData.notes && (
                <p><span className="font-medium">หมายเหตุ:</span> {rideData.notes}</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">ตำแหน่งปัจจุบัน</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">ตำแหน่ง:</span> {rideData.location.currentLocation}</p>
              <p><span className="font-medium">ระยะทางที่เหลือ:</span> {rideData.location.distanceRemaining}</p>
              <p><span className="font-medium">เวลาถึงโดยประมาณ:</span> {rideData.location.estimatedArrival} น.</p>
              <p><span className="font-medium">สภาพการจราจร:</span> {rideData.location.trafficCondition}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">ขั้นตอนการเดินทาง</h2>
        
        <div className="space-y-4">
          {rideData.timeline.map((step, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed 
                  ? 'bg-green-600 text-white' 
                  : step.estimated 
                    ? 'bg-gray-200 text-gray-600' 
                    : 'bg-blue-600 text-white'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    step.completed ? 'text-gray-900' : step.estimated ? 'text-gray-500' : 'text-blue-600'
                  }`}>
                    {step.description}
                  </p>
                  <span className={`text-xs ${
                    step.completed ? 'text-gray-600' : step.estimated ? 'text-gray-400' : 'text-blue-600'
                  }`}>
                    {step.estimated ? `ประมาณ ${step.time} น.` : `${step.time} น.`}
                  </span>
                </div>
                
                {index < rideData.timeline.length - 1 && (
                  <div className={`mt-2 w-px h-6 ml-4 ${
                    step.completed ? 'bg-green-300' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver and Vehicle Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลคนขับ</h2>
          
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {rideData.driver.photo ? (
                <img src={rideData.driver.photo} alt="Driver" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="text-2xl">👨‍💼</span>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{rideData.driver.name}</h3>
              <div className="space-y-1 text-sm text-gray-600 mt-2">
                <p>⭐ คะแนน: {rideData.driver.rating}/5</p>
                <p>🚗 ประสบการณ์: {rideData.driver.experience}</p>
                <p>📞 โทรศัพท์: {rideData.driver.phone}</p>
              </div>
              
              <Button
                onClick={handleCallDriver}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                📞 โทรหาคนขับ
              </Button>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลรถ</h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚐</span>
              <div>
                <p className="font-medium text-gray-900">{rideData.vehicle.model}</p>
                <p className="text-sm text-gray-600">{rideData.vehicle.type} • {rideData.vehicle.color}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-center font-mono text-lg font-bold text-gray-900">
                {rideData.vehicle.licensePlate}
              </p>
            </div>
            
            <div>
              <p className="font-medium text-gray-900 mb-2">อุปกรณ์ในรถ:</p>
              <div className="flex flex-wrap gap-2">
                {rideData.vehicle.equipment.map((item, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center">
          🚨 ติดต่อฉุกเฉิน
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">ผู้ป่วย</h3>
            <p className="text-sm text-gray-600 mb-2">{rideData.patientName}</p>
            <Button
              onClick={handleCallPatient}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              📞 โทร {rideData.patientPhone}
            </Button>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">ผู้ติดต่อฉุกเฉิน</h3>
            <p className="text-sm text-gray-600">{rideData.emergencyContact.name}</p>
            <p className="text-xs text-gray-500 mb-2">({rideData.emergencyContact.relation})</p>
            <Button
              onClick={handleCallEmergency}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              📞 โทร {rideData.emergencyContact.phone}
            </Button>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">หน่วยฉุกเฉิน</h3>
            <p className="text-sm text-gray-600 mb-2">สำหรับเหตุฉุกเฉิน</p>
            <Button
              onClick={() => window.open('tel:1669')}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              📞 โทร 1669
            </Button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการ</h2>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => onNavigate('service-history')}
            variant="outline"
            className="text-blue-600 hover:text-blue-700"
          >
            📋 ดูประวัติการเดินทาง
          </Button>
          <Button 
            onClick={() => onNavigate('book-ride')}
            variant="outline"
            className="text-green-600 hover:text-green-700"
          >
            📅 จองรถใหม่
          </Button>
          <Button 
            onClick={() => onNavigate('contact-staff')}
            variant="outline"
            className="text-purple-600 hover:text-purple-700"
          >
            📞 ติดต่อเจ้าหน้าที่
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TrackRideScreen
