import React from 'react';

interface HeaderProps {
  driverName: string;
  isOnline: boolean;
  onToggleOnline: () => void;
}

const Header: React.FC<HeaderProps> = ({ driverName, isOnline, onToggleOnline }) => {
  return (
    <header className="bg-[#005A9C] text-white p-4 shadow-lg fixed top-0 left-0 right-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">งานของคุณวันนี้</h1>
          <p className="text-sm opacity-90">{driverName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${isOnline ? 'text-green-300' : 'text-gray-300'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button
            onClick={onToggleOnline}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${
              isOnline ? 'bg-[#28A745]' : 'bg-gray-400'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                isOnline ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;