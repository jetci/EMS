import React from 'react';
import { render, screen } from '@testing-library/react';
import AssignDriverModal from '@/components/modals/AssignDriverModal';
import { RideStatus } from '@/types';

describe('AssignDriverModal', () => {
  test('does not crash when driver fullName is missing', () => {
    const ride = {
      id: 'RIDE-1',
      patientId: 'PAT-1',
      patientName: 'ผู้ป่วย ทดสอบ',
      pickupLocation: 'จุดรับ',
      destination: 'จุดส่ง',
      appointmentTime: new Date('2026-02-11T01:00:00.000Z').toISOString(),
      status: RideStatus.PENDING,
    };

    render(
      <AssignDriverModal
        isOpen={true}
        onClose={() => { }}
        onAssign={() => { }}
        ride={ride as any}
        allDrivers={[
          { id: 'DRV-1', full_name: 'สมชาย ใจดี', status: 'AVAILABLE' } as any,
          { id: 'DRV-2', status: 'AVAILABLE' } as any,
        ]}
        allRides={[] as any}
      />
    );

    expect(screen.getByText(/เลือกคนขับที่พร้อมให้บริการ/)).toBeInTheDocument();
    expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
    expect(screen.getByText('ไม่ระบุชื่อ')).toBeInTheDocument();
  });
});

