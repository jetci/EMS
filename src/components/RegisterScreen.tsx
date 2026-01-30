import React, { useState } from 'react';
import GoogleIcon from './icons/GoogleIcon';
import { authAPI } from '../services/api';

interface RegisterScreenProps {
  onLoginClick: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onLoginClick }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await authAPI.register({
        name: fullName,
        email: email,
        password: password
      });

      setSuccess('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        onLoginClick();
      }, 2000);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'การสมัครสมาชิกล้มเหลว กรุณาลองอีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F0F4F8] pt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl m-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#005A9C]">สร้างบัญชีใหม่</h1>
          <p className="mt-2 text-gray-600">เข้าร่วม WeCare เพื่อเริ่มการเดินทาง</p>
        </div>

        <div>
          <button
            type="button"
            className="flex items-center justify-center w-full px-4 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005A9C] transition-colors duration-300"
          >
            <GoogleIcon className="w-5 h-5 mr-3" />
            สมัครสมาชิกด้วย Google
          </button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 uppercase tracking-wide">
              หรือสมัครด้วยอีเมล
            </span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                ชื่อ
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1"
                placeholder="สมชาย"
              />
            </div>
            <div className="mt-4 md:mt-0">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                นามสกุล
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1"
                placeholder="ใจดี"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              ยืนยันรหัสผ่าน
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
            />
          </div>

          {error && (
            <p className="text-sm text-center text-[#DC3545]">{error}</p>
          )}
          {success && (
            <p className="text-sm text-center text-green-600">{success}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex justify-center w-full px-4 py-3 font-semibold text-white bg-[#28A745] rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </div>
        </form>
        <div className="pt-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            มีบัญชีอยู่แล้ว?{' '}
            <button onClick={onLoginClick} className="font-medium text-[#005A9C] hover:underline">
              เข้าสู่ระบบที่นี่
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
