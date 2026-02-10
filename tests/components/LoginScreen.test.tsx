import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginScreen from '@/components/LoginScreen';

describe('LoginScreen placeholders and submission', () => {
  test('shows placeholders aligned with standards', () => {
    const onLogin = jest.fn();
    const onRegisterClick = jest.fn();
    render(<LoginScreen onLogin={onLogin as any} onRegisterClick={onRegisterClick} />);

    expect(screen.getByTestId('login-email')).toHaveAttribute('placeholder', 'user@wecare.ems');
    expect(screen.getByTestId('login-password')).toHaveAttribute('placeholder', 'password123');
  });

  test('submits login with filled credentials', async () => {
    const user = userEvent.setup();
    const onLogin = jest.fn().mockResolvedValue(true);
    const onRegisterClick = jest.fn();
    render(<LoginScreen onLogin={onLogin as any} onRegisterClick={onRegisterClick} />);

    await user.type(screen.getByTestId('login-email'), 'admin@wecare.ems');
    await user.type(screen.getByTestId('login-password'), 'password123');
    await user.click(screen.getByTestId('login-submit'));

    expect(onLogin).toHaveBeenCalledWith('admin@wecare.ems', 'password123');
  });
});