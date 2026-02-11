import React, { useState, useEffect } from 'react';
import { Driver, DriverStatus, User } from '../../types';
import XIcon from '../icons/XIcon';
import UserIcon from '../icons/UserIcon';
import RidesIcon from '../icons/RidesIcon';
import SearchIcon from '../icons/SearchIcon';

interface EditDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (driver: Driver) => void;
  driver: Driver | null;
  availableStaff: User[];
  availableDrivers: Driver[];
}

const emptyDriver: Driver = {
  id: `DRV-${Math.floor(Math.random() * 1000)}`,
  fullName: '',
  phone: '',
  licensePlate: '',
  status: DriverStatus.OFFLINE,
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

// ... (keep imports and interface)

const EditDriverModal: React.FC<EditDriverModalProps> = ({ isOpen, onClose, onSave, driver, availableStaff, availableDrivers }) => {
  const [formData, setFormData] = useState<Driver>(driver || emptyDriver);
  const [searchTerm, setSearchTerm] = useState('');
  const isEditing = !!driver;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setFormData(driver || emptyDriver);
    setSelectedUser(null);
    if (!driver) {
      setSearchTerm('');
    }
  }, [driver, isOpen]);

  const searchResults = searchTerm
    ? availableStaff.filter(member =>
      !availableDrivers.some(d => (d.email || '').toLowerCase() === (member.email || '').toLowerCase()) && (
        (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    )
    : [];

  const handleSelectMember = (member: User) => {
    setFormData(prev => ({
      ...prev,
      fullName: member.name || '',
      email: member.email,
      phone: member.phone || '',
      profileImageUrl: member.profileImageUrl
    }));
    setSelectedUser(member);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setFormData(emptyDriver);
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, userId: selectedUser?.id } as any);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'แก้ไขข้อมูลคนขับ' : 'เพิ่มคนขับใหม่ (จากสมาชิกที่มีอยู่)'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* SEARCH SECTION - For New Driver Only */}
            {!isEditing && !selectedUser && (
              <div className="py-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <UserIcon className="w-8 h-8 text-[#005A9C]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">ค้นหาสมาชิกเพื่อลงทะเบียนเป็นคนขับ</h3>
                <p className="text-gray-500 mb-6 text-sm">ระบบจะดึงข้อมูลส่วนตัวจากฐานข้อมูลสมาชิกโดยอัตโนมัติ</p>

                <div className="relative max-w-md mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="พิมพ์ชื่อ หรือ อีเมลของสมาชิก..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#005A9C] focus:ring-0 transition-colors"
                      autoFocus
                    />
                    <div className="absolute left-3 top-3.5 text-gray-400">
                      <SearchIcon className="w-5 h-5" />
                    </div>
                  </div>

                  {searchTerm && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl mt-2 max-h-60 overflow-y-auto shadow-2xl text-left">
                      {searchResults.map(member => (
                        <div
                          key={member.id}
                          onClick={() => handleSelectMember(member)}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {(member.name || '').charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{member.name || '-'}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                          <div className="ml-auto">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">สมาชิก</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchTerm && searchResults.length === 0 && (
                    <div className="mt-2 text-sm text-gray-500">ไม่พบข้อมูลสมาชิกที่ค้นหา</div>
                  )}
                </div>
              </div>
            )}

            {/* SELECTED / EDITING STATE */}
            {(isEditing || selectedUser) && (
              <>
                {/* User Summary Card (Read Only) */}
                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-4 border border-blue-100">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden">
                    {formData.profileImageUrl ? (
                      <img src={formData.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500"><UserIcon className="w-6 h-6" /></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{formData.fullName}</h4>
                    <p className="text-sm text-gray-600">{formData.email}</p>
                    <p className="text-sm text-gray-600">{formData.phone}</p>
                  </div>
                  {!isEditing && (
                    <button type="button" onClick={handleClearSelection} className="text-xs text-red-600 hover:text-red-800 font-medium underline">
                      เลือกใหม่
                    </button>
                  )}
                </div>

                {/* Hidden inputs for form submission */}
                <input type="hidden" name="fullName" value={formData.fullName} />
                <input type="hidden" name="email" value={formData.email} />
                <input type="hidden" name="phone" value={formData.phone} />

                {/* Vehicle Information Section */}
                <fieldset className="border-t pt-6">
                  <legend className="text-lg font-semibold text-[#005A9C] mb-4">ข้อมูลรถและทะเบียน</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="vehicleBrand" className="block text-sm font-medium text-gray-700">ยี่ห้อรถ</label>
                      <input id="vehicleBrand" type="text" name="vehicleBrand" value={formData.vehicleBrand} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="เช่น Toyota" required />
                    </div>
                    <div>
                      <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700">รุ่นรถ</label>
                      <input id="vehicleModel" type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="เช่น Commuter" required />
                    </div>
                    <div>
                      <label htmlFor="vehicleColor" className="block text-sm font-medium text-gray-700">สีรถ</label>
                      <input id="vehicleColor" type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="เช่น ขาว" required />
                    </div>
                    <div>
                      <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">ทะเบียนรถ</label>
                      <input id="licensePlate" type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="เช่น นข 1234" required />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">ที่อยู่ปัจจุบัน</label>
                      <textarea id="address" name="address" rows={2} value={formData.address} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="ระบุที่อยู่สำหรับการติดต่อ..."></textarea>
                    </div>
                  </div>
                </fieldset>
              </>
            )}

            {/* Uploads Section (Only shown if user selected or editing) */}
            {(isEditing || selectedUser) && (
              <fieldset className="border-t pt-6 opacity-60">
                <div className="flex justify-between items-center mb-4">
                  <legend className="text-lg font-semibold text-[#005A9C]">เอกสารประกอบ (Simulation)</legend>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Not Connected</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">รูปโปรไฟล์ใหม่</label>
                    <input type="file" disabled className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ใบขับขี่</label>
                    <input type="file" disabled className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-gray-500" />
                  </div>
                </div>
              </fieldset>
            )}

          </div>

          {/* Footer */}
          {(isEditing || selectedUser) && (
            <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3 flex-shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#005A9C] rounded-md hover:bg-blue-800 shadow-sm"
              >
                {isEditing ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่มคนขับ'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditDriverModal;
