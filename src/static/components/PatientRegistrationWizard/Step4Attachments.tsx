// src/components/PatientRegistrationWizard/Step4Attachments.tsx
import React, { useState } from 'react';
import UploadIcon from '../../components/icons/UploadIcon';
import PaperclipIcon from '../../components/icons/PaperclipIcon';
import TrashIcon from '../../components/icons/TrashIcon';

interface Step4AttachmentsProps {
  onNext?: (data: any) => void;
  onBack?: () => void;
  currentData?: any;
  isLastStep?: boolean;
}

const Step4Attachments: React.FC<Step4AttachmentsProps> = ({
  onNext,
  onBack,
  currentData = {},
}) => {
  const [attachments, setAttachments] = useState<File[]>(currentData.attachments || []);
  const [profileImage, setProfileImage] = useState<{ file: File | null; previewUrl: string | null }>(currentData.profileImage || { file: null, previewUrl: null });
  const [errors, setErrors] = useState<any>({});

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxFileSize) {
        alert('ขนาดไฟล์รูปโปรไฟล์ต้องไม่เกิน 5MB');
        return;
      }
      setProfileImage({ file, previewUrl: URL.createObjectURL(file) });
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const maxFileSize = 5 * 1024 * 1024; // 5MB per file
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (attachments.length + newFiles.length > 5) {
        alert('คุณสามารถอัปโหลดเอกสารได้สูงสุด 5 ไฟล์เท่านั้น');
        return;
      }
      const filtered: File[] = [];
      for (const f of newFiles) {
        if (f.size > maxFileSize) {
          alert(`ไฟล์ ${f.name} มีขนาดเกิน 5MB และจะไม่ถูกอัปโหลด`);
          continue;
        }
        if (f.type && !allowedTypes.includes(f.type)) {
          alert(`ชนิดไฟล์ ${f.name} (${f.type || 'unknown'}) ไม่รองรับและจะข้าม`);
          continue;
        }
        filtered.push(f);
      }
      setAttachments((prev) => [...prev, ...filtered]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: any = {};
    // Add validation rules here if needed, e.g., minimum number of attachments
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onNext) {
      onNext({ attachments, profileImage });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          ขั้นตอนที่ 4: เอกสารแนบ
        </h3>
        <p className="text-gray-600">
          กรุณาอัปโหลดรูปโปรไฟล์และเอกสารที่เกี่ยวข้อง (สูงสุด 5 ไฟล์)
        </p>
      </div>

      <form id="step-3-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Image Upload */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">รูปโปรไฟล์</h2>
          <div className="flex flex-col items-center">
            <img
              src={profileImage.previewUrl || 'https://via.placeholder.com/150'}
              alt="Patient profile"
              className="w-36 h-36 rounded-full object-cover border-4 border-gray-200"
            />
            <label
              htmlFor="profileImage"
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
            >
              <UploadIcon className="inline-block w-4 h-4 mr-2" /> อัปโหลดรูปภาพ
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {/* Attachments Upload */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">เอกสารแนบ (สูงสุด 5 ไฟล์)</h2>
          <label
            htmlFor="attachments"
            className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <UploadIcon className="w-5 h-5 mr-2 text-gray-600" />
            <span className="text-gray-700">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</span>
            <input
              type="file"
              id="attachments"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleAttachmentChange}
              className="sr-only"
            />
          </label>
          {errors.attachments && <p className="text-red-500 text-sm mt-1">{errors.attachments}</p>}

          <div className="mt-4 space-y-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-center">
                  <PaperclipIcon className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          {attachments.length === 0 && (
            <p className="text-sm text-gray-500 mt-4 text-center">ยังไม่มีเอกสารแนบ</p>
          )}
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

export default Step4Attachments;

