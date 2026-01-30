/**
 * Unit Tests for UnifiedRadioDashboard
 * ทดสอบว่าหน้าใหม่ทำงานเหมือนหน้าเดิม 100%
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnifiedRadioDashboard from '../UnifiedRadioDashboard';
import SharedRadioDashboard from '../../../components/radio/SharedRadioDashboard';

// Mock SharedRadioDashboard
jest.mock('../../../components/radio/SharedRadioDashboard', () => {
  return jest.fn(() => <div data-testid="shared-radio-dashboard">Mocked SharedRadioDashboard</div>);
});

describe('UnifiedRadioDashboard', () => {
  const mockSetActiveView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Radio Role', () => {
    it('should render with correct title for radio role', () => {
      render(
        <UnifiedRadioDashboard 
          role="radio" 
          setActiveView={mockSetActiveView} 
        />
      );

      // ตรวจสอบว่า SharedRadioDashboard ถูกเรียกด้วย props ที่ถูกต้อง
      expect(SharedRadioDashboard).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'radio',
          title: 'ศูนย์วิทยุ (Radio)',
          setActiveView: mockSetActiveView
        }),
        expect.anything()
      );
    });

    it('should pass setActiveView function correctly', () => {
      render(
        <UnifiedRadioDashboard 
          role="radio" 
          setActiveView={mockSetActiveView} 
        />
      );

      const calls = (SharedRadioDashboard as jest.Mock).mock.calls;
      expect(calls[0][0].setActiveView).toBe(mockSetActiveView);
    });
  });

  describe('Radio Center Role', () => {
    it('should render with correct title for radio_center role', () => {
      render(
        <UnifiedRadioDashboard 
          role="radio_center" 
          setActiveView={mockSetActiveView} 
        />
      );

      // ตรวจสอบว่า SharedRadioDashboard ถูกเรียกด้วย props ที่ถูกต้อง
      expect(SharedRadioDashboard).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'radio_center',
          title: 'ศูนย์วิทยุกลาง (Radio Center)',
          setActiveView: mockSetActiveView
        }),
        expect.anything()
      );
    });

    it('should pass correct role to SharedRadioDashboard', () => {
      render(
        <UnifiedRadioDashboard 
          role="radio_center" 
          setActiveView={mockSetActiveView} 
        />
      );

      const calls = (SharedRadioDashboard as jest.Mock).mock.calls;
      expect(calls[0][0].role).toBe('radio_center');
    });
  });

  describe('Component Rendering', () => {
    it('should render SharedRadioDashboard component', () => {
      render(
        <UnifiedRadioDashboard 
          role="radio" 
          setActiveView={mockSetActiveView} 
        />
      );

      expect(screen.getByTestId('shared-radio-dashboard')).toBeInTheDocument();
    });

    it('should only render SharedRadioDashboard once', () => {
      render(
        <UnifiedRadioDashboard 
          role="radio" 
          setActiveView={mockSetActiveView} 
        />
      );

      expect(SharedRadioDashboard).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props Validation', () => {
    it('should handle role prop correctly', () => {
      const { rerender } = render(
        <UnifiedRadioDashboard 
          role="radio" 
          setActiveView={mockSetActiveView} 
        />
      );

      expect((SharedRadioDashboard as jest.Mock).mock.calls[0][0].role).toBe('radio');

      rerender(
        <UnifiedRadioDashboard 
          role="radio_center" 
          setActiveView={mockSetActiveView} 
        />
      );

      expect((SharedRadioDashboard as jest.Mock).mock.calls[1][0].role).toBe('radio_center');
    });

    it('should update title when role changes', () => {
      const { rerender } = render(
        <UnifiedRadioDashboard 
          role="radio" 
          setActiveView={mockSetActiveView} 
        />
      );

      expect((SharedRadioDashboard as jest.Mock).mock.calls[0][0].title).toBe('ศูนย์วิทยุ (Radio)');

      rerender(
        <UnifiedRadioDashboard 
          role="radio_center" 
          setActiveView={mockSetActiveView} 
        />
      );

      expect((SharedRadioDashboard as jest.Mock).mock.calls[1][0].title).toBe('ศูนย์วิทยุกลาง (Radio Center)');
    });
  });

  describe('Comparison with Old Components', () => {
    it('should behave identically to RadioDashboard for radio role', () => {
      render(
        <UnifiedRadioDashboard 
          role="radio" 
          setActiveView={mockSetActiveView} 
        />
      );

      // ตรวจสอบว่าส่ง props เหมือนกับ RadioDashboard.tsx
      const expectedProps = {
        role: 'radio',
        title: 'ศูนย์วิทยุ (Radio)',
        setActiveView: mockSetActiveView
      };

      expect(SharedRadioDashboard).toHaveBeenCalledWith(
        expect.objectContaining(expectedProps),
        expect.anything()
      );
    });

    it('should behave identically to RadioCenterDashboard for radio_center role', () => {
      render(
        <UnifiedRadioDashboard 
          role="radio_center" 
          setActiveView={mockSetActiveView} 
        />
      );

      // ตรวจสอบว่าส่ง props เหมือนกับ RadioCenterDashboard.tsx
      const expectedProps = {
        role: 'radio_center',
        title: 'ศูนย์วิทยุกลาง (Radio Center)',
        setActiveView: mockSetActiveView
      };

      expect(SharedRadioDashboard).toHaveBeenCalledWith(
        expect.objectContaining(expectedProps),
        expect.anything()
      );
    });
  });
});
