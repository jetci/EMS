import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import CommunityLayout from '../layouts/CommunityLayout.jsx'
import apiService from '../../services/api.js'
import ThaiCalendar from '../ui/ThaiCalendar.jsx'

const RegisterPatientScreen = ({ user, onNavigate, pageData, editMode = false }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // ข้อมูลระบุตัวตน
    idCardNumber: '',
    titleName: 'นาย',
    firstName: '',
    lastName: '',
    birthDate: '',
    age: '',
    gender: '',
    nationality: 'ไทย',
    religion: 'พุทธ',
    occupation: '',
    phone: '',
    email: '',
    
    // ข้อมูลทางการแพทย์เบื้องต้น
    bloodType: '',
    allergies: '',
    chronicDiseases: [],
    currentMedications: [],
    medicalHistory: '',
    disability: [],
    
    // ที่อยู่และข้อมูลติดต่อ
    houseNumber: '',
    village: '',
    subDistrict: '',
    district: '',
    province: '',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    emergencyContactAddress: '',
    
    // เอกสารแนบ
    idCardFile: null,
    medicalCertFile: null,
    insuranceFile: null,
    
    // หมายเหตุ
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [isDraft, setIsDraft] = useState(false)

  // โหลดข้อมูล Draft จาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    const savedDraft = localStorage.getItem('patientRegistrationDraft')
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft)
        setFormData(prev => ({ ...prev, ...draftData }))
        setIsDraft(true)
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
  }, [])

  // บันทึกข้อมูลเป็น Draft อัตโนมัติ
  const saveDraft = () => {
    try {
      localStorage.setItem('patientRegistrationDraft', JSON.stringify(formData))
      setIsDraft(true)
      alert('บันทึกข้อมูลแบบร่างเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลแบบร่าง')
    }
  }

  // ลบข้อมูล Draft
  const clearDraft = () => {
    localStorage.removeItem('patientRegistrationDraft')
    setIsDraft(false)
  }

  const steps = [
    { id: 1, title: 'ข้อมูลระบุตัวตน', icon: '👤' },
    { id: 2, title: 'ข้อมูลทางการแพทย์เบื้องต้น', icon: '🏥' },
    { id: 3, title: 'ที่อยู่และข้อมูลติดต่อ', icon: '📍' },
    { id: 4, title: 'เอกสารแนบ', icon: '📄' },
    { id: 5, title: 'ตรวจสอบข้อมูลก่อนบันทึก', icon: '✅' }
  ]

  // ตัวเลือกสำหรับ Tag-based input
  const disabilityOptions = [
    'ความพิการทางการเห็น',
    'ความพิการทางการได้ยิน',
    'ความพิการทางการเคลื่อนไหว',
    'ความพิการทางสติปัญญา',
    'ความพิการทางจิตใจ',
    'ความพิการทางการเรียนรู้',
    'ความพิการทางออทิสติก',
    'ความพิการซ้ำซ้อน'
  ]

  const chronicDiseaseOptions = [
    'เบาหวาน',
    'ความดันโลหิตสูง',
    'โรคหัวใจ',
    'โรคไต',
    'โรคตับ',
    'โรคปอด',
    'โรคมะเร็ง',
    'โรคไทรอยด์',
    'โรคกระดูกพรุน',
    'โรคข้อเข่าเสื่อม',
    'โรคหลอดเลือดสมอง',
    'โรคลมชัก'
  ]

  const medicationOptions = [
    'ยาลดความดัน',
    'ยาเบาหวาน',
    'ยาลดไขมัน',
    'ยาแก้ปวด',
    'ยาแก้อักเสบ',
    'ยาต้านการแข็งตัวของเลือด',
    'ยาต้านซึมเศร้า',
    'ยาลดกรด',
    'ยาแคลเซียม',
    'วิตามิน',
    'ยาสมุนไพร'
  ]

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

  const handleBirthDateChange = (formattedDate, selectedDate) => {
    // คำนวณอายุอัตโนมัติเมื่อเลือกวันเกิด
    const today = new Date()
    let age = today.getFullYear() - selectedDate.getFullYear()
    const monthDiff = today.getMonth() - selectedDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
      age--
    }
    
    setFormData(prev => ({
      ...prev,
      birthDate: formattedDate,
      age: age.toString()
    }))

    // Clear error when user selects a date
    if (errors.birthDate) {
      setErrors(prev => ({
        ...prev,
        birthDate: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }))
  }


  // ฟังก์ชันสำหรับจัดการ Tag-based input
  const handleTagToggle = (fieldName, value) => {
    setFormData(prev => {
      const currentValues = prev[fieldName] || []
      const isSelected = currentValues.includes(value)
      
      if (isSelected) {
        return {
          ...prev,
          [fieldName]: currentValues.filter(item => item !== value)
        }
      } else {
        return {
          ...prev,
          [fieldName]: [...currentValues, value]
        }
      }
    })
  }

  // คอมโพเนนต์สำหรับแสดง Tag-based input
  const TagSelector = ({ fieldName, options, label, placeholder }) => {
    const selectedValues = formData[fieldName] || []
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="border border-gray-300 rounded-md p-3 min-h-[100px] bg-gray-50">
          {selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedValues.map((value, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => handleTagToggle(fieldName, value)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="text-sm text-gray-600 mb-2">เลือกจากตัวเลือกด้านล่าง:</div>
          <div className="flex flex-wrap gap-2">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTagToggle(fieldName, option)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedValues.includes(option)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {selectedValues.length === 0 && (
            <div className="text-gray-400 text-sm mt-2">{placeholder}</div>
          )}
        </div>
      </div>
    )
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    switch (step) {
      case 1:
        if (!formData.idCardNumber.trim()) {
          newErrors.idCardNumber = 'กรุณากรอกเลขบัตรประชาชน'
        } else if (formData.idCardNumber.length !== 13) {
          newErrors.idCardNumber = 'เลขบัตรประชาชนต้องมี 13 หลัก'
        } else if (!/^\d{13}$/.test(formData.idCardNumber)) {
          newErrors.idCardNumber = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น'
        }
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'กรุณากรอกชื่อ'
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'กรุณากรอกนามสกุล'
        }
        if (!formData.birthDate.trim()) {
          newErrors.birthDate = 'กรุณาเลือกวันเกิด'
        }
        if (!formData.gender.trim()) {
          newErrors.gender = 'กรุณาเลือกเพศ'
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์'
        } else if (!/^[0-9-]{10,12}$/.test(formData.phone.replace(/-/g, ''))) {
          newErrors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 081-234-5678)'
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
        }
        break
        
      case 2:
        if (!formData.bloodType.trim()) {
          newErrors.bloodType = 'กรุณาเลือกหมู่เลือด'
        }
        break
        
      case 3:
        if (!formData.houseNumber.trim()) {
          newErrors.houseNumber = 'กรุณากรอกบ้านเลขที่'
        }
        if (!formData.subDistrict.trim()) {
          newErrors.subDistrict = 'กรุณากรอกตำบล'
        }
        if (!formData.district.trim()) {
          newErrors.district = 'กรุณากรอกอำเภอ'
        }
        if (!formData.province.trim()) {
          newErrors.province = 'กรุณากรอกจังหวัด'
        }
        if (!formData.emergencyContactName.trim()) {
          newErrors.emergencyContactName = 'กรุณากรอกชื่อผู้ติดต่อฉุกเฉิน'
        }
        if (!formData.emergencyContactPhone.trim()) {
          newErrors.emergencyContactPhone = 'กรุณากรอกเบอร์โทรผู้ติดต่อฉุกเฉิน'
        } else if (!/^[0-9-]{10,12}$/.test(formData.emergencyContactPhone.replace(/-/g, ''))) {
          newErrors.emergencyContactPhone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
        }
        if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode)) {
          newErrors.postalCode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'
        }
        break
        
      case 4:
        if (!formData.idCardFile) {
          newErrors.idCardFile = 'กรุณาแนบสำเนาบัตรประชาชน'
        } else {
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
          const maxSize = 5 * 1024 * 1024 // 5MB
          
          if (!allowedTypes.includes(formData.idCardFile.type)) {
            newErrors.idCardFile = 'รองรับเฉพาะไฟล์ JPG, PNG, PDF เท่านั้น'
          } else if (formData.idCardFile.size > maxSize) {
            newErrors.idCardFile = 'ขนาดไฟล์ต้องไม่เกิน 5MB'
          }
        }
        
        // ตรวจสอบไฟล์อื่นๆ ถ้ามีการอัปโหลด
        if (formData.medicalCertFile) {
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
          const maxSize = 5 * 1024 * 1024
          
          if (!allowedTypes.includes(formData.medicalCertFile.type)) {
            newErrors.medicalCertFile = 'รองรับเฉพาะไฟล์ JPG, PNG, PDF เท่านั้น'
          } else if (formData.medicalCertFile.size > maxSize) {
            newErrors.medicalCertFile = 'ขนาดไฟล์ต้องไม่เกิน 5MB'
          }
        }
        
        if (formData.insuranceFile) {
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
          const maxSize = 5 * 1024 * 1024
          
          if (!allowedTypes.includes(formData.insuranceFile.type)) {
            newErrors.insuranceFile = 'รองรับเฉพาะไฟล์ JPG, PNG, PDF เท่านั้น'
          } else if (formData.insuranceFile.size > maxSize) {
            newErrors.insuranceFile = 'ขนาดไฟล์ต้องไม่เกิน 5MB'
          }
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Prepare patient data
      const patientData = {
        id_card_number: formData.idCardNumber,
        title_name: formData.titleName,
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formData.birthDate,
        age: parseInt(formData.age) || new Date().getFullYear() - new Date(formData.birthDate).getFullYear(),
        gender: formData.gender,
        nationality: formData.nationality,
        religion: formData.religion,
        occupation: formData.occupation,
        phone: formData.phone,
        email: formData.email,
        blood_type: formData.bloodType,
        allergies: formData.allergies,
        chronic_diseases: Array.isArray(formData.chronicDiseases) ? formData.chronicDiseases.join(', ') : formData.chronicDiseases,
        current_medications: Array.isArray(formData.currentMedications) ? formData.currentMedications.join(', ') : formData.currentMedications,
        medical_history: formData.medicalHistory,
        disability: Array.isArray(formData.disability) ? formData.disability.join(', ') : formData.disability,
        house_number: formData.houseNumber,
        village: formData.village,
        sub_district: formData.subDistrict,
        district: formData.district,
        province: formData.province,
        postal_code: formData.postalCode,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_relation: formData.emergencyContactRelation,
        emergency_contact_phone: formData.emergencyContactPhone,
        emergency_contact_address: formData.emergencyContactAddress,
        notes: formData.notes,
        community_id: user.community_id || user.id,
        created_by: user.id
      }
      
      await apiService.createPatient(patientData)
      clearDraft() // ลบข้อมูล Draft เมื่อบันทึกสำเร็จ
      alert('ลงทะเบียนผู้ป่วยเรียบร้อยแล้ว')
      onNavigate('dashboard')
    } catch (error) {
      console.error('Patient registration failed:', error)
      alert('เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลระบุตัวตน</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เลขบัตรประชาชน *
                </label>
                <input
                  type="text"
                  name="idCardNumber"
                  value={formData.idCardNumber}
                  onChange={handleInputChange}
                  maxLength="13"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.idCardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1234567890123"
                />
                {errors.idCardNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.idCardNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  คำนำหน้า *
                </label>
                <select
                  name="titleName"
                  value={formData.titleName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="เด็กชาย">เด็กชาย</option>
                  <option value="เด็กหญิง">เด็กหญิง</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="กรอกนามสกุล"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันเกิด *
                </label>
                <ThaiCalendar
                  value={formData.birthDate}
                  onChange={handleBirthDateChange}
                  error={errors.birthDate}
                  maxDate={new Date()}
                  minDate={new Date(1900, 0, 1)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อายุ (ปี)
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="อายุจะคำนวณอัตโนมัติ"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">อายุจะคำนวณอัตโนมัติจากวันเกิด</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เพศ *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">เลือกเพศ</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สัญชาติ
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ไทย"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ศาสนา
                </label>
                <input
                  type="text"
                  name="religion"
                  value={formData.religion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="พุทธ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อาชีพ
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกอาชีพ"
                />
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="081-234-5678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลทางการแพทย์เบื้องต้น</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมู่เลือด *
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.bloodType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">เลือกหมู่เลือด</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
                {errors.bloodType && (
                  <p className="text-red-500 text-sm mt-1">{errors.bloodType}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <TagSelector
                  fieldName="disability"
                  options={disabilityOptions}
                  label="ความพิการ (ถ้ามี)"
                  placeholder="เลือกประเภทความพิการที่มี (สามารถเลือกได้หลายรายการ)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประวัติแพ้ยา/อาหาร
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ระบุสิ่งที่แพ้ เช่น ยาปฏิชีวนะ, กุ้ง, ไข่"
              />
            </div>

            <TagSelector
              fieldName="chronicDiseases"
              options={chronicDiseaseOptions}
              label="โรคประจำตัว"
              placeholder="เลือกโรคประจำตัวที่มี (สามารถเลือกได้หลายรายการ)"
            />

            <TagSelector
              fieldName="currentMedications"
              options={medicationOptions}
              label="ยาที่ใช้ประจำ"
              placeholder="เลือกยาที่ใช้ประจำ (สามารถเลือกได้หลายรายการ)"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประวัติการรักษา
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ประวัติการผ่าตัด, การรักษาที่สำคัญ"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ที่อยู่และข้อมูลติดต่อ</h3>
            
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">ที่อยู่ปัจจุบัน</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    บ้านเลขที่ *
                  </label>
                  <input
                    type="text"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.houseNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ตำบล *
                  </label>
                  <input
                    type="text"
                    name="subDistrict"
                    value={formData.subDistrict}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.subDistrict ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="เวียง"
                  />
                  {errors.subDistrict && (
                    <p className="text-red-500 text-sm mt-1">{errors.subDistrict}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อำเภอ *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.district ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ฝาง"
                  />
                  {errors.district && (
                    <p className="text-red-500 text-sm mt-1">{errors.district}</p>
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.province ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="เชียงใหม่"
                  />
                  {errors.province && (
                    <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสไปรษณีย์
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    maxLength="5"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="50110"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">ผู้ติดต่อฉุกเฉิน</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อผู้ติดต่อฉุกเฉิน *
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ชื่อ-นามสกุล"
                  />
                  {errors.emergencyContactName && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ความสัมพันธ์
                  </label>
                  <select
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">เลือกความสัมพันธ์</option>
                    <option value="บิดา">บิดา</option>
                    <option value="มารดา">มารดา</option>
                    <option value="สามี">สามี</option>
                    <option value="ภรรยา">ภรรยา</option>
                    <option value="บุตร">บุตร</option>
                    <option value="พี่น้อง">พี่น้อง</option>
                    <option value="ญาติ">ญาติ</option>
                    <option value="เพื่อน">เพื่อน</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทรผู้ติดต่อฉุกเฉิน *
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="081-234-5678"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ที่อยู่ผู้ติดต่อฉุกเฉิน
                  </label>
                  <textarea
                    name="emergencyContactAddress"
                    value={formData.emergencyContactAddress}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ที่อยู่ผู้ติดต่อฉุกเฉิน"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">เอกสารแนบ</h3>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สำเนาบัตรประชาชน *
                </label>
                <input
                  type="file"
                  name="idCardFile"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.idCardFile ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formData.idCardFile && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-green-700">
                        {formData.idCardFile.name} ({(formData.idCardFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  </div>
                )}
                {errors.idCardFile && (
                  <p className="text-red-500 text-sm mt-1">{errors.idCardFile}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 5MB</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ใบรับรองแพทย์ (ถ้ามี)
                </label>
                <input
                  type="file"
                  name="medicalCertFile"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.medicalCertFile ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formData.medicalCertFile && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-green-700">
                        {formData.medicalCertFile.name} ({(formData.medicalCertFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  </div>
                )}
                {errors.medicalCertFile && (
                  <p className="text-red-500 text-sm mt-1">{errors.medicalCertFile}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 5MB</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  บัตรประกันสุขภาพ (ถ้ามี)
                </label>
                <input
                  type="file"
                  name="insuranceFile"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.insuranceFile ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formData.insuranceFile && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-green-700">
                        {formData.insuranceFile.name} ({(formData.insuranceFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  </div>
                )}
                {errors.insuranceFile && (
                  <p className="text-red-500 text-sm mt-1">{errors.insuranceFile}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 5MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมายเหตุเพิ่มเติม
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ข้อมูลเพิ่มเติมที่ต้องการแจ้ง"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ตรวจสอบข้อมูลก่อนบันทึก</h3>
              <p className="text-gray-600">กรุณาตรวจสอบข้อมูลทั้งหมดให้ถูกต้องก่อนทำการบันทึก</p>
            </div>
            
            <div className="space-y-6">
              {/* ข้อมูลระบุตัวตน */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">ข้อมูลระบุตัวตน</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">เลขบัตรประชาชน:</span>
                    <span className="font-medium">{formData.idCardNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ชื่อ-นามสกุล:</span>
                    <span className="font-medium">{formData.titleName} {formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันเกิด:</span>
                    <span className="font-medium">{formData.birthDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">อายุ:</span>
                    <span className="font-medium">{formData.age} ปี</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">เพศ:</span>
                    <span className="font-medium">{formData.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สัญชาติ:</span>
                    <span className="font-medium">{formData.nationality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ศาสนา:</span>
                    <span className="font-medium">{formData.religion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">อาชีพ:</span>
                    <span className="font-medium">{formData.occupation || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">เบอร์โทร:</span>
                    <span className="font-medium">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">อีเมล:</span>
                    <span className="font-medium">{formData.email || '-'}</span>
                  </div>
                </div>
              </div>

              {/* ข้อมูลทางการแพทย์ */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 font-semibold">2</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">ข้อมูลทางการแพทย์</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">หมู่เลือด:</span>
                    <span className="font-medium">{formData.bloodType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ความพิการ:</span>
                    <span className="font-medium">
                      {Array.isArray(formData.disability) && formData.disability.length > 0 
                        ? formData.disability.join(', ') 
                        : '-'}
                    </span>
                  </div>
                </div>
                {(formData.allergies || (Array.isArray(formData.chronicDiseases) && formData.chronicDiseases.length > 0) || (Array.isArray(formData.currentMedications) && formData.currentMedications.length > 0) || formData.medicalHistory) && (
                  <div className="mt-4 space-y-2">
                    {formData.allergies && (
                      <div>
                        <span className="text-gray-600 font-medium">ประวัติแพ้ยา/อาหาร:</span>
                        <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{formData.allergies}</p>
                      </div>
                    )}
                    {Array.isArray(formData.chronicDiseases) && formData.chronicDiseases.length > 0 && (
                      <div>
                        <span className="text-gray-600 font-medium">โรคประจำตัว:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.chronicDiseases.map((disease, index) => (
                            <span key={index} className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {disease}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(formData.currentMedications) && formData.currentMedications.length > 0 && (
                      <div>
                        <span className="text-gray-600 font-medium">ยาที่ใช้ประจำ:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.currentMedications.map((medication, index) => (
                            <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {medication}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.medicalHistory && (
                      <div>
                        <span className="text-gray-600 font-medium">ประวัติการรักษา:</span>
                        <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{formData.medicalHistory}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ที่อยู่และผู้ติดต่อฉุกเฉิน */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">3</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">ที่อยู่และผู้ติดต่อฉุกเฉิน</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">ที่อยู่ปัจจุบัน:</span>
                    <p className="mt-1">{formData.houseNumber} {formData.village && `หมู่ ${formData.village}`} ต.{formData.subDistrict} อ.{formData.district} จ.{formData.province} {formData.postalCode}</p>
                  </div>
                  <div className="border-t pt-3">
                    <span className="text-gray-600 font-medium">ผู้ติดต่อฉุกเฉิน:</span>
                    <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>ชื่อ: {formData.emergencyContactName}</div>
                      <div>ความสัมพันธ์: {formData.emergencyContactRelation || '-'}</div>
                      <div>เบอร์โทร: {formData.emergencyContactPhone}</div>
                      {formData.emergencyContactAddress && (
                        <div className="md:col-span-2">ที่อยู่: {formData.emergencyContactAddress}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* เอกสารแนบ */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold">4</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">เอกสารแนบ</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">บัตรประชาชน:</span>
                    <span className={`font-medium ${formData.idCardFile ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.idCardFile ? (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {formData.idCardFile.name}
                        </div>
                      ) : 'ไม่มี'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">ใบรับรองแพทย์:</span>
                    <span className={`font-medium ${formData.medicalCertFile ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.medicalCertFile ? (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {formData.medicalCertFile.name}
                        </div>
                      ) : 'ไม่มี'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">บัตรประกันสุขภาพ:</span>
                    <span className={`font-medium ${formData.insuranceFile ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.insuranceFile ? (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {formData.insuranceFile.name}
                        </div>
                      ) : 'ไม่มี'}
                    </span>
                  </div>
                </div>
              </div>

              {/* หมายเหตุ */}
              {formData.notes && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">หมายเหตุเพิ่มเติม</h4>
                  <p className="text-sm p-3 bg-gray-50 rounded">{formData.notes}</p>
                </div>
              )}

              {/* คำเตือน */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h5 className="font-medium text-yellow-800">กรุณาตรวจสอบข้อมูลให้ถูกต้อง</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      เมื่อกดบันทึกแล้ว ข้อมูลจะถูกส่งไปยังระบบและไม่สามารถแก้ไขได้ กรุณาตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนดำเนินการ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <CommunityLayout 
      user={user} 
      onNavigate={onNavigate} 
      currentPage="register-patient"
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ลงทะเบียนผู้ป่วยใหม่
            </h1>
            {isDraft && (
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm text-orange-600">มีข้อมูลแบบร่างที่บันทึกไว้</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={saveDraft}
              variant="outline"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              💾 บันทึกแบบร่าง
            </Button>
            <Button
              onClick={() => onNavigate('dashboard')}
              variant="outline"
            >
              ← กลับ
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-105 ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                      : currentStep === step.id - 1
                      ? 'bg-blue-100 border-blue-300 text-blue-600 hover:bg-blue-200'
                      : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
                  }`}
                  disabled={step.id > currentStep + 1}
                >
                  {currentStep > step.id ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                </button>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    ขั้นตอนที่ {step.id}
                  </p>
                  <p className={`text-xs ${
                    currentStep >= step.id ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 hidden md:block">
                  <div className={`h-1 rounded-full transition-all duration-500 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Progress Indicator */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-600">
              ขั้นตอนที่ {currentStep} จาก {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm font-medium text-blue-600">
              {steps[currentStep - 1].title}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          {renderStepContent()}
        </div>

        {/* Error Message */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={prevStep}
            variant="outline"
            disabled={currentStep === 1}
          >
            ← ย้อนกลับ
          </Button>

          <div className="flex space-x-4">
            <Button
              onClick={() => onNavigate('dashboard')}
              variant="outline"
            >
              ยกเลิก
            </Button>
            
            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                ถัดไป →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </Button>
            )}
          </div>
        </div>
      </div>
      </div>
    </CommunityLayout>
  )
}

export default RegisterPatientScreen
