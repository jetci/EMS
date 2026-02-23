import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import ExecutiveMap from '../components/executive/ExecutiveMap';
import EfficiencyIcon from '../components/icons/EfficiencyIcon';
import KPICard from '../components/executive/KPICard';
import UsersIcon from '../components/icons/UsersIcon';

const DensityHeatmapPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const res = await apiRequest('/dashboard/executive');
                setData(res);
            } catch (err) {
                console.error('Failed to load density heatmap:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500 animate-pulse">กำลังวิเคราะห์ความหนาแน่น...</p></div>;
    if (!data) return <div className="p-8 text-center text-red-500">ไม่สามารถโหลดข้อมูลได้</div>;

    return (
        <div className="h-full flex flex-col space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">แผนที่วิเคราะห์ความหนาแน่น</h1>
                    <p className="text-slate-600 mt-2 text-lg font-medium">วิเคราะห์เชิงพื้นที่เพื่อประเมินจุดเสี่ยงและความต้องการบริการเร่งด่วน</p>
                </div>
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">สถานะระบบ</span>
                    <div className="px-5 py-2 bg-orange-50 text-orange-600 rounded-full border border-orange-100 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                        วิเคราะห์ผลแบบเรียลไทม์
                    </div>
                </div>
            </div>

            {/* Top Analytics Bar - Standardized Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Concentration Index - Replaced with KPICard */}
                <KPICard
                    title="จำนวนผู้ป่วยมีพิกัด"
                    value={data.patientLocations.length}
                    unit="ราย"
                    color="blue"
                    icon={<UsersIcon />}
                    trend={{ value: '', isUp: true }}
                />

                {/* Legend Card - Standardized Container */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-xl border border-white flex flex-col justify-center gap-6 min-h-[130px]">
                    <div className="flex flex-wrap items-center justify-around gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-lg bg-red-500 shadow-lg shadow-red-200"></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">วิกฤต</span>
                                <span className="text-sm font-black text-slate-700">{'>'} 10</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-lg bg-orange-400 shadow-lg shadow-orange-100"></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">สูง</span>
                                <span className="text-sm font-black text-slate-700">5-10</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-lg bg-blue-400 shadow-lg shadow-blue-50"></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ปานกลาง</span>
                                <span className="text-sm font-black text-slate-700">1-4</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Insight Card - Standardized size matching KPICard */}
                <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-xl relative overflow-hidden group min-h-[130px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                    <p className="text-xs font-black text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        บทวิเคราะห์ AI
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        แผนที่แสดงความหนาแน่นของผู้ป่วยจากข้อมูลพิกัดจริงในระบบ
                    </p>
                </div>
            </div>

            {/* Secondary Metric Row - Relocated from Overlay */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-xl border border-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                            <UsersIcon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">จำนวนคนขับทั้งหมด</p>
                            <p className="text-lg font-black text-slate-900">
                                {data.stats?.totalDrivers ?? '-'} คน
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex -space-x-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                {i}
                            </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                            +
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden relative min-h-[500px] group">
                <ExecutiveMap locations={data.patientLocations} />
            </div>
        </div>
    );
};

export default DensityHeatmapPage;
