import React from 'react';
import { render, screen } from '@testing-library/react';
import OfficeManageDriversPage from '@/pages/OfficeManageDriversPage';
import { apiRequest, driversAPI } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiRequest: jest.fn(),
  driversAPI: { getDrivers: jest.fn(), updateDriver: jest.fn(), createDriver: jest.fn() },
}));

let currentRole = 'radio_center';
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: currentRole } }),
}));

jest.mock('@/components/modals/EditDriverModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/Toast', () => ({
  __esModule: true,
  default: () => null,
}));

describe('OfficeManageDriversPage', () => {
  test('shows create button for OFFICER and loads driver-candidates', async () => {
    currentRole = 'officer';
    (driversAPI.getDrivers as jest.Mock).mockResolvedValue([
      { id: 'DRV-001', full_name: 'คนขับ ทดสอบ', status: 'AVAILABLE', trips_this_month: 0 }
    ]);
    (apiRequest as jest.Mock).mockResolvedValue([]);

    render(<OfficeManageDriversPage />);

    expect(await screen.findByText('จัดการข้อมูลคนขับ')).toBeInTheDocument();
    expect(await screen.findByText('คนขับ ทดสอบ')).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith('/users/driver-candidates');
    expect(screen.getByText('เพิ่มคนขับใหม่')).toBeInTheDocument();
  });

  test('shows create button for DEVELOPER and loads driver-candidates', async () => {
    currentRole = 'DEVELOPER';
    (driversAPI.getDrivers as jest.Mock).mockResolvedValue([]);
    (apiRequest as jest.Mock).mockResolvedValue([]);

    render(<OfficeManageDriversPage />);

    expect(await screen.findByText('จัดการข้อมูลคนขับ')).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith('/users/driver-candidates');
    expect(screen.getByText('เพิ่มคนขับใหม่')).toBeInTheDocument();
  });

  test('shows empty state when no drivers match', async () => {
    currentRole = 'radio_center';
    (driversAPI.getDrivers as jest.Mock).mockResolvedValue([]);

    render(<OfficeManageDriversPage />);

    expect(await screen.findByText('จัดการข้อมูลคนขับ')).toBeInTheDocument();
    expect(await screen.findByText('ไม่พบคนขับตามเงื่อนไขที่เลือก')).toBeInTheDocument();
  });
});
