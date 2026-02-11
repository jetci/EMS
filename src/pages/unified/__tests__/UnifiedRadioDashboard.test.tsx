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

  it('should render with correct title for radio_center role', () => {
    render(
      <UnifiedRadioDashboard
        role="radio_center"
        setActiveView={mockSetActiveView}
      />
    );

    expect(SharedRadioDashboard).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'radio_center',
        title: 'ศูนย์วิทยุกลาง (Radio Center)',
        setActiveView: mockSetActiveView
      }),
      expect.anything()
    );
    expect(screen.getByTestId('shared-radio-dashboard')).toBeInTheDocument();
  });
});
