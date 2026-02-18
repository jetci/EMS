import React from 'react';
import { render, screen, act } from '@testing-library/react';
import DriverTodayJobsPage from '@/pages/DriverTodayJobsPage';
import { driversAPI, ridesAPI } from '@/services/api';

jest.mock('@/services/api', () => ({
  driversAPI: { getMyRides: jest.fn() },
  ridesAPI: { updateRideStatus: jest.fn() },
}));

jest.mock('@/services/geminiService', () => ({
  optimizeRides: jest.fn(),
}));

let latestRideListProps: any = null;
jest.mock('@/components/RideList', () => ({
  __esModule: true,
  default: (props: any) => {
    latestRideListProps = props;
    return <div>RideListMock</div>;
  },
}));

jest.mock('@/components/driver/DriverLocationTracker', () => ({
  __esModule: true,
  default: () => <div>DriverLocationTrackerMock</div>,
}));

jest.mock('@/components/Toast', () => ({
  __esModule: true,
  default: () => null,
}));

describe('DriverTodayJobsPage', () => {
  beforeEach(() => {
    latestRideListProps = null;
    jest.clearAllMocks();
  });

  test('loads rides on mount and passes today active rides to RideList', async () => {
    const nowIso = new Date().toISOString();

    (driversAPI.getMyRides as jest.Mock).mockResolvedValue([
      {
        id: 'RIDE-1',
        patient_name: 'คนไข้ A',
        patient_phone: '080',
        pickup_location: 'บ้าน A',
        destination: 'รพ. A',
        appointment_time: nowIso,
        status: 'ASSIGNED',
      },
      {
        id: 'RIDE-2',
        patient_name: 'คนไข้ B',
        patient_phone: '081',
        pickup_location: 'บ้าน B',
        destination: 'รพ. B',
        appointment_time: nowIso,
        status: 'IN_PROGRESS',
      },
      {
        id: 'RIDE-3',
        patient_name: 'คนไข้ C',
        patient_phone: '082',
        pickup_location: 'บ้าน C',
        destination: 'รพ. C',
        appointment_time: nowIso,
        status: 'COMPLETED',
      },
    ]);

    render(<DriverTodayJobsPage />);

    expect(await screen.findByText('งานของฉัน')).toBeInTheDocument();

    expect(driversAPI.getMyRides).toHaveBeenCalledTimes(1);
    expect(latestRideListProps).not.toBeNull();

    const rides = latestRideListProps.rides as any[];
    expect(rides).toHaveLength(2);
    expect(rides.map(r => r.id)).toEqual(['RIDE-1', 'RIDE-2']);
    expect(rides[0]).toMatchObject({
      id: 'RIDE-1',
      patientName: 'คนไข้ A',
      patientPhone: '080',
      pickupLocation: 'บ้าน A',
      destination: 'รพ. A',
      status: 'ASSIGNED',
    });
  });

  test('refresh button triggers refetch of rides', async () => {
    (driversAPI.getMyRides as jest.Mock).mockResolvedValue([]);

    render(<DriverTodayJobsPage />);

    expect(await screen.findByText('งานของฉัน')).toBeInTheDocument();
    expect(driversAPI.getMyRides).toHaveBeenCalledTimes(1);

    const refreshButton = screen.getByTitle('รีเฟรช');

    (driversAPI.getMyRides as jest.Mock).mockResolvedValue([]);

    await act(async () => {
      refreshButton.click();
    });

    expect(driversAPI.getMyRides).toHaveBeenCalledTimes(2);
  });

  test('onUpdateStatus calls ridesAPI.updateRideStatus and updates local ride status', async () => {
    const nowIso = new Date().toISOString();
    (driversAPI.getMyRides as jest.Mock).mockResolvedValue([
      {
        id: 'RIDE-1',
        patient_name: 'คนไข้ A',
        patient_phone: '080',
        pickup_location: 'บ้าน A',
        destination: 'รพ. A',
        appointment_time: nowIso,
        status: 'ASSIGNED',
      },
    ]);
    (ridesAPI.updateRideStatus as jest.Mock).mockResolvedValue({});

    render(<DriverTodayJobsPage />);

    expect(await screen.findByText('งานของฉัน')).toBeInTheDocument();

    const onUpdateStatus = latestRideListProps.onUpdateStatus as (id: string, status: string) => Promise<void>;
    expect(typeof onUpdateStatus).toBe('function');

    await act(async () => {
      await onUpdateStatus('RIDE-1', 'IN_PROGRESS');
    });

    expect(ridesAPI.updateRideStatus).toHaveBeenCalledWith('RIDE-1', 'IN_PROGRESS');

    const updatedRides = latestRideListProps.rides as any[];
    expect(updatedRides[0].status).toBe('IN_PROGRESS');
  });
});
