import React from 'react';
import { render, screen } from '@testing-library/react';
import OfficeManagePatientsPage from '@/pages/OfficeManagePatientsPage';
import { patientsAPI } from '@/services/api';

jest.mock('@/services/api', () => ({
  patientsAPI: {
    getPatients: jest.fn(),
    updatePatient: jest.fn(),
    createPatient: jest.fn(),
    deletePatient: jest.fn(),
  },
}));

jest.mock('@/components/Toast', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/LoadingSpinner', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/ui/ModernDatePicker', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/dashboard/StatCard', () => ({
  __esModule: true,
  default: () => null,
}));

describe('OfficeManagePatientsPage', () => {
  test('renders patient name when API returns camelCase patient payload', async () => {
    (patientsAPI.getPatients as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'PAT-001',
          fullName: 'ผู้ป่วย ทดสอบ',
          dob: '2000-01-01',
          currentAddress: { houseNumber: '1', village: 'หมู่ 1', tambon: '', amphoe: '', changwat: '' },
          registeredDate: '2026-02-11T00:00:00.000Z',
          createdBy: 'USR-COMMUNITY',
          keyInfo: 'ทดสอบ',
        }
      ]
    });

    render(<OfficeManagePatientsPage />);

    expect(await screen.findByText('จัดการข้อมูลผู้ป่วยทั้งหมด')).toBeInTheDocument();
    expect(await screen.findByText('ผู้ป่วย ทดสอบ')).toBeInTheDocument();
    expect(screen.getByText('ทดสอบ')).toBeInTheDocument();
  });
});

