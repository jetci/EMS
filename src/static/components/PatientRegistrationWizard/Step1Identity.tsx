// src/components/PatientRegistrationWizard/Step1Identity.tsx
import React, { useState, useEffect } from 'react';

interface Step1IdentityProps {
  onNext?: (data: any) => void;
  onBack?: () => void;
  currentData?: any;
  isLastStep?: boolean;
}

const Step1Identity: React.FC<Step1IdentityProps> = ({ 
  onNext, 
  currentData = {} 
}) => {
  const [formData, setFormData] = useState({
    title: currentData.title || '',
    firstName: currentData.firstName || '',
    lastName: currentData.lastName || '',
    idCard: currentData.idCard || '',
    birthDay: currentData.birthDay || '',
    birthMonth: currentData.birthMonth || '',
    birthYear: currentData.birthYear || '',
    gender: currentData.gender || '',
    age: currentData.age || ''
  });

  const [errors, setErrors] = useState<any>({});

  // Auto-calculate age when birth date changes
  useEffect(() => {
    if (formData.birthDay && formData.birthMonth && formData.birthYear) {
      const birthDate = new Date(
        parseInt(formData.birthYear) - 543, // Convert Buddhist year to Gregorian
        parseInt(formData.birthMonth) - 1,
        parseInt(formData.birthDay)
      );
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFormData(prev => ({ ...prev, age: (age - 1).toString() }));
      } else {
        setFormData(prev => ({ ...prev, age: age.toString() }));
      }
    }
  }, [formData.birthDay, formData.birthMonth, formData.birthYear]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.title) newErrors.title = 'กรุณาเลือกคำนำหน้าชื่อ';
    if (!formData.firstName.trim()) newErrors.firstName = 'กรุณากรอกชื่อ';
    if (!formData.lastName.trim()) newErrors.lastName = 'กรุณากรอกนามสกุล';
    if (!formData.idCard.trim()) {
      newErrors.idCard = 'กรุณากรอกเลขบัตรประชาชน';
    } else if (formData.idCard.length !== 13) {
      newErrors.idCard = 'เลขบัตรประชาชนต้องมี 13 หลัก';
    }
    if (!formData.birthDay) newErrors.birthDay = 'กรุณาเลือกวันเกิด';
    if (!formData.birthMonth) newErrors.birthMonth = 'กรุณาเลือกเดือนเกิด';
    if (!formData.birthYear) newErrors.birthYear = 'กรุณาเลือกปีเกิด';
    if (!formData.gender) newErrors.gender = 'กรุณาเลือกเพศ';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onNext) {
      onNext(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          ขั้นตอนที่ 1: ข้อมูลระบุตัวตน
        </h3>
        <p className="text-gray-600">
          กรุณากรอกข้อมูลส่วนตัวของผู้ป่วยให้ครบถ้วน
        </p>
      </div>

      <form id="step-0-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Upload */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำนำหน้าชื่อ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- เลือก --</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
              <option value="เด็กชาย">เด็กชาย</option>
              <option value="เด็กหญิง">เด็กหญิง</option>
            </select>
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เพศ <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="ชาย"
                  checked={formData.gender === 'ชาย'}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="mr-2"
                />
                ชาย
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="หญิง"
                  checked={formData.gender === 'หญิง'}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="mr-2"
                />
                หญิง
              </label>
            </div>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="กรอกชื่อ"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="กรอกนามสกุล"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          {/* ID Card */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลขบัตรประชาชน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.idCard}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                handleInputChange('idCard', value);
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.idCard ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
              maxLength={13}
            />
            {errors.idCard && <p className="text-red-500 text-sm mt-1">{errors.idCard}</p>}
          </div>

          {/* Birth Date */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วัน/เดือน/ปีเกิด <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <select
                  value={formData.birthDay}
                  onChange={(e) => handleInputChange('birthDay', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.birthDay ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">วัน</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                {errors.birthDay && <p className="text-red-500 text-sm mt-1">{errors.birthDay}</p>}
              </div>
              <div>
                <select
                  value={formData.birthMonth}
                  onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.birthMonth ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">เดือน</option>
                  <option value="1">มกราคม</option>
                  <option value="2">กุมภาพันธ์</option>
                  <option value="3">มีนาคม</option>
                  <option value="4">เมษายน</option>
                  <option value="5">พฤษภาคม</option>
                  <option value="6">มิถุนายน</option>
                  <option value="7">กรกฎาคม</option>
                  <option value="8">สิงหาคม</option>
                  <option value="9">กันยายน</option>
                  <option value="10">ตุลาคม</option>
                  <option value="11">พฤศจิกายน</option>
                  <option value="12">ธันวาคม</option>
                </select>
                {errors.birthMonth && <p className="text-red-500 text-sm mt-1">{errors.birthMonth}</p>}
              </div>
              <div>
                <select
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange('birthYear', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.birthYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">ปี (พ.ศ.)</option>
                  {Array.from({ length: 100 }, (_, i) => {
                    const year = 2568 - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
                {errors.birthYear && <p className="text-red-500 text-sm mt-1">{errors.birthYear}</p>}
              </div>
            </div>
          </div>

          {/* Age (Auto-calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อายุ
            </label>
            <input
              type="text"
              value={formData.age ? `${formData.age} ปี` : ''}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              placeholder="จะคำนวณอัตโนมัติ"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Step1Identity;

