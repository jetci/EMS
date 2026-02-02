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

    return (
        <div className="space-y-10 animate-fadeIn">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">รายงานสถานะการเงิน</h1>
                    <p className="text-slate-600 mt-2 text-lg font-medium">ติดตามความคุ้มค่าเชิงงบประมาณและมูลค่าทางสังคมจากการให้บริการ</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="มูลค่าบริการรวม"
                    value={(data.stats.totalRides * 450).toLocaleString()}
                    unit="บาท"
                    color="emerald"
                    icon={<TagIcon />}
                    trend={{ value: 'ประมาณการ', isUp: true }}
                />
                <KPICard
                    title="ค่าเฉลี่ยต่อเที่ยววิ่ง"
                    value="450"
                    unit="บาท"
                    color="blue"
                    icon={<TagIcon />}
                    trend={{ value: 'คงที่', isUp: true }}
                />
                <KPICard
                    title="ประหยัดงบประมาณ"
                    value="15,400"
                    unit="บาท"
                    color="indigo"
                    icon={<TagIcon />}
                    trend={{ value: '5.4%', isUp: true }}
                />
                <KPICard
                    title="ความคุ้มค่าเชิงสังคม (SROI)"
                    value="3.8"
                    unit="Rate"
                    color="orange"
                    icon={<TagIcon />}
                    trend={{ value: '1.2', isUp: true }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200">
                    <h3 className="text-2xl font-black text-gray-900 mb-8">สัดส่วนมูลค่าตามประเภทบริการ</h3>
                    <div className="h-[400px]">
                        <DonutChart data={data.topTripTypesData} />
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="space-y-10">
                        <div>
                            <h4 className="text-xl font-black text-gray-900">การวิเคราะห์ความคุ้มค่า</h4>
                            <p className="text-slate-500 text-sm mt-2 font-medium">ระบบคำนวณมูลค่าทางตรงจากการลดภาระค่าใช้จ่ายในการเดินทางของผู้ป่วยและครอบครัว</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">ลดภาระผู้ป่วย</p>
                                <p className="text-3xl font-black text-gray-900">45k</p>
                            </div>
                            <div className="p-8 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-200">
                                <p className="text-xs font-black text-blue-100 uppercase tracking-wider mb-2">มูลค่าโครงการ</p>
                                <p className="text-3xl font-black">1.2M</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialReportPage;
