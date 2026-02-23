import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OperationalReportPage from '../../src/pages/OperationalReportPage';
import { apiRequest } from '../../src/services/api';
import '@testing-library/jest-dom';

// Mock apiRequest
jest.mock('../../src/services/api');
const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

// Mock Icons
jest.mock('../../src/components/icons/EfficiencyIcon', () => () => <div data-testid="efficiency-icon" />);
jest.mock('../../src/components/icons/HistoryIcon', () => () => <div data-testid="history-icon" />);
jest.mock('../../src/components/icons/TruckIcon', () => () => <div data-testid="truck-icon" />);
jest.mock('../../src/components/charts/BarChart', () => () => <div data-testid="bar-chart" />);

// Mock KPICard
jest.mock('../../src/components/executive/KPICard', () => ({ title, value }: any) => (
    <div data-testid="kpi-card">
        <span>{title}</span>
        <span>{value}</span>
    </div>
));

describe('OperationalReportPage', () => {
    const mockData = {
        stats: {
            totalRides: 5432,
            efficiency: 87,
            avgDistance: 12,
            totalDrivers: 5,
            ridesTrend: 10
        },
        monthlyRideData: [
            { label: 'Jan', value: 100 }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockedApiRequest.mockReturnValue(new Promise(() => { }));
        render(<OperationalReportPage />);
        expect(screen.getByText(/กำลังดึงข้อมูลผลการดำเนินงาน/i)).toBeInTheDocument();
    });

    it('renders page content after data load', async () => {
        mockedApiRequest.mockResolvedValue(mockData);
        render(<OperationalReportPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังดึงข้อมูลผลการดำเนินงาน/i)).not.toBeInTheDocument();
        });

        // Check Header
        expect(screen.getByText('รายงานผลการดำเนินงาน')).toBeInTheDocument();

        // Check KPICards
        expect(screen.getByText('อัตราการทำงานสำเร็จ')).toBeInTheDocument();
        expect(screen.getByText('87')).toBeInTheDocument();
        expect(screen.getByText('ระยะทางเฉลี่ยต่อเที่ยว')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('จำนวนคนขับทั้งหมด')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('จำนวนเที่ยววิ่งสะสม')).toBeInTheDocument();
        expect(screen.getByText('5432')).toBeInTheDocument();

        // Check Chart
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

        // Check Executive Snapshot
        expect(screen.getByText('บทสรุปผู้บริหาร')).toBeInTheDocument();
        expect(screen.getByText(/ดีมาก/i)).toBeInTheDocument();

        // Buttons
        expect(screen.getByText('ส่งออกรายงาน')).toBeInTheDocument();
    });

    it('handles error state', async () => {
        mockedApiRequest.mockRejectedValue(new Error('API Error'));
        render(<OperationalReportPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังดึงข้อมูลผลการดำเนินงาน/i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('ไม่สามารถโหลดข้อมูลได้')).toBeInTheDocument();
    });
});
