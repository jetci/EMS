import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DemographicsReportPage from '../../src/pages/DemographicsReportPage';
import { apiRequest } from '../../src/services/api';
import '@testing-library/jest-dom';

// Mock apiRequest
jest.mock('../../src/services/api');
const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

// Mock Icons
jest.mock('../../src/components/icons/UsersIcon', () => () => <div data-testid="users-icon" />);
jest.mock('../../src/components/charts/DonutChart', () => () => <div data-testid="donut-chart" />);
jest.mock('../../src/components/charts/HorizontalBarChart', () => () => <div data-testid="horizontal-bar-chart" />);

// Mock KPICard
jest.mock('../../src/components/executive/KPICard', () => ({ title, value }: any) => (
    <div data-testid="kpi-card">
        <span>{title}</span>
        <span>{value}</span>
    </div>
));

describe('DemographicsReportPage', () => {
    const mockData = {
        stats: {
            totalPatients: 250
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockedApiRequest.mockReturnValue(new Promise(() => { }));
        render(<DemographicsReportPage />);
        expect(screen.getByText(/กำลังวิเคราะห์ข้อมูลประชากร/i)).toBeInTheDocument();
    });

    it('renders page content after data load', async () => {
        mockedApiRequest.mockResolvedValue(mockData);
        render(<DemographicsReportPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังวิเคราะห์ข้อมูลประชากร/i)).not.toBeInTheDocument();
        });

        // Check Header
        expect(screen.getByText('ข้อมูลประชากรผู้ป่วย')).toBeInTheDocument();

        // Check KPICards
        expect(screen.getByText('จำนวนผู้ป่วยในระบบ')).toBeInTheDocument();
        expect(screen.getByText('250')).toBeInTheDocument();
        expect(screen.getByText('อายุเฉลี่ย')).toBeInTheDocument();

        // Check Charts
        expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
        expect(screen.getByTestId('horizontal-bar-chart')).toBeInTheDocument();
    });

    it('handles error state', async () => {
        mockedApiRequest.mockRejectedValue(new Error('API Error'));
        render(<DemographicsReportPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังวิเคราะห์ข้อมูลประชากร/i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('ไม่สามารถโหลดข้อมูลได้')).toBeInTheDocument();
    });
});
