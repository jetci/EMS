import React from 'react';

interface ToastProps {
  message: string | null;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center w-full max-w-xs p-4 space-x-4 text-gray-800 bg-white divide-x divide-gray-200 rounded-lg shadow-lg z-50 animate-fade-in-up"
      role="alert"
    >
      <div className="text-lg font-bold text-green-600">
        {message.includes('✅') || message.includes('🎉') || message.includes('✨') ? 'สำเร็จ' : 'แจ้งเตือน'}
      </div>
      <div className="pl-4 text-sm font-normal">{message}</div>
    </div>
  );
};

export default Toast;
