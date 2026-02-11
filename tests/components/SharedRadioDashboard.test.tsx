import React from 'react';
import { render, screen, within } from '@testing-library/react';
import SharedRadioDashboard from '@/components/radio/SharedRadioDashboard';
import { dashboardService } from '@/services/dashboardService';

jest.mock('@/services/socketService', () => ({
  onNotification: () => () => { },
}));

jest.mock('@/components/modals/AssignDriverModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/modals/RideDetailsModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/dashboard/LiveDriverStatusPanel', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/dashboard/ScheduleTimeline', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/services/dashboardService', () => ({
  dashboardService: {
    getUrgentRides: jest.fn(),
    getTodaysSchedule: jest.fn(),
    getDrivers: jest.fn(),
    getOfficeDashboard: jest.fn(),
    assignDriver: jest.fn(),
  },
}));

describe('SharedRadioDashboard', () => {
  test('shows other trip type details instead of "อื่นๆ"', async () => {
    (dashboardService.getUrgentRides as jest.Mock).mockResolvedValue({
      rides: [
        {
          id: 'RIDE-TEST-1',
          patient_id: 'PAT-001',
          patient_name: 'ทดสอบ คนไข้',
          pickup_location: 'หมู่ 1',
          destination: 'โรงพยาบาล',
          appointment_time: new Date('2026-02-11T01:00:00.000Z').toISOString(),
          status: 'PENDING',
          trip_type: 'อื่นๆ',
          notes: 'ตรวจสุขภาพประจำปี',
          special_needs: [],
        }
      ]
    });
    (dashboardService.getTodaysSchedule as jest.Mock).mockResolvedValue({ rides: [] });
    (dashboardService.getDrivers as jest.Mock).mockResolvedValue([]);
    (dashboardService.getOfficeDashboard as jest.Mock).mockResolvedValue({ total_today_rides: 0 });

    render(
      <SharedRadioDashboard
        role="radio_center"
        title="ศูนย์วิทยุกลาง (Radio Center)"
        setActiveView={() => { }}
      />
    );

    const row = await screen.findByText('ทดสอบ คนไข้');
    const tr = row.closest('tr');
    expect(tr).toBeTruthy();
    const utils = within(tr as HTMLElement);
    expect(utils.getByText('ตรวจสุขภาพประจำปี')).toBeInTheDocument();
    expect(utils.queryByText(/^อื่นๆ$/)).toBeNull();
  });
});

