import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ManageTeamsPage from '@/pages/ManageTeamsPage';
import { apiRequest, driversAPI, teamsAPI } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiRequest: jest.fn(),
  driversAPI: { getDrivers: jest.fn() },
  teamsAPI: { getTeams: jest.fn(), createTeam: jest.fn(), updateTeam: jest.fn(), deleteTeam: jest.fn() },
}));

let currentRole = 'radio_center';
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: currentRole } }),
}));

jest.mock('@/components/teams/TeamCard', () => ({
  __esModule: true,
  default: () => null,
}));

let latestEditTeamModalProps: any = null;
jest.mock('@/components/modals/EditTeamModal', () => ({
  __esModule: true,
  default: (props: any) => {
    latestEditTeamModalProps = props;
    return null;
  },
}));

jest.mock('@/components/modals/ConfirmationModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/Toast', () => ({
  __esModule: true,
  default: () => null,
}));

describe('ManageTeamsPage', () => {
  test('loads staff from /users/staff', async () => {
    currentRole = 'radio_center';
    (teamsAPI.getTeams as jest.Mock).mockResolvedValue([]);
    (driversAPI.getDrivers as jest.Mock).mockResolvedValue([]);
    (apiRequest as jest.Mock).mockResolvedValue([]);

    render(<ManageTeamsPage />);

    expect(await screen.findByText(/จัดการชุดเวร/)).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith('/users/staff');
  });

  test('shows create button for OFFICER', async () => {
    currentRole = 'OFFICER';
    (teamsAPI.getTeams as jest.Mock).mockResolvedValue([]);
    (driversAPI.getDrivers as jest.Mock).mockResolvedValue([]);
    (apiRequest as jest.Mock).mockResolvedValue([]);

    render(<ManageTeamsPage />);

    expect(await screen.findByText(/จัดการชุดเวร/)).toBeInTheDocument();
    expect(screen.getByText('สร้างทีมใหม่')).toBeInTheDocument();
  });

  test('shows create button for officer (lowercase)', async () => {
    currentRole = 'officer';
    (teamsAPI.getTeams as jest.Mock).mockResolvedValue([]);
    (driversAPI.getDrivers as jest.Mock).mockResolvedValue([]);
    (apiRequest as jest.Mock).mockResolvedValue([]);

    render(<ManageTeamsPage />);

    expect(await screen.findByText(/จัดการชุดเวร/)).toBeInTheDocument();
    expect(screen.getByText('สร้างทีมใหม่')).toBeInTheDocument();
  });

  test('shows create button for officer with whitespace', async () => {
    currentRole = ' officer ';
    (teamsAPI.getTeams as jest.Mock).mockResolvedValue([]);
    (driversAPI.getDrivers as jest.Mock).mockResolvedValue([]);
    (apiRequest as jest.Mock).mockResolvedValue([]);

    render(<ManageTeamsPage />);

    expect(await screen.findByText(/จัดการชุดเวร/)).toBeInTheDocument();
    expect(screen.getByText('สร้างทีมใหม่')).toBeInTheDocument();
  });

  test('filters out staff and drivers already assigned to other teams when creating new team', async () => {
    currentRole = 'OFFICER';
    (teamsAPI.getTeams as jest.Mock).mockResolvedValue([
      { id: 'TEAM-1', name: 'ทีม 1', leader_id: 'DRV-1', member_ids: ['USR-1'] },
    ]);
    (driversAPI.getDrivers as jest.Mock).mockResolvedValue([
      { id: 'DRV-1', full_name: 'คนขับ 1' },
      { id: 'DRV-2', full_name: 'คนขับ 2' },
    ]);
    (apiRequest as jest.Mock).mockResolvedValue([
      { id: 'USR-1', name: 'ผู้ช่วย 1' },
      { id: 'USR-2', name: 'ผู้ช่วย 2' },
    ]);

    render(<ManageTeamsPage />);

    expect(await screen.findByText(/จัดการชุดเวร/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('สร้างทีมใหม่'));

    expect(latestEditTeamModalProps).not.toBeNull();
    const { availableDrivers, availableStaff } = latestEditTeamModalProps;

    expect(availableDrivers.map((d: any) => d.id)).toEqual(['DRV-2']);
    expect(availableStaff.map((s: any) => s.id)).toEqual(['USR-2']);
  });
});
