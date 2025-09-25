import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Patient } from '../types';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import SearchIcon from '../components/icons/SearchIcon';
import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import RidesIcon from '../components/icons/RidesIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import EditPatientModal from '../components/modals/EditPatientModal';
import { formatDateToThai } from '../utils/dateUtils';
import ThaiDatePicker from '../components/ui/ThaiDatePicker';
import StatCard from '../components/dashboard/StatCard';
import UsersIcon from '../components/icons/UsersIcon';
import BedIcon from '../components/icons/BedIcon';
import PrintIcon from '../components/icons/PrintIcon';

dayjs.extend(isSameOrBefore);


const mockPatients: Patient[] = [
  { 
    id: 'PAT-001', fullName: 'สมชาย ใจดี', age: 72, keyInfo: 'โรคเบาหวาน, ความดันสูง', registeredDate: '2023-01-15T10:00:00Z', registeredBy: 'น.ส.มานี มีนา', 
    dob: '1952-03-10', contactPhone: '081-111-1111', chronicDiseases: ['เบาหวาน', 'ความดัน'], allergies: ['ไม่มี'], 
    currentAddress: { houseNumber: '123', village: 'หมู่ 1 บ้านหนองตุ้ม', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
    idCardAddress: { houseNumber: '123', village: 'หมู่ 1 บ้านหนองตุ้ม', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
    landmark: 'ใกล้ตลาดสด', latitude: '19.9213', longitude: '99.2131', title: 'นาย', gender: 'ชาย', nationalId: '1234567890123',
    patientTypes: ['ผู้ป่วยภาวะพึงพิง'], bloodType: 'A', rhFactor: 'Rh+', healthCoverage: 'สิทธิบัตรทอง (UC)', attachments: []
  },
  { 
    id: 'PAT-002', fullName: 'สมหญิง มีสุข', age: 68, keyInfo: 'ผู้ป่วยติดเตียง', registeredDate: '2023-02-20T11:00:00Z', registeredBy: 'นายปิติ ชูใจ', 
    dob: '1956-07-22', contactPhone: '082-222-2222', chronicDiseases: ['ผู้ป่วยติดเตียง'], allergies: ['เพนนิซิลลิน'], 
    caregiverName: 'สมศักดิ์ มีสุข', caregiverPhone: '089-999-9999', 
    currentAddress: { houseNumber: '456', village: 'หมู่ 2 ป่าบง', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
    idCardAddress: { houseNumber: '456', village: 'หมู่ 2 ป่าบง', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
    landmark: '', latitude: '19.9213', longitude: '99.2131', title: 'นาง', gender: 'หญิง', nationalId: '2345678901234',
    patientTypes: ['ผู้ป่วยติดเตียง', 'ผู้ป่วยยากไร้'], bloodType: 'O', rhFactor: 'Rh+', healthCoverage: 'ประกันสังคม', attachments: []
  },
   { 
    id: 'PAT-003', fullName: 'อาทิตย์ แจ่มใส', age: 80, keyInfo: 'โรคหัวใจ', registeredDate: '2023-03-10T14:00:00Z', registeredBy: 'นางสาวสมศรี ใจดี', 
    dob: '1944-03-10', contactPhone: '083-333-4444', chronicDiseases: ['โรคหัวใจ'], allergies: ['ไม่มี'], 
    currentAddress: { houseNumber: '789', village: 'หมู่ 3 เต๋าดิน, เวียงสุทโธ', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
    idCardAddress: { houseNumber: '789', village: 'หมู่ 3 เต๋าดิน, เวียงสุทโธ', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
    landmark: '', latitude: '19.9111', longitude: '99.2222', title: 'นาย', gender: 'ชาย', nationalId: '3456789012345',
    patientTypes: ['ผู้สูงอายุ'], bloodType: 'O', rhFactor: 'Rh+', healthCoverage: 'ข้าราชการ', attachments: []
  },
  { 
    id: 'PAT-004', fullName: 'จันทรา งามวงศ์วาน', age: 75, keyInfo: 'ต้องใช้วีลแชร์', registeredDate: '2023-04-05T16:00:00Z', registeredBy: 'น.ส.มานี มีนา', 
    dob: '1949-04-05', contactPhone: '084-444-5555', chronicDiseases: ['ข้อเข่าเสื่อม'], allergies: ['ซัลฟา'], 
    currentAddress: { houseNumber: '101', village: 'หมู่ 4 สวนดอก', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
    idCardAddress: { houseNumber: '101', village: 'หมู่ 4 สวนดอก', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
    landmark: '', latitude: '19.9333', longitude: '99.2000', title: 'นาง', gender: 'หญิง', nationalId: '4567890123456',
    patientTypes: ['ผู้สูงอายุ', 'ผู้พิการ'], bloodType: 'AB', rhFactor: 'Rh-', healthCoverage: 'สิทธิบัตรทอง (UC)', attachments: []
  },
];


const ITEMS_PER_PAGE = 10;

const OfficeManagePatientsPage: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>(mockPatients);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ registeredBy: 'All', village: 'All', healthCoverage: 'All', startDate: '', endDate: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const stats = useMemo(() => {
        const total = patients.length;
        const newThisMonth = patients.filter(p => dayjs(p.registeredDate).isSame(dayjs(), 'month')).length;
        const bedridden = patients.filter(p => p.patientTypes.includes('ผู้ป่วยติดเตียง')).length;
        return { total, newThisMonth, bedridden };
    }, [patients]);

    const uniqueRegistrars = useMemo(() => {
        const registrars = new Set(patients.map(p => p.registeredBy));
        return ['All', ...Array.from(registrars)];
    }, [patients]);
    
    const uniqueVillages = useMemo(() => {
        const villages = new Set(patients.map(p => p.currentAddress.village));
        return ['All', ...Array.from(villages)];
    }, [patients]);

    const uniqueHealthCoverages = useMemo(() => {
        const coverages = new Set(patients.map(p => p.healthCoverage));
        return ['All', ...Array.from(coverages)];
    }, [patients]);


    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFilters(f => ({ ...f, [name]: value }));
    };

    const filteredPatients = useMemo(() => {
        return patients.filter(p => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = p.fullName.toLowerCase().includes(searchLower) || p.id.toLowerCase().includes(searchLower);
            const matchesRegisteredBy = filters.registeredBy === 'All' || p.registeredBy === filters.registeredBy;
            const matchesVillage = filters.village === 'All' || p.currentAddress.village === filters.village;
            const matchesHealthCoverage = filters.healthCoverage === 'All' || p.healthCoverage === filters.healthCoverage;
            
            let matchesDate = true;
            if (filters.startDate && filters.endDate) {
                const regDate = dayjs(p.registeredDate);
                matchesDate = regDate.isAfter(dayjs(filters.startDate).subtract(1, 'day')) && regDate.isBefore(dayjs(filters.endDate).add(1, 'day'));
            }

            return matchesSearch && matchesRegisteredBy && matchesVillage && matchesHealthCoverage && matchesDate;
        });
    }, [patients, searchTerm, filters]);

    const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
    const paginatedPatients = filteredPatients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenEditModal = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleSavePatient = (updatedPatient: Patient) => {
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        setIsModalOpen(false);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilters({ registeredBy: 'All', village: 'All', healthCoverage: 'All', startDate: '', endDate: '' });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">จัดการข้อมูลผู้ป่วยทั้งหมด</h1>
                <button className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                    <UserPlusIcon className="w-5 h-5 mr-2" />
                    <span>ลงทะเบียนผู้ป่วยใหม่</span>
                </button>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="ผู้ป่วยทั้งหมด" value={stats.total.toString()} icon={UsersIcon} variant="default" />
                <StatCard title="ผู้ป่วยใหม่ (เดือนนี้)" value={stats.newThisMonth.toString()} icon={UserPlusIcon} variant="info" />
                <StatCard title="ผู้ป่วยติดเตียง" value={stats.bedridden.toString()} icon={BedIcon} variant="warning" />
            </div>

            {/* Advanced Filtering Toolbar */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">ค้นหา</label>
                        <input type="text" placeholder="ชื่อ, รหัสผู้ป่วย..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ชุมชน (ผู้ลงทะเบียน)</label>
                         <select name="registeredBy" value={filters.registeredBy} onChange={handleFilterChange}>
                           {uniqueRegistrars.map(r => (
                               <option key={r} value={r}>
                                   {r === 'All' ? 'ทั้งหมด' : r}
                               </option>
                           ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">หมู่บ้าน</label>
                        <select name="village" value={filters.village} onChange={handleFilterChange}>
                           {uniqueVillages.map(v => (
                               <option key={v} value={v}>
                                   {v === 'All' ? 'ทุกหมู่บ้าน' : v}
                               </option>
                           ))}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">สิทธิการรักษา</label>
                        <select name="healthCoverage" value={filters.healthCoverage} onChange={handleFilterChange}>
                           {uniqueHealthCoverages.map(hc => (
                               <option key={hc} value={hc}>
                                   {hc === 'All' ? 'ทุกสิทธิ' : hc}
                               </option>
                           ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1">ลงทะเบียน (จากวันที่)</label>
                        <ThaiDatePicker name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1">ลงทะเบียน (ถึงวันที่)</label>
                         <ThaiDatePicker name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                     <div className="flex items-end">
                        <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 font-medium py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                            <XCircleIcon className="w-5 h-5"/>
                            ล้างตัวกรอง
                        </button>
                    </div>
                 </div>
            </div>

             {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50/75">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Patient ID</th>
                                <th className="px-4 py-3 font-semibold">ชื่อ-นามสกุล</th>
                                <th className="px-4 py-3 font-semibold">ข้อมูลสำคัญ</th>
                                <th className="px-4 py-3 font-semibold">ลงทะเบียนโดย</th>
                                <th className="px-4 py-3 font-semibold">วันที่ลงทะเบียน</th>
                                <th className="px-4 py-3 font-semibold text-center">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedPatients.map(patient => (
                                <tr key={patient.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{patient.id}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{patient.fullName}<div className="text-xs text-gray-500 font-normal">อายุ {patient.age} ปี</div></td>
                                    <td className="px-4 py-3">{patient.keyInfo}</td>
                                    <td className="px-4 py-3">{patient.registeredBy}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{formatDateToThai(patient.registeredDate)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button onClick={() => handleOpenEditModal(patient)} className="p-2 rounded-full text-gray-400 hover:text-blue-600" title="ดู/แก้ไข"><EditIcon className="w-5 h-5" /></button>
                                            <button className="p-2 rounded-full text-gray-400 hover:text-red-600" title="ลบ"><TrashIcon className="w-5 h-5" /></button>
                                            <button className="p-2 rounded-full text-gray-400 hover:text-green-600" title="ร้องขอการเดินทาง"><RidesIcon className="w-5 h-5" /></button>
                                            <button className="p-2 rounded-full text-gray-400 hover:text-gray-800" title="พิมพ์บัตรข้อมูล"><PrintIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">ผลลัพธ์ {paginatedPatients.length} จาก {filteredPatients.length} รายการ</span>
                <div className="inline-flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} disabled={currentPage === 1} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <span className="text-sm font-semibold">หน้า {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} disabled={currentPage === totalPages} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronRightIcon className="w-5 h-5"/></button>
                </div>
            </div>

            {selectedPatient && <EditPatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} patient={selectedPatient} onSave={handleSavePatient} />}
        </div>
    );
};

export default OfficeManagePatientsPage;