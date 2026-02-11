import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import EditDriverModal from '@/components/modals/EditDriverModal';
import { DriverStatus } from '@/types';

describe('EditDriverModal', () => {
  test('selects member and submits with userId', () => {
    const onSave = jest.fn();
    render(
      <EditDriverModal
        isOpen={true}
        onClose={() => { }}
        onSave={onSave}
        driver={null}
        availableStaff={[
          { id: 'USR-100', name: 'สมาชิก ก', email: 'a@x.com', role: 'community' as any } as any,
          { id: 'USR-101', name: 'สมาชิก ข', email: 'b@x.com', role: 'community' as any } as any,
        ]}
        availableDrivers={[]}
      />
    );

    const searchInput = screen.getByPlaceholderText('พิมพ์ชื่อ หรือ อีเมลของสมาชิก...');
    fireEvent.change(searchInput, { target: { value: 'สมาชิก' } });
    fireEvent.click(screen.getByText('สมาชิก ก'));

    fireEvent.change(screen.getByLabelText('ยี่ห้อรถ'), { target: { value: 'Toyota' } });
    fireEvent.change(screen.getByLabelText('รุ่นรถ'), { target: { value: 'Commuter' } });
    fireEvent.change(screen.getByLabelText('สีรถ'), { target: { value: 'ขาว' } });
    fireEvent.change(screen.getByLabelText('ทะเบียนรถ'), { target: { value: 'กข-1234' } });

    fireEvent.click(screen.getByText('ยืนยันการเพิ่มคนขับ'));

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload.userId).toBe('USR-100');
    expect(payload.fullName).toBe('สมาชิก ก');
    expect(payload.email).toBe('a@x.com');
    expect(payload.vehicleBrand).toBe('Toyota');
  });

  test('does not crash when member name is missing', () => {
    const onSave = jest.fn();
    render(
      <EditDriverModal
        isOpen={true}
        onClose={() => { }}
        onSave={onSave}
        driver={null}
        availableStaff={[
          { id: 'USR-200', email: 'noname@x.com', name: '' as any } as any,
        ]}
        availableDrivers={[
          { id: 'DRV-1', email: '', fullName: '', status: DriverStatus.AVAILABLE } as any,
        ]}
      />
    );

    const searchInput = screen.getByPlaceholderText('พิมพ์ชื่อ หรือ อีเมลของสมาชิก...');
    fireEvent.change(searchInput, { target: { value: 'noname' } });
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});

