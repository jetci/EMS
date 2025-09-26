import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

const PersonalInfoScreen = ({ user, onNavigate, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    houseNumber: '',
    moo: '',
    tambon: '',
    amphoe: '',
    province: '',
    postalCode: '',
    emergencyPhone: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState({})

  // Load user data
  useEffect(() => {
    if (user) {
      // Split name if it exists
      const nameParts = user.name ? user.name.split(' ') : ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      setFormData({
        firstName: user.firstName || firstName,
        lastName: user.lastName || lastName,
        email: user.email || '',
        phone: user.phone || '',
        houseNumber: user.houseNumber || '',
        moo: user.moo || '',
        tambon: user.tambon || '',
        amphoe: user.amphoe || '',
        province: user.province || '',
        postalCode: user.postalCode || '',
        emergencyPhone: user.emergencyPhone || ''
      })
    }
  }, [user])

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'กรุณากรอกชื่อ'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'กรุณากรอกนามสกุล'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์'
    }
    
    // Address validation
    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = 'กรุณากรอกบ้านเลขที่'
    }
    if (!formData.tambon.trim()) {
      newErrors.tambon = 'กรุณากรอกตำบล'
    }
    if (!formData.amphoe.trim()) {
      newErrors.amphoe = 'กรุณากรอกอำเภอ'
    }
    if (!formData.province.trim()) {
      newErrors.province = 'กรุณากรอกจังหวัด'
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'กรุณากรอกรหัสไปรษณีย์'
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors = {}
    
    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน'
    }
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = 'กรุณากรอกรหัสผ่านใหม่'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    }
    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านใหม่ไม่ตรงกัน'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // Combine firstName and lastName for backward compatibility
      const dataToSave = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim()
      }
      onSave(dataToSave)
      setIsEditing(false)
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (validatePasswordForm()) {
      // Handle password change
      console.log('Password change:', passwordData)
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      alert('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว')
    }
  }

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || '',
        medicalInfo: user.medicalInfo || '',
        notes: user.notes || ''
      })
    }
    setIsEditing(false)
    setErrors({})
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            ข้อมูลส่วนบุคคล
          </h1>
          <div className="flex space-x-2">
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                แก้ไขข้อมูล
              </Button>
            )}
            <Button
              onClick={() => onNavigate('dashboard')}
              variant="outline"
            >
              ← กลับ
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              ข้อมูลพื้นฐาน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-100' : ''
                  } ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="กรอกชื่อ"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  นามสกุล *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-100' : ''
                  } ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="กรอกนามสกุล"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-100' : ''
                  } ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์ *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-100' : ''
                  } ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="081-234-5678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ที่อยู่
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    บ้านเลขที่ *
                  </label>
                  <input
                    type="text"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    } ${errors.houseNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="123"
                  />
                  {errors.houseNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.houseNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หมู่ที่
                  </label>
                  <input
                    type="text"
                    name="moo"
                    value={formData.moo}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    } border-gray-300`}
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ตำบล *
                  </label>
                  <input
                    type="text"
                    name="tambon"
                    value={formData.tambon}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    } ${errors.tambon ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="เวียง"
                  />
                  {errors.tambon && (
                    <p className="text-red-500 text-sm mt-1">{errors.tambon}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อำเภอ *
                  </label>
                  <input
                    type="text"
                    name="amphoe"
                    value={formData.amphoe}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    } ${errors.amphoe ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="ฝาง"
                  />
                  {errors.amphoe && (
                    <p className="text-red-500 text-sm mt-1">{errors.amphoe}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    จังหวัด *
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    } ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="เชียงใหม่"
                  />
                  {errors.province && (
                    <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสไปรษณีย์ *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    maxLength={5}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    } ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="50110"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              ผู้ติดต่อฉุกเฉิน
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรผู้ติดต่อฉุกเฉิน
              </label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditing ? 'bg-gray-100' : ''
                } border-gray-300`}
                placeholder="081-234-5678"
              />
            </div>
          </div>



          {/* Submit Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                บันทึกข้อมูล
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          เปลี่ยนรหัสผ่าน
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่านปัจจุบัน *
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="กรอกรหัสผ่านปัจจุบัน"
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่านใหม่ *
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ยืนยันรหัสผ่านใหม่ *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              เปลี่ยนรหัสผ่าน
            </Button>
          </div>
        </form>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          สถานะบัญชี
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-green-600 text-2xl mb-2">✓</div>
            <div className="text-sm font-medium text-gray-900">อีเมลยืนยันแล้ว</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-blue-600 text-2xl mb-2">👥</div>
            <div className="text-sm font-medium text-gray-900">สมาชิกชุมชน</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-gray-600 text-2xl mb-2">📅</div>
            <div className="text-sm font-medium text-gray-900">สมัครเมื่อ: {new Date().toLocaleDateString('th-TH')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfoScreen
