import React, { useState, useEffect } from 'react';
import { User, AuthenticatedView, Notification } from '../../types';
import { getAppSettings } from '../../utils/settings';
import UserIcon from '../icons/UserIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import BellIcon from '../icons/BellIcon';
import MenuIcon from '../icons/MenuIcon';
import { formatDateTimeToThai } from '../../utils/dateUtils';

interface TopHeaderProps {
  user: User;
  activeView: AuthenticatedView;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  onMenuClick: () => void;
}

const viewToName: Record<string, string> = {
  // Community & Office Views (Shared)
  dashboard: 'System Overview',
  patients: 'Manage Patients',
  rides: 'Manage Rides',

  // Driver Views
  today_jobs: "My Jobs",
  history: 'Ride History',

  // Office-specific
  drivers: 'Manage Drivers',
  manage_teams: 'Manage Teams',
  manage_schedules: 'จัดการตารางเวร',
  news: 'จัดการข่าวสาร',
  edit_news: 'เขียน/แก้ไขข่าว',
  reports: 'ศูนย์กลางรายงาน',

  // Admin-specific
  users: 'User Management',
  manage_vehicles: 'จัดการยานพาหนะ',
  manage_vehicle_types: 'จัดการประเภทรถ',
  logs: 'Audit Logs',
  settings: 'System Settings',
  test_map: 'Test Map Component',

  // Executive-specific
  executive_dashboard: 'Executive Dashboard',
  village_distribution: 'สรุปรายหมู่บ้าน',
  spatial_analytics: 'แผนที่การกระจายตัว',
  drill_down: 'รายละเอียดเชิงลึก',
  density_map: 'วิเคราะห์ความหนาแน่น',
  operational_report: 'รายงานผลดำเนินการ',
  financial_report: 'รายงานสถานะการเงิน',
  patient_demographics_report: 'ข้อมูลประชากรผู้ป่วย',

  // Shared
  profile: 'My Profile',
  register_patient: 'Register New Patient',
  request_ride: 'Request New Ride',
  patient_detail: 'Patient Details',
};


const TopHeader: React.FC<TopHeaderProps> = ({ user, activeView, notifications, setNotifications, onMenuClick }) => {
  console.log('DEBUG: TopHeader activeView =', activeView);
  const [settings, setSettings] = useState(getAppSettings());
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleSettingsChange = () => {
      setSettings(getAppSettings());
    };
    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      // Mark all as read when opening
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  }

  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        {/* Breadcrumbs & Mobile Menu */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="mr-4 md:hidden text-gray-500 hover:text-[var(--wecare-blue)] focus:outline-none"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center text-sm text-gray-500">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Logo" className="w-6 h-6 object-contain mr-2 hidden sm:block" />
            )}
            <span>Home</span>
            <ChevronRightIcon className="w-4 h-4 mx-1" />
            <span className="font-medium text-gray-800">{viewToName[activeView] || (activeView ? `View: ${activeView}` : 'Dashboard')}</span>
          </div>
        </div>

        {/* User Info & Notifications */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button onClick={handleToggleNotifications} className="relative text-gray-500 hover:text-gray-700">
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
                <div className="p-3 border-b font-semibold text-gray-700">การแจ้งเตือน</div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 border-b text-sm ${!n.isRead && n.id === notifications[0].id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <p className="text-gray-800">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDateTimeToThai(n.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.email}</span>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
