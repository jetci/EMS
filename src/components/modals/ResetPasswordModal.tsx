
import React, { useState } from 'react';
import { ManagedUser } from '../../types';
import XIcon from '../icons/XIcon';
import PasswordStrengthIndicator, { validatePassword } from '../ui/PasswordStrengthIndicator';

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (user: ManagedUser, newPassword: string) => Promise<void>;
    user: ManagedUser | null;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, onConfirm, user }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setPassword('');
            setConfirmPassword('');
            setError('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            setError(`รหัสผ่านไม่ปลอดภัยพอ: ${passwordErrors.join(', ')}`);
            return;
        }

        try {
            setIsSubmitting(true);
            await onConfirm(user, password);
            onClose();
        } catch (err: any) {
            console.error('Failed to reset password:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">
                        รีเซ็ตรหัสผ่าน: {user.fullName}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="reset-password" class="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="reset-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm pr-10"
                                    required
                                    placeholder="กรอกรหัสผ่านใหม่"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-800"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {password && (
                                <div className="mt-2">
                                    <PasswordStrengthIndicator password={password} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="reset-confirm-password" class="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่านใหม่</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="reset-confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                required
                                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-600 mt-1">รหัสผ่านไม่ตรงกัน</p>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
                            disabled={isSubmitting}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordModal;
