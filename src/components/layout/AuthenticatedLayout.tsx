import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { User, AuthenticatedView, DriverView, CommunityView, OfficerView, AdminView, Notification, ExecutiveView } from '../../types';
import CommunityDashboard from '../../pages/CommunityDashboard';
import ManagePatientsPage from '../../pages/ManagePatientsPage';
import ManageRidesPage from '../../pages/ManageRidesPage';
import DriverTodayJobsPage from '../../pages/DriverTodayJobsPage';
import DriverHistoryPage from '../../pages/DriverHistoryPage';
import DriverProfilePage from '../../pages/DriverProfilePage';
import OfficeDashboard from '../../pages/OfficeDashboard';
import RadioDashboard from '../../pages/RadioDashboard';
import RadioCenterDashboard from '../../pages/RadioCenterDashboard';
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
import OfficeReportsPage from '../../pages/OfficeReportsPage';
import ExecutiveDashboardPage from '../../pages/ExecutiveDashboardPage';
import VillageDistributionPage from '../../pages/VillageDistributionPage';
import PatientSpatialMapPage from '../../pages/PatientSpatialMapPage';
import PatientDrillDownPage from '../../pages/PatientDrillDownPage';
import DensityHeatmapPage from '../../pages/DensityHeatmapPage';
import OperationalReportPage from '../../pages/OperationalReportPage';
import FinancialReportPage from '../../pages/FinancialReportPage';
import DemographicsReportPage from '../../pages/DemographicsReportPage';
import DeveloperDashboardPage from '../../pages/DeveloperDashboardPage';
import SystemLogsPage from '../../pages/SystemLogsPage';
import MapCommandPage from '../../pages/MapCommandPage';
// ⚠️ TEMPORARY: Test page for UnifiedRadioDashboard (will be removed after testing)
import TestUnifiedRadioPage from '../../pages/TestUnifiedRadioPage';
import PublicSingleNewsPage from '../../pages/PublicSingleNewsPage';
import ExecutiveProfilePage from '../../pages/ExecutiveProfilePage';

import { initializeSocket, disconnectSocket, onNotification } from '../../services/socketService';

interface AuthenticatedLayoutProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

const getInitialView = (role: User['role']): AuthenticatedView => {
  switch (role) {
    case 'driver': return 'today_jobs';
    case 'community': return 'dashboard';
    case 'radio': return 'dashboard';
    case 'radio_center': return 'dashboard';
    case 'OFFICER': return 'dashboard';
    case 'admin': return 'dashboard';
    case 'EXECUTIVE': return 'executive_dashboard';
    case 'DEVELOPER': return 'dashboard';
    default: return 'dashboard';
  }
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ user, onLogout, onUpdateUser }) => {
  const [activeView, setActiveView] = useState<AuthenticatedView>(getInitialView(user.role));
  const [viewContext, setViewContext] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize Socket.IO
  useEffect(() => {
    try {
      if (user) {
        initializeSocket();
        console.log('🔌 Socket initialized for user:', user.email);

        const cleanup = onNotification((data) => {
          console.log('🔔 New notification received:', data);
          const newNotification: Notification = {
            id: `N${Date.now()}`,
            message: data.message || 'มีการแจ้งเตือนใหม่',
            timestamp: new Date().toISOString(),
            isRead: false,
            type: data.type || 'info',
            link: data.link
          };
          setNotifications(prev => [newNotification, ...prev]);
        });

        return () => {
          cleanup();
          disconnectSocket();
        };
      }
    } catch (err) {
      console.error('Failed to initialize socket:', err);
    }
  }, [user]);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // ... renderContent switch ...

  const renderContent = () => {
    switch (user.role) {
      case 'driver':
        switch (activeView as DriverView) {
          case 'today_jobs': return <DriverTodayJobsPage />;
          case 'history': return <DriverHistoryPage />;
          case 'profile': return <DriverProfilePage user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} />;
          default: return <DriverTodayJobsPage />;
        }
      case 'community':
        switch (activeView as CommunityView) {
          case 'dashboard': return <CommunityDashboard setActiveView={handleSetView} />;
          case 'patients': return <ManagePatientsPage setActiveView={handleSetView} />;
          case 'rides': return <ManageRidesPage setActiveView={handleSetView} initialFilter={viewContext?.filter} />;
          case 'profile': return <CommunityProfilePage user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} />;
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
        switch (activeView as OfficerView) {
          case 'dashboard': return <OfficeDashboard setActiveView={handleSetView} />;
          case 'map_command': return <MapCommandPage setActiveView={handleSetView} />;
          case 'rides': return <OfficeManageRidesPage setActiveView={handleSetView} />;
          case 'patients': return <OfficeManagePatientsPage setActiveView={handleSetView} />;
          case 'register_patient': return <CommunityRegisterPatientPage setActiveView={handleSetView} />;
          case 'drivers': return <OfficeManageDriversPage />;
          case 'manage_teams': return <ManageTeamsPage />;
          case 'manage_schedules': return <ManageSchedulePage />;
          case 'news': return <ManageNewsPage setActiveView={handleSetView} />;
          case 'edit_news': return <NewsEditorPage setActiveView={handleSetView} articleId={viewContext?.articleId} />;
          case 'view_news': return <PublicSingleNewsPage articleId={viewContext?.articleId} onBackToList={() => handleSetView('news')} />;
          case 'manage_vehicles': return <ManageVehiclesPage />;
          case 'reports': return <OfficeReportsPage />;
          case 'profile': return <CommunityProfilePage user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} />;
          default: return <OfficeDashboard setActiveView={handleSetView} />;
        }
      case 'radio':
        switch (activeView as OfficerView) {
          case 'dashboard': return <RadioDashboard setActiveView={handleSetView} />;
          case 'map_command': return <MapCommandPage setActiveView={handleSetView} />;
          case 'rides': return <OfficeManageRidesPage setActiveView={handleSetView} />;
          case 'request_ride': return <CommunityRequestRidePage setActiveView={handleSetView} addNotification={addNotification} />;
          case 'patients': return <OfficeManagePatientsPage setActiveView={handleSetView} />;
          case 'register_patient': return <CommunityRegisterPatientPage setActiveView={handleSetView} />;
          case 'drivers': return <OfficeManageDriversPage />;
          case 'manage_teams': return <ManageTeamsPage />;
          case 'manage_schedules': return <ManageSchedulePage />;
          case 'news': return <ManageNewsPage setActiveView={handleSetView} />;
          case 'edit_news': return <NewsEditorPage setActiveView={handleSetView} articleId={viewContext?.articleId} />;
          case 'view_news': return <PublicSingleNewsPage articleId={viewContext?.articleId} onBackToList={() => handleSetView('news')} />;
          case 'reports': return <OfficeReportsPage />;
          case 'profile': return <CommunityProfilePage user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} />;
          default: return <RadioDashboard setActiveView={handleSetView} />;
        }
      case 'radio_center':
        switch (activeView as OfficerView) {
          case 'dashboard': return <RadioCenterDashboard setActiveView={handleSetView} />;
          case 'map_command': return <MapCommandPage setActiveView={handleSetView} />;
          case 'rides': return <OfficeManageRidesPage setActiveView={handleSetView} />;
          case 'request_ride': return <CommunityRequestRidePage setActiveView={handleSetView} addNotification={addNotification} />;
          case 'patients': return <OfficeManagePatientsPage setActiveView={handleSetView} />;
          case 'register_patient': return <CommunityRegisterPatientPage setActiveView={handleSetView} />;
          case 'drivers': return <OfficeManageDriversPage />;
          case 'manage_teams': return <ManageTeamsPage />;
          case 'manage_schedules': return <ManageSchedulePage />;
          case 'news': return <ManageNewsPage setActiveView={handleSetView} />;
          case 'edit_news': return <NewsEditorPage setActiveView={handleSetView} articleId={viewContext?.articleId} />;
          case 'view_news': return <PublicSingleNewsPage articleId={viewContext?.articleId} onBackToList={() => handleSetView('news')} />;
          case 'reports': return <OfficeReportsPage />;
          case 'profile': return <CommunityProfilePage user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} />;
          default: return <RadioCenterDashboard setActiveView={handleSetView} />;
        }
      case 'EXECUTIVE':
        switch (activeView as ExecutiveView) {
          case 'executive_dashboard': return <ExecutiveDashboardPage />;
          case 'village_distribution': return <VillageDistributionPage />;
          case 'spatial_analytics': return <PatientSpatialMapPage />;
          case 'drill_down': return <PatientDrillDownPage />;
          case 'density_map': return <DensityHeatmapPage />;
          case 'operational_report': return <OperationalReportPage />;
          case 'financial_report': return <FinancialReportPage />;
          case 'patient_demographics_report': return <DemographicsReportPage />;
          case 'profile': return <ExecutiveProfilePage user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} />;
          default: return <ExecutiveDashboardPage />;
        }
      case 'DEVELOPER':
        switch (activeView as AdminView) {
          case 'dashboard': return <DeveloperDashboardPage setActiveView={handleSetView} />;
          case 'logs': return <SystemLogsPage />;
          case 'test_map': return <TestMapPage />;
          case 'test_unified_radio' as any: return <TestUnifiedRadioPage />; // ⚠️ TEMPORARY TEST
          default: return <DeveloperDashboardPage setActiveView={handleSetView} />;
        }
      case 'admin':
        switch (activeView as AdminView) {
          case 'dashboard': return <AdminDashboardPage setActiveView={handleSetView} />;
          case 'users': return <AdminUserManagementPage currentUser={user} />;

          case 'manage_teams': return <ManageTeamsPage />;
          case 'manage_schedules': return <ManageSchedulePage />;
          case 'manage_vehicles': return <ManageVehiclesPage />;
          case 'manage_vehicle_types': return <ManageVehicleTypesPage />;
          case 'news': return <ManageNewsPage setActiveView={handleSetView} />;
          case 'edit_news': return <NewsEditorPage setActiveView={handleSetView} articleId={viewContext?.articleId} />;
          case 'view_news': return <PublicSingleNewsPage articleId={viewContext?.articleId} onBackToList={() => handleSetView('news')} />;
          case 'reports': return <OfficeReportsPage />;
          case 'logs': return <AdminAuditLogsPage />;
          case 'settings': return <AdminSystemSettingsPage currentUser={user} />;
          case 'test_map': return <TestMapPage />;
          case 'profile': return <CommunityProfilePage user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} />;

          default: return <AdminDashboardPage setActiveView={handleSetView} />;
        }
      default:
        return null;
    }
  };

  const isMobileNavVisible = user.role === 'driver' || user.role === 'community';

  return (
    <div className="flex h-screen bg-[var(--bg-main)]">
      <Sidebar
        user={user}
        activeView={activeView}
        setActiveView={handleSetView}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader
          user={user}
          activeView={activeView}
          notifications={notifications}
          setNotifications={setNotifications}
          onMenuClick={toggleSidebar}
        />
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
