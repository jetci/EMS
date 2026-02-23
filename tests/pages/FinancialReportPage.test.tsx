import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FinancialReportPage from '../../src/pages/FinancialReportPage';
import { apiRequest } from '../../src/services/api';
import '@testing-library/jest-dom';

// Mock apiRequest
jest.mock('../../src/services/api');
const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

// Mock Icons
jest.mock('../../src/components/icons/TagIcon', () => () => <div data-testid="tag-icon" />);
jest.mock('../../src/components/charts/DonutChart', () => () => <div data-testid="donut-chart" />);

// Mock KPICard
jest.mock('../../src/components/executive/KPICard', () => ({ title, value }: any) => (
    <div data-testid="kpi-card">
        <span>{title}</span>
        <span>{value}</span>
    </div>
));

describe('FinancialReportPage', () => {
    const mockData = {
        stats: {
            totalRides: 100,
            totalPatients: 0
        },
        topTripTypesData: [
            { label: 'Type A', value: 100, color: '#3B82F6' }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockedApiRequest.mockReturnValue(new Promise(() => { }));
        render(<FinancialReportPage />);
        expect(screen.getByText(/กำลังประมวลผลข้อมูลการเงิน/i)).toBeInTheDocument();
    });

    it('renders page content after data load', async () => {
        mockedApiRequest.mockResolvedValue(mockData);
        render(<FinancialReportPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังประมวลผลข้อมูลการเงิน/i)).not.toBeInTheDocument();
        });

        // Check Header
        expect(screen.getByText('รายงานสถานะการเงิน')).toBeInTheDocument();

        // Check KPICards
        expect(screen.getByText('จำนวนเที่ยววิ่งทั้งหมด')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('จำนวนผู้ป่วยทั้งหมด')).toBeInTheDocument();

        // Check Chart
        expect(screen.getByTestId('donut-chart')).toBeInTheDocument();

        // Check Analysis Section
        expect(screen.getByText('คำอธิบายข้อมูล')).toBeInTheDocument();
        expect(screen.getByText(/\/api\/dashboard\/executive/)).toBeInTheDocument();
    });

    it('handles error state', async () => {
        mockedApiRequest.mockRejectedValue(new Error('API Error'));
        render(<FinancialReportPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังประมวลผลข้อมูลการเงิน/i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('ไม่สามารถโหลดข้อมูลได้')).toBeInTheDocument();
    });
});
