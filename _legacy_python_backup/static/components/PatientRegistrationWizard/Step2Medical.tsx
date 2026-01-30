// src/components/PatientRegistrationWizard/Step2Medical.tsx
import React, { useState } from 'react';
import EnhancedTagInput from '../ui/EnhancedTagInput';

interface Step2MedicalProps {
  onNext?: (data: any) => void;
  onBack?: () => void;
  currentData?: any;
  isLastStep?: boolean;
}

const Step2Medical: React.FC<Step2MedicalProps> = ({
  onNext,
  onBack,
  currentData = {}
}) => {
  const [formData, setFormData] = useState({
    patientTypes: currentData.patientTypes || [],
    patientTypeOther: currentData.patientTypeOther || '',
    chronicDiseases: currentData.chronicDiseases || [],
    allergies: currentData.allergies || [],
    bloodGroup: currentData.bloodGroup || '',
    rhFactor: currentData.rhFactor || '',
    insuranceType: currentData.insuranceType || ''
  });

  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (formData.patientTypes.length === 0) {
      newErrors.patientTypes = 'กรุณาเลือกประเภทผู้ป่วยอย่างน้อย 1 ประเภท';
    }
    // Validate 'other' field if 'ผู้ป่วยอื่นๆ' is selected
    if (formData.patientTypes.includes('ผู้ป่วยอื่นๆ') && !formData.patientTypeOther.trim()) {
      newErrors.patientTypeOther = 'กรุณาระบุประเภทผู้ป่วยอื่นๆ';
    }
    if (!formData.bloodGroup) newErrors.bloodGroup = 'กรุณาเลือกกรุ๊ปเลือด';
    if (!formData.rhFactor) newErrors.rhFactor = 'กรุณาเลือก Rh Factor';
    if (!formData.insuranceType) newErrors.insuranceType = 'กรุณาเลือกสิทธิการรักษา';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onNext) {
      onNext(formData);
    }
  };

  const patientTypeOptions = [
    'ผู้ป่วยทั่วไป',
    'ผู้ป่วยเรื้อรัง',
    'ผู้สูงอายุ',
    'เด็ก',
    'หญิงตั้งครรภ์',
    'ผู้พิการ',
    'ผู้ป่วยจิตเวช',
    'ผู้ป่วยติดเตียง',
    'ผู้ป่วยภาวะพึ่งพิง',
    'ผู้ยากไร้',
    'ผู้ป่วยอื่นๆ'
  ];

  const commonDiseases = [
    'เบาหวาน',
    'ความดันโลหิตสูง',
    'โรคหัวใจ',
    'โรคไต',
    'โรคตับ',
    'โรคปอด',
    'โรคข้อ',
    'โรคผิวหนัง',
    'โรคตา',
    'โรคหู'
  ];

  const commonAllergies = [
    'แพ้ยาปฏิชีวนะ',
    'แพ้อาหารทะเล',
    'แพ้นม',
    'แพ้ไข่',
    'แพ้ถั่ว',
    'แพ้ฝุ่น',
    'แพ้เกสรดอกไม้',
    'แพ้สารเคมี',
    'แพ้ยาแก้ปวด',
    'แพ้ยาลดไข้'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          ขั้นตอนที่ 2: ข้อมูลทางการแพทย์
        </h3>
        <p className="text-gray-600">
          กรุณากรอกข้อมูลสุขภาพและประวัติการรักษาของผู้ป่วย
        </p>
      </div>

      <form id="step-1-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ประเภทผู้ป่วย <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {patientTypeOptions.map((type) => (
              <label key={type} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.patientTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('patientTypes', [...formData.patientTypes, type]);
                    } else {
                      handleInputChange('patientTypes', formData.patientTypes.filter((t: string) => t !== type));
                      // Clear 'other' field if unchecking 'ผู้ป่วยอื่นๆ'
                      if (type === 'ผู้ป่วยอื่นๆ') {
                        handleInputChange('patientTypeOther', '');
                      }
                    }
                  }}
                  className="mr-3"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
          {errors.patientTypes && <p className="text-red-500 text-sm mt-1">{errors.patientTypes}</p>}
          
          {/* Show text input if 'ผู้ป่วยอื่นๆ' is selected */}
          {formData.patientTypes.includes('ผู้ป่วยอื่นๆ') && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ระบุประเภทผู้ป่วยอื่นๆ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.patientTypeOther}
                onChange={(e) => handleInputChange('patientTypeOther', e.target.value)}
                placeholder="กรุณาระบุประเภทผู้ป่วย..."
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.patientTypeOther ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.patientTypeOther && <p className="text-red-500 text-sm mt-1">{errors.patientTypeOther}</p>}
            </div>
          )}
        </div>

        {/* Chronic Diseases */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            โรคประจำตัว
          </label>
          <EnhancedTagInput
            value={formData.chronicDiseases}
            onChange={(tags) => handleInputChange('chronicDiseases', tags)}
            suggestions={commonDiseases}
            placeholder="เพิ่มโรคประจำตัว... (กดเพื่อเลือกจากรายการหรือพิมพ์เพิ่มเติม)"
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            สามารถเลือกจากรายการหรือพิมพ์เพิ่มเติมได้
          </p>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ประวัติการแพ้ยา/อาหาร
          </label>
          <EnhancedTagInput
            value={formData.allergies}
            onChange={(tags) => handleInputChange('allergies', tags)}
            suggestions={commonAllergies}
            placeholder="เพิ่มประวัติการแพ้... (กดเพื่อเลือกจากรายการหรือพิมพ์เพิ่มเติม)"
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            ระบุสิ่งที่แพ้ให้ละเอียดเพื่อความปลอดภัยในการรักษา
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Blood Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              กรุ๊ปเลือด <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.bloodGroup ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">-- กรุ๊ปเลือด --</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
            {errors.bloodGroup && <p className="text-red-500 text-sm mt-1">{errors.bloodGroup}</p>}
          </div>

          {/* Rh Factor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rh Factor <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.rhFactor}
              onChange={(e) => handleInputChange('rhFactor', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.rhFactor ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">-- Rh --</option>
              <option value="Rh+">Rh+</option>
              <option value="Rh-">Rh-</option>
            </select>
            {errors.rhFactor && <p className="text-red-500 text-sm mt-1">{errors.rhFactor}</p>}
          </div>

          {/* Insurance Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สิทธิการรักษา <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.insuranceType}
              onChange={(e) => handleInputChange('insuranceType', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.insuranceType ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">-- สิทธิการรักษา --</option>
              <option value="สิทธิบัตรทอง">สิทธิบัตรทอง</option>
              <option value="ประกันสังคม">ประกันสังคม</option>
              <option value="ข้าราชการ">ข้าราชการ</option>
              <option value="ชำระเงินเอง">ชำระเงินเอง</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
            {errors.insuranceType && <p className="text-red-500 text-sm mt-1">{errors.insuranceType}</p>}
          </div>
        </div>

        {/* Medical Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">สรุปข้อมูลทางการแพทย์</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>ประเภทผู้ป่วย:</strong> {formData.patientTypes.length > 0 ? formData.patientTypes.join(', ') : 'ยังไม่ได้เลือก'}</p>
            <p><strong>โรคประจำตัว:</strong> {formData.chronicDiseases.length > 0 ? formData.chronicDiseases.join(', ') : 'ไม่มี'}</p>
            <p><strong>ประวัติการแพ้:</strong> {formData.allergies.length > 0 ? formData.allergies.join(', ') : 'ไม่มี'}</p>
            <p><strong>กรุ๊ปเลือด:</strong> {formData.bloodGroup && formData.rhFactor ? `${formData.bloodGroup}${formData.rhFactor}` : 'ยังไม่ได้ระบุ'}</p>
            <p><strong>สิทธิการรักษา:</strong> {formData.insuranceType || 'ยังไม่ได้เลือก'}</p>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
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

export default Step2Medical;

