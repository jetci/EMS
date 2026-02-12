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
import ModernDatePicker from '../components/ui/ModernDatePicker';
import { formatDateToThai, formatDateTimeToThai } from '../utils/dateUtils';

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

const InfoField: React.FC<InfoFieldProps & { type?: string }> = ({ label, value, isEditing, name, type = "text", onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-500">{label}</label>
        {isEditing ? (
            type === 'date' ? (
                <ModernDatePicker
                    name={name}
                    value={value}
                    onChange={(e) => {
                        // Adapt ModernDatePicker event to standard ChangeEvent if needed
                        // But usually it's already compatible or uses a custom event
                        onChange(e as any);
                    }}
                />
            ) : (
                <input type={type} id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            )
        ) : (
            <p className="mt-1 text-md text-gray-800 font-semibold">
                {type === 'date' ? formatDateToThai(value) : (value || '-')}
            </p>
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
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    licensePlate: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehicleType: '',
    status: DriverStatus.AVAILABLE,
    address: '',
    profileImageUrl: '',
    licenseNumber: '',
    licenseExpiry: '',
    dateCreated: '',
    avgReviewScore: 0,
    totalTrips: 0,
    tripsThisMonth: 0
};

const DriverProfilePage: React.FC<DriverProfilePageProps> = ({ user, onLogout, onUpdateUser }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [profileImage, setProfileImage] = useState<string>(user.profileImageUrl || defaultProfileImage);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [driverData, setDriverData] = useState<Driver>(emptyDriver);
    const [originalData, setOriginalData] = useState<Driver>(emptyDriver);
    const [isEditing, setIsEditing] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState<boolean>(false);
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
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    licensePlate: data.license_plate || data.licensePlate || '',
                    vehicleBrand: data.vehicle_brand || data.vehicleBrand || 'Toyota',
                    vehicleModel: data.vehicle_model || data.vehicleModel || '',
                    vehicleYear: data.vehicle_year || data.vehicleYear || '',
                    vehicleColor: data.vehicle_color || data.vehicleColor || '',
                    vehicleType: data.vehicle_type || data.vehicleType || '',
                    status: (data.status as DriverStatus) || DriverStatus.AVAILABLE,
                    address: data.address || '',
                    profileImageUrl: data.profile_image_url || data.profileImageUrl || `https://i.pravatar.cc/150?u=${data.email}`,
                    licenseNumber: data.license_number || data.licenseNumber || '',
                    licenseExpiry: data.license_expiry || data.licenseExpiry || '',
                    dateCreated: data.created_at || data.date_created || data.dateCreated || '',
                    avgReviewScore: data.avg_review_score || data.avgReviewScore || 0,
                    totalTrips: data.total_trips || data.totalTrips || 0,
                    tripsThisMonth: data.trips_this_month || data.tripsThisMonth || 0
                };
                setDriverData(mapped);
                setOriginalData(mapped);
                setLastUpdated(new Date().toISOString());
                setIsOffline(false);
                localStorage.setItem('wecare_driver_profile_cache', JSON.stringify({
                    driver: mapped,
                    timestamp: new Date().toISOString()
                }));
            } catch (e) {
                console.warn('Failed to load driver profile, checking cache:', e);
                const cached = localStorage.getItem('wecare_driver_profile_cache');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setDriverData(parsed.driver);
                    setOriginalData(parsed.driver);
                    setLastUpdated(parsed.timestamp);
                    setIsOffline(true);
                } else {
                    showToast('❌ ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
                }
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
            const updatedProfile = await driversAPI.updateMyProfile({
                first_name: driverData.firstName,
                last_name: driverData.lastName,
                phone: driverData.phone,
                license_number: driverData.licenseNumber,
                license_expiry: driverData.licenseExpiry,
                address: driverData.address
            });

            // Update local state with fresh data from backend
            const mapped: Driver = {
                id: updatedProfile.id || '',
                firstName: updatedProfile.first_name || '',
                lastName: updatedProfile.last_name || '',
                phone: updatedProfile.phone || '',
                email: updatedProfile.email || '',
                licensePlate: updatedProfile.license_plate || '',
                vehicleBrand: updatedProfile.vehicle_brand || '',
                vehicleModel: updatedProfile.vehicle_model || '',
                vehicleYear: updatedProfile.vehicle_year || '',
                vehicleColor: updatedProfile.vehicle_color || '',
                vehicleType: updatedProfile.vehicle_type || '',
                status: (updatedProfile.status as DriverStatus) || DriverStatus.AVAILABLE,
                address: updatedProfile.address || '',
                profileImageUrl: updatedProfile.profile_image_url || `https://i.pravatar.cc/150?u=${updatedProfile.email}`,
                licenseNumber: updatedProfile.license_number || '',
                licenseExpiry: updatedProfile.license_expiry || '',
                dateCreated: updatedProfile.created_at || '',
                avgReviewScore: updatedProfile.avg_review_score || 0,
                totalTrips: updatedProfile.total_trips || 0,
                tripsThisMonth: updatedProfile.trips_this_month || 0
            };

            const fullName = `${mapped.firstName} ${mapped.lastName}`.trim();

            // Also update global auth profile
            await authAPI.updateProfile({
                name: fullName,
                phone: mapped.phone
            });

            // Update global state
            const updatedUser = {
                ...user,
                name: fullName,
                phone: mapped.phone
            };
            onUpdateUser(updatedUser);
            localStorage.setItem('wecare_user', JSON.stringify(updatedUser));

            setDriverData(mapped);
            setOriginalData(mapped);
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

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showToast('❌ กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('❌ ขนาดไฟล์ต้องไม่เกิน 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Auto upload
        uploadImage(file);
    };

    const uploadImage = async (file: File) => {
        try {
            setUploadingImage(true);

            const formData = new FormData();
            formData.append('profile_image', file);

            const response = await fetch('/api/auth/upload-profile-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('wecare_token')}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to upload image');
            }

            const data = await response.json();

            if (data.imageUrl) {
                setProfileImage(data.imageUrl);
                setDriverData(prev => ({ ...prev, profileImageUrl: data.imageUrl }));

                // Update global user state
                const updatedUser = { ...user, profileImageUrl: data.imageUrl };
                onUpdateUser(updatedUser);
                localStorage.setItem('wecare_user', JSON.stringify(updatedUser));
            }

            showToast('✅ อัพโหลดรูปภาพเรียบร้อยแล้ว');
        } catch (error: any) {
            console.error('❌ Upload error:', error);
            showToast('❌ ไม่สามารถอัพโหลดรูปภาพได้: ' + error.message);
            setProfileImage(user.profileImageUrl || defaultProfileImage);
        } finally {
            setUploadingImage(false);
        }
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
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์ของฉัน</h1>
                        {lastUpdated && (
                            <span className="text-xs text-gray-400">อัปเดตล่าสุด: {formatDateTimeToThai(lastUpdated)}</span>
                        )}
                    </div>
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

                {isOffline && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-6 flex items-center justify-between shadow-sm rounded-r-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-full">
                                <span className="text-amber-600 font-bold">!</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-800">โหมดออฟไลน์</p>
                                <p className="text-xs text-amber-700">กำลังแสดงข้อมูลที่บันทึกไว้ในเครื่อง ท่านไม่สามารถอัปเดตข้อมูลได้ในขณะนี้</p>
                            </div>
                        </div>
                    </div>
                )}



                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-6">
                    <div className="xl:col-span-2 space-y-8">
                        {/* Card 1: Personal Info */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลส่วนตัว</h2>
                            <div className="flex items-center gap-6 mb-6">
                                <div className="relative group">
                                    <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md text-transparent" />
                                    {uploadingImage && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <div className="bg-white p-1.5 rounded-full shadow-lg transform scale-75">
                                                <EditIcon className="w-5 h-5 text-[var(--wecare-blue)]" />
                                            </div>
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-bold text-gray-800">{`${driverData.firstName} ${driverData.lastName}`}</h3>
                                        <RoleBadge role={user.role} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InfoField label="ชื่อ" name="firstName" value={driverData.firstName} isEditing={isEditing} onChange={handleFormChange} />
                                        <InfoField label="นามสกุล" name="lastName" value={driverData.lastName} isEditing={isEditing} onChange={handleFormChange} />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoField label="เบอร์โทรศัพท์" name="phone" value={driverData.phone} isEditing={isEditing} onChange={handleFormChange} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">อีเมล</label>
                                    <p className="mt-1 text-md text-gray-600">{driverData.email}</p>
                                </div>
                                <InfoField label="เลขที่ใบอนุญาตขับรถ" name="licenseNumber" value={driverData.licenseNumber} isEditing={isEditing} onChange={handleFormChange} />
                                <InfoField label="วันหมดอายุใบอนุญาต" name="licenseExpiry" value={driverData.licenseExpiry} isEditing={isEditing} type="date" onChange={handleFormChange} />
                                <div className="sm:col-span-2">
                                    <InfoField label="ที่อยู่ปัจจุบัน" name="address" value={driverData.address} isEditing={isEditing} onChange={handleFormChange} />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Vehicle Info */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[var(--wecare-blue)]">ข้อมูลยานพาหนะที่ได้รับมอบหมาย</h2>
                                {driverData.licensePlate ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">เชื่อมต่อระบบแล้ว</span>
                                ) : (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">ยังไม่มีรถที่มอบหมาย</span>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">ทะเบียนรถ</label>
                                    <p className="mt-1 text-md text-gray-800 font-bold">{driverData.licensePlate || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">ยี่ห้อ / รุ่น / ปี</label>
                                    <p className="mt-1 text-md text-gray-800 font-semibold">{driverData.licensePlate ? `${driverData.vehicleBrand} ${driverData.vehicleModel} ${driverData.vehicleYear}` : '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">ประเภทรถ</label>
                                    <p className="mt-1 text-md text-gray-800">{driverData.vehicleType || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">สีรถ</label>
                                    <p className="mt-1 text-md text-gray-800">{driverData.vehicleColor || '-'}</p>
                                </div>
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
                                <StatItem icon={CalendarIcon} label="เป็นสมาชิกตั้งแต่" value={driverData.dateCreated ? formatDateToThai(driverData.dateCreated) : '-'} />
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
