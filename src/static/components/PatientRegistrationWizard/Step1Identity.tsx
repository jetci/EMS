// src/components/PatientRegistrationWizard/Step1Identity.tsx
import React, { useState, useEffect } from 'react';
import ModernDatePicker from '../../../../components/ui/ModernDatePicker';

interface Step1IdentityProps {
  onNext?: (data: any) => void;
  onBack?: () => void;
  currentData?: any;
  isLastStep?: boolean;
}

const Step1Identity: React.FC<Step1IdentityProps> = ({
  onNext,
  onBack,
  currentData = {}
}) => {
  const [formData, setFormData] = useState({
    title: currentData.title || '',
    firstName: currentData.firstName || '',
    lastName: currentData.lastName || '',
    idCard: currentData.idCard || '',
    birthDate: currentData.birthDate || '',
    gender: currentData.gender || '',
    age: currentData.age || ''
  });

  const [profileImage, setProfileImage] = useState<{ file: File | null; previewUrl: string | null }>(currentData.profileImage || { file: null, previewUrl: null });
  const [errors, setErrors] = useState<any>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-calculate age when birth date changes
  useEffect(() => {
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFormData(prev => ({ ...prev, age: (age - 1).toString() }));
      } else {
        setFormData(prev => ({ ...prev, age: age.toString() }));
      }
    }
  }, [formData.birthDate]);

  const handleInputChange = (field: string, value: string) => {
    // Auto-select gender based on title
    if (field === 'title') {
      let gender = '';
      if (value === 'นาย' || value === 'เด็กชาย') {
        gender = 'ชาย';
      } else if (value === 'นาง' || value === 'นางสาว' || value === 'เด็กหญิง') {
        gender = 'หญิง';
      }
      setFormData(prev => ({ ...prev, [field]: value, gender }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
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
    if (!formData.birthDate) newErrors.birthDate = 'กรุณาเลือกวันเกิด';
    if (!formData.gender) newErrors.gender = 'กรุณาเลือกเพศ';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      
      if (file.size > maxFileSize) {
        alert('ขนาดไฟล์รูปโปรไฟล์ต้องไม่เกิน 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      setProfileImage({ file, previewUrl: URL.createObjectURL(file) });
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onNext) {
      onNext({ ...formData, profileImage });
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
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {profileImage?.previewUrl ? (
                <img src={profileImage.previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleProfileImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleProfileImageClick}
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
              title="อัปโหลดรูปโปรไฟล์"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
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

          {/* Gender (Auto-selected from Title) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เพศ <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(เลือกอัตโนมัติจากคำนำหน้า)</span>
            </label>
            <div className="flex space-x-4">
              <label className={`flex items-center ${!formData.gender ? 'opacity-50' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="ชาย"
                  checked={formData.gender === 'ชาย'}
                  disabled={true}
                  className="mr-2 cursor-not-allowed"
                />
                ชาย
              </label>
              <label className={`flex items-center ${!formData.gender ? 'opacity-50' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="หญิง"
                  checked={formData.gender === 'หญิง'}
                  disabled={true}
                  className="mr-2 cursor-not-allowed"
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.idCard ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
              maxLength={13}
            />
            {errors.idCard && <p className="text-red-500 text-sm mt-1">{errors.idCard}</p>}
          </div>

          {/* Birth Date */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันเกิด <span className="text-red-500">*</span>
            </label>
            <ModernDatePicker
              name="birthDate"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              placeholder="เลือกวันเกิด"
              required
            />
            {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
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
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={!onBack}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${!onBack
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            ← ย้อนกลับ
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            ถัดไป →
          </button>
        </div>

      </form>
    </div>
  );
};

export default Step1Identity;

