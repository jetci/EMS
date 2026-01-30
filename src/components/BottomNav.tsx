
import React from 'react';
import CarIcon from './icons/CarIcon';
import HistoryIcon from './icons/HistoryIcon';
import UserIcon from './icons/UserIcon';

type ActiveView = 'rides' | 'history' | 'profile';

interface BottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'rides', label: 'งาน', icon: CarIcon },
    { id: 'history', label: 'ประวัติ', icon: HistoryIcon },
    { id: 'profile', label: 'โปรไฟล์', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="max-w-4xl mx-auto flex justify-around">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ActiveView)}
              className={`flex flex-col items-center justify-center w-full py-2 px-1 text-sm transition-colors duration-200 ${
                isActive ? 'text-[#005A9C]' : 'text-gray-500 hover:text-[#005A9C]'
              }`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'text-[#005A9C]' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 h-1 w-10 bg-[#005A9C] rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
