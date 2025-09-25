import React, { useState, useEffect } from 'react';
// FIX: Import DriverStatus enum to use for type safety.
import { Driver, DriverStatus } from '../../types';
import XIcon from '../icons/XIcon';
import UserIcon from '../icons/UserIcon';
import RidesIcon from '../icons/RidesIcon';

interface EditDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (driver: Driver) => void;
  driver: Driver | null; // Can be null for adding a new driver
}

// FIX: Add missing properties to conform to the Driver type.
const emptyDriver: Driver = {
    id: `DRV-${Math.floor(Math.random() * 1000)}`,
    fullName: '',
    phone: '',
    licensePlate: '',
    // FIX: Use DriverStatus enum instead of a string literal to match the type definition.
    status: DriverStatus.AVAILABLE,
    profileImageUrl: '',
    email: '',
    address: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleColor: '',
    tripsThisMonth: 0,
    vehicleType: '',
    totalTrips: 0,
    avgReviewScore: 0,
};

const EditDriverModal: React.FC<EditDriverModalProps> = ({ isOpen, onClose, onSave, driver }) => {
  const [formData, setFormData] = useState<Driver>(driver || emptyDriver);
  const isEditing = !!driver;

  useEffect(() => {
    setFormData(driver || emptyDriver);
  }, [driver, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-driver-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 id="edit-driver-modal-title" className="text-xl font-bold text-gray-800">{isEditing ? 'แก้ไขข้อมูลคนขับ' : 'เพิ่มคนขับใหม่'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Personal Information Section */}
            <fieldset className="border-t pt-6">
              <legend className="text-lg font-semibold text-[#005A9C] mb-4">ข้อมูลส่วนตัว</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                  <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-[#005A9C] focus:border-[#005A9C]" required />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">เบอร์โทรติดต่อ</label>
                  <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-[#005A9C] focus:border-[#005A9C]" required />
                </div>
                 <div className="md:col-span-2">
                   <label htmlFor="address" className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                  <textarea name="address" id="address" rows={2} value={formData.address} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-[#005A9C] focus:border-[#005A9C]"></textarea>
                </div>
              </div>
            </fieldset>
            
            {/* Login Credentials Section */}
             <fieldset className="border-t pt-6">
              <legend className="text-lg font-semibold text-[#005A9C] mb-4">ข้อมูลสำหรับเข้าระบบ</legend>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล (ใช้เป็น Username)</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-[#005A9C] focus:border-[#005A9C]" required />
                 </div>
                 {!isEditing && (
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">ตั้งรหัสผ่านเริ่มต้น</label>
                        <input type="password" name="password" id="password" className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-[#005A9C] focus:border-[#005A9C]" />
                    </div>
                 )}
               </div>
            </fieldset>

            {/* Vehicle Information Section */}
            <fieldset className="border-t pt-6">
              <legend className="text-lg font-semibold text-[#005A9C] mb-4">ข้อมูลรถ</legend>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                  <label htmlFor="vehicleBrand" className="block text-sm font-medium text-gray-700">ยี่ห้อ</label>
                  <input type="text" name="vehicleBrand" id="vehicleBrand" value={formData.vehicleBrand} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700">รุ่น</label>
                  <input type="text" name="vehicleModel" id="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div>
                  <label htmlFor="vehicleColor" className="block text-sm font-medium text-gray-700">สี</label>
                  <input type="text" name="vehicleColor" id="vehicleColor" value={formData.vehicleColor} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div className="md:col-span-3">
                  <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">หมายเลขทะเบียน</label>
                  <input type="text" name="licensePlate" id="licensePlate" value={formData.licensePlate} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                </div>
              </div>
            </fieldset>
            
             {/* Uploads Section */}
             <fieldset className="border-t pt-6">
                 <legend className="text-lg font-semibold text-[#005A9C] mb-4">อัปโหลดเอกสาร</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">รูปโปรไฟล์</label>
                        <div className="mt-1 flex items-center">
                            <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100"><UserIcon className="h-full w-full text-gray-300"/></span>
                            <input type="file" className="ml-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">รูปถ่ายใบขับขี่</label>
                        <div className="mt-1 flex items-center">
                            <span className="inline-block h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center"><RidesIcon className="h-8 w-8 text-gray-300"/></span>
                            <input type="file" className="ml-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                    </div>
                 </div>
             </fieldset>

          </div>

          {/* Footer */}
          <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#005A9C] rounded-md hover:bg-blue-800"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDriverModal;