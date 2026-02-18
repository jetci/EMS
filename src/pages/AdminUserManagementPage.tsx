import React, { useState, useMemo, useEffect } from 'react';
import { ManagedUser, User, UserStatus } from '../types';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import SearchIcon from '../components/icons/SearchIcon';
import EditIcon from '../components/icons/EditIcon';
import PowerIcon from '../components/icons/PowerIcon';
import KeyIcon from '../components/icons/KeyIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import RoleBadge from '../components/ui/RoleBadge';
import UserStatusBadge from '../components/ui/UserStatusBadge';
import EditUserModal from '../components/modals/EditUserModal';
import ResetPasswordModal from '../components/modals/ResetPasswordModal';
import { formatDateToThai } from '../utils/dateUtils';
import { defaultProfileImage } from '../assets/defaultProfile';
import { apiRequest } from '../services/api';

const ITEMS_PER_PAGE = 10;

interface AdminUserManagementPageProps {
    currentUser: User;
}

const AdminUserManagementPage: React.FC<AdminUserManagementPageProps> = ({ currentUser }) => {
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ role: 'All', status: 'All' });
    const [currentPage, setCurrentPage] = useState(1);

    // Modals state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiRequest('/users');
            const usersData = Array.isArray(response) ? response : (response.users || []);
            const mapped: ManagedUser[] = usersData.map((u: any) => ({
                id: u.id?.toString() || '',
                fullName: u.full_name || u.name || u.username || '',
                email: u.email || '',
                role: ((): any => {
                    const r = String(u.role || '').trim();
                    const upper = r.toUpperCase();
                    if (upper === 'OFFICE') return 'OFFICER';
                    if (upper === 'RADIO') return 'radio_center';
                    return r || 'community';
                })(),
                dateCreated: u.created_at || u.dateCreated || new Date().toISOString(),
                status: (u.status || (u.is_active === false ? 'Inactive' : 'Active')) as UserStatus,
                profileImageUrl: u.profile_image_url || undefined,
            }));
            setUsers(mapped);
        } catch (err: any) {
            console.error('Failed to load users:', err);
            setError(err.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        } finally {
            setLoading(false);
        }
    };

    const visibleUsers = useMemo(() => {
        if (currentUser.role === 'admin') {
            return users.filter(u => u.role !== 'DEVELOPER');
        }
        return users;
    }, [users, currentUser]);

    const filteredUsers = useMemo(() => {
        return visibleUsers.filter(u => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = u.fullName.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower);
            const matchesRole = filters.role === 'All' || u.role === filters.role;
            const matchesStatus = filters.status === 'All' || u.status === filters.status;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [visibleUsers, searchTerm, filters]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenEditModal = (user: ManagedUser | null) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (userToSave: ManagedUser & { password?: string }) => {
        try {
            if (selectedUser) {
                await apiRequest(`/users/${userToSave.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        full_name: userToSave.fullName,
                        email: userToSave.email,
                        role: userToSave.role,
                        status: userToSave.status
                    }),
                });
            } else {
                await apiRequest('/users', {
                    method: 'POST',
                    body: JSON.stringify({
                        full_name: userToSave.fullName,
                        email: userToSave.email,
                        role: userToSave.role,
                        status: 'Active',
                        password: userToSave.password
                    }),
                });
            }
            await loadUsers();
            setIsEditModalOpen(false);
        } catch (err: any) {
            console.error('Failed to save user:', err);
            alert('ไม่สามารถบันทึกข้อมูลผู้ใช้ได้: ' + (err.message || 'Unknown error'));
        }
    };

    const handleToggleStatus = async (user: ManagedUser) => {
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        const action = newStatus === 'Inactive' ? 'ระงับการใช้งาน' : 'เปิดใช้งาน';

        // Improved confirmation message
        if (!window.confirm(`ยืนยันการ${action}บัญชีผู้ใช้:\n\n${user.fullName}\n(${user.email})`)) return;

        try {
            await apiRequest(`/users/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            await loadUsers();
        } catch (err: any) {
            console.error('Failed to update status:', err);
            alert('ไม่สามารถเปลี่ยนสถานะได้');
        }
    };

    const handleResetPasswordRequest = (user: ManagedUser) => {
        setSelectedUser(user);
        setIsResetModalOpen(true);
    };

    const handleConfirmResetPassword = async (user: ManagedUser, newPassword: string) => {
        try {
            await apiRequest(`/users/${user.id}/reset-password`, {
                method: 'POST',
                body: JSON.stringify({ newPassword })
            });
            alert('✅ รีเซ็ตรหัสผ่านสำเร็จ');
        } catch (err: any) {
            console.error('Failed to reset password:', err);
            throw err; // Let modal handle error display
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-red-500">{error}</div>
                <button onClick={loadUsers} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    ลองใหม่
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">จัดการบัญชีผู้ใช้</h1>
                <button onClick={() => handleOpenEditModal(null)} className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                    <UserPlusIcon className="w-5 h-5 mr-2" />
                    <span>เพิ่มผู้ใช้ใหม่</span>
                </button>
            </div>

            {/* Filtering Toolbar */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="text-xs font-medium text-gray-600">ค้นหา</label>
                        <input type="text" placeholder="ชื่อ หรือ อีเมล..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600">Role</label>
                        <select value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
                            <option value="All">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="office">Office</option>
                            <option value="OFFICER">Officer</option>
                            <option value="driver">Driver</option>
                            <option value="community">Community</option>
                            <option value="EXECUTIVE">Executive</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600">สถานะ</label>
                        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/75">
                            <tr>
                                <th className="px-6 py-3 font-semibold">ผู้ใช้</th>
                                <th className="px-6 py-3 font-semibold">Role</th>
                                <th className="px-6 py-3 font-semibold">วันที่สร้าง</th>
                                <th className="px-6 py-3 font-semibold">สถานะ</th>
                                <th className="px-6 py-3 font-semibold text-center">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <img src={user.profileImageUrl || defaultProfileImage} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                {user.fullName}
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDateToThai(user.dateCreated)}</td>
                                    <td className="px-6 py-4"><UserStatusBadge status={user.status} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button
                                                onClick={() => handleOpenEditModal(user)}
                                                className="icon-btn icon-btn-edit"
                                                title="แก้ไข"
                                            >
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleResetPasswordRequest(user)}
                                                className="icon-btn icon-btn-view"
                                                title="รีเซ็ตรหัสผ่าน"
                                            >
                                                <KeyIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`icon-btn ${
                                                    user.status === 'Active'
                                                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                }`}
                                                title={user.status === 'Active' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                                            >
                                                <PowerIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">ผลลัพธ์ {paginatedUsers.length} จาก {filteredUsers.length} รายการ</span>
                <div className="inline-flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} disabled={currentPage === 1} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} disabled={currentPage === totalPages} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Modals */}
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                onSave={handleSaveUser}
                currentUser={currentUser}
            />

            <ResetPasswordModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleConfirmResetPassword}
                user={selectedUser}
            />
        </div>
    );
};

export default AdminUserManagementPage;
