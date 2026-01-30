/**
 * Step 2: Medical Information
 * Patient registration wizard - Medical details
 */

import React, { useState } from 'react';

interface Step2Props {
  onNext?: (data: any) => void;
  onBack?: () => void;
  formData?: any;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const Step2Medical: React.FC<Step2Props> = ({ onNext, onBack, formData = {} as any }) => {
  const [data, setData] = useState({
    bloodType: formData.bloodType || '',
    rhFactor: formData.rhFactor || '',
    healthCoverage: formData.healthCoverage || '',
    patientTypes: formData.patientTypes || [],
    chronicDiseases: formData.chronicDiseases || [],
    allergies: formData.allergies || [],
    keyInfo: formData.keyInfo || '',
    ...formData,
  });

  const [patientTypeOther, setPatientTypeOther] = useState(formData.patientTypeOther || '');

  const [chronicDisease, setChronicDisease] = useState('');
  const [allergy, setAllergy] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handlePatientTypeChange = (type: string) => {
    const currentTypes = data.patientTypes;
    if (currentTypes.includes(type)) {
      setData({ ...data, patientTypes: currentTypes.filter((t: string) => t !== type) });
    } else {
      setData({ ...data, patientTypes: [...currentTypes, type] });
    }
  };

  const addChronicDisease = () => {
    if (chronicDisease.trim()) {
      setData({
        ...data,
        chronicDiseases: [...data.chronicDiseases, chronicDisease.trim()],
      });
      setChronicDisease('');
    }
  };

  const removeChronicDisease = (index: number) => {
    setData({
      ...data,
      chronicDiseases: data.chronicDiseases.filter((_: any, i: number) => i !== index),
    });
  };

  const addAllergy = () => {
    if (allergy.trim()) {
      setData({
        ...data,
        allergies: [...data.allergies, allergy.trim()],
      });
      setAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setData({
      ...data,
      allergies: data.allergies.filter((_: any, i: number) => i !== index),
    });
  };

  const handleNext = () => {
    if (onNext) {
      onNext({ ...data, patientTypeOther });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          ข้อมูลทางการแพทย์
        </h2>
        <p className="text-sm text-gray-600">
          กรุณากรอกข้อมูลสุขภาพของผู้ป่วย
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blood Type */}
        <div>
          <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
            กรุ๊ปเลือด
          </label>
          <select
            id="bloodType"
            name="bloodType"
            value={data.bloodType}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">เลือกกรุ๊ปเลือด</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </select>
        </div>

        {/* RH Factor */}
        <div>
          <label htmlFor="rhFactor" className="block text-sm font-medium text-gray-700 mb-1">
            RH
          </label>
          <select
            id="rhFactor"
            name="rhFactor"
            value={data.rhFactor}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">เลือก RH</option>
            <option value="+">+</option>
            <option value="-">-</option>
          </select>
        </div>

        {/* Health Coverage */}
        <div className="md:col-span-2">
          <label htmlFor="healthCoverage" className="block text-sm font-medium text-gray-700 mb-1">
            สิทธิการรักษา
          </label>
          <select
            id="healthCoverage"
            name="healthCoverage"
            value={data.healthCoverage}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">เลือกสิทธิการรักษา</option>
            <option value="บัตรทอง">บัตรทอง (30 บาท)</option>
            <option value="ประกันสังคม">ประกันสังคม</option>
            <option value="ข้าราชการ">ข้าราชการ</option>
            <option value="เบิกได้">เบิกได้</option>
            <option value="จ่ายเอง">จ่ายเอง</option>
          </select>
        </div>

        {/* Patient Types */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ประเภทผู้ป่วย
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['ผู้ป่วยติดเตียง', 'ผู้สูงอายุ', 'ผู้พิการ', 'ผู้ป่วยเรื้อรัง', 'ภาวะพึ่งพิง'].map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.patientTypes.includes(type)}
                  onChange={() => handlePatientTypeChange(type)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.patientTypes.includes('อื่นๆ')}
                onChange={() => handlePatientTypeChange('อื่นๆ')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">อื่นๆ</span>
            </label>
          </div>
          {data.patientTypes.includes('อื่นๆ') && (
            <input
              type="text"
              value={patientTypeOther}
              onChange={(e) => setPatientTypeOther(e.target.value)}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ระบุประเภทผู้ป่วยอื่นๆ"
            />
          )}
        </div>

        {/* Chronic Diseases */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            โรคประจำตัว
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={chronicDisease}
              onChange={(e) => setChronicDisease(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addChronicDisease()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="เช่น เบาหวาน, ความดันโลหิตสูง"
            />
            <button
              type="button"
              onClick={addChronicDisease}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              เพิ่ม
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.chronicDiseases.map((disease: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {disease}
                <button
                  type="button"
                  onClick={() => removeChronicDisease(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            แพ้ยา/อาหาร
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={allergy}
              onChange={(e) => setAllergy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="เช่น ยาปฏิชีวนะ, อาหารทะเล"
            />
            <button
              type="button"
              onClick={addAllergy}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              เพิ่ม
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.allergies.map((item: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeAllergy(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Key Info */}
        <div className="md:col-span-2">
          <label htmlFor="keyInfo" className="block text-sm font-medium text-gray-700 mb-1">
            ข้อมูลสำคัญ/สรุปอาการ
          </label>
          <textarea
            id="keyInfo"
            name="keyInfo"
            value={data.keyInfo || ''}
            onChange={(e) => setData({ ...data, keyInfo: e.target.value })}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="ระบุข้อมูลสำคัญที่ควรรู้เกี่ยวกับผู้ป่วยรายนี้..."
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          ย้อนกลับ
        </button>
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

export default Step2Medical;
