import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '@/pages/ProfilePage';
import * as api from '@/services/api';

jest.mock('@/services/api');

describe('ProfilePage - upload profile image', () => {
  const mockGetProfile = jest.fn();
  const mockUpload = jest.fn();
  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    (api.authAPI.getProfile as any) = mockGetProfile.mockResolvedValue({
      id: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
      phone: '0891234567',
      role: 'user',
      profile_image_url: 'http://example.com/initial.jpg',
    });

    (api.authAPI.uploadProfileImage as any) = mockUpload.mockResolvedValue({
      imageUrl: 'http://example.com/new.jpg',
    });

    (api.authAPI.updateProfile as any) = mockUpdate.mockResolvedValue({});
  });

  test('selecting and uploading image calls authAPI.uploadProfileImage then reloads profile', async () => {
    const { container } = render(<ProfilePage />);

    // Wait for initial profile to load
    expect(await screen.findByText('โปรไฟล์ของฉัน')).toBeInTheDocument();

    const fileInput = container.querySelector('#profile-image-input') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const blob = new Blob(['x'], { type: 'image/png' });
    const file = new File([blob], 'avatar.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Click upload button labeled 'บันทึกรูปภาพ'
    const uploadBtn = await screen.findByRole('button', { name: /บันทึกรูปภาพ/ });
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledTimes(1);
      const passedFile = (mockUpload.mock.calls[0][0]) as File;
      expect(passedFile.name).toBe('avatar.png');
    });

    // After upload, loadProfile should be called to refresh
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledTimes(2); // initial + reload
    });

    // Toast shown
    expect(await screen.findByText('✅ อัพโหลดรูปภาพเรียบร้อยแล้ว')).toBeInTheDocument();
  });

  test('upload failure shows error toast and resets uploading state', async () => {
    const { container } = render(<ProfilePage />);
    expect(await screen.findByText('โปรไฟล์ของฉัน')).toBeInTheDocument();

    const fileInput = container.querySelector('#profile-image-input') as HTMLInputElement;
    const blob = new Blob(['x'], { type: 'image/png' });
    const file = new File([blob], 'bad.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Force rejection
    mockUpload.mockRejectedValueOnce(new Error('upload failed'));

    const uploadBtn = await screen.findByRole('button', { name: /บันทึกรูปภาพ/ });
    fireEvent.click(uploadBtn);

    // During upload, loading label appears
    expect(await screen.findByText('กำลังอัพโหลด...')).toBeInTheDocument();

    // After failure, error toast appears and upload state resets
    expect(await screen.findByText('❌ ไม่สามารถอัพโหลดรูปภาพได้')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('กำลังอัพโหลด...')).not.toBeInTheDocument();
      // Upload button enabled again
      const btn = screen.getByRole('button', { name: /บันทึกรูปภาพ/ });
      expect(btn).not.toHaveAttribute('disabled');
    });
  });

  test('remove image cancels selection and hides upload actions', async () => {
    const { container } = render(<ProfilePage />);
    expect(await screen.findByText('โปรไฟล์ของฉัน')).toBeInTheDocument();

    const fileInput = container.querySelector('#profile-image-input') as HTMLInputElement;
    const blob = new Blob(['x'], { type: 'image/png' });
    const file = new File([blob], 'avatar.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Upload actions should appear
    const uploadBtn = await screen.findByRole('button', { name: /บันทึกรูปภาพ/ });
    // Scope cancel button within upload actions container to avoid picking form-level cancel
    const actionsContainer = uploadBtn.parentElement as HTMLElement;
    const cancelBtn = actionsContainer.querySelector('button[type="button"]:not([disabled])') as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();
    fireEvent.click(cancelBtn);

    // After cancel, actions disappear (imageFile cleared)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /บันทึกรูปภาพ/ })).not.toBeInTheDocument();
    });
  });

  test('validate form shows errors and successful submit updates profile', async () => {
    render(<ProfilePage />);
    expect(await screen.findByText('โปรไฟล์ของฉัน')).toBeInTheDocument();

    // Clear name to trigger validation error
    const nameInput = screen.getByPlaceholderText('กรอกชื่อ-นามสกุล');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Submit with empty name -> error
    const submitBtn = screen.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' });
    fireEvent.click(submitBtn);
    expect(await screen.findByText('กรุณากรอกชื่อ')).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();

    // Fix name, set invalid phone
    fireEvent.change(nameInput, { target: { value: 'Alice Updated' } });
    const phoneInput = screen.getByLabelText(/เบอร์โทรศัพท์/);
    fireEvent.change(phoneInput, { target: { value: '1234' } });
    fireEvent.click(submitBtn);
    expect(await screen.findByText('เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก')).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();

    // Valid phone and submit
    fireEvent.change(phoneInput, { target: { value: '0812345678' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ name: 'Alice Updated', phone: '0812345678' });
    });
    // Toast shown and loadProfile called again
    expect(await screen.findByText('✅ บันทึกข้อมูลสำเร็จ')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledTimes(2); // initial + reload after update
    });
  });
});