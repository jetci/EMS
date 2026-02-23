import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import BarChart from '../components/charts/BarChart';
import EfficiencyIcon from '../components/icons/EfficiencyIcon';
import HistoryIcon from '../components/icons/HistoryIcon';
import TruckIcon from '../components/icons/TruckIcon';
import KPICard from '../components/executive/KPICard';

const OperationalReportPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Reusing executive endpoint as it contains most operational stats
                const res = await apiRequest('/dashboard/executive');
                setData(res);
            } catch (err) {
                console.error('Failed to load operational report:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500 animate-pulse">กำลังดึงข้อมูลผลการดำเนินงาน...</p></div>;
    if (!data) return <div className="p-8 text-center text-red-500">ไม่สามารถโหลดข้อมูลได้</div>;

    return (
        <div className="space-y-10 animate-fadeIn">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">รายงานผลการดำเนินงาน</h1>
                    <p className="text-slate-600 mt-2 text-lg font-medium">วิเคราะห์ประสิทธิภาพการให้บริการและความพร้อมของทรัพยากรในระบบ</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        ส่งออกรายงาน
                    </button>
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                        พิมพ์สรุป
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="อัตราการทำงานสำเร็จ"
                    value={data.stats.efficiency || 0}
                    unit="%"
                    color="emerald"
                    icon={<EfficiencyIcon />}
                    trend={{ value: '', isUp: true }}
                />
                <KPICard
                    title="ระยะทางเฉลี่ยต่อเที่ยว"
                    value={data.stats.avgDistance || 0}
                    unit="กม."
                    color="blue"
                    icon={<HistoryIcon />}
                    trend={{ value: '', isUp: true }}
                />
                <KPICard
                    title="จำนวนคนขับทั้งหมด"
                    value={data.stats.totalDrivers || 0}
                    unit="คน"
                    color="indigo"
                    icon={<TruckIcon />}
                    trend={{ value: '', isUp: true }}
                />
                <KPICard
                    title="จำนวนเที่ยววิ่งสะสม"
                    value={data.stats.totalRides || 0}
                    unit="เที่ยว"
                    color="orange"
                    icon={<HistoryIcon />}
                    trend={{ value: `${data.stats.ridesTrend ?? 0}%`, isUp: (data.stats.ridesTrend ?? 0) >= 0 }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">แนวโน้มการปฏิบัติงานรายเดือน</h3>
                            <p className="text-gray-400 text-sm mt-1">เปรียบเทียบจำนวนงานสะสมและการตอบสนอง</p>
                        </div>
                        <select className="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2">
                            <option>6 เดือนล่าสุด</option>
                            <option>1 ปีล่าสุด</option>
                        </select>
                    </div>
                    <div className="h-[400px]">
                        <BarChart data={data.monthlyRideData} />
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[2rem] p-10 text-white overflow-hidden relative group flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-8">บทสรุปผู้บริหาร</h3>
                        <div className="space-y-8">
                            <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                                <p className="text-xs font-black text-blue-300 uppercase tracking-wider mb-2">คุณภาพบริการ</p>
                                <p className="text-sm font-medium leading-relaxed">
                                    การปฏิบัติงานโดยรวมอยู่ในเกณฑ์ <span className="text-emerald-400 font-bold">ดีมาก</span> ความเร็วในการตอบสนองคงที่แม้ปริมาณงานจะเพิ่มขึ้น 12% ในเดือนที่ผ่านมา
                                </p>
                            </div>
                            <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                                <p className="text-xs font-black text-blue-300 uppercase tracking-wider mb-2">สถานภาพยานพาหนะ</p>
                                <p className="text-sm font-medium leading-relaxed">
                                    ยานพาหนะ 18 คันมีความพร้อมใช้งาน 100% มี 2 คันอยู่ระหว่างซ่อมบำรุงตามรอบปกติ ไม่ส่งผลกระทบต่อภารกิจหลัก
                                </p>
                            </div>
                            <button className="w-full py-5 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 mt-4">
                                ดูรายงานฉบับเต็ม
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationalReportPage;
