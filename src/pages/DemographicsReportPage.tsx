import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import DonutChart from '../components/charts/DonutChart';
import HorizontalBarChart from '../components/charts/HorizontalBarChart';
import UsersIcon from '../components/icons/UsersIcon';
import KPICard from '../components/executive/KPICard';

const DemographicsReportPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const res = await apiRequest('/dashboard/executive');
                setData(res);
            } catch (err) {
                console.error('Failed to load demographics report:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500 animate-pulse">กำลังวิเคราะห์ข้อมูลประชากร...</p></div>;
    if (!data) return <div className="p-8 text-center text-red-500">ไม่สามารถโหลดข้อมูลได้</div>;

    const chronicDiseasesData = [
        { name: 'เบาหวาน', value: 45 },
        { name: 'ความดันโลหิตสูง', value: 62 },
        { name: 'โรคหัวใจ', value: 18 },
        { name: 'โรคไต', value: 12 },
        { name: 'อื่นๆ', value: 15 },
    ];

    const ageDistributionData = [
        { name: '0-15 ปี', value: 5 },
        { name: '16-40 ปี', value: 12 },
        { name: '41-60 ปี', value: 28 },
        { name: '60+ ปี', value: 55 },
    ];

    return (
        <div className="space-y-10 animate-fadeIn">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">ข้อมูลประชากรผู้ป่วย</h1>
                    <p className="text-slate-600 mt-2 text-lg font-medium">ทำความเข้าใจโปรไฟล์ผู้รับบริการเพื่อการออกแบบนโยบายสุขภาพเชิงรุก</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="จำนวนผู้ป่วยในระบบ"
                    value={data.stats.totalPatients || 0}
                    unit="คน"
                    color="blue"
                    icon={<UsersIcon />}
                    trend={{ value: '8.2%', isUp: true }}
                />
                <KPICard
                    title="อายุเฉลี่ย"
                    value="68"
                    unit="ปี"
                    color="orange"
                    icon={<UsersIcon />}
                    trend={{ value: 'Elderly focus', isUp: true }} // Using isUp true for neutral/informative
                />
                <KPICard
                    title="ผู้ป่วยกลุ่มติดเตียง"
                    value="12"
                    unit="%"
                    color="red"
                    icon={<UsersIcon />}
                    trend={{ value: '2 Cases', isUp: true }} // Increase in bedridden might be 'bad' contextually but 'up' numerically. Keeping generic.
                />
                <KPICard
                    title="อัตราการเข้าถึงบริการ"
                    value="94"
                    unit="%"
                    color="emerald"
                    icon={<UsersIcon />}
                    trend={{ value: '3.1%', isUp: true }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200">
                    <h3 className="text-2xl font-black text-gray-900 mb-8">สัดส่วนตามกลุ่มอายุ</h3>
                    <div className="h-[400px]">
                        <DonutChart data={ageDistributionData} />
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200">
                    <h3 className="text-2xl font-black text-gray-900 mb-8">สถิติโรคประจำตัว</h3>
                    <div className="h-[400px]">
                        <HorizontalBarChart data={chronicDiseasesData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemographicsReportPage;
