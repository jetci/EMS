import React, { useState, useEffect } from 'react';
import { ManagedUser, User } from '../../types';
import XIcon from '../icons/XIcon';
import PasswordStrengthIndicator, { validatePassword } from '../ui/PasswordStrengthIndicator';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: ManagedUser & { password?: string }) => void;
  user: ManagedUser | null;
  currentUser?: User; // Add currentUser prop
}

const emptyUser: ManagedUser = {
  id: `USR-${Math.floor(Math.random() * 1000)}`,
  fullName: '',
  email: '',
  role: '' as User['role'], // Default to empty
  dateCreated: new Date().toISOString(),
  status: 'Active',
};

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSave, user, currentUser }) => {
  const [formData, setFormData] = useState(user || emptyUser);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = !!user;

  useEffect(() => {
    setFormData(user || emptyUser);
    setPassword('');
    setConfirmPassword('');
    setError('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const [firstName, lastName] = formData.fullName.split(' ');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const currentName = formData.fullName.split(' ');
    let newFullName = '';
    if (name === 'firstName') {
      newFullName = `${value} ${currentName[1] || ''}`.trim();
    } else {
      newFullName = `${currentName[0] || ''} ${value}`.trim();
    }
    setFormData(prev => ({ ...prev, fullName: newFullName }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Strict validation: No whitespace only
    if (!firstName?.trim()) {
      setError('กรุณาระบุชื่อ (ห้ามเว้นว่าง)');
      return;
    }
    if (!lastName?.trim()) {
      setError('กรุณาระบุนามสกุล (ห้ามเว้นว่าง)');
      return;
    }
    if (!formData.email?.trim()) {
      setError('กรุณาระบุอีเมล (ห้ามเว้นว่าง)');
      return;
    }
    if (!formData.role) {
      setError('กรุณาเลือกบทบาท (Role)');
      return;
    }

    if (!isEditing) {
      // Validate password match
      if (password !== confirmPassword) {
        setError('รหัสผ่านไม่ตรงกัน');
        return;
      }

      // Check password whitespace
      if (!password.trim()) {
        setError('รหัสผ่านต้องไม่เป็นช่องว่าง');
        return;
      }

      // Validate password strength
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        setError(`รหัสผ่านไม่ปลอดภัยพอ: ${passwordErrors.join(', ')}`);
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    // Validate name length
    if (formData.fullName.trim().length < 2) {
      setError('ชื่อ-นามสกุลสั้นเกินไป');
      return;
    }

    onSave({ ...formData, email: formData.email.trim(), fullName: formData.fullName.trim(), password: password || undefined });
  };

  const userRoles: User['role'][] = [
    'admin',
    'DEVELOPER',
    'office',
    'OFFICER',
    'driver',
    'community',
    'radio',
    'radio_center',
    'EXECUTIVE'
  ].filter(role => {
    // Only allow DEVELOPER role to assign 'DEVELOPER' role
    if (role === 'DEVELOPER') {
      return currentUser?.role === 'DEVELOPER';
    }
    return true;
  }) as User['role'][];

  const roleLabels: { [key: string]: string } = {
    admin: 'ผู้ดูแลระบบ',
    DEVELOPER: 'ผู้พัฒนาระบบ',
    office: 'ธุรการ',
    OFFICER: 'เจ้าหน้าที่',
    driver: 'พนักงานขับรถ',
    community: 'อาสาสมัคร',
    radio: 'เจ้าหน้าที่วิทยุ',
    radio_center: 'ศูนย์สั่งการ',
    EXECUTIVE: 'ผู้บริหาร'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-user-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 id="edit-user-modal-title" className="text-xl font-bold text-gray-800">{isEditing ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">ชื่อ</label>
                <input type="text" name="firstName" id="firstName" value={firstName || ''} onChange={handleNameChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="ชื่อ (เช่น สมชาย)" required />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">นามสกุล</label>
                <input type="text" name="lastName" id="lastName" value={lastName || ''} onChange={handleNameChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="นามสกุล (เช่น ใจดี)" required />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="อีเมล (เช่น user@wecare.dev)" required />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role (บทบาท)</label>
              <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm bg-white" required>
                <option value="" disabled>-- กรุณาเลือกบทบาท --</option>
                {userRoles.map(role => (
                  <option key={role} value={role}>{roleLabels[role] || role}</option>
                ))}
              </select>
            </div>
            {!isEditing && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">ตั้งรหัสผ่านเริ่มต้น</label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm pr-10"
                      required
                      placeholder="กรอกรหัสผ่าน"
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
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                    required
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">รหัสผ่านไม่ตรงกัน</p>
                  )}
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </>
            )}
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

export default EditUserModal;
