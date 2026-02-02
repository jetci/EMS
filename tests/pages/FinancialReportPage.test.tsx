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
            totalRides: 100
        },
        topTripTypesData: [
            { label: 'Type A', value: 100 }
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
        expect(screen.getByText('มูลค่าบริการรวม')).toBeInTheDocument();
        // 100 rides * 450 = 45,000
        expect(screen.getByText('45,000')).toBeInTheDocument();
        expect(screen.getByText('ค่าเฉลี่ยต่อเที่ยววิ่ง')).toBeInTheDocument();

        // Check Chart
        expect(screen.getByTestId('donut-chart')).toBeInTheDocument();

        // Check Analysis Section
        expect(screen.getByText('การวิเคราะห์ความคุ้มค่า')).toBeInTheDocument();
        expect(screen.getByText('45k')).toBeInTheDocument();
        expect(screen.getByText('1.2M')).toBeInTheDocument();
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
