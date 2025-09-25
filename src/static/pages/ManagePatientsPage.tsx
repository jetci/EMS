import React, { useState, useMemo } from 'react';
import { Patient, CommunityView } from '../types';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import SearchIcon from '../components/icons/SearchIcon';
import EyeIcon from '../components/icons/EyeIcon';
import TrashIcon from '../components/icons/TrashIcon';
import RidesIcon from '../components/icons/RidesIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import UsersIcon from '../components/icons/UsersIcon';
import { formatDateToThai } from '../utils/dateUtils';

// FIX: Expanded mock patient data to fully conform to the Patient interface.
const mockPatients: Patient[] = [
    { 
        id: 'PAT-001', 
        fullName: 'สมชาย ใจดี', 
        age: 72, 
        keyInfo: 'โรคเบาหวาน, ความดันสูง', 
        registeredDate: '2023-01-15T10:00:00Z',
        registeredBy: 'Community A', 
        title: 'นาย',
        gender: 'ชาย',
        nationalId: '1234567890123',
        dob: '1952-01-15',
        patientTypes: ['ผู้สูงอายุ', 'ผู้ป่วยภาวะพึงพิง'],
        bloodType: 'A',
        rhFactor: 'Rh+',
        healthCoverage: 'สิทธิบัตรทอง (UC)',
        chronicDiseases: ['เบาหวาน', 'ความดันสูง'],
        allergies: ['ไม่มี'],
        contactPhone: '081-111-2222',
        idCardAddress: { houseNumber: '123', village: 'หมู่ 1 บ้านหนองตุ้ม', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        currentAddress: { houseNumber: '123', village: 'หมู่ 1 บ้านหนองตุ้ม', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        landmark: 'ใกล้ตลาด',
        latitude: '19.9213',
        longitude: '99.2131',
        attachments: [],
    },
    { 
        id: 'PAT-002', 
        fullName: 'สมหญิง มีสุข', 
        age: 68, 
        keyInfo: 'ผู้ป่วยติดเตียง', 
        registeredDate: '2023-02-20T11:00:00Z',
        registeredBy: 'Community B',
        title: 'นาง',
        gender: 'หญิง',
        nationalId: '2345678901234',
        dob: '1956-02-20',
        patientTypes: ['ผู้ป่วยติดเตียง'],
        bloodType: 'B',
        rhFactor: 'Rh+',
        healthCoverage: 'ประกันสังคม',
        chronicDiseases: ['ผู้ป่วยติดเตียง'],
        allergies: ['เพนนิซิลลิน'],
        contactPhone: '082-222-3333',
        idCardAddress: { houseNumber: '456', village: 'หมู่ 2 ป่าบง', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        currentAddress: { houseNumber: '456', village: 'หมู่ 2 ป่าบง', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        landmark: '',
        latitude: '19.9250',
        longitude: '99.2100',
        attachments: [],
        caregiverName: 'สมศักดิ์ มีสุข',
        caregiverPhone: '089-999-9999',
    },
    { 
        id: 'PAT-003', 
        fullName: 'อาทิตย์ แจ่มใส', 
        age: 80, 
        keyInfo: 'โรคหัวใจ', 
        registeredDate: '2023-03-10T14:00:00Z',
        registeredBy: 'Community A',
        title: 'นาย',
        gender: 'ชาย',
        nationalId: '3456789012345',
        dob: '1944-03-10',
        patientTypes: ['ผู้สูงอายุ'],
        bloodType: 'O',
        rhFactor: 'Rh+',
        healthCoverage: 'ข้าราชการ',
        chronicDiseases: ['โรคหัวใจ'],
        allergies: ['ไม่มี'],
        contactPhone: '083-333-4444',
        idCardAddress: { houseNumber: '789', village: 'หมู่ 3 เต๋าดิน, เวียงสุทโธ', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        currentAddress: { houseNumber: '789', village: 'หมู่ 3 เต๋าดิน, เวียงสุทโธ', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        landmark: '',
        latitude: '19.9111',
        longitude: '99.2222',
        attachments: [],
    },
    { 
        id: 'PAT-004', 
        fullName: 'จันทรา งามวงศ์วาน', 
        age: 75, 
        keyInfo: 'ต้องใช้วีลแชร์', 
        registeredDate: '2023-04-05T16:00:00Z',
        registeredBy: 'Community C',
        title: 'นาง',
        gender: 'หญิง',
        nationalId: '4567890123456',
        dob: '1949-04-05',
        patientTypes: ['ผู้สูงอายุ', 'ผู้พิการ'],
        bloodType: 'AB',
        rhFactor: 'Rh-',
        healthCoverage: 'สิทธิบัตรทอง (UC)',
        chronicDiseases: ['ข้อเข่าเสื่อม'],
        allergies: ['ซัลฟา'],
        contactPhone: '084-444-5555',
        idCardAddress: { houseNumber: '101', village: 'หมู่ 4 สวนดอก', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        currentAddress: { houseNumber: '101', village: 'หมู่ 4 สวนดอก', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        landmark: '',
        latitude: '19.9333',
        longitude: '99.2000',
        attachments: [],
    },
    { 
        id: 'PAT-005', 
        fullName: 'มานี รักเรียน', 
        age: 65, 
        keyInfo: 'ฟอกไต', 
        registeredDate: '2023-05-21T09:00:00Z',
        registeredBy: 'Community B',
        title: 'นางสาว',
        gender: 'หญิง',
        nationalId: '5678901234567',
        dob: '1959-05-21',
        patientTypes: ['ผู้ป่วยโรคไต'],
        bloodType: 'O',
        rhFactor: 'Rh+',
        healthCoverage: 'สิทธิบัตรทอง (UC)',
        chronicDiseases: ['โรคไตเรื้อรัง'],
        allergies: ['ไม่มี'],
        contactPhone: '085-555-6666',
        idCardAddress: { houseNumber: '222', village: 'หมู่ 5 ต้นหนุน', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        currentAddress: { houseNumber: '222', village: 'หมู่ 5 ต้นหนุน', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        landmark: '',
        latitude: '19.9000',
        longitude: '99.2333',
        attachments: [],
    },
    { 
        id: 'PAT-006', 
        fullName: 'ปิติ ชูใจ', 
        age: 78, 
        keyInfo: 'ไม่มีโรคประจำตัว', 
        registeredDate: '2023-06-11T13:00:00Z',
        registeredBy: 'Community A',
        title: 'นาย',
        gender: 'ชาย',
        nationalId: '6789012345678',
        dob: '1946-06-11',
        patientTypes: ['ผู้สูงอายุ'],
        bloodType: 'A',
        rhFactor: 'Rh+',
        healthCoverage: 'ชำระเงินเอง',
        chronicDiseases: [],
        allergies: ['ไม่มี'],
        contactPhone: '086-666-7777',
        idCardAddress: { houseNumber: '333', village: 'หมู่ 6 สันทรายคองน้อย', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        currentAddress: { houseNumber: '333', village: 'หมู่ 6 สันทรายคองน้อย', tambon: 'เวียง', amphoe: 'ฝาง', changwat: 'เชียงใหม่' },
        landmark: '',
        latitude: '19.9444',
        longitude: '99.2111',
        attachments: [],
    },
];

const ITEMS_PER_PAGE = 5;

interface ManagePatientsPageProps {
    setActiveView: (view: CommunityView, context?: any) => void;
}

const ManagePatientsPage: React.FC<ManagePatientsPageProps> = ({ setActiveView }) => {
  const [patients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (patients.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-[60vh]">
            <UsersIcon className="w-24 h-24 text-gray-300" />
            <h2 className="mt-6 text-2xl font-semibold text-gray-700">ยังไม่มีผู้ป่วยในความดูแลของคุณ</h2>
            <p className="mt-2 text-gray-500">เริ่มต้นด้วยการเพิ่มข้อมูลผู้ป่วยคนแรกของคุณ</p>
            <button
                onClick={() => setActiveView('register_patient')}
                className="mt-6 flex items-center justify-center px-5 py-3 font-medium text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-800 transition-colors"
            >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                ลงทะเบียนผู้ป่วยคนแรก
            </button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">จัดการผู้ป่วย</h1>
            <p className="mt-1 text-[var(--text-secondary)]">ดู แก้ไข และจัดการข้อมูลผู้ป่วยในความดูแลของคุณ</p>
        </div>
        <button 
            onClick={() => setActiveView('register_patient')}
            className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          <span>ลงทะเบียนผู้ป่วยใหม่</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--border-color)]">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[var(--border-color)]">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-[var(--text-secondary)]">
                <thead className="text-xs text-[var(--text-primary)] uppercase bg-gray-50/75">
                    <tr>
                        <th scope="col" className="px-6 py-4 font-semibold">ชื่อ-นามสกุล</th>
                        <th scope="col" className="px-6 py-4 font-semibold">อายุ</th>
                        <th scope="col" className="px-6 py-4 font-semibold">ข้อมูลสำคัญ</th>
                        <th scope="col" className="px-6 py-4 font-semibold">วันที่ลงทะเบียน</th>
                        <th scope="col" className="px-6 py-4 font-semibold text-center">การดำเนินการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                    {paginatedPatients.map(patient => (
                        <tr key={patient.id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4 font-medium text-[var(--text-primary)] whitespace-nowrap">{patient.fullName}</td>
                            <td className="px-6 py-4">{patient.age}</td>
                            <td className="px-6 py-4 max-w-xs truncate">{patient.keyInfo}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatDateToThai(patient.registeredDate)}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center space-x-2">
                                    <button onClick={() => setActiveView('patient_detail', { patientId: patient.id })} className="p-2 rounded-full hover:bg-blue-100 text-blue-600" title="ดูรายละเอียด"><EyeIcon className="w-5 h-5" /></button>
                                    <button className="p-2 rounded-full hover:bg-red-100 text-red-600" title="ลบ"><TrashIcon className="w-5 h-5" /></button>
                                    <button onClick={() => setActiveView('request_ride', { patientId: patient.id })} className="p-2 rounded-full hover:bg-green-100 text-green-600" title="ร้องขอการเดินทาง"><RidesIcon className="w-5 h-5" /></button>
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
        <span className="text-sm text-[var(--text-secondary)]">
          หน้า {currentPage} จาก {totalPages}
        </span>
        <div className="inline-flex items-center space-x-2">
            <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRightIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ManagePatientsPage;