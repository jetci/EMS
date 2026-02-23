import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import DonutChart from '../components/charts/DonutChart';
import HorizontalBarChart from '../components/charts/HorizontalBarChart';
import UsersIcon from '../components/icons/UsersIcon';
import KPICard from '../components/executive/KPICard';

const AGE_BUCKETS = [
    { label: '0-15 ปี', min: 0, max: 15, color: '#3B82F6' },
    { label: '16-40 ปี', min: 16, max: 40, color: '#6366F1' },
    { label: '41-60 ปี', min: 41, max: 60, color: '#10B981' },
    { label: '60+ ปี', min: 61, max: 200, color: '#F59E0B' },
];

const DemographicsReportPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [demographics, setDemographics] = useState<{
        ageDistribution: { label: string; value: number; color: string }[];
        chronicDiseases: { label: string; value: number }[];
        avgAge: number;
        bedriddenPercent: number;
        serviceCoveragePercent: number;
    } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [dashboardRes, patientsRes] = await Promise.all([
                    apiRequest('/dashboard/executive'),
                    apiRequest('/patients')
                ]);

                const patients: any[] = Array.isArray(patientsRes?.data || patientsRes) ? (patientsRes.data || patientsRes) : [];

                let totalAge = 0;
                let ageCount = 0;
                const ageBucketsCount: Record<string, number> = {};
                AGE_BUCKETS.forEach(b => { ageBucketsCount[b.label] = 0; });

                const diseaseCounts: Record<string, number> = {};
                let bedriddenCount = 0;

                patients.forEach(p => {
                    const age = typeof p.age === 'number' ? p.age : parseInt(p.age || '0', 10);
                    if (!isNaN(age) && age > 0) {
                        totalAge += age;
                        ageCount += 1;
                        const bucket = AGE_BUCKETS.find(b => age >= b.min && age <= b.max);
                        if (bucket) {
                            ageBucketsCount[bucket.label] += 1;
                        }
                    }

                    const chronic = p.chronicDiseases || p.chronic_diseases;
                    let chronicList: string[] = [];
                    if (Array.isArray(chronic)) {
                        chronicList = chronic;
                    } else if (typeof chronic === 'string' && chronic.trim()) {
                        try {
                            const parsed = JSON.parse(chronic);
                            if (Array.isArray(parsed)) {
                                chronicList = parsed;
                            }
                        } catch {
                            chronicList = [chronic];
                        }
                    }

                    chronicList.forEach((d: string) => {
                        const key = d.trim();
                        if (!key) return;
                        diseaseCounts[key] = (diseaseCounts[key] || 0) + 1;
                        if (key.includes('ติดเตียง')) {
                            bedriddenCount += 1;
                        }
                    });
                });

                const totalPatients = patients.length || dashboardRes.stats?.totalPatients || 0;
                const avgAge = ageCount > 0 ? Math.round(totalAge / ageCount) : 0;

                const ageDistribution = AGE_BUCKETS.map(b => ({
                    label: b.label,
                    value: ageBucketsCount[b.label] || 0,
                    color: b.color
                }));

                const rawChronicDiseases = Object.keys(diseaseCounts).map(label => ({
                    label,
                    value: diseaseCounts[label]
                }));

                rawChronicDiseases.sort((a, b) => b.value - a.value);

                const looksLikeHash = (label: string) => {
                    const compact = label.replace(/\s+/g, '');
                    if (compact.length < 12) return false;
                    return /^[0-9A-Fa-f-]+$/.test(compact);
                };

                const cleaned: { label: string; value: number }[] = [];
                let othersCount = 0;

                rawChronicDiseases.forEach(item => {
                    if (looksLikeHash(item.label)) {
                        othersCount += item.value;
                    } else {
                        cleaned.push(item);
                    }
                });

                cleaned.sort((a, b) => b.value - a.value);

                const MAX_ITEMS = 7;
                let chronicDiseases: { label: string; value: number }[] = [];

                if (cleaned.length > MAX_ITEMS) {
                    const top = cleaned.slice(0, MAX_ITEMS);
                    const rest = cleaned.slice(MAX_ITEMS);
                    const restTotal = rest.reduce((sum, item) => sum + item.value, 0) + othersCount;
                    chronicDiseases = restTotal > 0 ? [...top, { label: 'อื่นๆ', value: restTotal }] : top;
                } else {
                    chronicDiseases = [...cleaned];
                    if (othersCount > 0) {
                        chronicDiseases.push({ label: 'อื่นๆ', value: othersCount });
                    }
                }

                const bedriddenPercent = totalPatients > 0 ? Math.round((bedriddenCount / totalPatients) * 100) : 0;

                const serviceCoveragePercent =
                    dashboardRes.stats && dashboardRes.stats.totalRides && totalPatients
                        ? Math.min(100, Math.round((dashboardRes.stats.totalRides / totalPatients) * 100))
                        : 0;

                setData(dashboardRes);
                setDemographics({
                    ageDistribution,
                    chronicDiseases,
                    avgAge,
                    bedriddenPercent,
                    serviceCoveragePercent
                });
            } catch (err) {
                console.error('Failed to load demographics report:', err);
                setData(null);
                setDemographics(null);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500 animate-pulse">กำลังวิเคราะห์ข้อมูลประชากร...</p></div>;
    if (!data || !demographics) return <div className="p-8 text-center text-red-500">ไม่สามารถโหลดข้อมูลได้</div>;

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
                    trend={{ value: '', isUp: true }}
                />
                <KPICard
                    title="อายุเฉลี่ย"
                    value={demographics.avgAge || 0}
                    unit="ปี"
                    color="orange"
                    icon={<UsersIcon />}
                    trend={{ value: '', isUp: true }}
                />
                <KPICard
                    title="ผู้ป่วยกลุ่มติดเตียง"
                    value={demographics.bedriddenPercent || 0}
                    unit="%"
                    color="red"
                    icon={<UsersIcon />}
                    trend={{ value: '', isUp: true }}
                />
                <KPICard
                    title="อัตราการเข้าถึงบริการ"
                    value={demographics.serviceCoveragePercent || 0}
                    unit="%"
                    color="emerald"
                    icon={<UsersIcon />}
                    trend={{ value: '', isUp: true }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200">
                    <h3 className="text-2xl font-black text-gray-900 mb-8">สัดส่วนตามกลุ่มอายุ</h3>
                    <div className="h-[400px]">
                        <DonutChart data={demographics.ageDistribution} />
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200">
                    <h3 className="text-2xl font-black text-gray-900 mb-8">สถิติโรคประจำตัว</h3>
                    <div className="max-h-[420px] overflow-y-auto pr-1">
                        <HorizontalBarChart data={demographics.chronicDiseases} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemographicsReportPage;
