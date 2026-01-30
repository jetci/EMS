/**
 * Step 5: Review & Confirm
 * Patient registration wizard - Final review
 */

import React from 'react';
import { formatDateToThai } from '../../../utils/dateUtils';

interface Step5Props {
  onNext?: (data: any) => void;
  onBack?: () => void;
  formData?: any;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const Step5Review: React.FC<Step5Props> = ({ onNext, onBack, formData = {} as any }) => {
  const handleSubmit = () => {
    if (onNext) {
      onNext(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          ตรวจสอบข้อมูล
        </h2>
        <p className="text-sm text-gray-600">
          กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          ข้อมูลส่วนตัว
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {formData.title && (
            <>
              <dt className="text-sm font-medium text-gray-500">คำนำหน้า</dt>
              <dd className="text-sm text-gray-900">{formData.title}</dd>
            </>
          )}
          <dt className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</dt>
          <dd className="text-sm text-gray-900">
            {formData.firstName && formData.lastName
              ? `${formData.firstName} ${formData.lastName}`
              : formData.fullName || '-'}
          </dd>

          <dt className="text-sm font-medium text-gray-500">เลขบัตรประชาชน</dt>
          <dd className="text-sm text-gray-900">{formData.nationalId || '-'}</dd>

          <dt className="text-sm font-medium text-gray-500">วันเกิด</dt>
          <dd className="text-sm text-gray-900">{formData.dob ? formatDateToThai(formData.dob) : '-'}</dd>

          <dt className="text-sm font-medium text-gray-500">อายุ</dt>
          <dd className="text-sm text-gray-900">{formData.age ? `${formData.age} ปี` : '-'}</dd>

          <dt className="text-sm font-medium text-gray-500">เพศ</dt>
          <dd className="text-sm text-gray-900">{formData.gender || '-'}</dd>
        </dl>
      </div>

      {/* Medical Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          ข้อมูลทางการแพทย์
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <dt className="text-sm font-medium text-gray-500">กรุ๊ปเลือด</dt>
          <dd className="text-sm text-gray-900">
            {formData.bloodType && formData.rhFactor
              ? `${formData.bloodType} ${formData.rhFactor}`
              : formData.bloodType || '-'}
          </dd>

          <dt className="text-sm font-medium text-gray-500">สิทธิการรักษา</dt>
          <dd className="text-sm text-gray-900">{formData.healthCoverage || '-'}</dd>

          <dt className="text-sm font-medium text-gray-500 md:col-span-2">โรคประจำตัว</dt>
          <dd className="text-sm text-gray-900 md:col-span-2">
            {formData.chronicDiseases && formData.chronicDiseases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.chronicDiseases.map((disease: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {disease}
                  </span>
                ))}
              </div>
            ) : (
              '-'
            )}
          </dd>

          <dt className="text-sm font-medium text-gray-500 md:col-span-2">แพ้ยา/อาหาร</dt>
          <dd className="text-sm text-gray-900 md:col-span-2">
            {formData.allergies && formData.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              '-'
            )}
          </dd>
        </dl>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          ข้อมูลติดต่อ
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <dt className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</dt>
          <dd className="text-sm text-gray-900">{formData.contactPhone || '-'}</dd>

          <dt className="text-sm font-medium text-gray-500 md:col-span-2">ที่อยู่ปัจจุบัน</dt>
          <dd className="text-sm text-gray-900 md:col-span-2">
            {formData.currentAddress ? (
              <>
                {[
                  formData.currentAddress.houseNumber,
                  formData.currentAddress.village,
                  formData.currentAddress.tambon,
                  formData.currentAddress.amphoe,
                  formData.currentAddress.changwat,
                ]
                  .filter(Boolean)
                  .join(' ') || '-'}
              </>
            ) : (
              '-'
            )}
          </dd>

          {formData.emergencyContact && (formData.emergencyContact.name || formData.emergencyContact.phone) && (
            <>
              <dt className="text-sm font-medium text-gray-500 md:col-span-2">ผู้ติดต่อฉุกเฉิน</dt>
              <dd className="text-sm text-gray-900 md:col-span-2">
                {formData.emergencyContact.name || '-'}
                {formData.emergencyContact.phone && ` (${formData.emergencyContact.phone})`}
                {formData.emergencyContact.relation && ` - ${formData.emergencyContact.relation}`}
              </dd>
            </>
          )}
        </dl>
      </div>

      {/* Attachments */}
      {((formData.profileImage?.previewUrl || formData.profileImage?.file) || (formData.attachments && formData.attachments.length > 0)) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            เอกสารแนบ
          </h3>
          <div className="space-y-3">
            {(formData.profileImage?.previewUrl || formData.profileImage?.file) && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">✓ รูปถ่ายผู้ป่วย</p>
                {formData.profileImage?.previewUrl && (
                  <img
                    src={formData.profileImage.previewUrl}
                    alt="รูปถ่ายผู้ป่วย"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                )}
              </div>
            )}
            {formData.attachments && formData.attachments.length > 0 && (
              <p className="text-sm text-gray-900">
                ✓ เอกสารแนบ {formData.attachments.length} ไฟล์
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">ยืนยันการบันทึกข้อมูล</h3>
            <p className="mt-1 text-sm text-yellow-700">
              กรุณาตรวจสอบความถูกต้องของข้อมูลทั้งหมด หากพบข้อผิดพลาดสามารถกดย้อนกลับเพื่อแก้ไขได้
            </p>
          </div>
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
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          ยืนยันและบันทึก
        </button>
      </div>
    </div>
  );
};

export default Step5Review;
