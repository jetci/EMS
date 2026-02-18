import React from 'react';
import { render, screen, act } from '@testing-library/react';
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

let latestEditDriverModalProps: any = null;
jest.mock('@/components/modals/EditDriverModal', () => ({
  __esModule: true,
  default: (props: any) => {
    latestEditDriverModalProps = props;
    return null;
  },
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

  test('calls createDriver with correct payload when saving new driver', async () => {
    currentRole = 'officer';
    (driversAPI.getDrivers as jest.Mock).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    (apiRequest as jest.Mock).mockResolvedValue([]);
    (driversAPI.createDriver as jest.Mock).mockResolvedValue({ id: 'DRV-NEW' });

    render(<OfficeManageDriversPage />);

    await screen.findByText('จัดการข้อมูลคนขับ');

    const onSave = latestEditDriverModalProps?.onSave as ((driver: any) => Promise<void>) | undefined;
    expect(typeof onSave).toBe('function');

    const newDriver = {
      id: 'DRV-NEW',
      fullName: 'สมาชิก ก',
      phone: '0800000000',
      licensePlate: 'กข-1234',
      status: 'AVAILABLE',
      profileImageUrl: 'http://example.com/pic.jpg',
      email: 'a@x.com',
      address: '',
      vehicleBrand: 'Toyota',
      vehicleModel: 'Commuter',
      vehicleColor: 'ขาว',
      tripsThisMonth: 0,
      vehicleType: '',
      totalTrips: 0,
      avgReviewScore: 0,
      userId: 'USR-100',
    };

    await act(async () => {
      await onSave?.(newDriver);
    });

    expect(driversAPI.createDriver).toHaveBeenCalledTimes(1);
    const payload = (driversAPI.createDriver as jest.Mock).mock.calls[0][0];
    expect(payload).toMatchObject({
      user_id: 'USR-100',
      full_name: 'สมาชิก ก',
      phone: '0800000000',
      status: 'AVAILABLE',
      profile_image_url: 'http://example.com/pic.jpg',
      license_plate: 'กข-1234',
      brand: 'Toyota',
      model: 'Commuter',
      color: 'ขาว',
    });
  });
});
