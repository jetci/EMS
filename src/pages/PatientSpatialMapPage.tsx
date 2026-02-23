import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import ExecutiveMap from '../components/executive/ExecutiveMap';
import MapIcon from '../components/icons/MapIcon';
import KPICard from '../components/executive/KPICard';
import UsersIcon from '../components/icons/UsersIcon';
import EfficiencyIcon from '../components/icons/EfficiencyIcon';

const PatientSpatialMapPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await apiRequest('/dashboard/executive');
            setData(res);
        } catch (err) {
            console.error('Failed to load spatial analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleResetView = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500 animate-pulse">กำลังเรียกข้อมูลพิกัด...</p></div>;
    if (!data) return <div className="p-8 text-center text-red-500">ไม่สามารถโหลดข้อมูลได้</div>;

    return (
        <div className="h-full flex flex-col space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">แผนที่การกระจายตัวของผู้ป่วย</h1>
                    <p className="text-gray-500 mt-2 text-lg">แสดงพิกัดที่ตั้งจริงเชิงพื้นที่เพื่อการบริหารจัดการทรัพยากรที่แม่นยำ</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleResetView}
                        className="bg-white p-3 hover:bg-slate-50 rounded-2xl shadow-sm border border-slate-200 transition-all text-slate-400 hover:text-blue-600"
                        title="Refresh Data"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                </div>
            </div>

            {/* Top KPI Section - Compact Version */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[1.5rem] shadow-lg border border-white hover:shadow-blue-900/5 transition-all duration-300 flex items-center gap-4">
                    <div className="p-3 rounded-xl shadow-lg bg-blue-600 shadow-blue-200/50 text-white">
                        <UsersIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ผู้ป่วยทั้งหมด</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{data.patientLocations.length}</h3>
                            <span className="text-xs font-bold text-slate-500">ราย</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[1.5rem] shadow-lg border border-white hover:shadow-emerald-900/5 transition-all duration-300 flex items-center gap-4">
                    <div className="p-3 rounded-xl shadow-lg bg-emerald-600 shadow-emerald-200/50 text-white">
                        <MapIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">หมู่บ้านที่มีพิกัด</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                {new Set(data.patientLocations.map((p: any) => p.village)).size}
                            </h3>
                            <span className="text-xs font-bold text-slate-500">แห่ง</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[1.5rem] shadow-lg border border-white hover:shadow-indigo-900/5 transition-all duration-300 flex items-center gap-4">
                    <div className="p-3 rounded-xl shadow-lg bg-indigo-600 shadow-indigo-200/50 text-white">
                        <EfficiencyIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">สัดส่วนผู้ป่วยมีพิกัด</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                {data.stats && data.stats.totalPatients
                                    ? Math.round((data.patientLocations.length / data.stats.totalPatients) * 100)
                                    : 0}
                            </h3>
                            <span className="text-xs font-bold text-slate-500">%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden relative min-h-[600px] group transition-all duration-500 hover:shadow-blue-900/5">
                <ExecutiveMap key={refreshKey} locations={data.patientLocations} />

                <div className="absolute bottom-12 right-8 z-[1000] flex flex-col gap-3">
                    <button
                        onClick={handleResetView}
                        className="bg-gray-900/90 backdrop-blur-xl text-white shadow-2xl px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 group/btn border border-white/10"
                    >
                        <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21l-8-18h16l-8 18z"></path></svg>
                        สเกลพิกัดหมู่บ้านหลัก
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientSpatialMapPage;
