import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExecutiveProfilePage from '../../src/pages/ExecutiveProfilePage';
import { UserRole } from '../../src/types';
import { authAPI } from '../../src/services/api';

// Mock dependencies
jest.mock('../../src/services/api', () => ({
    authAPI: {
        updateProfile: jest.fn(),
        changePassword: jest.fn(),
    }
}));

// Mock icons to avoid rendering issues
jest.mock('../../src/components/icons/SaveIcon', () => () => <div data-testid="save-icon" />);
jest.mock('../../src/components/icons/EditIcon', () => () => <div data-testid="edit-icon" />);
jest.mock('../../src/components/icons/LogoutIcon', () => () => <div data-testid="logout-icon" />);
jest.mock('../../src/components/ui/RoleBadge', () => ({ role }: { role: string }) => <div data-testid="role-badge">{role}</div>);

describe('ExecutiveProfilePage', () => {
    const mockUser = {
        id: 'exec-123',
        name: 'Executive User',
        email: 'exec@wecare.app',
        role: UserRole.EXECUTIVE,
        phone: '0812345678',
        profileImageUrl: 'http://example.com/profile.jpg'
    };

    const mockOnLogout = jest.fn();
    const mockOnUpdateUser = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders executive profile information correctly', () => {
        render(<ExecutiveProfilePage user={mockUser} onLogout={mockOnLogout} onUpdateUser={mockOnUpdateUser} />);

        // Header check
        expect(screen.getByRole('heading', { level: 1, name: 'Executive User' })).toBeInTheDocument();
        const emailElements = screen.getAllByText('exec@wecare.app');
        expect(emailElements.length).toBeGreaterThanOrEqual(1);

        expect(screen.getByText('Executive Access')).toBeInTheDocument();
        expect(screen.getByText('System Online')).toBeInTheDocument();

        // Personal Info section
        expect(screen.getByText('ข้อมูลส่วนตัว')).toBeInTheDocument();
        // The name appears again in the details section, so we just check it exists in the document generally or use getAll
        const nameElements = screen.getAllByText('Executive User');
        expect(nameElements.length).toBeGreaterThanOrEqual(2); // Header + Details

        expect(screen.getByText('0812345678')).toBeInTheDocument();

        // Logout button
        expect(screen.getByText('ออกจากระบบ')).toBeInTheDocument();
    });

    test('switches to edit mode and allows updating profile', async () => {
        render(<ExecutiveProfilePage user={mockUser} onLogout={mockOnLogout} onUpdateUser={mockOnUpdateUser} />);

        // Click Edit
        fireEvent.click(screen.getByTestId('edit-icon').closest('button')!);

        // Inputs should appear - assume values are pre-filled
        const nameInput = screen.getByDisplayValue('Executive User');
        const phoneInput = screen.getByDisplayValue('0812345678');

        // Update fields
        fireEvent.change(nameInput, { target: { value: 'Updated Executive' } });
        fireEvent.change(phoneInput, { target: { value: '0999999999' } });

        // Click Save
        fireEvent.click(screen.getByText('บันทึก'));

        // Confirm modal should appear
        expect(screen.getByText('ยืนยันการบันทึก')).toBeInTheDocument();

        // Confirm
        fireEvent.click(screen.getByText('ยืนยัน'));

        await waitFor(() => {
            expect(authAPI.updateProfile).toHaveBeenCalledWith({
                name: 'Updated Executive',
                phone: '0999999999'
            });
        });

        expect(mockOnUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Updated Executive',
            phone: '0999999999'
        }));
    });

    test('validates password change form', async () => {
        render(<ExecutiveProfilePage user={mockUser} onLogout={mockOnLogout} onUpdateUser={mockOnUpdateUser} />);

        // Use labels identifying the inputs uniquely
        const currentPass = screen.getByLabelText('รหัสผ่านปัจจุบัน');
        const newPass = screen.getByLabelText('รหัสผ่านใหม่');
        const confirmPass = screen.getByLabelText('ยืนยันรหัสผ่านใหม่');

        fireEvent.change(currentPass, { target: { value: 'oldpass' } });
        fireEvent.change(newPass, { target: { value: 'short' } }); // Short password
        fireEvent.change(confirmPass, { target: { value: 'short' } });

        fireEvent.click(screen.getByText('เปลี่ยนรหัสผ่าน'));

        // Should NOT call API
        expect(authAPI.changePassword).not.toHaveBeenCalled();
    });
});
