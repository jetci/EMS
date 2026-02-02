import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import UsersIcon from '../components/icons/UsersIcon';
import MapIcon from '../components/icons/MapIcon';
import EfficiencyIcon from '../components/icons/EfficiencyIcon';
import KPICard from '../components/executive/KPICard'; // Consolidate Import
import DonutChart from '../components/charts/DonutChart';

const VillageDistributionPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const res = await apiRequest('/dashboard/executive');
                setData(res);
            } catch (err) {
                console.error('Failed to load village distribution:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูลพื้นที่...</p></div>;
    if (!data) return <div className="p-8 text-center text-red-500">ไม่สามารถโหลดข้อมูลได้</div>;

    const filteredVillages = data.patientDistributionData.filter((v: any) =>
        v.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const maxPatients = Math.max(...data.patientDistributionData.map((v: any) => v.value), 1);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">การกระจายตัวของผู้ป่วยตามหมู่บ้าน</h1>
                <p className="text-slate-600 mt-2 text-lg font-medium">วิเคราะห์ความหนาแน่นของผู้ป่วยแยกตามเขตพื้นที่รับผิดชอบทั้ง 20 หมู่บ้าน</p>
            </div>

            {/* Quick Stats Grid - Using Shared KPICard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="หมู่บ้านทั้งหมด"
                    value={data.patientDistributionData.length}
                    unit="แห่ง"
                    color="blue"
                    icon={<MapIcon />}
                    trend={{ value: 'ความครอบคลุม', isUp: true }}
                />
                <KPICard
                    title="ผู้ป่วยสะสม"
                    value={data.stats.totalPatients}
                    unit="คน"
                    color="indigo"
                    icon={<UsersIcon />}
                    trend={{ value: 'ยอดรวม', isUp: true }}
                />
                <KPICard
                    title="หนาแน่นที่สุด"
                    value={data.patientDistributionData[0]?.value || 0}
                    unit="ราย"
                    color="emerald"
                    icon={<EfficiencyIcon />}
                    trend={{ value: 'สูงสุด', isUp: true }}
                />
                <KPICard
                    title="ประสิทธิภาพบริการ"
                    value={`${data.stats.efficiency}%`}
                    unit=""
                    color="orange"
                    icon={<EfficiencyIcon />}
                    trend={{ value: 'ประสิทธิภาพ', isUp: true }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200">
                    <h2 className="text-2xl font-black text-gray-900 mb-8">สัดส่วนตามหมู่บ้าน</h2>
                    <div className="h-[400px]">
                        <DonutChart data={data.patientDistributionData} />
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                        <h2 className="text-2xl font-black text-gray-900">ตารางวิจัยรายพื้นที่</h2>
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="ค้นหาหมู่บ้าน..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredVillages.map((v: any) => (
                            <div key={v.label} className="group cursor-default p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{v.label}</span>
                                    <span className="text-sm font-black text-slate-500">{v.value} คน</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${(v.value / maxPatients) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {filteredVillages.length === 0 && (
                            <p className="text-center text-gray-400 py-8">ไม่พบชื่อหมู่บ้านที่ค้นหา</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VillageDistributionPage;
