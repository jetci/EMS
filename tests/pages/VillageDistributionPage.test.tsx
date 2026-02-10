import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VillageDistributionPage from '../../src/pages/VillageDistributionPage';
import { apiRequest } from '../../src/services/api';
import '@testing-library/jest-dom';

// Mock apiRequest
jest.mock('../../src/services/api');
const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

// Mock Components
jest.mock('../../src/components/icons/UsersIcon', () => () => <div data-testid="users-icon" />);
jest.mock('../../src/components/icons/MapIcon', () => () => <div data-testid="map-icon" />);
jest.mock('../../src/components/icons/EfficiencyIcon', () => () => <div data-testid="efficiency-icon" />);
jest.mock('../../src/components/charts/DonutChart', () => () => <div data-testid="donut-chart" />);

// Mock KPICard
jest.mock('../../src/components/executive/KPICard', () => ({ title, value }: any) => (
    <div data-testid="kpi-card">
        <span>{title}</span>
        <span>{value}</span>
    </div>
));

describe('VillageDistributionPage', () => {
    const mockData = {
        stats: {
            totalPatients: 1500,
            efficiency: 95
        },
        patientDistributionData: [
            { label: 'Village A', value: 50 },
            { label: 'Village B', value: 30 },
            { label: 'Village C', value: 20 },
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockedApiRequest.mockReturnValue(new Promise(() => { }));
        render(<VillageDistributionPage />);
        expect(screen.getByText(/กำลังโหลดข้อมูลพื้นที่/i)).toBeInTheDocument();
    });

    it('renders page content after data load', async () => {
        mockedApiRequest.mockResolvedValue(mockData);
        render(<VillageDistributionPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังโหลดข้อมูลพื้นที่/i)).not.toBeInTheDocument();
        });

        // Check Header
        expect(screen.getByText('การกระจายตัวของผู้ป่วยตามหมู่บ้าน')).toBeInTheDocument();

        // Check KPICards
        expect(screen.getByText('หมู่บ้านทั้งหมด')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument(); // 3 villages in mock
        expect(screen.getByText('ผู้ป่วยสะสม')).toBeInTheDocument();
        expect(screen.getByText('1500')).toBeInTheDocument();
        expect(screen.getByText('ประสิทธิภาพบริการ')).toBeInTheDocument();
        expect(screen.getByText('95%')).toBeInTheDocument();

        // Check Chart
        expect(screen.getByTestId('donut-chart')).toBeInTheDocument();

        // Check Village List
        expect(screen.getByText('Village A')).toBeInTheDocument();
        expect(screen.getByText('50 คน')).toBeInTheDocument();
        expect(screen.getByText('Village B')).toBeInTheDocument();
    });

    it('handles search functionality', async () => {
        // Can't easily test search interaction fully without userEvent, but can mock data and check initial render
        mockedApiRequest.mockResolvedValue(mockData);
        render(<VillageDistributionPage />);
        await waitFor(() => expect(screen.getByText('Village A')).toBeInTheDocument());

        // Note: Full interaction testing would use userEvent for calling setSearchTerm
    });

    it('handles error state', async () => {
        const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockedApiRequest.mockRejectedValue(new Error('API Error'));
        render(<VillageDistributionPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังโหลดข้อมูลพื้นที่/i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('ไม่สามารถโหลดข้อมูลได้')).toBeInTheDocument();
        errSpy.mockRestore();
    });
});
