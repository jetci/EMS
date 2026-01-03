/**
 * Profile Page
 * Allows users to view and update their profile information
 */

import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import UserIcon from '../../components/icons/UserIcon';
import PhoneIcon from '../../components/icons/PhoneIcon';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
}

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await authAPI.getProfile();
            setProfile(data);
            setFormData({
                name: data.name || '',
                phone: data.phone || ''
            });
        } catch (error: any) {
            console.error('Failed to load profile:', error);
            showToast('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = 'กรุณากรอกชื่อ';
        }

        // Validate phone (optional, but if provided must be valid)
        if (formData.phone && formData.phone.trim()) {
            const phoneRegex = /^[0-9]{9,10}$/;
            if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
                newErrors.phone = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            await authAPI.updateProfile(formData);
            showToast('✅ บันทึกข้อมูลสำเร็จ');
            // Reload profile to get updated data
            await loadProfile();
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            showToast('❌ ไม่สามารถบันทึกข้อมูลได้: ' + (error.message || 'เกิดข้อผิดพลาด'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <LoadingSpinner text="กำลังโหลดข้อมูลโปรไฟล์..." />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center p-8">
                <p className="text-red-600">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้</p>
                <button
                    onClick={loadProfile}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    ลองใหม่อีกครั้ง
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์ของฉัน</h1>
                    <p className="mt-1 text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
                </div>
                <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>เปลี่ยนรหัสผ่าน</span>
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                            <UserIcon className="w-10 h-10 text-blue-600" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-bold">{profile.name}</h2>
                            <p className="text-blue-100">{profile.email}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4" />
                                <span>ชื่อ-นามสกุล</span>
                                <span className="text-red-500">*</span>
                            </div>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="กรอกชื่อ-นามสกุล"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4" />
                                <span>เบอร์โทรศัพท์</span>
                            </div>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="0812345678"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">ตัวเลข 9-10 หลัก</p>
                    </div>

                    {/* Email Field (Read-only) */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            อีเมล
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={profile.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-sm text-gray-500">ไม่สามารถแก้ไขอีเมลได้</p>
                    </div>

                    {/* Role Field (Read-only) */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                            บทบาท
                        </label>
                        <input
                            type="text"
                            id="role"
                            value={profile.role}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-sm text-gray-500">ไม่สามารถแก้ไขบทบาทได้</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={loadProfile}
                            disabled={saving}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>กำลังบันทึก...</span>
                                </>
                            ) : (
                                <span>บันทึกการเปลี่ยนแปลง</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <Toast message={toastMessage} />

            {/* Change Password Modal */}
            {profile && (
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    userId={profile.id}
                />
            )}
        </div>
    );
};

export default ProfilePage;
