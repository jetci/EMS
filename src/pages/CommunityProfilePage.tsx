import React, { useState, useEffect } from 'react';
import { User } from '../types';
import GoogleIcon from '../components/icons/GoogleIcon';
import SaveIcon from '../components/icons/SaveIcon';
import EditIcon from '../components/icons/EditIcon';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Toast from '../components/Toast';
import ActionSheet from '../components/ui/ActionSheet';
import ImageIcon from '../components/icons/ImageIcon';
import CameraIcon from '../components/icons/CameraIcon';
import CameraModal from '../components/modals/CameraModal';
import { defaultProfileImage } from '../assets/defaultProfile';
import LogoutIcon from '../components/icons/LogoutIcon';
import RoleBadge from '../components/ui/RoleBadge';
import { authAPI } from '../services/api';


interface CommunityProfilePageProps {
    user: User;
    onLogout: () => void;
    onUpdateUser: (user: User) => void;
}

const CommunityProfilePage: React.FC<CommunityProfilePageProps> = ({ user: initialUser, onLogout, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [profileImage, setProfileImage] = useState(initialUser.profileImageUrl || defaultProfileImage);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        firstName: initialUser.name.split(' ')[0] || '',
        lastName: initialUser.name.split(' ')[1] || '',
        phone: initialUser.phone || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    useEffect(() => {
        // Reset form data and image if the user prop changes
        setFormData({
            firstName: initialUser.name.split(' ')[0] || '',
            lastName: initialUser.name.split(' ')[1] || '',
            phone: initialUser.phone || '',
        });
        setProfileImage(initialUser.profileImageUrl || defaultProfileImage);
    }, [initialUser]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setFormData({
            firstName: initialUser.name.split(' ')[0] || '',
            lastName: initialUser.name.split(' ')[1] || '',
            phone: initialUser.phone || '',
        });
        setIsEditing(false);
    };

    const handleSaveClick = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSave = async () => {
        setIsConfirmModalOpen(false);
        try {
            await authAPI.updateProfile({
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                phone: formData.phone,
            });

            // Create updated user object
            const updatedUser = {
                ...initialUser,
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                phone: formData.phone
            };

            // Update global state via callback
            onUpdateUser(updatedUser);

            // Update localStorage with new user data
            localStorage.setItem('wecare_user', JSON.stringify(updatedUser));
            setIsEditing(false);
            showToast("✅ บันทึกข้อมูลสำเร็จแล้ว!");
        } catch (error: any) {
            showToast(`❌ เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            showToast("❌ รหัสผ่านใหม่ไม่ตรงกัน");
            return;
        }
        if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
            showToast("❌ รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }
        if (!passwordData.currentPassword) {
            showToast("❌ กรุณากรอกรหัสผ่านปัจจุบัน");
            return;
        }
        try {
            await authAPI.changePassword(
                initialUser.id || '',
                passwordData.currentPassword,
                passwordData.newPassword
            );
            showToast("✅ เปลี่ยนรหัสผ่านสำเร็จแล้ว!");
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error: any) {
            showToast(`❌ เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const handleCaptureImage = (imageDataUrl: string) => {
        setProfileImage(imageDataUrl);
        setIsCameraModalOpen(false);
        showToast("📸 อัปเดตรูปภาพโปรไฟล์สำเร็จแล้ว!");
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

        setImageFile(file);

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

            // Upload via centralized API (handles CSRF & auth)
            const result = await authAPI.uploadProfileImage(file);

            // After upload, fetch latest profile to get canonical image URL
            const latest = await authAPI.getProfile();
            const imageUrl = latest.profile_image_url || initialUser.profileImageUrl || undefined;
            if (imageUrl) {
                setProfileImage(imageUrl);
                const updatedUser = { ...initialUser, profileImageUrl: imageUrl } as any;
                onUpdateUser(updatedUser);
                localStorage.setItem('wecare_user', JSON.stringify(updatedUser));
            }

            showToast('✅ อัพโหลดรูปภาพเรียบร้อยแล้ว');
            setImageFile(null);
        } catch (error: any) {
            console.error('❌ Upload error:', error);
            showToast('❌ ไม่สามารถอัพโหลดรูปภาพได้: ' + error.message);
            setProfileImage(initialUser.profileImageUrl || defaultProfileImage);
        } finally {
            setUploadingImage(false);
        }
    };

    const actionSheetOptions = [
        {
            label: "เลือกรูปภาพจากคลัง",
            icon: ImageIcon,
            onClick: () => {
                console.log("Choose from library");
                setIsActionSheetOpen(false);
                fileInputRef.current?.click();
            }
        },
        {
            label: "ถ่ายภาพใหม่",
            icon: CameraIcon,
            onClick: () => {
                setIsActionSheetOpen(false);
                setIsCameraModalOpen(true);
            }
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์และการตั้งค่า</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Profile Information */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSaveClick}>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-[var(--wecare-blue)]">ข้อมูลส่วนตัว</h2>
                                {!isEditing && (
                                    <button type="button" onClick={handleEditClick} className="flex items-center text-sm font-semibold text-white bg-[var(--wecare-blue)] px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        <EditIcon className="w-4 h-4 mr-2" />
                                        แก้ไขข้อมูล
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                                        {uploadingImage && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        <div className="absolute -bottom-2 -right-2">
                                            <RoleBadge role={initialUser.role} />
                                        </div>
                                    </div>
                                    {isEditing && (
                                        <div>
                                            <button type="button" onClick={() => setIsActionSheetOpen(true)} className="text-sm font-semibold text-[var(--wecare-blue)] hover:underline">
                                                เปลี่ยนรูปภาพ
                                            </button>
                                            <p className="text-xs text-gray-500 mt-1">JPG, PNG or WEBP. 5MB max.</p>
                                        </div>
                                    )}
                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        id="profile-image-input"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        aria-label="เลือกรูปภาพโปรไฟล์"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">ชื่อ</label>
                                        {isEditing ? (
                                            <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleProfileChange} className="mt-1 w-full" />
                                        ) : (
                                            <p className="mt-1 text-lg text-gray-900">{formData.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">นามสกุล</label>
                                        {isEditing ? (
                                            <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleProfileChange} className="mt-1 w-full" />
                                        ) : (
                                            <p className="mt-1 text-lg text-gray-900">{formData.lastName}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล</label>
                                    <p className="mt-1 text-gray-700">{initialUser.email}</p>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                                    {isEditing ? (
                                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleProfileChange} className="mt-1 w-full" />
                                    ) : (
                                        <p className="mt-1 text-lg text-gray-900">{formData.phone || '-'}</p>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end pt-4 gap-3 border-t">
                                        <button type="button" onClick={handleCancelClick} className="px-6 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                            ยกเลิก
                                        </button>
                                        <button type="submit" className="flex items-center justify-center px-6 py-2 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600 transition-colors">
                                            <SaveIcon className="w-5 h-5 mr-2" />
                                            บันทึก
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Column 2: Security Settings */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">เปลี่ยนรหัสผ่าน</h2>
                        <form onSubmit={handlePasswordSave} className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">รหัสผ่านปัจจุบัน</label>
                                <input type="password" name="currentPassword" id="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="mt-1 w-full" />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
                                <input type="password" name="newPassword" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="mt-1 w-full" />
                            </div>
                            <div>
                                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่านใหม่</label>
                                <input type="password" name="confirmNewPassword" id="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} className="mt-1 w-full" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full flex items-center justify-center px-4 py-2.5 font-semibold text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                                    เปลี่ยนรหัสผ่าน
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 font-bold py-2.5 px-4 rounded-lg hover:bg-red-200 transition duration-300"
                        >
                            <LogoutIcon className="w-5 h-5" />
                            <span>ออกจากระบบ</span>
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmSave}
                title="ยืนยันการแก้ไขข้อมูล"
                message="คุณต้องการบันทึกการเปลี่ยนแปลงข้อมูลส่วนตัวใช่หรือไม่?"
            />
            <ActionSheet
                isOpen={isActionSheetOpen}
                onClose={() => setIsActionSheetOpen(false)}
                title="เปลี่ยนรูปโปรไฟล์"
                options={actionSheetOptions}
            />
            <CameraModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={handleCaptureImage}
            />
            <Toast message={toastMessage} />
        </div>
    );
};

export default CommunityProfilePage;
