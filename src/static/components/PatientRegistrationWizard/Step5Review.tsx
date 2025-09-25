// src/components/PatientRegistrationWizard/Step5Review.tsx
import React from 'react';

interface Step5ReviewProps {
  onNext?: (data: any) => void;
  onBack?: () => void;
  currentData?: any;
  isLastStep?: boolean;
}

const Step5Review: React.FC<Step5ReviewProps> = ({
  currentData = {},
}) => {
  const { 
    title, firstName, lastName, idCard, birthDay, birthMonth, birthYear, gender, age,
    patientTypes, chronicDiseases, allergies, bloodGroup, rhFactor, insuranceType,
    idCardAddress, currentAddress, addressOption, contactPhone,
    emergencyContactName, emergencyContactPhone, emergencyContactRelation, landmark,
    latitude, longitude,
    profileImage, attachments
  } = currentData;

  const renderAddress = (address: any) => (
    <div className="text-sm text-gray-700">
      <p>บ้านเลขที่: {address.houseNumber}</p>
      <p>หมู่บ้าน: {address.village}</p>
      <p>ตำบล: {address.tambon}</p>
      <p>อำเภอ: {address.amphoe}</p>
      <p>จังหวัด: {address.changwat}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          ขั้นตอนที่ 5: ตรวจสอบ & ยืนยัน
        </h3>
        <p className="text-gray-600">
          โปรดตรวจสอบข้อมูลทั้งหมดก่อนกดยืนยันการลงทะเบียน
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 space-y-6">
        {/* Section 1: ข้อมูลระบุตัวตน */}
        <div>
          <h4 className="text-lg font-semibold text-blue-700 mb-3">1. ข้อมูลระบุตัวตน</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">รูปโปรไฟล์:</p>
              {profileImage?.previewUrl ? (
                <img src={profileImage.previewUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <p className="text-sm text-gray-500">ไม่มีรูปโปรไฟล์</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">ชื่อ-นามสกุล:</p>
              <p className="text-base text-gray-800">{title} {firstName} {lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">เลขบัตรประชาชน:</p>
              <p className="text-base text-gray-800">{idCard}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">วันเกิด:</p>
              <p className="text-base text-gray-800">{birthDay}/{birthMonth}/{birthYear}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">เพศ:</p>
              <p className="text-base text-gray-800">{gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">อายุ:</p>
              <p className="text-base text-gray-800">{age}</p>
            </div>
          </div>
        </div>

        {/* Section 2: ข้อมูลทางการแพทย์ */}
        <div>
          <h4 className="text-lg font-semibold text-blue-700 mb-3">2. ข้อมูลทางการแพทย์</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">ประเภทผู้ป่วย:</p>
              <p className="text-base text-gray-800">{patientTypes?.join(", ") || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">โรคประจำตัว:</p>
              <p className="text-base text-gray-800">{chronicDiseases?.join(", ") || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">ประวัติการแพ้:</p>
              <p className="text-base text-gray-800">{allergies?.join(", ") || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">กรุ๊ปเลือด:</p>
              <p className="text-base text-gray-800">{bloodGroup}{rhFactor}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">สิทธิการรักษา:</p>
              <p className="text-base text-gray-800">{insuranceType}</p>
            </div>
          </div>
        </div>

        {/* Section 3: ที่อยู่และข้อมูลติดต่อ */}
        <div>
          <h4 className="text-lg font-semibold text-blue-700 mb-3">3. ที่อยู่และข้อมูลติดต่อ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">ที่อยู่ตามบัตรประชาชน:</p>
              {renderAddress(idCardAddress)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">ที่อยู่ปัจจุบัน:</p>
              {addressOption === 'same' ? (
                <p className="text-base text-gray-800">ใช้ที่อยู่เดียวกับบัตรประชาชน</p>
              ) : (
                renderAddress(currentAddress)
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">เบอร์โทรศัพท์ติดต่อ:</p>
              <p className="text-base text-gray-800">{contactPhone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">ผู้ติดต่อฉุกเฉิน:</p>
              <p className="text-base text-gray-800">{emergencyContactName} ({emergencyContactRelation})</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">เบอร์โทรผู้ติดต่อฉุกเฉิน:</p>
              <p className="text-base text-gray-800">{emergencyContactPhone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">จุดสังเกต:</p>
              <p className="text-base text-gray-800">{landmark || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">พิกัด (ละติจูด, ลองจิจูด):</p>
              <p className="text-base text-gray-800">{latitude}, {longitude}</p>
            </div>
          </div>
        </div>

        {/* Section 4: เอกสารแนบ */}
        <div>
          <h4 className="text-lg font-semibold text-blue-700 mb-3">4. เอกสารแนบ</h4>
          {attachments && attachments.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-700">
              {attachments.map((file: File) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">ไม่มีเอกสารแนบ</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step5Review;

