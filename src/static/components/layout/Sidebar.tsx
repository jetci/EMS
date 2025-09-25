

import React from 'react';
import { AuthenticatedView, User } from '../../types';
import DashboardIcon from '../icons/DashboardIcon';
import UsersIcon from '../icons/UsersIcon';
import RidesIcon from '../icons/RidesIcon';
import UserIcon from '../icons/UserIcon';
import LogoutIcon from '../icons/LogoutIcon';
import HistoryIcon from '../icons/HistoryIcon';
import SteeringWheelIcon from '../icons/SteeringWheelIcon';
import NewspaperIcon from '../icons/NewspaperIcon';
import FileTextIcon from '../icons/FileTextIcon';
import SettingsIcon from '../icons/SettingsIcon';
import TeamIcon from '../icons/TeamIcon';
import CalendarCheckIcon from '../icons/CalendarCheckIcon';
import TruckIcon from '../icons/TruckIcon';
import TagIcon from '../icons/TagIcon';
import DocumentReportIcon from '../icons/DocumentReportIcon';

interface SidebarProps {
  user: User;
  activeView: AuthenticatedView;
  setActiveView: (view: AuthenticatedView) => void;
  onLogout: () => void;
}

const getNavItems = (role: User['role']) => {
  switch (role) {
    case 'driver':
      return [
        { id: 'today_jobs', label: 'งานของฉัน', icon: DashboardIcon },
        { id: 'history', label: 'ประวัติการเดินทาง', icon: HistoryIcon },
      ];
    case 'community':
      return [
        { id: 'dashboard', label: 'หน้าหลัก', icon: DashboardIcon },
        { id: 'patients', label: 'จัดการผู้ป่วย', icon: UsersIcon },
        { id: 'rides', label: 'จัดการการเดินทาง', icon: RidesIcon },
      ];
    case 'OFFICER':
    case 'office':
       return [
        { id: 'dashboard', label: 'ภาพรวม', icon: DashboardIcon },
        { id: 'rides', label: 'จัดการการเดินทาง', icon: RidesIcon },
        { id: 'patients', label: 'จัดการผู้ป่วย', icon: UsersIcon },
        { id: 'drivers', label: 'จัดการคนขับ', icon: SteeringWheelIcon },
        { id: 'manage_teams', label: 'จัดการชุดเวร', icon: TeamIcon },
        { id: 'manage_schedules', label: 'จัดการตารางเวร', icon: CalendarCheckIcon },
        { id: 'news', label: 'จัดการข่าวสาร', icon: NewspaperIcon },
        { id: 'reports', label: 'ศูนย์กลางรายงาน', icon: DocumentReportIcon },
      ];
    case 'EXECUTIVE':
        return [
            { id: 'executive_dashboard', label: 'ภาพรวมโครงการ', icon: DashboardIcon },
        ];
    case 'DEVELOPER':
    case 'admin':
      return [
        { id: 'dashboard', label: 'ภาพรวมระบบ', icon: DashboardIcon },
        { id: 'users', label: 'จัดการบัญชีผู้ใช้', icon: UsersIcon },
        { id: 'rides', label: 'จัดการการเดินทาง', icon: RidesIcon },
        { id: 'patients', label: 'จัดการผู้ป่วย', icon: UsersIcon },
        { id: 'drivers', label: 'จัดการคนขับ', icon: SteeringWheelIcon },
        { id: 'manage_teams', label: 'จัดการชุดเวร', icon: TeamIcon },
        { id: 'manage_schedules', label: 'จัดการตารางเวร', icon: CalendarCheckIcon },
        { id: 'manage_vehicles', label: 'จัดการยานพาหนะ', icon: TruckIcon },
        { id: 'manage_vehicle_types', label: 'จัดการประเภทรถ', icon: TagIcon },
        { id: 'news', label: 'จัดการข่าวสาร', icon: NewspaperIcon },
        { id: 'reports', label: 'ศูนย์กลางรายงาน', icon: DocumentReportIcon },
        { id: 'logs', label: 'บันทึกการใช้งาน', icon: FileTextIcon },
        { id: 'settings', label: 'ตั้งค่าระบบ', icon: SettingsIcon },
      ];
    default:
      return [];
  }
};


const Sidebar: React.FC<SidebarProps> = ({ user, activeView, setActiveView, onLogout }) => {
  const navItems = getNavItems(user.role);
  const profileItem = { id: 'profile', label: 'โปรไฟล์', icon: UserIcon };

  const NavLink: React.FC<{ item: any }> = ({ item }) => {
    const isActive = activeView === item.id;
    return (
      <button
        onClick={() => setActiveView(item.id as AuthenticatedView)}
        className={`w-full flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-[var(--wecare-blue)] text-white shadow'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <item.icon className={`w-5 h-5 mr-3 transition-colors ${
            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
        }`} />
        <span>{item.label}</span>
      </button>
    );
  };


  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-[var(--bg-card)] border-r border-[var(--border-color)]">
          <div className="flex items-center h-16 flex-shrink-0 px-4">
             <h1 className="text-2xl font-bold text-[var(--wecare-blue)]">WeCare</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto p-4">
            <nav className="flex-1 space-y-1">
              {navItems.map(item => <NavLink key={item.id} item={item} />)}
            </nav>
            <div className="mt-auto">
               <div className="border-t border-[var(--border-color)] my-4"></div>
               <div className="space-y-1">
                <NavLink item={profileItem} />
                <button
                    onClick={onLogout}
                    className="w-full flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-600 hover:bg-gray-100 group"
                    >
                    <LogoutIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500 transition-colors" />
                    <span>ออกจากระบบ</span>
                    </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;