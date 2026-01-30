/**
 * Step 1: Identity Information
 * Patient registration wizard - Basic identity
 */

import React, { useState, useEffect } from 'react';
import ModernDatePicker from '../../../components/ui/ModernDatePicker';

interface Step1Props {
  onNext?: (data: any) => void;
  onBack?: () => void;
  formData?: any;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const Step1Identity: React.FC<Step1Props> = ({ onNext, formData = {} as any }) => {
  console.log('👤 Step1Identity received formData:', formData);
  const [data, setData] = useState({
    title: formData.title || '',
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    nationalId: formData.nationalId || '',
    dob: formData.dob || '',
    age: formData.age || '',
    gender: formData.gender || '',
    ...formData,
  });
  console.log('👤 Step1Identity initialized data state:', data);

  const [errors, setErrors] = useState<any>({});

  // Update state when formData prop changes (e.g., when loading draft)
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      console.log('🔄 Step1Identity updating from formData:', formData);
      setData({
        title: formData.title || '',
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        nationalId: formData.nationalId || '',
        dob: formData.dob || '',
        age: formData.age || '',
        gender: formData.gender || '',
        ...formData,
      });
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updates: any = { [name]: value };
    let newErrors = { ...errors };

    // Clear error when user types
    if (newErrors[name]) {
      newErrors[name] = '';
    }

    // Auto-calculate age from DOB
    if (name === 'dob' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      updates.age = age.toString();
    }

    // Auto-select gender from title
    if (name === 'title') {
      if (['นาย', 'เด็กชาย'].includes(value)) {
        updates.gender = 'ชาย';
        if (newErrors.gender) newErrors.gender = '';
      } else if (['นาง', 'นางสาว', 'เด็กหญิง'].includes(value)) {
        updates.gender = 'หญิง';
        if (newErrors.gender) newErrors.gender = '';
      }
    }

    setData({ ...data, ...updates });
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors: any = {};

    if (!data.firstName?.trim()) {
      newErrors.firstName = 'กรุณากรอกชื่อ';
    }

    if (!data.lastName?.trim()) {
      newErrors.lastName = 'กรุณากรอกนามสกุล';
    }

    if (!data.nationalId?.trim()) {
      newErrors.nationalId = 'กรุณากรอกเลขบัตรประชาชน';
    } else if (!/^\d{13}$/.test(data.nationalId)) {
      newErrors.nationalId = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    }

    if (!data.dob) {
      newErrors.dob = 'กรุณาเลือกวันเกิด';
    }

    if (!data.gender) {
      newErrors.gender = 'กรุณาเลือกเพศ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate() && onNext) {
      onNext(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          ข้อมูลส่วนตัว
        </h2>
        <p className="text-sm text-gray-600">
          กรุณากรอกข้อมูลส่วนตัวของผู้ป่วย
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title, Name, Surname Group */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              คำนำหน้า
            </label>
            <select
              id="title"
              name="title"
              value={data.title}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">เลือก</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">น.ส.</option>
              <option value="เด็กชาย">ด.ช.</option>
              <option value="เด็กหญิง">ด.ญ.</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={data.firstName}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="เช่น สมชาย"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div className="md:col-span-5">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              นามสกุล <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={data.lastName}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="เช่น ใจดี"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* National ID */}
        <div className="md:col-span-2">
          <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-1">
            เลขบัตรประชาชน <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="nationalId"
            name="nationalId"
            value={data.nationalId}
            onChange={handleChange}
            maxLength={13}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.nationalId ? 'border-red-300' : 'border-gray-300'
              }`}
            placeholder="1234567890123"
          />
          {errors.nationalId && (
            <p className="mt-1 text-sm text-red-600">{errors.nationalId}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="relative">
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
            วันเกิด <span className="text-red-600">*</span>
          </label>
          <ModernDatePicker
            name="dob"
            value={data.dob}
            onChange={(e: any) => handleChange(e as any)}
            max={new Date().toISOString().split('T')[0]} // Cannot be born in future
            required
            placeholder="เลือกวันเกิด"
          />
          {errors.dob && (
            <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
          )}
        </div>

        {/* Age */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            อายุ (ปี)
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={data.age}
            onChange={handleChange}
            readOnly
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Gender */}
        <div className="md:col-span-2">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            เพศ <span className="text-red-600">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={data.gender}
            onChange={handleChange}
            disabled={['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง'].includes(data.title)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.gender ? 'border-red-300' : 'border-gray-300'
              } ${['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง'].includes(data.title) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
          >
            <option value="">เลือกเพศ</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
            <option value="ไม่ระบุ">ไม่ระบุ</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default Step1Identity;
