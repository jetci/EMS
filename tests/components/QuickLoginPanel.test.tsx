import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickLoginPanel from '@/components/dev/QuickLoginPanel';

describe('QuickLoginPanel', () => {
  test('clicking ADMIN triggers quick login with admin@wecare.ems and password123', async () => {
    const user = userEvent.setup();
    const onQuickLogin = jest.fn().mockResolvedValue(undefined);

    render(<QuickLoginPanel onQuickLogin={onQuickLogin} />);

    const adminButton = screen.getByRole('button', { name: /Login as ADMIN/i });
    await user.click(adminButton);

    expect(onQuickLogin).toHaveBeenCalledWith('admin@wecare.ems', 'password123');
  });

  test('clicking DRIVER triggers quick login with driver1@wecare.dev and password123', async () => {
    const user = userEvent.setup();
    const onQuickLogin = jest.fn().mockResolvedValue(undefined);

    render(<QuickLoginPanel onQuickLogin={onQuickLogin} />);

    const driverButton = screen.getByRole('button', { name: /Login as DRIVER/i });
    await user.click(driverButton);

    expect(onQuickLogin).toHaveBeenCalledWith('driver1@wecare.dev', 'password123');
  });
});