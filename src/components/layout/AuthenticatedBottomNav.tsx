import React from 'react';
import { AuthenticatedView, User } from '../../types';
import DashboardIcon from '../icons/DashboardIcon';
import HistoryIcon from '../icons/HistoryIcon';
import UserIcon from '../icons/UserIcon';
import RidesIcon from '../icons/RidesIcon';
import UsersIcon from '../icons/UsersIcon';

interface AuthenticatedBottomNavProps {
  user: User;
  activeView: AuthenticatedView;
  setActiveView: (view: AuthenticatedView) => void;
}

const getNavItems = (role: User['role']) => {
  switch (role) {
    case 'driver':
      return [
        { id: 'today_jobs', label: 'งานวันนี้', icon: DashboardIcon },
        { id: 'history', label: 'ประวัติ', icon: HistoryIcon },
        { id: 'profile', label: 'โปรไฟล์', icon: UserIcon },
      ];
    case 'community':
      return [
        { id: 'dashboard', label: 'หน้าหลัก', icon: DashboardIcon },
        { id: 'patients', label: 'ผู้ป่วย', icon: UsersIcon },
        { id: 'rides', label: 'เดินทาง', icon: RidesIcon },
        { id: 'profile', label: 'โปรไฟล์', icon: UserIcon },
      ];
    default:
      return [];
  }
};

const AuthenticatedBottomNav: React.FC<AuthenticatedBottomNavProps> = ({ user, activeView, setActiveView }) => {
  const navItems = getNavItems(user.role);

  if (navItems.length === 0) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
      <div className="flex justify-around">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as AuthenticatedView)}
              className={`flex flex-col items-center justify-center w-full pt-2 pb-1 px-1 text-sm transition-colors duration-200 relative ${
                isActive ? 'text-[var(--wecare-blue)]' : 'text-gray-600 hover:text-[var(--wecare-blue)]'
              }`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'text-[var(--wecare-blue)]' : 'text-gray-500'}`} />
              <span className="font-medium text-xs">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 h-1 w-12 bg-[var(--wecare-blue)] rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default AuthenticatedBottomNav;
