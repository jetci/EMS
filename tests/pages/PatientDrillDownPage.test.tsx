import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PatientDrillDownPage from '../../src/pages/PatientDrillDownPage';
import { apiRequest } from '../../src/services/api';
import '@testing-library/jest-dom';

// Mock apiRequest
jest.mock('../../src/services/api');
const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

// Mock Icons to avoid rendering issues in test environment
jest.mock('../../src/components/icons/UsersIcon', () => () => <div data-testid="users-icon" />);
jest.mock('../../src/components/icons/EfficiencyIcon', () => () => <div data-testid="efficiency-icon" />);
jest.mock('../../src/components/icons/HistoryIcon', () => () => <div data-testid="history-icon" />);

// Mock KPICard with proper display
jest.mock('../../src/components/executive/KPICard', () => ({ title, value }: any) => (
    <div data-testid="kpi-card">
        <span>{title}</span>
        <span>{value}</span>
    </div>
));

describe('PatientDrillDownPage', () => {
    const mockData = {
        patientLocations: [
            { id: 'P001', name: 'Patient A', village: 'Village A', type: 'Type A' },
            { id: 'P002', name: 'Patient B', village: 'Village B', type: 'Type B' },
            { id: 'P003', name: 'Patient C', village: 'Village C', type: 'Type C' },
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockedApiRequest.mockReturnValue(new Promise(() => { })); // Never resolves
        render(<PatientDrillDownPage />);
        expect(screen.getByText(/กำลังประมวลผลฐานข้อมูลเชิงลึก/i)).toBeInTheDocument();
    });

    it('renders KPI cards and table/list after data load', async () => {
        mockedApiRequest.mockResolvedValue(mockData);
        render(<PatientDrillDownPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังประมวลผลฐานข้อมูลเชิงลึก/i)).not.toBeInTheDocument();
        });

        // Check Header
        expect(screen.getByText('รายละเอียดข้อมูลเชิงลึก')).toBeInTheDocument();

        // Check KPI Cards (using our mock implementation)
        expect(screen.getByText('ผู้ป่วยทั้งหมด')).toBeInTheDocument();

        // Check Data Rendering (Desktop & Mobile)
        const patients = screen.getAllByText('Patient A');
        expect(patients.length).toBeGreaterThanOrEqual(1);
    });

    it('handles empty data gracefully', async () => {
        mockedApiRequest.mockResolvedValue({ patientLocations: [] });
        render(<PatientDrillDownPage />);

        await waitFor(() => {
            const zeros = screen.getAllByText('0');
            expect(zeros.length).toBeGreaterThan(0);
        });

        expect(screen.getByText('ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา')).toBeInTheDocument();
        expect(screen.getByText('ไม่พบข้อมูล')).toBeInTheDocument();
    });
});
