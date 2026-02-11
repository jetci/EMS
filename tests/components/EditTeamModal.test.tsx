import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import EditTeamModal from '@/components/modals/EditTeamModal';

describe('EditTeamModal', () => {
  test('shows error when selecting more than 4 assistants but still submits first 4', () => {
    const onSave = jest.fn();
    render(
      <EditTeamModal
        isOpen={true}
        onClose={() => { }}
        onSave={onSave}
        team={null}
        availableDrivers={[{ id: 'DRV-1', fullName: 'คนขับ 1' } as any]}
        availableStaff={[
          { id: 'USR-1', name: 'ผู้ช่วย 1' } as any,
          { id: 'USR-2', name: 'ผู้ช่วย 2' } as any,
          { id: 'USR-3', name: 'ผู้ช่วย 3' } as any,
          { id: 'USR-4', name: 'ผู้ช่วย 4' } as any,
          { id: 'USR-5', name: 'ผู้ช่วย 5' } as any,
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText('ชื่อทีม'), { target: { value: 'ชุดเวร A' } });
    fireEvent.change(screen.getByLabelText('คนขับ (1 คน)'), { target: { value: 'DRV-1' } });

    const staffInput = screen.getByPlaceholderText('เลือกผู้ช่วยประจำรถ...');
    fireEvent.focus(staffInput);

    fireEvent.click(screen.getByText('ผู้ช่วย 1'));
    fireEvent.focus(staffInput);
    fireEvent.click(screen.getByText('ผู้ช่วย 2'));
    fireEvent.focus(staffInput);
    fireEvent.click(screen.getByText('ผู้ช่วย 3'));
    fireEvent.focus(staffInput);
    fireEvent.click(screen.getByText('ผู้ช่วย 4'));
    fireEvent.focus(staffInput);
    fireEvent.click(screen.getByText('ผู้ช่วย 5'));

    expect(screen.getByText('สามารถเลือกผู้ช่วยประจำรถได้สูงสุด 4 คน')).toBeInTheDocument();
    fireEvent.click(screen.getByText('บันทึกทีม'));
    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload.staffIds).toEqual(['USR-1', 'USR-2', 'USR-3', 'USR-4']);
  });

  test('submits mapped staffIds and driverId', () => {
    const onSave = jest.fn();
    render(
      <EditTeamModal
        isOpen={true}
        onClose={() => { }}
        onSave={onSave}
        team={null}
        availableDrivers={[{ id: 'DRV-9', fullName: 'คนขับ 9' } as any]}
        availableStaff={[
          { id: 'USR-10', name: 'ผู้ช่วย 10' } as any,
          { id: 'USR-11', name: 'ผู้ช่วย 11' } as any,
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText('ชื่อทีม'), { target: { value: 'ชุดเวร B' } });
    fireEvent.change(screen.getByLabelText('คนขับ (1 คน)'), { target: { value: 'DRV-9' } });

    const staffInput = screen.getByPlaceholderText('เลือกผู้ช่วยประจำรถ...');
    fireEvent.focus(staffInput);
    fireEvent.click(screen.getByText('ผู้ช่วย 10'));
    fireEvent.focus(staffInput);
    fireEvent.click(screen.getByText('ผู้ช่วย 11'));

    fireEvent.click(screen.getByText('บันทึกทีม'));
    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload.name).toBe('ชุดเวร B');
    expect(payload.driverId).toBe('DRV-9');
    expect(payload.staffIds).toEqual(['USR-10', 'USR-11']);
  });
});
