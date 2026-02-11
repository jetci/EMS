import React from 'react';
import { render, screen } from '@testing-library/react';
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

jest.mock('@/components/modals/EditTeamModal', () => ({
  __esModule: true,
  default: () => null,
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
});
