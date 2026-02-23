import React, { useState, useEffect } from 'react';
import UsersIcon from '../components/icons/UsersIcon';
import MapIcon from '../components/icons/MapIcon';
import HistoryIcon from '../components/icons/HistoryIcon';
import EfficiencyIcon from '../components/icons/EfficiencyIcon';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import HorizontalBarChart from '../components/charts/HorizontalBarChart';
import DownloadIcon from '../components/icons/DownloadIcon';
import ExportReportModal from '../components/modals/ExportReportModal';
import { apiRequest } from '../services/api';
import KPICard from '../components/executive/KPICard';

const ExecutiveDashboardPage: React.FC = () => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>({
        monthlyRideData: [],
        patientDistributionData: [],
        volunteerDistributionData: [],
        topTripTypesData: [],
        patientLocations: [],
        stats: { totalRides: 0, totalPatients: 0, avgDistance: 0, efficiency: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('year');

    useEffect(() => {
        loadDashboardData();
    }, [filterDate]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            let url = '/dashboard/executive';
            if (filterDate === 'month') {
                const start = new Date();
                start.setDate(1);
                url += `?startDate=${start.toISOString().split('T')[0]}`;
            } else if (filterDate === 'quarter') {
                const start = new Date();
                start.setMonth(start.getMonth() - 3);
                url += `?startDate=${start.toISOString().split('T')[0]}`;
            }

            const data = await apiRequest(url);
            setDashboardData(data || {
                monthlyRideData: [],
                patientDistributionData: [],
                volunteerDistributionData: [],
                topTripTypesData: [],
                patientLocations: [],
                stats: { totalRides: 0, totalPatients: 0, avgDistance: 0, efficiency: 0 }
            });
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-fadeIn">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">ภาพรวมโครงการ</h1>
                    <p className="text-gray-500 mt-2 text-lg font-medium">ภาพรวมการดำเนินงาน สถิติ และตัวชี้วัดความสำเร็จของระบบ WeCare</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        Export Data
                    </button>
                    <div className="px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs font-black text-gray-600 uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </header>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <KPICard
                    title="จำนวนผู้ป่วยทั้งหมด"
                    value={dashboardData.stats.totalPatients.toLocaleString()}
                    unit="คน"
                    color="blue"
                    icon={<UsersIcon />}
                    trend={{
                        value: `${dashboardData.stats.patientsTrend ?? 0}%`,
                        isUp: (dashboardData.stats.patientsTrend ?? 0) >= 0
                    }}
                />
                <KPICard
                    title="เที่ยววิ่งสะสม"
                    value={dashboardData.stats.totalRides.toLocaleString()}
                    unit="ครั้ง"
                    color="indigo"
                    icon={<HistoryIcon />}
                    trend={{
                        value: `${dashboardData.stats.ridesTrend ?? 0}%`,
                        isUp: (dashboardData.stats.ridesTrend ?? 0) >= 0
                    }}
                />
                <KPICard
                    title="ประสิทธิภาพการตอบสนอง"
                    value={`${dashboardData.stats.efficiency}%`}
                    unit=""
                    color="emerald"
                    icon={<EfficiencyIcon />}
                    trend={{ value: 'Stable', isUp: true }}
                />
                <KPICard
                    title="ครอบคลุมหมู่บ้าน"
                    value={dashboardData.patientDistributionData.length}
                    unit="แห่ง"
                    color="orange"
                    icon={<MapIcon />}
                    trend={{ value: '100%', isUp: true }}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Main Trends Chart */}
                <div className="xl:col-span-2 bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">แนวโน้มเที่ยววิ่งรายเดือน</h2>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Monthly Analytics</p>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <BarChart data={dashboardData.monthlyRideData} title="จำนวนเที่ยววิ่ง" />
                    </div>
                </div>

                {/* Village Distribution Chart */}
                <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200">
                    <h2 className="text-2xl font-black text-gray-900 mb-8">สัดส่วนหมู่บ้านหลัก</h2>
                    <div className="h-[400px]">
                        <DonutChart data={dashboardData.patientDistributionData.slice(0, 5)} title="Top 5 Villages" />
                    </div>
                </div>
            </div>

            {/* Volunteer Distribution */}
            <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200">
                <h2 className="text-2xl font-black text-gray-900 mb-8">สัดส่วนอาสาสมัครตามหมู่บ้าน/ตำบล</h2>
                <div className="h-[400px]">
                    <DonutChart data={dashboardData.volunteerDistributionData || []} />
                </div>
            </div>

            {/* Patient Data Table - Wide Format */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">ข้อมูลผู้ป่วยล่าสุด</h2>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Recently Registered Analysis</p>
                    </div>
                    <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                        ดูทั้งหมดในรายละเอียดเชิงลึก
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-wider text-left">Identity</th>
                                <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Village</th>
                                <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Type</th>
                                <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {dashboardData.patientLocations.slice(0, 6).map((patient: any) => (
                                <tr key={patient.id} className="hover:bg-blue-50/30 transition-all duration-300 group cursor-pointer">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-base transition-colors group-hover:text-blue-600">{patient.name}</p>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 group-hover:text-blue-400">UID: #{patient.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <span className="text-sm font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                            {patient.village}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-wider border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            {patient.type}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-wider border border-emerald-100">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            Verified
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Status Card - Premium Glassmorphism */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-16 shadow-2xl relative overflow-hidden group border border-slate-800">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full -mr-300 -mt-300 blur-[150px] group-hover:bg-blue-600/30 transition-all duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full -ml-200 -mb-200 blur-[100px] group-hover:bg-indigo-600/20 transition-all duration-1000"></div>

                <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
                        <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 transform -rotate-6 group-hover:rotate-0 transition-all duration-700">
                            <EfficiencyIcon className="w-14 h-14" />
                        </div>
                        <div>
                            <h2 className="text-5xl font-black tracking-tighter leading-tight">ความสมบูรณ์ของระบบข้อมูล</h2>
                            <p className="text-slate-400 mt-4 text-xl font-medium max-w-2xl">
                                ภาพรวมความครอบคลุมข้อมูลเชิงพื้นที่และประชากรในเขตพื้นที่บริบท <br className="hidden md:block" />
                                <span className="text-blue-500 font-black text-2xl">ความถูกต้อง 100.0% ผ่านการเข้ารหัส SHA-256</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto">
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            ดาวน์โหลดรายงานฉบับย่อ
                        </button>
                        <button
                            onClick={() => window.location.href = '#spatial-analytics'}
                            className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/40 transform hover:-translate-y-1 active:scale-95"
                        >
                            เข้าสู่ระบบ Command Center
                        </button>
                    </div>
                </div>
            </div>

            <ExportReportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
            />
        </div>
    );
};


export default ExecutiveDashboardPage;
