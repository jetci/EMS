import React from 'react';
import { render, screen } from '@testing-library/react';
import OfficeReportsPage from '@/pages/OfficeReportsPage';
import { driversAPI, teamsAPI } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiRequest: jest.fn(),
  driversAPI: { getDrivers: jest.fn() },
  teamsAPI: { getTeams: jest.fn() },
}));

jest.mock('@/components/modals/ReportPreviewModal', () => ({
  __esModule: true,
  default: () => null,
}));

describe('OfficeReportsPage', () => {
  test('maps driver full_name to fullName for dropdown', async () => {
    (driversAPI.getDrivers as jest.Mock).mockResolvedValue([
      { id: 'DRV-001', full_name: 'คนขับ ทดสอบ' },
    ]);
    (teamsAPI.getTeams as jest.Mock).mockResolvedValue([
      { id: 'TEAM-001', name: 'ทีม 1' },
    ]);

    render(<OfficeReportsPage />);

    expect(await screen.findByText('ศูนย์กลางรายงาน')).toBeInTheDocument();
    expect(await screen.findByText('คนขับ ทดสอบ')).toBeInTheDocument();
  });
});

