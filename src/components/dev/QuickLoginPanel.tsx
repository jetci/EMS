import React from 'react';

interface QuickLoginPanelProps {
  onQuickLogin: (email: string, pass: string) => Promise<void>;
}

const testUsers = [
  { key: 'RADIO_CENTER', label: 'RADIO_CENTER', email: 'radio_center@wecare.dev', pass: 'password123' },
  { key: 'OFFICER', label: 'OFFICER', email: 'officer1@wecare.dev', pass: 'password123' },
  { key: 'DRIVER', label: 'DRIVER', email: 'driver1@wecare.dev', pass: 'password123' },
  { key: 'COMMUNITY', label: 'COMMUNITY', email: 'community1@wecare.dev', pass: 'password123' },
  { key: 'EXECUTIVE', label: 'EXECUTIVE', email: 'executive1@wecare.dev', pass: 'password123' },
  { key: 'ADMIN', label: 'ADMIN', email: 'admin@wecare.ems', pass: 'password123' },
  { key: 'DEVELOPER', label: 'DEVELOPER', email: 'dev@wecare.ems', pass: 'password123' },
] as const;

const QuickLoginPanel: React.FC<QuickLoginPanelProps> = ({ onQuickLogin }) => {
  const handleQuickLogin = async (email: string, pass: string) => {
    try {
      await onQuickLogin(email, pass);
    } catch (error) {
      console.error('Quick login error:', error);
    }
  };

  return (
    <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-center text-sm font-semibold text-gray-600 mb-3">
        เข้าสู่ระบบด่วน (สำหรับทดสอบ)
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {testUsers.map((u) => (
          <button
            key={u.key}
            onClick={() => handleQuickLogin(u.email, u.pass)}
            className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005A9C] transition-colors duration-300"
          >
            Login as {u.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickLoginPanel;
