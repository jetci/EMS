import React, { useState, useEffect } from 'react';
import RidesIcon from '../components/icons/RidesIcon';
import UsersIcon from '../components/icons/UsersIcon';
import RouteIcon from '../components/icons/RouteIcon';
import EfficiencyIcon from '../components/icons/EfficiencyIcon';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import HorizontalBarChart from '../components/charts/HorizontalBarChart';
import DownloadIcon from '../components/icons/DownloadIcon';
import ExportReportModal from '../components/modals/ExportReportModal';
import { apiRequest } from '../services/api';
import ExecutiveMap from '../components/executive/ExecutiveMap';

import StatCard from '../components/dashboard/StatCard';

const ExecutiveDashboardPage: React.FC = () => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>({
        monthlyRideData: [],
        patientDistributionData: [],
        topTripTypesData: [],
        patientLocations: [],
        stats: { totalRides: 0, totalPatients: 0, avgDistance: 0, efficiency: 0, avgResponseTime: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('year');

    useEffect(() => {
        loadDashboardData();
    }, [filterDate]);

    const getDateRange = () => {
        let startDate = '';
        const endDate = new Date().toISOString().split('T')[0];

        if (filterDate === 'month') {
            const start = new Date();
            start.setDate(1);
            startDate = start.toISOString().split('T')[0];
        } else if (filterDate === 'quarter') {
            const start = new Date();
            start.setMonth(start.getMonth() - 3);
            startDate = start.toISOString().split('T')[0];
        } else if (filterDate === 'year') {
            const start = new Date();
            start.setMonth(0, 1); // Jan 1st
            startDate = start.toISOString().split('T')[0];
        }

        return { startDate, endDate };
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const { startDate, endDate } = getDateRange();
            let url = '/dashboard/executive';
            if (startDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const data = await apiRequest(url);
            setDashboardData(data || {
                monthlyRideData: [],
                patientDistributionData: [],
                topTripTypesData: [],
                patientLocations: [],
                stats: { totalRides: 0, totalPatients: 0, avgDistance: 0, efficiency: 0, avgResponseTime: 0 }
            });
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">ภาพรวมโครงการ WeCare</h1>
                    <p className="text-gray-600 mt-1">สรุปข้อมูลเชิงกลยุทธ์ในรูปแบบที่เข้าใจง่าย</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="w-full sm:w-auto p-2 border rounded-lg"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    >
                        <option value="month">เดือนนี้</option>
                        <option value="quarter">ไตรมาสล่าสุด</option>
                        <option value="year">ปีนี้</option>
                    </select>
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-[#005A9C] rounded-lg shadow-sm hover:bg-blue-800 transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        <span>ส่งออกรายงาน</span>
                    </button>
                </div>
            </div>

            {/* KPI Widget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={RidesIcon} title="จำนวนเที่ยววิ่งทั้งหมด" value={dashboardData.stats.totalRides.toLocaleString()} variant="info" />
                <StatCard icon={UsersIcon} title="จำนวนผู้ป่วยที่ใซ้บริการ" value={dashboardData.stats.totalPatients.toLocaleString()} variant="success" />
                <StatCard icon={RouteIcon} title="เวลาตอบสนองเฉลี่ย" value={`${dashboardData.stats.avgResponseTime} นาที`} variant="warning" />
                <StatCard icon={EfficiencyIcon} title="ประสิทธิภาพการดำเนินงาน" value={`${dashboardData.stats.efficiency}%`} variant="default" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Ride Stats Widget */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">สถิติการเดินทางรายเดือน</h2>
                    <div className="h-64">
                        <BarChart data={dashboardData.monthlyRideData} title="แนวโน้มการเดินทางรายเดือน" />
                    </div>
                </div>

                {/* Patient Distribution Widget */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">การกระจายตัวของผู้ป่วยตามหมู่บ้าน</h2>
                    <div className="h-64 flex items-center justify-center">
                        <DonutChart data={dashboardData.patientDistributionData} title="สัดส่วนผู้ป่วยตามหมู่บ้าน" />
                    </div>
                </div>
            </div>

            {/* Spatial Analytics Map */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">แผนที่การกระจายตัวของผู้ป่วย (Spatial Analytics)</h2>
                <div className="h-[500px]">
                    <ExecutiveMap locations={dashboardData.patientLocations} />
                </div>
                <p className="text-sm text-gray-500 mt-4 italic">* แสดงพิกัดที่ตั้งของผู้ป่วยเพื่อวิเคราะห์ความหนาแน่นและการวางแผนจุดบริการ</p>
            </div>

            {/* Drill-down Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">รายละเอียดข้อมูลเชิงลึก (Drill-down)</h2>
                    <div className="text-sm text-gray-500 italic">
                        แสดงข้อมูลผู้ป่วยล่าสุด 10 ราย
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 text-sm font-semibold text-gray-600">ID</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">ชื่อ-นามสกุล</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">ประเภท</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">พิกัด</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.patientLocations.slice(0, 10).map((loc: any) => (
                                <tr key={loc.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-3 text-sm text-blue-600 font-medium">{loc.id}</td>
                                    <td className="p-3 text-sm text-gray-800">{loc.name}</td>
                                    <td className="p-3 text-sm text-gray-600">{loc.type}</td>
                                    <td className="p-3 text-sm text-gray-500">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {dashboardData.patientLocations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                        ไม่มีข้อมูลผู้ป่วยที่มีพิกัดในระบบ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Trip Types Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">ประเภทการเดินทางยอดนิยม 5 อันดับแรก</h2>
                <HorizontalBarChart data={dashboardData.topTripTypesData} title="ประเภทการเดินทางที่มีความต้องการสูงสุด" />
            </div>

            <ExportReportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                startDate={getDateRange().startDate}
                endDate={getDateRange().endDate}
            />
        </div>
    );
};

export default ExecutiveDashboardPage;
