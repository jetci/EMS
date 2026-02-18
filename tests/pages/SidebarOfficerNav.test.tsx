import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../../src/components/layout/Sidebar';
import { User } from '../../src/types';

const baseUser: User = {
  id: 'u1',
  email: 'officer1@wecare.dev',
  role: 'OFFICER',
  name: 'Officer Test',
  createdAt: '',
  status: 'active',
};

describe('Sidebar navigation for OFFICER', () => {
  test('shows manage facilities menu and can switch view', () => {
    const setActiveView = jest.fn();

    render(
      <Sidebar
        user={baseUser}
        activeView={'dashboard' as any}
        setActiveView={setActiveView}
        onLogout={jest.fn()}
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    const menu = screen.getByTestId('sidebar-nav-manage_facilities');
    expect(menu).toBeInTheDocument();

    fireEvent.click(menu);
    expect(setActiveView).toHaveBeenCalledWith('manage_facilities');
  });
});

