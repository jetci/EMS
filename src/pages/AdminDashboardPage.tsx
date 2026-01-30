import React, { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard';
import UsersIcon from '../components/icons/UsersIcon';
import RidesIcon from '../components/icons/RidesIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import { SystemLog, User, AdminView } from '../types';
import RoleBadge from '../components/ui/RoleBadge';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import FileTextIcon from '../components/icons/FileTextIcon';
import SettingsIcon from '../components/icons/SettingsIcon';
import MapIcon from '../components/icons/MapIcon';
import { dashboardService } from '../services/dashboardService';

interface AdminDashboardPageProps {
    setActiveView: (view: AdminView) => void;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ setActiveView }) => {
    const [stats, setStats] = useState({ totalUsers: 0, totalRides: 0, newUsers: 0 });
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getAdminDashboard();
            setStats({
                totalUsers: data.totalUsers || 0,
                totalRides: data.totalRides || 0,
                newUsers: data.newUsers || 0,
            });
            setLogs(data.recentLogs || []);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">ภาพรวมระบบสำหรับผู้ดูแล</h1>

            {/* Key System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="จำนวนผู้ใช้ทั้งหมด" value={stats.totalUsers.toString()} icon={UsersIcon} />
                <StatCard title="การเดินทางทั้งหมด (เดือนนี้)" value={stats.totalRides.toString()} icon={RidesIcon} />
                <StatCard title="ผู้ใช้ใหม่ (7 วันล่าสุด)" value={stats.newUsers.toString()} icon={UserPlusIcon} />
                <StatCard title="สถานะระบบ" value="ปกติ" icon={CheckCircleIcon} variant="success" />
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">ทางลัดการทำงาน</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onClick={() => setActiveView('users')} className="flex items-center justify-center p-4 bg-blue-50 text-[var(--wecare-blue)] rounded-lg hover:bg-blue-100 transition-colors duration-300">
                        <UserPlusIcon className="w-6 h-6 mr-3" />
                        <span className="text-md font-semibold">เพิ่มผู้ใช้ใหม่</span>
                    </button>
                    <button onClick={() => setActiveView('logs')} className="flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300">
                        <FileTextIcon className="w-6 h-6 mr-3" />
                        <span className="text-md font-semibold">ดูบันทึกการใช้งาน</span>
                    </button>
                    <button onClick={() => setActiveView('settings')} className="flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300">
                        <SettingsIcon className="w-6 h-6 mr-3" />
                        <span className="text-md font-semibold">ไปที่หน้าตั้งค่า</span>
                    </button>

                </div>
            </div>

            {/* Recent System-Wide Activity */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">กิจกรรมล่าสุด</h2>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50/75">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-semibold">เวลา</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">ผู้ใช้</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Role</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">การกระทำ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {logs.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-mono text-xs">{log.time}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{log.user}</td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={log.role} />
                                        </td>
                                        <td className="px-6 py-4">{log.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
