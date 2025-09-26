import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

const ServiceHistoryScreen = ({ user, onNavigate }) => {
  const [serviceHistory, setServiceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, completed, cancelled

  useEffect(() => {
    // Mock data for service history
    const mockHistory = [
      {
        id: 1,
        patientName: 'นาย สมชาย ใจดี',
        destination: 'โรงพยาบาลบางพลี',
        appointmentDate: '2025-09-20',
        appointmentTime: '10:00',
        status: 'COMPLETED',
        driverName: 'นาย สมศักดิ์ ขับดี',
        vehicleNumber: 'กข-1234',
        notes: 'เดินทางสำเร็จ ผู้ป่วยปลอดภัย'
      },
      {
        id: 2,
        patientName: 'นาง สมหญิง รักดี',
        destination: 'โรงพยาบาลสมุทรปราการ',
        appointmentDate: '2025-09-18',
        appointmentTime: '14:30',
        status: 'COMPLETED',
        driverName: 'นาย สมปอง ใจดี',
        vehicleNumber: 'กข-5678',
        notes: 'เดินทางสำเร็จ'
      },
      {
        id: 3,
        patientName: 'นาย สมศักดิ์ ดีใจ',
        destination: 'โรงพยาบาลบางนา',
        appointmentDate: '2025-09-15',
        appointmentTime: '09:00',
        status: 'CANCELLED',
        driverName: '-',
        vehicleNumber: '-',
        notes: 'ยกเลิกเนื่องจากผู้ป่วยไม่สามารถเดินทางได้'
      },
      {
        id: 4,
        patientName: 'นาย สมชาย ใจดี',
        destination: 'โรงพยาบาลบางพลี',
        appointmentDate: '2025-09-10',
        appointmentTime: '11:00',
        status: 'COMPLETED',
        driverName: 'นาย สมศักดิ์ ขับดี',
        vehicleNumber: 'กข-1234',
        notes: 'เดินทางสำเร็จ ตรวจเลือดประจำเดือน'
      }
    ]
    
    setServiceHistory(mockHistory)
    setLoading(false)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'เสร็จสิ้น'
      case 'CANCELLED': return 'ยกเลิก'
      case 'IN_PROGRESS': return 'กำลังดำเนินการ'
      default: return status
    }
  }

  const filteredHistory = serviceHistory.filter(item => {
    if (filter === 'all') return true
    return item.status.toLowerCase() === filter.toLowerCase()
  })

  const getFilterCount = (filterType) => {
    if (filterType === 'all') return serviceHistory.length
    return serviceHistory.filter(item => item.status.toLowerCase() === filterType.toLowerCase()).length
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
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
              ประวัติการใช้บริการ
            </h1>
            <p className="text-gray-600 mt-1">
              ดูประวัติการจองรถและการเดินทางทั้งหมด
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
            onClick={() => setFilter('completed')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            เสร็จสิ้น ({getFilterCount('completed')})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'cancelled'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ยกเลิก ({getFilterCount('cancelled')})
          </button>
        </div>
      </div>

      {/* Service History List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            รายการประวัติ ({filteredHistory.length} รายการ)
          </h2>
        </div>
        
        {filteredHistory.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            ไม่มีประวัติการใช้บริการ
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredHistory.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.patientName}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">จุดหมาย:</span> {item.destination}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">วันที่:</span> {new Date(item.appointmentDate).toLocaleDateString('th-TH')}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">เวลา:</span> {item.appointmentTime} น.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">คนขับ:</span> {item.driverName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">ทะเบียนรถ:</span> {item.vehicleNumber}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">หมายเหตุ:</span> {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    {item.status === 'COMPLETED' && (
                      <Button
                        onClick={() => onNavigate('book-ride', { patientName: item.patientName, destination: item.destination })}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        จองซ้ำ
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">📊</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">รวมทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{serviceHistory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">✅</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">เสร็จสิ้น</p>
              <p className="text-2xl font-bold text-green-600">{getFilterCount('completed')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">❌</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ยกเลิก</p>
              <p className="text-2xl font-bold text-red-600">{getFilterCount('cancelled')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceHistoryScreen
