import React, { useState } from 'react';
import RidesIcon from '../components/icons/RidesIcon';
import UsersIcon from '../components/icons/UsersIcon';
import RouteIcon from '../components/icons/RouteIcon';
import EfficiencyIcon from '../components/icons/EfficiencyIcon';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import HorizontalBarChart from '../components/charts/HorizontalBarChart';
import DownloadIcon from '../components/icons/DownloadIcon';
import ExportReportModal from '../components/modals/ExportReportModal';

// Mock Data for Charts
const monthlyRideData = [
    { label: 'ม.ค.', value: 110 }, { label: 'ก.พ.', value: 125 }, { label: 'มี.ค.', value: 140 },
    { label: 'เม.ย.', value: 130 }, { label: 'พ.ค.', value: 155 }, { label: 'มิ.ย.', value: 160 },
    { label: 'ก.ค.', value: 175 }, { label: 'ส.ค.', value: 180 }, { label: 'ก.ย.', value: 165 },
];

const patientDistributionData = [
    { label: 'หมู่ 1', value: 15, color: '#3B82F6' },
    { label: 'หมู่ 2', value: 12, color: '#10B981' },
    { label: 'หมู่ 3', value: 8, color: '#F59E0B' },
    { label: 'หมู่ 4', value: 10, color: '#EF4444' },
    { label: 'หมู่ 5', value: 5, color: '#8B5CF6' },
    { label: 'อื่นๆ', value: 50, color: '#6B7280' },
];

const topTripTypesData = [
    { label: 'นัดฟอกไต', value: 85 },
    { label: 'กายภาพบำบัด', value: 62 },
    { label: 'รับยา', value: 55 },
    { label: 'นัดหมอตามปกติ', value: 48 },
    { label: 'ฉุกเฉิน', value: 23 },
];

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
                <StatCard icon={RidesIcon} label="จำนวนการเดินทางทั้งหมด" value="165" />
                <StatCard icon={UsersIcon} label="จำนวนผู้ป่วยที่ให้บริการ" value="42" />
                <StatCard icon={RouteIcon} label="ระยะทางรวม (กม.)" value="2,480" />
                <StatCard icon={EfficiencyIcon} label="ประสิทธิภาพเฉลี่ย" value="5.5 เที่ยว/วัน" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Ride Stats Widget */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">สถิติการเดินทางรายเดือน</h2>
                    <div className="h-64">
                        <BarChart data={monthlyRideData} />
                    </div>
                </div>

                {/* Patient Distribution Widget */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">การกระจายตัวของผู้ป่วยตามหมู่บ้าน</h2>
                    <div className="h-64 flex items-center justify-center">
                        <DonutChart data={patientDistributionData} />
                    </div>
                </div>
            </div>
            
            {/* Top Trip Types Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">ประเภทการเดินทางยอดนิยม 5 อันดับแรก</h2>
                <HorizontalBarChart data={topTripTypesData} />
            </div>

            <ExportReportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
            />
        </div>
    );
};

export default ExecutiveDashboardPage;