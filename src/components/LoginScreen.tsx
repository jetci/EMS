import React, { useState } from 'react';
import GoogleIcon from './icons/GoogleIcon';
import QuickLoginPanel from './dev/QuickLoginPanel';

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegisterClick: () => void;
}

const isDevEnv = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
const isTestEnv = typeof process !== 'undefined' && process.env && typeof process.env.JEST_WORKER_ID !== 'undefined';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Show QuickLoginPanel only for development or test environments
  const [showQuickLogin, setShowQuickLogin] = useState(false);

  // Check if user is trying to login as DEVELOPER
  const checkDeveloperAccess = () => {
    return email.toLowerCase().includes('jetci');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await onLogin(email, password);
    if (!success) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง');
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setError('');
    setIsLoading(true);
    const success = await onLogin(quickEmail, quickPass);
    if (!success) {
      setError('Quick login failed for this user.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F0F4F8] pt-16">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-xl m-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#005A9C]">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-gray-600">เข้าสู่ระบบเพื่อจัดการการเดินทางของคุณ</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate data-testid="login-form">
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
              placeholder="user@wecare.ems"
              data-testid="login-email"
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="password123"
              data-testid="login-password"
            />
          </div>

          {error && (
            <p role="alert" aria-live="assertive" data-testid="login-error" className="text-sm text-center text-[#DC3545]">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex justify-center w-full px-4 py-3 font-semibold text-white bg-[#005A9C] rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
              data-testid="login-submit"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              หรือ
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            className="flex items-center justify-center w-full px-4 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005A9C] transition-colors duration-300"
            data-testid="login-google"
          >
            <GoogleIcon className="w-5 h-5 mr-3" />
            เข้าสู่ระบบด้วย Google
          </button>
        </div>

        {/* Quick Login Panel - Development/Test Only */}
        {(isDevEnv || isTestEnv) && (
          <QuickLoginPanel onQuickLogin={handleQuickLogin} />
        )}

        <div className="pt-4 text-center text-sm text-gray-600 space-y-2">
          <a href="#" className="font-medium text-[#005A9C] hover:underline" data-testid="forgot-password-link">
            ลืมรหัสผ่าน?
          </a>
          <p>
            ยังไม่มีบัญชี?{' '}
            <button onClick={onRegisterClick} className="font-medium text-[#005A9C] hover:underline" data-testid="register-link-button">
              สมัครสมาชิกที่นี่
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
