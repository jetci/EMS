import React, { useState, useMemo } from 'react';
import { AuditLog, ActionType } from '../types';
import SearchIcon from '../components/icons/SearchIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import RoleBadge from '../components/ui/RoleBadge';
import EyeIcon from '../components/icons/EyeIcon';
import LogDetailsModal from '../components/modals/LogDetailsModal';
import { formatDateTimeToThai, formatDateToThai } from '../utils/dateUtils';
import ThaiDatePicker from '../components/ui/ThaiDatePicker';

const mockLogs: AuditLog[] = [
  { id: 'LOG-001', timestamp: '2024-09-16T14:32:15Z', userEmail: 'office1@wecare.dev', userRole: 'office', action: ActionType.ASSIGN_DRIVER, targetId: 'RIDE-206', ipAddress: '192.168.1.10', dataPayload: { before: { driver: null }, after: { driver: 'Driver One' } } },
  { id: 'LOG-002', timestamp: '2024-09-16T14:30:05Z', userEmail: 'community1@wecare.dev', userRole: 'community', action: ActionType.CREATE_PATIENT, targetId: 'PAT-007', ipAddress: '203.0.113.25' },
  { id: 'LOG-003', timestamp: '2024-09-16T13:15:40Z', userEmail: 'driver1@wecare.dev', userRole: 'driver', action: ActionType.COMPLETE_RIDE, targetId: 'RIDE-201', ipAddress: '198.51.100.12' },
  { id: 'LOG-004', timestamp: '2024-09-16T11:05:10Z', userEmail: 'admin@wecare.dev', userRole: 'admin', action: ActionType.UPDATE_USER, targetId: 'USR-005', ipAddress: '127.0.0.1', dataPayload: { before: { status: 'Inactive' }, after: { status: 'Active' } } },
  { id: 'LOG-005', timestamp: '2024-09-16T09:00:01Z', userEmail: 'admin@wecare.dev', userRole: 'admin', action: ActionType.LOGIN, ipAddress: '127.0.0.1' },
];

const ITEMS_PER_PAGE = 10;

const AdminAuditLogsPage: React.FC = () => {
    const [logs] = useState<AuditLog[]>(mockLogs);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ user: '', role: 'All', actionType: 'All', startDate: '', endDate: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFilters(f => ({ ...f, [name]: value }));
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = !searchTerm || log.action.toLowerCase().includes(searchTerm.toLowerCase()) || (log.targetId && log.targetId.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesUser = !filters.user || log.userEmail.toLowerCase().includes(filters.user.toLowerCase());
            const matchesRole = filters.role === 'All' || log.userRole === filters.role;
            const matchesAction = filters.actionType === 'All' || log.action === filters.actionType;

            let matchesDate = true;
            if (filters.startDate && filters.endDate) {
                const logDate = new Date(log.timestamp);
                matchesDate = logDate >= new Date(filters.startDate) && logDate <= new Date(filters.endDate);
            }

            return matchesSearch && matchesUser && matchesRole && matchesAction && matchesDate;
        });
    }, [logs, searchTerm, filters]);

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenModal = (log: AuditLog) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilters({ user: '', role: 'All', actionType: 'All', startDate: '', endDate: '' });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">บันทึกการใช้งานระบบ</h1>

            {/* Advanced Filtering Toolbar */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" placeholder="ค้นหา Keyword..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <input type="text" placeholder="กรองตามผู้ใช้ (Email)..." name="user" value={filters.user} onChange={handleFilterChange} />
                    <select name="role" value={filters.role} onChange={handleFilterChange}>
                       <option value="All">All Roles</option>
                       <option value="admin">Admin</option>
                       <option value="office">Office</option>
                       <option value="driver">Driver</option>
                       <option value="community">Community</option>
                    </select>
                    <select name="actionType" value={filters.actionType} onChange={handleFilterChange}>
                       <option value="All">All Action Types</option>
                       {Object.values(ActionType).map(action => <option key={action} value={action}>{action}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">จากวันที่</label>
                        <ThaiDatePicker name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ถึงวันที่</label>
                        <ThaiDatePicker name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                    <div className="flex items-end">
                        <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 font-medium py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                            <XCircleIcon className="w-5 h-5"/>
                            ล้างตัวกรอง
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/75">
                            <tr>
                                <th className="px-6 py-3 font-semibold">วัน-เวลา</th>
                                <th className="px-6 py-3 font-semibold">ผู้ใช้งาน</th>
                                <th className="px-6 py-3 font-semibold">Role</th>
                                <th className="px-6 py-3 font-semibold">การกระทำ</th>
                                <th className="px-6 py-3 font-semibold">เป้าหมาย</th>
                                <th className="px-6 py-3 font-semibold text-center">รายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{formatDateTimeToThai(log.timestamp)}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{log.userEmail}</td>
                                    <td className="px-6 py-4"><RoleBadge role={log.userRole} /></td>
                                    <td className="px-6 py-4 font-mono text-xs">{log.action}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{log.targetId || 'N/A'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleOpenModal(log)} className="p-2 rounded-full text-gray-400 hover:text-blue-600" title="ดูรายละเอียด">
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             {/* Pagination */}
             <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">ผลลัพธ์ {paginatedLogs.length} จาก {filteredLogs.length} รายการ</span>
                <div className="inline-flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} disabled={currentPage === 1} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} disabled={currentPage === totalPages} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronRightIcon className="w-5 h-5"/></button>
                </div>
            </div>

            {selectedLog && <LogDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} log={selectedLog} />}
        </div>
    );
};

export default AdminAuditLogsPage;