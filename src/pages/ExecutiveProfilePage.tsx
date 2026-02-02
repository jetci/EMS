import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authAPI } from '../services/api';
import RoleBadge from '../components/ui/RoleBadge';
import SaveIcon from '../components/icons/SaveIcon';
import EditIcon from '../components/icons/EditIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Toast from '../components/Toast';
import { defaultProfileImage } from '../assets/defaultProfile';

interface ExecutiveProfilePageProps {
    user?: User; // Optional as it might be fetched or passed from layout
    onLogout?: () => void;
    onUpdateUser?: (user: User) => void;
}

const ExecutiveProfilePage: React.FC<ExecutiveProfilePageProps> = ({
    user: propUser,
    onLogout,
    onUpdateUser
}) => {
    // Fallback if user is not passed directly (though it should be from Layout)
    const [user, setUser] = useState<User | null>(propUser || null);

    // Load user from local storage if not provided
    useEffect(() => {
        if (!user) {
            try {
                const storedUser = localStorage.getItem('wecare_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Failed to load user info", e);
            }
        }
    }, [user]);

    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    if (!user) return null;

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSaveClick = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSave = async () => {
        setIsConfirmModalOpen(false);
        try {
            await authAPI.updateProfile({
                name: formData.name,
                phone: formData.phone,
            });

            const updatedUser = { ...user, ...formData };
            if (onUpdateUser) onUpdateUser(updatedUser);

            localStorage.setItem('wecare_user', JSON.stringify(updatedUser));
            setIsEditing(false);
            showToast("✅ บันทึกข้อมูลสำเร็จแล้ว");
        } catch (error: any) {
            showToast(`❌ เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            showToast("❌ รหัสผ่านใหม่ไม่ตรงกัน");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showToast("❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }
        try {
            await authAPI.changePassword(user.id || '', passwordData.currentPassword, passwordData.newPassword);
            showToast("✅ เปลี่ยนรหัสผ่านสำเร็จแล้ว");
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error: any) {
            showToast(`❌ เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                </div>

                <div className="relative z-10 px-10 py-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                        <img
                            src={user.profileImageUrl || defaultProfileImage}
                            alt="Profile"
                            className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl relative z-10 object-cover"
                        />
                        <div className="absolute bottom-2 right-2 z-20">
                            <RoleBadge role={UserRole.EXECUTIVE} />
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-4xl font-black tracking-tight">{user.name}</h1>
                        <p className="text-slate-400 text-lg font-medium">{user.email}</p>
                        <div className="flex items-center gap-3 mt-2 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                                Executive Access
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                                System Online
                            </span>
                        </div>
                    </div>

                    <div className="md:ml-auto">
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-white rounded-2xl flex items-center gap-2 font-bold backdrop-blur-md border border-white/10 shadow-xl"
                            >
                                <LogoutIcon className="w-5 h-5" />
                                <span>ออกจากระบบ</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Information */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors"></div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">ข้อมูลส่วนตัว</h2>
                                <p className="text-slate-500">จัดการข้อมูลยืนยันตัวตนของคุณ</p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleSaveClick}
                                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                                    >
                                        <SaveIcon className="w-4 h-4" />
                                        บันทึก
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full text-lg font-bold text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 outline-none py-2 bg-transparent transition-colors"
                                    />
                                ) : (
                                    <p className="text-xl font-bold text-slate-800">{formData.name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">อีเมล</label>
                                <p className="text-xl font-bold text-slate-800 opacity-60 cursor-not-allowed">{user.email}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">เบอร์โทรศัพท์</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full text-lg font-bold text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 outline-none py-2 bg-transparent transition-colors"
                                    />
                                ) : (
                                    <p className="text-xl font-bold text-slate-800">{formData.phone || '-'}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">บทบาท</label>
                                <div className="flex">
                                    <RoleBadge role={user.role} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                            ความปลอดภัย
                        </h2>

                        <form onSubmit={handlePasswordSave} className="space-y-5">
                            <div className="space-y-1">
                                <label htmlFor="currentPassword" className="text-xs font-bold text-slate-400 uppercase">รหัสผ่านปัจจุบัน</label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 font-bold transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="newPassword" className="text-xs font-bold text-slate-400 uppercase">รหัสผ่านใหม่</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 font-bold transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="confirmNewPassword" className="text-xs font-bold text-slate-400 uppercase">ยืนยันรหัสผ่านใหม่</label>
                                <input
                                    id="confirmNewPassword"
                                    type="password"
                                    value={passwordData.confirmNewPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 font-bold transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmSave}
                title="ยืนยันการบันทึก"
                message="คุณต้องการบันทึกการเปลี่ยนแปลงข้อมูลใช่หรือไม่?"
            />

            <Toast message={toastMessage} />
        </div>
    );
};

export default ExecutiveProfilePage;
