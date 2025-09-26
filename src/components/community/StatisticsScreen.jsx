import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

const StatisticsScreen = ({ user, onNavigate }) => {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month') // week, month, quarter, year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadStatistics()
  }, [selectedPeriod, selectedYear])

  const loadStatistics = async () => {
    setLoading(true)
    
    // Mock data for statistics
    const mockStats = {
      overview: {
        totalPatients: 3,
        totalRides: 12,
        completedRides: 10,
        cancelledRides: 2,
        totalDistance: 245.5, // km
        totalTime: 18.5 // hours
      },
      monthlyData: [
        { month: 'ม.ค.', rides: 2, completed: 2, cancelled: 0 },
        { month: 'ก.พ.', rides: 1, completed: 1, cancelled: 0 },
        { month: 'มี.ค.', rides: 3, completed: 2, cancelled: 1 },
        { month: 'เม.ย.', rides: 2, completed: 2, cancelled: 0 },
        { month: 'พ.ค.', rides: 1, completed: 1, cancelled: 0 },
        { month: 'มิ.ย.', rides: 0, completed: 0, cancelled: 0 },
        { month: 'ก.ค.', rides: 1, completed: 1, cancelled: 0 },
        { month: 'ส.ค.', rides: 0, completed: 0, cancelled: 0 },
        { month: 'ก.ย.', rides: 2, completed: 1, cancelled: 1 }
      ],
      patientStats: [
        {
          name: 'นาย สมชาย ใจดี',
          totalRides: 6,
          completedRides: 5,
          cancelledRides: 1,
          lastRide: '2025-09-20',
          avgRating: 4.8
        },
        {
          name: 'นาง สมหญิง รักดี',
          totalRides: 4,
          completedRides: 3,
          cancelledRides: 1,
          lastRide: '2025-09-18',
          avgRating: 4.9
        },
        {
          name: 'นาย สมศักดิ์ ดีใจ',
          totalRides: 2,
          completedRides: 2,
          cancelledRides: 0,
          lastRide: '2025-09-15',
          avgRating: 5.0
        }
      ],
      destinationStats: [
        { name: 'โรงพยาบาลบางพลี', count: 5, percentage: 41.7 },
        { name: 'โรงพยาบาลสมุทรปราการ', count: 3, percentage: 25.0 },
        { name: 'โรงพยาบาลบางนา', count: 2, percentage: 16.7 },
        { name: 'คลินิกเอกชน', count: 2, percentage: 16.7 }
      ],
      timeStats: {
        morningRides: 4, // 06:00-12:00
        afternoonRides: 6, // 12:00-18:00
        eveningRides: 2, // 18:00-24:00
        nightRides: 0 // 00:00-06:00
      },
      performanceMetrics: {
        onTimePercentage: 85.0,
        averageWaitTime: 12.5, // minutes
        averageRideTime: 35.2, // minutes
        customerSatisfaction: 4.7 // out of 5
      }
    }
    
    setStats(mockStats)
    setLoading(false)
  }

  const getSuccessRate = () => {
    if (!stats.overview) return 0
    return ((stats.overview.completedRides / stats.overview.totalRides) * 100).toFixed(1)
  }

  const getTimeSlotLabel = (slot) => {
    switch (slot) {
      case 'morning': return 'เช้า (06:00-12:00)'
      case 'afternoon': return 'บ่าย (12:00-18:00)'
      case 'evening': return 'เย็น (18:00-24:00)'
      case 'night': return 'กลางคืน (00:00-06:00)'
      default: return slot
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">กำลังโหลดสถิติ...</div>
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
              รายงานสถิติ
            </h1>
            <p className="text-gray-600 mt-1">
              สถิติการใช้บริการและข้อมูลเชิงลึก
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">สัปดาห์นี้</option>
              <option value="month">เดือนนี้</option>
              <option value="quarter">ไตรมาสนี้</option>
              <option value="year">ปีนี้</option>
            </select>
            <Button
              onClick={() => onNavigate('dashboard')}
              variant="outline"
            >
              ← กลับหน้าหลัก
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">👥</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ผู้ป่วยทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview?.totalPatients || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">🚗</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">การเดินทางทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview?.totalRides || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">✅</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">อัตราสำเร็จ</p>
              <p className="text-2xl font-bold text-green-600">{getSuccessRate()}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl">⭐</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ความพึงพอใจ</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.performanceMetrics?.customerSatisfaction || 0}/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          แนวโน้มการใช้บริการรายเดือน
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>การเดินทางทั้งหมด</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>เสร็จสิ้น</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>ยกเลิก</span>
            </div>
          </div>
          
          <div className="grid grid-cols-9 gap-2">
            {stats.monthlyData?.map((month, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 space-y-1">
                  <div 
                    className="bg-blue-500 rounded"
                    style={{ height: `${Math.max(month.rides * 10, 4)}px` }}
                    title={`ทั้งหมด: ${month.rides}`}
                  ></div>
                  <div 
                    className="bg-green-500 rounded"
                    style={{ height: `${Math.max(month.completed * 10, 4)}px` }}
                    title={`เสร็จสิ้น: ${month.completed}`}
                  ></div>
                  <div 
                    className="bg-red-500 rounded"
                    style={{ height: `${Math.max(month.cancelled * 10, 4)}px` }}
                    title={`ยกเลิก: ${month.cancelled}`}
                  ></div>
                </div>
                <div className="text-xs text-gray-600">{month.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Statistics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            สถิติรายผู้ป่วย
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {stats.patientStats?.map((patient, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {patient.name}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">การเดินทางทั้งหมด</p>
                      <p className="font-medium text-gray-900">{patient.totalRides}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">เสร็จสิ้น</p>
                      <p className="font-medium text-green-600">{patient.completedRides}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">ยกเลิก</p>
                      <p className="font-medium text-red-600">{patient.cancelledRides}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">คะแนนเฉลี่ย</p>
                      <p className="font-medium text-yellow-600">{patient.avgRating}/5</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    เดินทางครั้งล่าสุด: {new Date(patient.lastRide).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Destination and Time Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destination Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            จุดหมายยอดนิยม
          </h2>
          
          <div className="space-y-3">
            {stats.destinationStats?.map((dest, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{dest.name}</span>
                    <span className="text-sm text-gray-600">{dest.count} ครั้ง</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${dest.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slot Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            ช่วงเวลาการใช้บริการ
          </h2>
          
          <div className="space-y-3">
            {Object.entries(stats.timeStats || {}).map(([slot, count]) => (
              <div key={slot} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {getTimeSlotLabel(slot)}
                    </span>
                    <span className="text-sm text-gray-600">{count} ครั้ง</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / (stats.overview?.totalRides || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          ตัวชี้วัดประสิทธิภาพ
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.performanceMetrics?.onTimePercentage || 0}%
            </div>
            <p className="text-sm text-gray-600">การตรงต่อเวลา</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.performanceMetrics?.averageWaitTime || 0}
            </div>
            <p className="text-sm text-gray-600">เวลารอเฉลี่ย (นาที)</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.performanceMetrics?.averageRideTime || 0}
            </div>
            <p className="text-sm text-gray-600">เวลาเดินทางเฉลี่ย (นาที)</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          ส่งออกรายงาน
        </h2>
        <div className="flex space-x-3">
          <Button 
            onClick={() => alert('ฟีเจอร์ส่งออก PDF จะพร้อมใช้งานเร็วๆ นี้')}
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            📄 ส่งออก PDF
          </Button>
          <Button 
            onClick={() => alert('ฟีเจอร์ส่งออก Excel จะพร้อมใช้งานเร็วๆ นี้')}
            variant="outline"
            className="text-green-600 hover:text-green-700"
          >
            📊 ส่งออก Excel
          </Button>
          <Button 
            onClick={() => alert('ฟีเจอร์ส่งอีเมลรายงานจะพร้อมใช้งานเร็วๆ นี้')}
            variant="outline"
            className="text-blue-600 hover:text-blue-700"
          >
            📧 ส่งอีเมลรายงาน
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StatisticsScreen
