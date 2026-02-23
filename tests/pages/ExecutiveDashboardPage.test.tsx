import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ExecutiveDashboardPage from '../../src/pages/ExecutiveDashboardPage';
import { apiRequest } from '../../src/services/api';
import '@testing-library/jest-dom';

// Mock apiRequest
jest.mock('../../src/services/api');
const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

// Mock Icons to prevent rendering issues
jest.mock('../../src/components/icons/UsersIcon', () => () => <div data-testid="users-icon" />);
jest.mock('../../src/components/icons/MapIcon', () => () => <div data-testid="map-icon" />);
jest.mock('../../src/components/icons/HistoryIcon', () => () => <div data-testid="history-icon" />);
jest.mock('../../src/components/icons/EfficiencyIcon', () => () => <div data-testid="efficiency-icon" />);
jest.mock('../../src/components/icons/DownloadIcon', () => () => <div data-testid="download-icon" />);
jest.mock('../../src/components/modals/ExportReportModal', () => () => <div data-testid="export-modal" />);

// Mock Charts
jest.mock('../../src/components/charts/BarChart', () => () => <div data-testid="bar-chart" />);
jest.mock('../../src/components/charts/DonutChart', () => () => <div data-testid="donut-chart" />);

// Mock KPICard
jest.mock('../../src/components/executive/KPICard', () => ({ title, value }: any) => (
    <div data-testid="kpi-card">
        <span>{title}</span>
        <span>{value}</span>
    </div>
));

describe('ExecutiveDashboardPage', () => {
    const mockData = {
        monthlyRideData: [{ label: 'Jan', value: 10 }],
        patientDistributionData: [{ label: 'Village A', value: 5 }],
        volunteerDistributionData: [{ label: 'เวียง - หมู่ 1 บ้านหนองตุ้ม', value: 3 }],
        topTripTypesData: [],
        patientLocations: [
            { id: '123456789', name: 'John Doe', village: 'Village A', type: 'Type A' }
        ],
        stats: {
            totalRides: 100,
            totalPatients: 50,
            avgDistance: 10,
            efficiency: 95
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders dashboard with stats after loading', async () => {
        mockedApiRequest.mockResolvedValue(mockData);
        render(<ExecutiveDashboardPage />);

        // Check for KPICards
        await waitFor(() => {
            expect(screen.getByText('จำนวนผู้ป่วยทั้งหมด')).toBeInTheDocument();
            expect(screen.getByText('50')).toBeInTheDocument();
        });

        expect(screen.getByText('เที่ยววิ่งสะสม')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('ประสิทธิภาพการตอบสนอง')).toBeInTheDocument();
        expect(screen.getByText('95%')).toBeInTheDocument();

        // Check Charts (at least bar chart should be present; donut charts are mocked but may render multiple times)
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

        // Check Table
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Village A')).toBeInTheDocument();
    });

    it('handles empty data gracefully', async () => {
        mockedApiRequest.mockResolvedValue(null);
        render(<ExecutiveDashboardPage />);

        await waitFor(() => {
            expect(screen.getByText('จำนวนผู้ป่วยทั้งหมด')).toBeInTheDocument(); // Still renders structure
            expect(screen.getAllByText('0').length).toBeGreaterThan(0); // Default 0
        });
    });

    it('shows initial default stats during loading, then updates after data resolves', async () => {
        jest.useFakeTimers();
        mockedApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockData), 100)));

        render(<ExecutiveDashboardPage />);

        // During loading, initial default KPIs should be rendered with zeros
        expect(screen.getByText('จำนวนผู้ป่วยทั้งหมด')).toBeInTheDocument();
        expect(screen.getAllByText('0').length).toBeGreaterThan(0);

        // Resolve the delayed API call
        jest.advanceTimersByTime(100);
        await waitFor(() => {
            expect(screen.getByText('50')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
        });
        jest.useRealTimers();
    });

    it('handles API error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockedApiRequest.mockRejectedValue(new Error('API Error'));
        render(<ExecutiveDashboardPage />);

        await waitFor(() => {
            // Should still render defaults on error, or at least not crash
            expect(screen.getByText('ภาพรวมโครงการ')).toBeInTheDocument();
            expect(screen.getAllByText('0').length).toBeGreaterThan(0);
        });

        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});
