/**
 * Step 4: Attachments
 * Patient registration wizard - File uploads
 */

import React, { useState, useEffect } from 'react';

interface Step4Props {
  onNext?: (data: any) => void;
  onBack?: () => void;
  formData?: any;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const Step4Attachments: React.FC<Step4Props> = ({ onNext, onBack, formData = {} as any }) => {
  const [data, setData] = useState({
    profileImage: formData.profileImage || { file: null, previewUrl: null },
    attachments: formData.attachments || [],
    ...formData,
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(formData.profileImage?.previewUrl || null);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);

  // Update state when formData prop changes (e.g., when loading draft)
  useEffect(() => {
    if (formData?.profileImage?.previewUrl) {
      setProfilePreview(formData.profileImage.previewUrl);
    }
  }, [formData]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setProfilePreview(previewUrl);
        // Store both file and preview URL
        setData({ ...data, profileImage: { file, previewUrl } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setData({ ...data, attachments: [...data.attachments, ...files] });

      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setData({
      ...data,
      attachments: data.attachments.filter((_: any, i: number) => i !== index),
    });
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (onNext) {
      onNext(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          เอกสารแนบ
        </h2>
        <p className="text-sm text-gray-600">
          อัปโหลดรูปถ่ายและเอกสารที่เกี่ยวข้อง (ไม่บังคับ)
        </p>
      </div>

      {/* Profile Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          รูปถ่ายผู้ป่วย
        </label>
        <div className="flex items-center gap-4">
          {profilePreview ? (
            <div className="relative">
              <img
                src={profilePreview}
                alt="Profile preview"
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={() => {
                  setData({ ...data, profileImage: { file: null, previewUrl: null } });
                  setProfilePreview(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <div>
            <label
              htmlFor="profileImage"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              เลือกรูปภาพ
            </label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG หรือ WEBP (สูงสุด 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          เอกสารแนบอื่นๆ
        </label>
        <div className="space-y-3">
          <label
            htmlFor="attachments"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มเอกสาร
          </label>
          <input
            type="file"
            id="attachments"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleAttachmentsChange}
            className="hidden"
          />
          <p className="text-xs text-gray-500">
            รองรับ: รูปภาพ, PDF, Word (สูงสุด 5 ไฟล์, ไฟล์ละ 5MB)
          </p>

          {/* Attachment List */}
          {data.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                ไฟล์ที่แนบ ({data.attachments.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.attachments.map((file: File, index: number) => (
                  <div
                    key={index}
                    className="relative border border-gray-300 rounded-lg p-3 hover:border-blue-500 transition-colors"
                  >
                    {attachmentPreviews[index] && file.type.startsWith('image/') ? (
                      <img
                        src={attachmentPreviews[index]}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <p className="text-xs text-gray-700 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">คำแนะนำ</h3>
            <div className="mt-1 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>รูปถ่ายผู้ป่วยจะช่วยในการระบุตัวตน</li>
                <li>เอกสารที่แนบอาจรวม: สำเนาบัตรประชาชน, ใบรับรองแพทย์, ฯลฯ</li>
                <li>ไฟล์ทั้งหมดจะถูกเก็บอย่างปลอดภัย</li>
              </ul>
            </div>
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
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default Step4Attachments;
