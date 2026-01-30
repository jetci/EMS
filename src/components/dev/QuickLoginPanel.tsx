import React from 'react';

interface QuickLoginPanelProps {
  onQuickLogin: (email: string, pass: string) => Promise<void>;
}

const testUsers = {
  ADMIN: { email: 'admin@wecare.dev', pass: 'password' },
  DEVELOPER: { email: 'jetci.jm@gmail.com', pass: 'devpass123' },
  RADIO: { email: 'office1@wecare.dev', pass: 'password' },
  OFFICER: { email: 'officer1@wecare.dev', pass: 'password' },
  DRIVER: { email: 'driver1@wecare.dev', pass: 'password' },
  COMMUNITY: { email: 'community1@wecare.dev', pass: 'password' },
  EXECUTIVE: { email: 'executive1@wecare.dev', pass: 'password' },
};

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
        {(Object.keys(testUsers) as Array<keyof typeof testUsers>).map((role) => (
          <button
            key={role}
            onClick={() => handleQuickLogin(testUsers[role].email, testUsers[role].pass)}
            className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005A9C] transition-colors duration-300"
          >
            Login as {role}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickLoginPanel;
