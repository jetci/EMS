import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { User, Driver, DriverStatus } from '../types';
import SaveIcon from '../components/icons/SaveIcon';
import EditIcon from '../components/icons/EditIcon';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { defaultProfileImage } from '../assets/defaultProfile';
import LogoutIcon from '../components/icons/LogoutIcon';
import StarIcon from '../components/icons/StarIcon';
import RidesIcon from '../components/icons/RidesIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import KeyIcon from '../components/icons/KeyIcon';
import RoleBadge from '../components/ui/RoleBadge';
import { driversAPI, authAPI } from '../services/api';

interface DriverProfilePageProps {
    user: User;
    onLogout: () => void;
    onUpdateUser: (user: User) => void;
}

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

// Default empty driver for loading state
const emptyDriver: Driver = {
    id: '',
    fullName: '',
    phone: '',
    email: '',
    licensePlate: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleColor: '',
    vehicleType: '',
    status: DriverStatus.AVAILABLE,
    address: '',
    profileImageUrl: '',
    dateCreated: '',
    avgReviewScore: 0,
    totalTrips: 0,
    tripsThisMonth: 0
};

const DriverProfilePage: React.FC<DriverProfilePageProps> = ({ user, onLogout }) => {
    const [driverData, setDriverData] = useState<Driver>(emptyDriver);
    const [originalData, setOriginalData] = useState<Driver>(emptyDriver);
    const [isEditing, setIsEditing] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await driversAPI.getMyProfile();
                // Map backend data to Driver interface
                const mapped: Driver = {
                    id: data.id || '',
                    fullName: data.full_name || data.fullName || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    licensePlate: data.license_plate || data.licensePlate || '',
                    vehicleBrand: data.vehicle_brand || data.vehicleBrand || 'Toyota',
                    vehicleModel: data.vehicle_model || data.vehicleModel || '',
                    vehicleColor: data.vehicle_color || data.vehicleColor || '',
                    vehicleType: data.vehicle_type || data.vehicleType || '',
                    status: (data.status as DriverStatus) || DriverStatus.AVAILABLE,
                    address: data.address || '',
                    profileImageUrl: data.profile_image_url || data.profileImageUrl || `https://i.pravatar.cc/150?u=${data.email}`,
                    dateCreated: data.date_created || data.dateCreated || '',
                    avgReviewScore: data.avg_review_score || data.avgReviewScore || 0,
                    totalTrips: data.total_trips || data.totalTrips || 0,
                    tripsThisMonth: data.trips_this_month || data.tripsThisMonth || 0
                };
                setDriverData(mapped);
                setOriginalData(mapped);
            } catch (e) {
                console.error('Failed to load driver profile:', e);
                showToast('❌ ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDriverData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await driversAPI.updateMyProfile({
                full_name: driverData.fullName,
                phone: driverData.phone,
                license_plate: driverData.licensePlate,
                vehicle_model: driverData.vehicleModel,
                address: driverData.address
            });
            setOriginalData(driverData);
            setIsEditing(false);
            showToast("✅ บันทึกข้อมูลสำเร็จแล้ว!");
        } catch (e: any) {
            showToast(`❌ บันทึกข้อมูลไม่สำเร็จ: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setDriverData(originalData);
        setIsEditing(false);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('❌ รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showToast('❌ รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }
        try {
            await authAPI.changePassword(user.id || '', passwordData.currentPassword, passwordData.newPassword);
            showToast('✅ เปลี่ยนรหัสผ่านสำเร็จ!');
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (e: any) {
            showToast(`❌ ${e.message}`);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-6">
            <form id="profileForm" onSubmit={handleSave}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์ของฉัน</h1>
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <button type="button" onClick={handleCancel} disabled={isSaving} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                                    ยกเลิก
                                </button>
                                <button type="submit" disabled={isSaving} className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600 disabled:bg-gray-400">
                                    <SaveIcon className="w-5 h-5 mr-2" />
                                    {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)} className="flex items-center text-sm font-semibold text-white bg-[var(--wecare-blue)] px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <EditIcon className="w-4 h-4 mr-2" />
                                แก้ไขข้อมูล
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center mt-6">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)]">สถานะการทำงาน</h2>
                        <p className={`text-sm font-medium ${driverData.status === DriverStatus.AVAILABLE ? 'text-green-600' : 'text-gray-500'}`}>
                            {driverData.status === DriverStatus.AVAILABLE ? '🟢 พร้อมรับงาน (Online)' : '⚫ ออฟไลน์ (Offline)'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={async () => {
                            const newStatus = driverData.status === DriverStatus.AVAILABLE ? DriverStatus.OFFLINE : DriverStatus.AVAILABLE;
                            try {
                                await driversAPI.updateMyProfile({ status: newStatus });
                                setDriverData(prev => ({ ...prev, status: newStatus }));
                                setOriginalData(prev => ({ ...prev, status: newStatus }));
                                showToast(`✅ เปลี่ยนสถานะเป็น ${newStatus === DriverStatus.AVAILABLE ? 'พร้อมทำงาน' : 'ออฟไลน์'} แล้ว`);
                            } catch (e: any) {
                                showToast(`❌ ไม่สามารถเปลี่ยนสถานะได้: ${e.message}`);
                            }
                        }}
                        className={`px-6 py-2 rounded-full font-bold transition-colors ${driverData.status === DriverStatus.AVAILABLE
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                    >
                        {driverData.status === DriverStatus.AVAILABLE ? 'ปิดรับงาน (Go Offline)' : 'เปิดรับงาน (Go Online)'}
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-6">
                    <div className="xl:col-span-2 space-y-8">
                        {/* Card 1: Personal Info */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลส่วนตัว</h2>
                            <div className="flex items-center gap-6 mb-6">
                                <img src={driverData.profileImageUrl || defaultProfileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-bold text-gray-800">{driverData.fullName}</h3>
                                        <RoleBadge role={user.role} />
                                    </div>
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
                                <StatItem icon={StarIcon} label="คะแนนรีวิวเฉลี่ย" value={driverData.avgReviewScore ? driverData.avgReviewScore.toFixed(1) : '0.0'} />
                                <StatItem icon={RidesIcon} label="จำนวนเที่ยววิ่งทั้งหมด" value={driverData.totalTrips || 0} />
                                <StatItem icon={CalendarIcon} label="เป็นสมาชิกตั้งแต่" value={driverData.dateCreated ? dayjs(driverData.dateCreated).format('D MMM YYYY') : '-'} />
                            </div>
                        </div>

                        {/* Card 4: Security */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ความปลอดภัย</h2>

                            {isChangingPassword ? (
                                <form onSubmit={handlePasswordChange} className="space-y-3">
                                    <input
                                        type="password"
                                        placeholder="รหัสผ่านปัจจุบัน"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="รหัสผ่านใหม่"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="ยืนยันรหัสผ่านใหม่"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                                            ยกเลิก
                                        </button>
                                        <button type="submit" className="flex-1 py-2 text-white bg-[var(--wecare-blue)] rounded-lg hover:bg-blue-700">
                                            บันทึก
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button type="button" onClick={() => setIsChangingPassword(true)} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-semibold text-[var(--wecare-blue)] bg-blue-50 rounded-lg hover:bg-blue-100">
                                    <KeyIcon className="w-5 h-5" />
                                    เปลี่ยนรหัสผ่าน
                                </button>
                            )}

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
