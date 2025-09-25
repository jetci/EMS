import React, { useState } from 'react';
import ReportCard from '../components/reports/ReportCard';
import ThaiDatePicker from '../components/ui/ThaiDatePicker';
import MultiSelectAutocomplete from '../components/ui/MultiSelectAutocomplete';
import { mockDrivers, mockTeams } from '../data/mockData';
import WrenchIcon from '../components/icons/WrenchIcon';

const mockVillages = [
    "หมู่ 1 บ้านหนองตุ้ม", "หมู่ 2 ป่าบง", "หมู่ 3 เต๋าดิน, เวียงสุทโธ",
    "หมู่ 4 สวนดอก", "หมู่ 5 ต้นหนุน", "หมู่ 6 สันทรายคองน้อย",
    "หมู่ 7 แม่ใจใต้", "หมู่ 8 แม่ใจเหนือ", "หมู่ 9 ริมฝาง,สันป่าไหน่",
    "หมู่ 10 ห้วยเฮี่ยน,สันป่ายางยาง", "หมู่ 11 ท่าสะแล", "หมู่ 12 โป่งถืบ",
    "หมู่ 13 ห้วยบอน", "หมู่ 14 เสาหิน", "หมู่ 15 โป่งถืบใน",
    "หมู่ 16 ปางผึ้ง", "หมู่ 17 ใหม่คองน้อย", "หมู่ 18 ศรีดอนชัย",
    "หมู่ 19 ใหม่ชยาราม", "หมู่ 20 สระนิคม"
];

const OfficeReportsPage: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const [loadingReport, setLoadingReport] = useState<string | null>(null);

    // 1. Roster/Shift Report State
    const [rosterData, setRosterData] = useState({ startDate: '', endDate: '', teamId: 'all' });
    
    // 2. Personnel Report State
    const [personnelData, setPersonnelData] = useState({ startDate: '', endDate: '', driverId: 'all' });

    // 3. Maintenance Report State
    const [maintenanceStatus, setMaintenanceStatus] = useState('all');
    
    // 4. Patient Data Report State
    const [patientData, setPatientData] = useState({ startDate: '', endDate: '' });
    const [selectedVillages, setSelectedVillages] = useState<string[]>([]);
    
    const handleStateChange = (setter: React.Dispatch<React.SetStateAction<any>>, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
        setter((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleCreateReport = (reportName: string) => {
        setLoadingReport(reportName);
        console.log(`Generating report: ${reportName}`);
        setTimeout(() => {
            alert(`สร้าง "${reportName}" สำเร็จแล้ว`);
            setLoadingReport(null);
        }, 2000);
    };

    // Validation Logic
    const isRosterDisabled = !rosterData.startDate || !rosterData.endDate;
    const isPersonnelDisabled = !personnelData.startDate || !personnelData.endDate;
    const isPatientDataDisabled = !patientData.startDate || !patientData.endDate || selectedVillages.length === 0;

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">ศูนย์กลางรายงาน</h1>
                <p className="mt-1 text-gray-600">สร้างและดาวน์โหลดรายงานเชิงปฏิบัติการสำหรับการสรุปผลและวางแผนงาน</p>
            </div>

            {/* Report Generation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                {/* Card 1: Roster/Shift Report */}
                <ReportCard
                    title="1. รายงานเวร"
                    description="สรุปการปฏิบัติงานและตารางเวรของทีม"
                    actionButtonText="สร้างรายงาน (PDF)"
                    onActionClick={() => handleCreateReport('รายงานเวร')}
                    isLoading={loadingReport === 'รายงานเวร'}
                    disabled={isRosterDisabled}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ช่วงวันที่ *</label>
                            <div className="flex flex-col gap-2">
                                <ThaiDatePicker name="startDate" value={rosterData.startDate} onChange={(e) => handleStateChange(setRosterData, e)} max={today} />
                                <ThaiDatePicker name="endDate" value={rosterData.endDate} onChange={(e) => handleStateChange(setRosterData, e)} max={today} />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลือกทีม</label>
                            <select name="teamId" value={rosterData.teamId} onChange={(e) => handleStateChange(setRosterData, e)}>
                                <option value="all">ทุกทีม</option>
                                {mockTeams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </ReportCard>

                {/* Card 2: Personnel Report */}
                <ReportCard
                    title="2. รายงานข้อมูลบุคลากร"
                    description="ข้อมูลเชิงลึกของคนขับแต่ละคน"
                    actionButtonText="สร้างรายงาน (PDF)"
                    onActionClick={() => handleCreateReport('รายงานข้อมูลบุคลากร')}
                    isLoading={loadingReport === 'รายงานข้อมูลบุคลากร'}
                    disabled={isPersonnelDisabled}
                >
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ช่วงวันที่ *</label>
                            <div className="flex flex-col gap-2">
                                <ThaiDatePicker name="startDate" value={personnelData.startDate} onChange={(e) => handleStateChange(setPersonnelData, e)} max={today} />
                                <ThaiDatePicker name="endDate" value={personnelData.endDate} onChange={(e) => handleStateChange(setPersonnelData, e)} max={today} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลือกคนขับ</label>
                            <select name="driverId" value={personnelData.driverId} onChange={(e) => handleStateChange(setPersonnelData, e)}>
                                <option value="all">คนขับทั้งหมด</option>
                                {mockDrivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.fullName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </ReportCard>
                
                {/* Card 3: Vehicle Maintenance Report */}
                <ReportCard
                    title="3. รายงานซ่อมบำรุง"
                    description="ติดตามและวางแผนการนำรถเข้าตรวจสภาพตาม 'วันตรวจสภาพครั้งต่อไป'"
                    actionButtonText="สร้างรายงาน (Excel/CSV)"
                    icon={WrenchIcon}
                    onActionClick={() => handleCreateReport('รายงานซ่อมบำรุง')}
                    isLoading={loadingReport === 'รายงานซ่อมบำรุง'}
                    disabled={false} // This report has no required fields
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">กรองตามสถานะ</label>
                            <select value={maintenanceStatus} onChange={(e) => setMaintenanceStatus(e.target.value)}>
                                <option value="all">ทั้งหมด</option>
                                <option value="upcoming">ใกล้ถึงกำหนด</option>
                                <option value="overdue">เกินกำหนด</option>
                            </select>
                        </div>
                    </div>
                </ReportCard>
                
                {/* Card 4: Patient Data Report */}
                <ReportCard
                    title="4. รายงานข้อมูลผู้ป่วย"
                    description="ข้อมูลผู้ป่วยในเชิงสถิติเพื่อการวิเคราะห์"
                    actionButtonText="สร้างรายงาน (Excel/CSV)"
                    onActionClick={() => handleCreateReport('รายงานข้อมูลผู้ป่วย')}
                    isLoading={loadingReport === 'รายงานข้อมูลผู้ป่วย'}
                    disabled={isPatientDataDisabled}
                >
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ช่วงวันที่ลงทะเบียน *</label>
                            <div className="flex flex-col gap-2">
                                <ThaiDatePicker name="startDate" value={patientData.startDate} onChange={(e) => handleStateChange(setPatientData, e)} max={today} />
                                <ThaiDatePicker name="endDate" value={patientData.endDate} onChange={(e) => handleStateChange(setPatientData, e)} max={today} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลือกหมู่บ้าน *</label>
                            <MultiSelectAutocomplete 
                                options={mockVillages}
                                selectedItems={selectedVillages}
                                setSelectedItems={setSelectedVillages}
                                placeholder="เลือกหมู่บ้าน (อย่างน้อย 1)..."
                            />
                        </div>
                    </div>
                </ReportCard>
            </div>
             <p className="text-xs text-gray-500 mt-4">* จำเป็นต้องกรอกข้อมูล</p>
        </div>
    );
};

export default OfficeReportsPage;