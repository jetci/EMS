import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

const BookRideScreen = ({ onBack, onSave, patientId }) => {
  const [patients, setPatients] = useState([])
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    destination: '',
    appointmentDate: '',
    appointmentTime: '',
    pickupAddress: '',
    notes: '',
    urgency: 'normal'
  })

  const [errors, setErrors] = useState({})

  // Mock patients data
  useEffect(() => {
    setPatients([
      { id: 1, name: 'นาย สมชาย ใจดี', phone: '081-234-5678' },
      { id: 2, name: 'นาง สมหญิง รักดี', phone: '082-345-6789' },
      { id: 3, name: 'นาย สมศักดิ์ ดีใจ', phone: '083-456-7890' }
    ])
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.patientId) {
      newErrors.patientId = 'กรุณาเลือกผู้ป่วย'
    }
    if (!formData.destination.trim()) {
      newErrors.destination = 'กรุณากรอกจุดหมาย'
    }
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'กรุณาเลือกวันที่นัด'
    }
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'กรุณาเลือกเวลานัด'
    }
    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'กรุณากรอกที่อยู่รับ'
    }

    // Check if appointment is in the past
    if (formData.appointmentDate && formData.appointmentTime) {
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`)
      const now = new Date()
      if (appointmentDateTime <= now) {
        newErrors.appointmentDate = 'วันและเวลานัดต้องเป็นอนาคต'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMinTime = () => {
    const today = new Date()
    const selectedDate = new Date(formData.appointmentDate)
    
    // If selected date is today, minimum time is current time + 2 hours
    if (selectedDate.toDateString() === today.toDateString()) {
      const minTime = new Date(today.getTime() + 2 * 60 * 60 * 1000)
      return minTime.toTimeString().slice(0, 5)
    }
    return '06:00'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            จองรถสำหรับผู้ป่วย
          </h1>
          <Button
            onClick={onBack}
            variant="outline"
          >
            ← กลับ
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              เลือกผู้ป่วย
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ผู้ป่วย *
              </label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.patientId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">เลือกผู้ป่วย</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.phone})
                  </option>
                ))}
              </select>
              {errors.patientId && (
                <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
              )}
            </div>
          </div>

          {/* Destination */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              จุดหมาย
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานพยาบาล/จุดหมาย *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.destination ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="เช่น โรงพยาบาลบางพลี, คลินิกเวชกรรม"
              />
              {errors.destination && (
                <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
              )}
            </div>
          </div>

          {/* Appointment DateTime */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              วันและเวลานัด
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่นัด *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.appointmentDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.appointmentDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.appointmentDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เวลานัด *
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  min={getMinTime()}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.appointmentTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.appointmentTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.appointmentTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pickup Address */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              ที่อยู่รับ
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ที่อยู่รับผู้ป่วย *
              </label>
              <textarea
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pickupAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ที่อยู่ที่ต้องการให้รถไปรับ"
              />
              {errors.pickupAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.pickupAddress}</p>
              )}
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              ระดับความเร่งด่วน
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ความเร่งด่วน
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">ไม่เร่งด่วน</option>
                <option value="normal">ปกติ</option>
                <option value="high">เร่งด่วน</option>
                <option value="emergency">ฉุกเฉิน</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมายเหตุเพิ่มเติม
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ข้อมูลเพิ่มเติมสำหรับคนขับรถ เช่น อุปกรณ์พิเศษที่ต้องการ"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              จองรถ
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookRideScreen
