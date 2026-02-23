import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import DonutChart from '../components/charts/DonutChart';
import TagIcon from '../components/icons/TagIcon';
import KPICard from '../components/executive/KPICard';

const FinancialReportPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const res = await apiRequest('/dashboard/executive');
                setData(res);
            } catch (err) {
                console.error('Failed to load financial report:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500 animate-pulse">กำลังประมวลผลข้อมูลการเงิน...</p></div>;
    if (!data) return <div className="p-8 text-center text-red-500">ไม่สามารถโหลดข้อมูลได้</div>;

    const avgCostPerRide = 0;
    const estimatedTotal = 0;

    return (
        <div className="space-y-10 animate-fadeIn">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">รายงานสถานะการเงิน</h1>
                    <p className="text-slate-600 mt-2 text-lg font-medium">รายงานจำนวนเที่ยววิ่งและสัดส่วนประเภทบริการจากข้อมูลจริง</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="จำนวนเที่ยววิ่งทั้งหมด"
                    value={data.stats.totalRides || 0}
                    unit="เที่ยว"
                    color="emerald"
                    icon={<TagIcon />}
                    trend={{ value: '', isUp: true }}
                />
                <KPICard
                    title="จำนวนผู้ป่วยทั้งหมด"
                    value={data.stats.totalPatients || 0}
                    unit="คน"
                    color="blue"
                    icon={<TagIcon />}
                    trend={{ value: '', isUp: true }}
                />
                <KPICard
                    title="ค่าเฉลี่ยต่อเที่ยว (ยังไม่กำหนด)"
                    value={avgCostPerRide}
                    unit="บาท"
                    color="indigo"
                    icon={<TagIcon />}
                    trend={{ value: '', isUp: true }}
                />
                <KPICard
                    title="มูลค่ารวมโดยประมาณ (ยังไม่กำหนด)"
                    value={estimatedTotal}
                    unit="บาท"
                    color="orange"
                    icon={<TagIcon />}
                    trend={{ value: '', isUp: true }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200">
                    <h3 className="text-2xl font-black text-gray-900 mb-8">สัดส่วนจำนวนเที่ยววิ่งตามประเภทบริการ</h3>
                    <div className="h-[400px]">
                        <DonutChart data={data.topTripTypesData} />
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xl font-black text-gray-900">คำอธิบายข้อมูล</h4>
                            <p className="text-slate-500 text-sm mt-2 font-medium">
                                หน้านี้แสดงจำนวนเที่ยววิ่งรวม ผู้ป่วยทั้งหมด และสัดส่วนตามประเภทบริการโดยอิงจากข้อมูล rides จริงในระบบ
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">แหล่งข้อมูล</p>
                            <p className="text-sm font-medium text-gray-700">
                                /api/dashboard/executive (rides, patients, trip_type) — ยังไม่คำนวณต้นทุนทางการเงินจริง
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialReportPage;
