import React, { useState } from 'react';
import dayjs from 'dayjs';
import { User, Driver, DriverStatus } from '../types';
import SaveIcon from '../components/icons/SaveIcon';
import EditIcon from '../components/icons/EditIcon';
import Toast from '../components/Toast';
import { defaultProfileImage } from '../assets/defaultProfile';
import LogoutIcon from '../components/icons/LogoutIcon';
import StarIcon from '../components/icons/StarIcon';
import RidesIcon from '../components/icons/RidesIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import KeyIcon from '../components/icons/KeyIcon';

interface DriverProfilePageProps {
    user: User;
    onLogout: () => void;
}

// Mock full driver data based on the new interface
const mockDriver: Driver = {
  id: 'DRV-001',
  fullName: 'สมศักดิ์ ขยันยิ่ง',
  phone: '081-234-5678',
  email: 'driver1@wecare.dev',
  licensePlate: 'กท 1234',
  vehicleBrand: 'Toyota',
  vehicleModel: 'Vios',
  vehicleColor: 'บรอนซ์เงิน',
  vehicleType: 'รถยนต์ 4 ประตู',
  status: DriverStatus.AVAILABLE,
  address: '123 ถนนสุขุมวิท, กรุงเทพฯ',
  profileImageUrl: `https://i.pravatar.cc/150?u=driver1@wecare.dev`,
  dateCreated: '2023-01-15T10:00:00Z',
  avgReviewScore: 4.8,
  totalTrips: 152,
  tripsThisMonth: 25
};

interface InfoFieldProps {
    label: string;
    value: string;
    isEditing: boolean;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, isEditing, name, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-500">{label}</label>
        {isEditing ? (
            <input type="text" id={name} name={name} value={value} onChange={onChange} className="mt-1" />
        ) : (
            <p className="mt-1 text-md text-gray-800 font-semibold">{value || '-'}</p>
        )}
    </div>
);

const StatItem: React.FC<{ icon: React.ElementType, label: string, value: string | number }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center p-3 bg-gray-50/75 rounded-lg">
        <Icon className="w-6 h-6 text-gray-500 mr-4" />
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="font-bold text-lg text-gray-800">{value}</p>
        </div>
    </div>
);


const DriverProfilePage: React.FC<DriverProfilePageProps> = ({ user, onLogout }) => {
    const [driverData, setDriverData] = useState<Driver>(mockDriver);
    const [isEditing, setIsEditing] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDriverData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
        showToast("✅ บันทึกข้อมูลสำเร็จแล้ว!");
        // In a real app, you would make an API call here.
    };

    const handleCancel = () => {
        setDriverData(mockDriver); // Reset to original data
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <form id="profileForm" onSubmit={handleSave}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์ของฉัน</h1>
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <button type="button" onClick={handleCancel} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                                    ยกเลิก
                                </button>
                                <button type="submit" className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600">
                                    <SaveIcon className="w-5 h-5 mr-2"/>
                                    บันทึก
                                </button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)} className="flex items-center text-sm font-semibold text-white bg-[var(--wecare-blue)] px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <EditIcon className="w-4 h-4 mr-2"/>
                                แก้ไขข้อมูล
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-6">
                    <div className="xl:col-span-2 space-y-8">
                        {/* Card 1: Personal Info */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลส่วนตัว</h2>
                             <div className="flex items-center gap-6 mb-6">
                                <img src={driverData.profileImageUrl || defaultProfileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                                <div>
                                    <InfoField label="ชื่อ-นามสกุล" name="fullName" value={driverData.fullName} isEditing={isEditing} onChange={handleFormChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoField label="เบอร์โทรศัพท์" name="phone" value={driverData.phone} isEditing={isEditing} onChange={handleFormChange} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">อีเมล</label>
                                    <p className="mt-1 text-md text-gray-600">{driverData.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Vehicle Info */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลยานพาหนะ</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoField label="ทะเบียนรถ" name="licensePlate" value={driverData.licensePlate} isEditing={isEditing} onChange={handleFormChange} />
                                <div>
                                     <label className="block text-sm font-medium text-gray-500">ยี่ห้อ / รุ่น</label>
                                     <p className="mt-1 text-md text-gray-800 font-semibold">{`${driverData.vehicleBrand} ${driverData.vehicleModel}`}</p>
                                </div>
                                <InfoField label="ประเภทรถ" name="vehicleType" value={driverData.vehicleType} isEditing={isEditing} onChange={handleFormChange} />
                                <InfoField label="สี" name="vehicleColor" value={driverData.vehicleColor} isEditing={isEditing} onChange={handleFormChange} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Card 3: Performance Stats */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">สถิติผลงาน</h2>
                            <div className="space-y-3">
                                <StatItem icon={StarIcon} label="คะแนนรีวิวเฉลี่ย" value={driverData.avgReviewScore.toFixed(1)} />
                                <StatItem icon={RidesIcon} label="จำนวนเที่ยววิ่งทั้งหมด" value={driverData.totalTrips} />
                                <StatItem icon={CalendarIcon} label="เป็นสมาชิกตั้งแต่" value={dayjs(driverData.dateCreated).format('D MMM YYYY')} />
                            </div>
                        </div>
                        
                        {/* Card 4: Security */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ความปลอดภัย</h2>
                            <button type="button" onClick={() => setIsChangingPassword(true)} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-semibold text-[var(--wecare-blue)] bg-blue-50 rounded-lg hover:bg-blue-100">
                                <KeyIcon className="w-5 h-5"/>
                                เปลี่ยนรหัสผ่าน
                            </button>
                            <div className="mt-4 border-t pt-4">
                                <button type="button" onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 font-bold py-2.5 px-4 rounded-lg hover:bg-red-200 transition duration-300">
                                    <LogoutIcon className="w-5 h-5" />
                                    <span>ออกจากระบบ</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            <Toast message={toastMessage} />
        </div>
    );
};

export default DriverProfilePage;