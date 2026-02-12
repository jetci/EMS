import React from 'react';
import { AuthenticatedView, User, UserRole } from '../../types';
import XIcon from '../icons/XIcon';
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
import MapIcon from '../icons/MapIcon';
import SparklesIcon from '../icons/SparklesIcon';

interface SidebarProps {
  user: User;
  activeView: AuthenticatedView;
  setActiveView: (view: AuthenticatedView) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}
const getNavItems = (role: User['role']) => {
  const normalizedRole = role?.toUpperCase();

  switch (normalizedRole) {
    case UserRole.DRIVER:
      return [
        { id: 'today_jobs', label: 'งานของฉัน', icon: DashboardIcon },
        { id: 'history', label: 'ประวัติการเดินทาง', icon: HistoryIcon },
      ];
    case UserRole.COMMUNITY:
      return [
        { id: 'dashboard', label: 'หน้าหลัก', icon: DashboardIcon },
        { id: 'patients', label: 'จัดการผู้ป่วย', icon: UsersIcon },
        { id: 'rides', label: 'จัดการการเดินทาง', icon: RidesIcon },
      ];
    case UserRole.OFFICER:
      return [
        { id: 'dashboard', label: 'ภาพรวมบริหาร', icon: DashboardIcon },
        { id: 'patients', label: 'จัดการผู้ป่วย', icon: UsersIcon },
        { id: 'drivers', label: 'จัดการคนขับ', icon: SteeringWheelIcon },
        { id: 'manage_vehicles', label: 'จัดการยานพาหนะ', icon: TruckIcon },
        { id: 'manage_teams', label: 'จัดการชุดเวร', icon: TeamIcon },
        { id: 'manage_schedules', label: 'จัดการตารางเวร', icon: CalendarCheckIcon },
        { id: 'rides', label: 'ประวัติการเดินทาง', icon: RidesIcon },
        { id: 'news', label: 'จัดการข่าวสาร', icon: NewspaperIcon },
        { id: 'reports', label: 'ศูนย์กลางรายงาน', icon: DocumentReportIcon },
        { id: 'map_command', label: 'แผนที่ (Monitor)', icon: MapIcon },
      ];
    case UserRole.RADIO_CENTER:
      return [
        { id: 'dashboard', label: 'ศูนย์สั่งการ', icon: DashboardIcon },
        { id: 'map_command', label: 'แผนที่สั่งการ', icon: MapIcon },
        { id: 'rides', label: 'จัดการการเดินทาง', icon: RidesIcon },
        { id: 'drivers', label: 'สถานะคนขับ', icon: SteeringWheelIcon },
        { id: 'patients', label: 'ข้อมูลผู้ป่วย', icon: UsersIcon },
        { id: 'reports', label: 'รายงานประจำวัน', icon: DocumentReportIcon },
      ];
    case UserRole.RADIO:
      return [
        { id: 'dashboard', label: 'หน้าปฏิบัติการ', icon: DashboardIcon },
        { id: 'map_command', label: 'แผนที่', icon: MapIcon },
        { id: 'rides', label: 'รายการงาน', icon: RidesIcon },
        { id: 'drivers', label: 'ตรวจสอบคนขับ', icon: SteeringWheelIcon },
      ];
    case UserRole.EXECUTIVE:
      return [
        { id: 'executive_dashboard', label: 'ภาพรวมโครงการ', icon: DashboardIcon },
      ];
    case UserRole.DEVELOPER:
      return [
        { id: 'dashboard', label: 'ภาพรวมระบบ', icon: DashboardIcon },
        { id: 'users', label: 'จัดการบัญชีผู้ใช้', icon: UsersIcon },
        { id: 'manage_vehicles', label: 'จัดการยานพาหนะ', icon: TruckIcon },
        { id: 'manage_vehicle_types', label: 'จัดการประเภทรถ', icon: TagIcon },
        { id: 'news', label: 'จัดการข่าวสาร', icon: NewspaperIcon },
        { id: 'reports', label: 'ศูนย์กลางรายงาน', icon: DocumentReportIcon },
        { id: 'logs', label: 'บันทึกการใช้งาน', icon: FileTextIcon },
        { id: 'settings', label: 'ตั้งค่าระบบ', icon: SettingsIcon },
        { id: 'design_system', label: 'ระบบการออกแบบ UX/UI', icon: SparklesIcon },
      ];
    case UserRole.ADMIN:
      return [
        { id: 'dashboard', label: 'ภาพรวมระบบ', icon: DashboardIcon },
        { id: 'users', label: 'จัดการบัญชีผู้ใช้', icon: UsersIcon },
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
const Sidebar: React.FC<SidebarProps> = ({ user, activeView, setActiveView, onLogout, isOpen, onClose }) => {
  const navItems = getNavItems(user.role);
  const profileItem = { id: 'profile', label: 'โปรไฟล์', icon: UserIcon };

  const NavLink: React.FC<{ item: any }> = ({ item }) => {
    const isActive = activeView === item.id;
    return (
      <button
        onClick={() => {
          setActiveView(item.id as AuthenticatedView);
          if (window.innerWidth < 768) {
            onClose();
          }
        }}
        className={`w-full flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 group ${isActive
          ? 'bg-[var(--wecare-blue)] text-white shadow'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
      >
        <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
          }`} />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[var(--bg-card)] border-r border-[var(--border-color)] transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-auto md:flex md:flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-[var(--wecare-blue)]">WeCare</h1>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none"
            >
              <XIcon className="w-6 h-6" />
            </button>
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
      </aside>
    </>
  );
};

export default Sidebar;
