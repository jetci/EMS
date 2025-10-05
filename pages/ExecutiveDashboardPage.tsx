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
import { apiRequest } from '../src/services/api';

const StatCard: React.FC<{ icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string; value: string; }> = ({ icon: Icon, label, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ExecutiveDashboardPage: React.FC = () => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>({
        monthlyRideData: [],
        patientDistributionData: [],
        topTripTypesData: [],
        stats: { totalRides: 0, totalPatients: 0, avgDistance: 0, efficiency: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const data = await apiRequest('/dashboard/executive');
            setDashboardData(data || {
                monthlyRideData: [],
                patientDistributionData: [],
                topTripTypesData: [],
                stats: { totalRides: 0, totalPatients: 0, avgDistance: 0, efficiency: 0 }
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
                    <select className="w-full sm:w-auto">
                        <option>เดือนนี้</option>
                        <option>ไตรมาสล่าสุด</option>
                        <option>ปีนี้</option>
                        <option>กำหนดเอง</option>
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
                <StatCard icon={RidesIcon} label="จำนวนเที่ยววิ่งทั้งหมด" value={dashboardData.stats.totalRides.toLocaleString()} />
                <StatCard icon={UsersIcon} label="จำนวนผู้ป่วยที่ใซ้บริการ" value={dashboardData.stats.totalPatients.toLocaleString()} />
                <StatCard icon={RouteIcon} label="ระยะทางเฉลี่ยต่อเที่ยว" value={`${dashboardData.stats.avgDistance} กม.`} />
                <StatCard icon={EfficiencyIcon} label="ประสิทธิภาพการดำเนินงาน" value={`${dashboardData.stats.efficiency}%`} />
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

            {/* Top Trip Types Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">ประเภทการเดินทางยอดนิยม 5 อันดับแรก</h2>
                <HorizontalBarChart data={dashboardData.topTripTypesData} title="ประเภทการเดินทางที่มีความต้องการสูงสุด" />
            </div>

            <ExportReportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
            />
        </div>
    );
};

export default ExecutiveDashboardPage;