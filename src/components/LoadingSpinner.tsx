import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3" role="status" aria-label="Loading">
      <div className="w-12 h-12 border-4 border-[#005A9C] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#005A9C] font-semibold">กำลังโหลดข้อมูล...</p>
    </div>
  );
};

export default LoadingSpinner;
