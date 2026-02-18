import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageFacilitiesPage from '../ManageFacilitiesPage';

jest.mock('../../services/api', () => ({
  facilitiesAPI: {
    getFacilities: jest.fn().mockResolvedValue([
      { id: 'FAC-001', name: 'โรงพยาบาลฝาง', lat: 19.9, lng: 99.2, facilityType: 'โรงพยาบาลชุมชน', isActive: true },
    ]),
    createFacility: jest.fn().mockResolvedValue({}),
    updateFacility: jest.fn().mockResolvedValue({}),
    deleteFacility: jest.fn().mockResolvedValue({}),
  },
}));

describe('ManageFacilitiesPage', () => {
  test('แสดงรายการสถานพยาบาลที่โหลดมาจาก API', async () => {
    render(<ManageFacilitiesPage />);
    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('โรงพยาบาลฝาง')).toBeInTheDocument();
    });
  });

  test('สามารถกดปุ่มเพิ่มสถานพยาบาลใหม่และ submit ฟอร์มได้', async () => {
    const { facilitiesAPI } = require('../../services/api');
    render(<ManageFacilitiesPage />);
    await waitFor(() => {
      expect(screen.getByText('โรงพยาบาลฝาง')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ เพิ่มสถานพยาบาล'));

    fireEvent.change(screen.getByLabelText('ชื่อสถานพยาบาล'), { target: { value: 'รพ.ทดสอบ' } });
    fireEvent.change(screen.getByLabelText('ละติจูด (Lat)'), { target: { value: '18.0' } });
    fireEvent.change(screen.getByLabelText('ลองจิจูด (Lng)'), { target: { value: '99.0' } });

    fireEvent.click(screen.getByText('บันทึก'));

    await waitFor(() => {
      expect(facilitiesAPI.createFacility).toHaveBeenCalledWith({
        name: 'รพ.ทดสอบ',
        lat: 18,
        lng: 99,
        facilityType: undefined,
        isActive: true,
      });
    });
  });

  test('เมื่อเลือกตำแหน่งบนแผนที่แล้วค่าสนาม Lat/Lng ถูกอัปเดต', async () => {
    render(<ManageFacilitiesPage />);
    await waitFor(() => {
      expect(screen.getByText('โรงพยาบาลฝาง')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ เพิ่มสถานพยาบาล'));

    expect(screen.getByLabelText('ละติจูด (Lat)')).toBeInTheDocument();
    expect(screen.getByLabelText('ลองจิจูด (Lng)')).toBeInTheDocument();
  });
});
