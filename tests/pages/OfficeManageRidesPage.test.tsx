import React from 'react';
import { render, screen } from '@testing-library/react';
import OfficeManageRidesPage from '@/pages/OfficeManageRidesPage';
import { ridesAPI, driversAPI } from '@/services/api';

jest.mock('@/services/api', () => ({
  ridesAPI: { getRides: jest.fn(), cancelRide: jest.fn() },
  driversAPI: { getDrivers: jest.fn() },
}));

jest.mock('@/services/dashboardService', () => ({
  dashboardService: { assignDriver: jest.fn() },
}));

jest.mock('@/components/modals/AssignDriverModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/ui/ModernDatePicker', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/Toast', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/ui/StatusBadge', () => ({
  __esModule: true,
  default: () => null,
}));

describe('OfficeManageRidesPage', () => {
  test('renders driver options when backend returns full_name', async () => {
    (ridesAPI.getRides as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'RIDE-1',
          patientName: 'ผู้ป่วย ทดสอบ',
          appointmentTime: new Date('2026-02-11T01:00:00.000Z').toISOString(),
          status: 'PENDING',
          tripType: 'นัดหมอตามปกติ',
          specialNeeds: [],
        }
      ]
    });
    (driversAPI.getDrivers as jest.Mock).mockResolvedValue([
      { id: 'DRV-1', full_name: 'สมชาย ใจดี' },
      { id: 'DRV-2', fullName: 'สมหญิง ใจดี' },
    ]);

    render(<OfficeManageRidesPage />);

    expect(await screen.findByText('จัดการการเดินทางทั้งหมด')).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'สมชาย ใจดี' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'สมหญิง ใจดี' })).toBeInTheDocument();
  });
});

