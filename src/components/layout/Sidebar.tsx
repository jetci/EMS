import React, { useState, useEffect } from 'react';
import { AuthenticatedView, User } from '../../types';
import { getAppSettings, fetchSettingsOptimized } from '../../utils/settings';
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
import EfficiencyIcon from '../icons/EfficiencyIcon';

interface SidebarProps {
  user: User;
  activeView: AuthenticatedView;
  setActiveView: (view: AuthenticatedView) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
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
    case 'radio_center':
      return [
        { id: 'dashboard', label: 'ศูนย์สั่งการ', icon: DashboardIcon },
        { id: 'map_command', label: 'แผนที่สั่งการ', icon: MapIcon },
        { id: 'rides', label: 'จัดการการเดินทาง', icon: RidesIcon },
        { id: 'drivers', label: 'สถานะคนขับ', icon: SteeringWheelIcon },
        { id: 'patients', label: 'ข้อมูลผู้ป่วย', icon: UsersIcon },
        { id: 'manage_teams', label: 'จัดการชุดเวร', icon: TeamIcon },
        { id: 'manage_schedules', label: 'จัดการตารางเวร', icon: CalendarCheckIcon },
        { id: 'news', label: 'จัดการข่าวสาร', icon: NewspaperIcon },
        { id: 'reports', label: 'รายงานประจำวัน', icon: DocumentReportIcon },
      ];
    case 'EXECUTIVE':
      return [
        { id: 'executive_dashboard', label: 'ภาพรวมโครงการ', icon: DashboardIcon },
        { id: 'village_distribution', label: 'การกระจายตัวหมู่บ้าน', icon: UsersIcon },
        { id: 'spatial_analytics', label: 'แผนที่การกระจายตัว', icon: MapIcon },
        { id: 'drill_down', label: 'รายละเอียดเชิงลึก', icon: FileTextIcon },
        { id: 'density_map', label: 'แผนที่ความหนาแน่น', icon: EfficiencyIcon },
        { id: 'operational_report', label: 'รายงานผลการดำเนินงาน', icon: DocumentReportIcon },
        { id: 'financial_report', label: 'รายงานสถานะการเงิน', icon: TagIcon },
        { id: 'patient_demographics_report', label: 'ข้อมูลประชากรผู้ป่วย', icon: TeamIcon },
      ];
    case 'DEVELOPER':
    case 'admin':
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
  const [settings, setSettings] = useState(getAppSettings());

  useEffect(() => {
    const handleSettingsChange = () => {
      setSettings(getAppSettings());
      fetchSettingsOptimized(user.role).then(res => {
        if (res?.logoUrl) {
          setSettings(prev => ({ ...prev, logoUrl: res.logoUrl }));
        }
      });
    };
    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);

  useEffect(() => {
    fetchSettingsOptimized(user.role).then(res => {
      if (res?.logoUrl) setSettings(prev => ({ ...prev, logoUrl: res.logoUrl }));
    });
  }, []);

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
        data-testid={`sidebar-nav-${item.id}`}
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
          data-testid="sidebar-overlay"
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[var(--bg-card)] border-r border-[var(--border-color)] transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-auto md:flex md:flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      data-testid="sidebar-root"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-20 flex-shrink-0 px-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.appName} className="w-10 h-10 object-contain rounded" />
            ) : (
              <div className="w-10 h-10 bg-[var(--wecare-blue)] rounded flex items-center justify-center text-white font-bold">
                {settings.appName.charAt(0)}
              </div>
            )}
            <h1 className="text-xl font-bold text-[var(--wecare-blue)] truncate max-w-[140px]">{settings.appName}</h1>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none"
            data-testid="sidebar-close-mobile"
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
                data-testid="sidebar-logout"
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
