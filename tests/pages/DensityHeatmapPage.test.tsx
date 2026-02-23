import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DensityHeatmapPage from '../../src/pages/DensityHeatmapPage';
import { apiRequest } from '../../src/services/api';
import '@testing-library/jest-dom';

// Mock apiRequest
jest.mock('../../src/services/api');
const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

// Mock Icons
jest.mock('../../src/components/icons/EfficiencyIcon', () => () => <div data-testid="efficiency-icon" />);
jest.mock('../../src/components/icons/UsersIcon', () => () => <div data-testid="users-icon" />);
jest.mock('../../src/components/executive/ExecutiveMap', () => () => <div data-testid="executive-map" />);

// Mock KPICard
jest.mock('../../src/components/executive/KPICard', () => ({ title, value }: any) => (
    <div data-testid="kpi-card">
        <span>{title}</span>
        <span>{value}</span>
    </div>
));

describe('DensityHeatmapPage', () => {
    const mockData = {
        patientLocations: [
            { id: 'P001', lat: 10, lng: 10 },
            { id: 'P002', lat: 10.1, lng: 10.1 },
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockedApiRequest.mockReturnValue(new Promise(() => { }));
        render(<DensityHeatmapPage />);
        expect(screen.getByText(/กำลังวิเคราะห์ความหนาแน่น/i)).toBeInTheDocument();
    });

    it('renders dashboards and map after data load', async () => {
        mockedApiRequest.mockResolvedValue(mockData);
        render(<DensityHeatmapPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังวิเคราะห์ความหนาแน่น/i)).not.toBeInTheDocument();
        });

        // Check Header
        expect(screen.getByText('แผนที่วิเคราะห์ความหนาแน่น')).toBeInTheDocument();

        // Legend Card Content (Critical, High, Med)
        expect(screen.getByText('วิกฤต')).toBeInTheDocument();
        expect(screen.getByText('สูง')).toBeInTheDocument();
        expect(screen.getByText('ปานกลาง')).toBeInTheDocument();

        // Check AI Insights
        expect(screen.getByText('บทวิเคราะห์ AI')).toBeInTheDocument();

        // Check Map Mock
        expect(screen.getByTestId('executive-map')).toBeInTheDocument();
    });

    it('handles error state', async () => {
        mockedApiRequest.mockRejectedValue(new Error('Failed to load'));
        render(<DensityHeatmapPage />);

        await waitFor(() => {
            expect(screen.queryByText(/กำลังวิเคราะห์ความหนาแน่น/i)).not.toBeInTheDocument();
        });

        // Current implementation renders data=null check -> "ไม่สามารถโหลดข้อมูลได้"
        // It relies on initial state or logic. If error, data stays null.
        expect(screen.getByText('ไม่สามารถโหลดข้อมูลได้')).toBeInTheDocument();
    });
});
