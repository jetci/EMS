import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import StatCard from '../components/dashboard/StatCard';
import UsersIcon from '../components/icons/UsersIcon';
import RidesIcon from '../components/icons/RidesIcon';
import { OfficerView, Vehicle, NewsArticle, VehicleStatus } from '../types';
import UserIcon from '../components/icons/UserIcon';
import { formatFullDateToThai, formatDateTimeToThai } from '../utils/dateUtils';
import Toast from '../components/Toast';
import { dashboardService } from '../services/dashboardService';
import { apiRequest } from '../services/api';

interface OfficeDashboardProps {
    setActiveView: (view: OfficerView, context?: any) => void;
}

const OfficeDashboard: React.FC<OfficeDashboardProps> = ({ setActiveView }) => {
    const currentDate = formatFullDateToThai(new Date());
    const [stats, setStats] = useState<any>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, vehiclesData, vehicleTypesData, newsData] = await Promise.all([
                dashboardService.getOfficeDashboard(),
                apiRequest('/vehicles'),
                apiRequest('/vehicle-types'),
                dashboardService.getNews(),
            ]);

            setStats(statsData);

            const rawVehicles = Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData?.vehicles || []);
            const rawTypes = Array.isArray(vehicleTypesData) ? vehicleTypesData : (vehicleTypesData?.vehicleTypes || []);

            const typeMap: Record<string, string> = {};
            rawTypes.forEach((t: any) => {
                if (t && t.id) {
                    typeMap[t.id] = t.name;
                }
            });

            const mappedVehicles: Vehicle[] = rawVehicles.map((v: any) => ({
                id: v.id,
                licensePlate: v.license_plate || v.licensePlate || '',
                model: v.model || '',
                brand: v.brand || '',
                color: v.color || '',
                vehicleTypeId: v.vehicle_type_id || v.vehicleTypeId || '',
                vehicleTypeName: typeMap[v.vehicle_type_id] || v.vehicleTypeName || '-',
                status: (v.status as VehicleStatus) || VehicleStatus.AVAILABLE,
                assignedTeamId: v.assigned_team_id || v.assignedTeamId,
                nextMaintenanceDate: v.next_maintenance_date || v.nextMaintenanceDate || null,
            }));

            setVehicles(mappedVehicles);
            setNews(Array.isArray(newsData) ? newsData.slice(0, 5) : []); // Get latest 5 news
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            showToast('⚠️ ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const availableVehicles = vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length;
    const maintenanceVehicles = vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">แผงบริหารจัดการ (Management)</h1>
                    <p className="text-gray-500 mt-1">ภาพรวมทรัพยากรและการวางแผน</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-medium text-[var(--wecare-blue)]">{currentDate}</p>
                    <p className="text-sm text-gray-400">อัปเดตล่าสุด: {dayjs().format('HH:mm')}</p>
                </div>
            </div>

            {/* Management Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="ผู้ป่วยในระบบ"
                    value={stats?.total_patients?.toString() || '0'}
                    icon={UsersIcon}
                    onClick={() => setActiveView('patients')}
                />
                <StatCard
                    title="ยานพาหนะทั้งหมด"
                    value={`${availableVehicles} / ${vehicles.length}`}
                    subtitle={`ซ่อมบำรุง: ${maintenanceVehicles}`}
                    icon={RidesIcon}
                    variant="info"
                    onClick={() => setActiveView('manage_vehicles')}
                />
                <StatCard
                    title="บุคลากรขับรถ"
                    value={stats?.total_drivers?.toString() || '0'}
                    subtitle={`พร้อมงาน: ${stats?.available_drivers || 0}`}
                    icon={UserIcon}
                    variant="success"
                    onClick={() => setActiveView('drivers')}
                />
                <StatCard
                    title="เที่ยววิ่งวันนี้"
                    value={stats?.total_today_rides?.toString() || '0'}
                    subtitle="รอจ่ายงาน: 0"
                    icon={RidesIcon}
                    variant="warning"
                    onClick={() => setActiveView('reports')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Resource Status */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Vehicle Status Overview */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">สถานะยานพาหนะ</h2>
                            <button onClick={() => setActiveView('manage_vehicles')} className="text-sm text-blue-600 hover:underline">จัดการรถทั้งหมด</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">ทะเบียน</th>
                                        <th className="px-4 py-3">ยี่ห้อ/รุ่น</th>
                                        <th className="px-4 py-3">ประเภท</th>
                                        <th className="px-4 py-3">สถานะ</th>
                                        <th className="px-4 py-3">ซ่อมบำรุงถัดไป</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.slice(0, 5).map((vehicle) => (
                                        <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{vehicle.licensePlate}</td>
                                            <td className="px-4 py-3">{vehicle.brand} {vehicle.model}</td>
                                            <td className="px-4 py-3">{vehicle.vehicleTypeName || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${vehicle.status === VehicleStatus.AVAILABLE ? 'bg-green-100 text-green-800' :
                                                    vehicle.status === VehicleStatus.MAINTENANCE ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {vehicle.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{vehicle.nextMaintenanceDate ? formatDateTimeToThai(vehicle.nextMaintenanceDate) : '-'}</td>
                                        </tr>
                                    ))}
                                    {vehicles.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-4 text-gray-500">ไม่พบข้อมูลยานพาหนะ</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">ประกาศและข่าวสาร</h2>
                            <button
                                onClick={() => setActiveView('news')}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                จัดการข่าวสาร
                            </button>
                        </div>
                        <div className="space-y-3">
                            {news.map((item) => {
                                const plainText = item.content.replace(/<[^>]+>/g, '');
                                const isPublished = item.status === 'published';
                                return (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border border-gray-100 bg-gray-50/80 hover:bg-gray-50 transition-colors p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-snug line-clamp-2">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                {plainText}
                                            </p>
                                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                                <span>โดย {item.author}</span>
                                                <span>•</span>
                                                <span>{item.publishedDate ? formatDateTimeToThai(item.publishedDate) : 'ยังไม่เผยแพร่'}</span>
                                            </div>
                                        </div>
                                        <div className="flex md:flex-col items-end md:items-end justify-between gap-2 md:gap-3">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {isPublished ? 'เผยแพร่แล้ว' : 'ร่าง'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {news.length === 0 && (
                                <p className="text-center text-gray-500 py-4">ยังไม่มีประกาศข่าวสาร</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions & Tools */}
                <div className="space-y-6">
                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">เมนูด่วน (Quick Actions)</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setActiveView('manage_teams')} className="p-3 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <span className="block text-2xl mb-1">👥</span>
                                <span className="text-sm font-medium text-blue-800">จัดทีม/เวร</span>
                            </button>
                            <button onClick={() => setActiveView('manage_vehicles')} className="p-3 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                                <span className="block text-2xl mb-1">🚑</span>
                                <span className="text-sm font-medium text-green-800">จัดการรถ</span>
                            </button>
                            <button onClick={() => setActiveView('reports')} className="p-3 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                                <span className="block text-2xl mb-1">📊</span>
                                <span className="text-sm font-medium text-purple-800">รายงาน</span>
                            </button>
                            <button onClick={() => setActiveView('news')} className="p-3 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                                <span className="block text-2xl mb-1">📢</span>
                                <span className="text-sm font-medium text-orange-800">ประกาศข่าว</span>
                            </button>
                        </div>
                    </div>

                    {/* System Status (Mock) */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-sm p-6 text-white">
                        <h2 className="text-lg font-bold mb-4">สถานะระบบ</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-sm">Database</span>
                                <span className="text-green-400 text-xs font-bold px-2 py-1 bg-green-400/10 rounded">ONLINE</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-sm">API Server</span>
                                <span className="text-green-400 text-xs font-bold px-2 py-1 bg-green-400/10 rounded">ONLINE</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-sm">Last Backup</span>
                                <span className="text-gray-400 text-xs">Today, 03:00 AM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Toast message={toastMessage} />
        </div>
    );
};

export default OfficeDashboard;
