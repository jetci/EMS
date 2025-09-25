
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { User, AuthenticatedView, DriverView, CommunityView, OfficeView, AdminView, Notification, ExecutiveView } from '../../types';
import CommunityDashboard from '../../pages/CommunityDashboard';
import ManagePatientsPage from '../../pages/ManagePatientsPage';
import ManageRidesPage from '../../pages/ManageRidesPage';
import DriverTodayJobsPage from '../../pages/DriverTodayJobsPage';
import DriverHistoryPage from '../../pages/DriverHistoryPage';
import DriverProfilePage from '../../pages/DriverProfilePage';
import OfficeDashboard from '../../pages/OfficeDashboard';
import OfficeManageRidesPage from '../../pages/OfficeManageRidesPage';
import OfficeManagePatientsPage from '../../pages/OfficeManagePatientsPage';
import OfficeManageDriversPage from '../../pages/OfficeManageDriversPage';
import AdminDashboardPage from '../../pages/AdminDashboardPage';
import AdminUserManagementPage from '../../pages/AdminUserManagementPage';
import AdminAuditLogsPage from '../../pages/AdminAuditLogsPage';
import AdminSystemSettingsPage from '../../pages/AdminSystemSettingsPage';
import CommunityProfilePage from '../../pages/CommunityProfilePage';
import CommunityRegisterPatientPage from '../../pages/CommunityRegisterPatientPage';
import CommunityRequestRidePage from '../../pages/CommunityRequestRidePage';
import TestMapPage from '../../pages/TestMapPage';
import PatientDetailPage from '../../pages/PatientDetailPage';
import ManageTeamsPage from '../../pages/ManageTeamsPage';
import ManageSchedulePage from '../../pages/ManageSchedulePage';
import ManageVehiclesPage from '../../pages/ManageVehiclesPage';
import ManageVehicleTypesPage from '../../pages/ManageVehicleTypesPage';
import AuthenticatedBottomNav from './AuthenticatedBottomNav';
import ManageNewsPage from '../../pages/ManageNewsPage';
import NewsEditorPage from '../../pages/NewsEditorPage';
import ExecutiveDashboardPage from '../../pages/ExecutiveDashboardPage';
import OfficeReportsPage from '../../pages/OfficeReportsPage';

interface AuthenticatedLayoutProps {
  user: User;
  onLogout: () => void;
}

const getInitialView = (role: User['role']): AuthenticatedView => {
    switch (role) {
        case 'driver': return 'today_jobs';
        case 'community': return 'dashboard';
        case 'office': return 'dashboard';
        case 'OFFICER': return 'dashboard';
        case 'admin': return 'dashboard';
        case 'EXECUTIVE': return 'executive_dashboard';
        case 'DEVELOPER': return 'dashboard';
        default: return 'dashboard';
    }
}

const mockInitialNotifications: Notification[] = [
    { id: 'N01', message: 'คำขอเดินทาง #RIDE-105 ได้รับการอนุมัติแล้ว', timestamp: new Date().toISOString(), isRead: false },
    { id: 'N02', message: 'คนขับ สมศักดิ์ เริ่มเดินทางไปรับผู้ป่วยแล้ว', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isRead: false },
    { id: 'N03', message: 'การเดินทาง #RIDE-103 เสร็จสิ้น', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), isRead: true },
];

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<AuthenticatedView>(getInitialView(user.role));
  const [viewContext, setViewContext] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockInitialNotifications);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `N${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleSetView = (view: AuthenticatedView, context: any = null) => {
    setActiveView(view);
    setViewContext(context);
  };

  const renderContent = () => {
    switch (user.role) {
      case 'driver':
        switch (activeView as DriverView) {
            case 'today_jobs': return <DriverTodayJobsPage />;
            case 'history': return <DriverHistoryPage />;
            case 'profile': return <DriverProfilePage user={user} onLogout={onLogout} />;
            default: return <DriverTodayJobsPage />;
        }
      case 'community':
        switch (activeView as CommunityView) {
            case 'dashboard': return <CommunityDashboard setActiveView={handleSetView} />;
            case 'patients': return <ManagePatientsPage setActiveView={handleSetView} />;
            case 'rides': return <ManageRidesPage setActiveView={handleSetView} initialFilter={viewContext?.filter} />;
            case 'profile': return <CommunityProfilePage user={user} onLogout={onLogout} />;
            case 'register_patient': return <CommunityRegisterPatientPage setActiveView={handleSetView} />;
            case 'request_ride': return <CommunityRequestRidePage setActiveView={handleSetView} preselectedPatientId={viewContext?.patientId} addNotification={addNotification} />;
            case 'patient_detail':
              if (viewContext?.patientId) {
                return <PatientDetailPage patientId={viewContext.patientId} setActiveView={handleSetView} />;
              }
              return <ManagePatientsPage setActiveView={handleSetView} />; // Fallback
            default: return <CommunityDashboard setActiveView={handleSetView} />;
        }
      case 'OFFICER':
      case 'office':
        switch (activeView as OfficeView) {
            case 'dashboard': return <OfficeDashboard setActiveView={handleSetView} />;
            case 'rides': return <OfficeManageRidesPage />;
            case 'patients': return <OfficeManagePatientsPage />;
            case 'drivers': return <OfficeManageDriversPage />;
            case 'manage_teams': return <ManageTeamsPage />;
            case 'manage_schedules': return <ManageSchedulePage />;
            case 'news': return <ManageNewsPage setActiveView={handleSetView} />;
            case 'edit_news': return <NewsEditorPage setActiveView={handleSetView} articleId={viewContext?.articleId} />;
            case 'reports': return <OfficeReportsPage />;
            case 'profile': return <CommunityProfilePage user={user} onLogout={onLogout} />;
            default: return <OfficeDashboard setActiveView={handleSetView} />;
        }
      case 'EXECUTIVE':
        switch (activeView as ExecutiveView) {
            case 'executive_dashboard': return <ExecutiveDashboardPage />;
            default: return <ExecutiveDashboardPage />;
        }
      case 'DEVELOPER':
      case 'admin':
        switch (activeView as AdminView) {
            case 'dashboard': return <AdminDashboardPage setActiveView={handleSetView} />;
            case 'users': return <AdminUserManagementPage currentUser={user} />;
            case 'rides': return <OfficeManageRidesPage />; // Admins can use the comprehensive Office page
            case 'patients': return <OfficeManagePatientsPage />;
            case 'drivers': return <OfficeManageDriversPage />;
            case 'manage_teams': return <ManageTeamsPage />;
            case 'manage_schedules': return <ManageSchedulePage />;
            case 'manage_vehicles': return <ManageVehiclesPage />;
            case 'manage_vehicle_types': return <ManageVehicleTypesPage />;
            case 'news': return <ManageNewsPage setActiveView={handleSetView} />;
            case 'edit_news': return <NewsEditorPage setActiveView={handleSetView} articleId={viewContext?.articleId} />;
            case 'reports': return <OfficeReportsPage />;
            case 'logs': return <AdminAuditLogsPage />;
            case 'settings': return <AdminSystemSettingsPage />;
            case 'profile': return <CommunityProfilePage user={user} onLogout={onLogout} />;
            case 'test_map': return <TestMapPage />;
            default: return <AdminDashboardPage setActiveView={handleSetView} />;
        }
      default:
        return null;
    }
  };

  const isMobileNavVisible = user.role === 'driver' || user.role === 'community';

  return (
    <div className="flex h-screen bg-[var(--bg-main)]">
      <Sidebar user={user} activeView={activeView} setActiveView={handleSetView} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader user={user} activeView={activeView} notifications={notifications} setNotifications={setNotifications} />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-[var(--bg-main)] ${isMobileNavVisible ? 'pb-16 md:pb-0' : ''}`}>
          <div className="container mx-auto px-8 py-8">
            {renderContent()}
          </div>
        </main>
        {isMobileNavVisible && <AuthenticatedBottomNav user={user} activeView={activeView} setActiveView={handleSetView} />}
      </div>
    </div>
  );
};

export default AuthenticatedLayout;