import React, { useState, useMemo, useEffect } from 'react';
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
import { formatDateToThai } from '../utils/dateUtils';
import ModernDatePicker from '../components/ui/ModernDatePicker';
import StatCard from '../components/dashboard/StatCard';
import UsersIcon from '../components/icons/UsersIcon';
import BedIcon from '../components/icons/BedIcon';
import PrintIcon from '../components/icons/PrintIcon';
import { patientsAPI } from '../services/api';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

dayjs.extend(isSameOrBefore);

const ITEMS_PER_PAGE = 10;



interface OfficeManagePatientsPageProps {
    setActiveView?: (view: any, context?: any) => void;
}

const OfficeManagePatientsPage: React.FC<OfficeManagePatientsPageProps> = ({ setActiveView }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingRemote, setLoadingRemote] = useState<boolean>(false);
    const [remoteError, setRemoteError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const loadPatients = async () => {
        setLoadingRemote(true);
        setRemoteError(null);
        try {
            const response = await patientsAPI.getPatients();
            // Backward compatible: support both old (array) and new (object) formats
            const data = response?.data || response || [];
            const patientsData = Array.isArray(data) ? data : [];
            const normalizeAddress = (v: any) => {
                const fallback = { houseNumber: '', village: '', tambon: '', amphoe: '', changwat: '' };
                if (!v || typeof v !== 'object') return fallback;
                return {
                    houseNumber: v.houseNumber ?? v.house_number ?? fallback.houseNumber,
                    village: v.village ?? fallback.village,
                    tambon: v.tambon ?? fallback.tambon,
                    amphoe: v.amphoe ?? fallback.amphoe,
                    changwat: v.changwat ?? fallback.changwat,
                };
            };

            const coerceString = (v: any): string => (typeof v === 'string' ? v : (v == null ? '' : String(v)));
            const coerceArray = (v: any): any[] => (Array.isArray(v) ? v : []);
            const coerceKeyInfo = (v: any): string => {
                if (typeof v === 'string') return v;
                if (v && typeof v === 'object') {
                    if (typeof v.summary === 'string') return v.summary;
                    try { return JSON.stringify(v); } catch { }
                }
                return '';
            };

            const mapped: Patient[] = patientsData.map((p: any) => {
                const fullName = coerceString(p.fullName ?? p.full_name).trim();
                const dob = coerceString(p.dob ?? p.dateOfBirth ?? p.date_of_birth ?? '');
                const registeredDate = coerceString(p.registeredDate ?? p.registered_date ?? new Date().toISOString());

                const currentAddress =
                    p.currentAddress ? normalizeAddress(p.currentAddress)
                        : (p.current_address ? normalizeAddress(p.current_address) : normalizeAddress({
                            houseNumber: p.currentHouseNumber ?? p.current_house_number,
                            village: p.currentVillage ?? p.current_village,
                            tambon: p.currentTambon ?? p.current_tambon,
                            amphoe: p.currentAmphoe ?? p.current_amphoe,
                            changwat: p.currentChangwat ?? p.current_changwat,
                        }));

                const idCardAddress =
                    p.idCardAddress ? normalizeAddress(p.idCardAddress)
                        : (p.id_card_address ? normalizeAddress(p.id_card_address) : normalizeAddress({
                            houseNumber: p.idCardHouseNumber ?? p.id_card_house_number,
                            village: p.idCardVillage ?? p.id_card_village,
                            tambon: p.idCardTambon ?? p.id_card_tambon,
                            amphoe: p.idCardAmphoe ?? p.id_card_amphoe,
                            changwat: p.idCardChangwat ?? p.id_card_changwat,
                        }));

                return {
                    id: coerceString(p.id),
                    fullName,
                    profileImageUrl: p.profileImageUrl ?? p.profile_image_url ?? undefined,
                    title: coerceString(p.title ?? ''),
                    gender: coerceString(p.gender ?? ''),
                    nationalId: coerceString(p.nationalId ?? p.national_id ?? ''),
                    dob,
                    age: dob ? dayjs().diff(dayjs(dob), 'year') : 0,
                    patientTypes: coerceArray(p.patientTypes ?? p.patient_types),
                    bloodType: coerceString(p.bloodType ?? p.blood_type ?? ''),
                    rhFactor: coerceString(p.rhFactor ?? p.rh_factor ?? ''),
                    healthCoverage: coerceString(p.healthCoverage ?? p.health_coverage ?? ''),
                    chronicDiseases: coerceArray(p.chronicDiseases ?? p.chronic_diseases),
                    allergies: coerceArray(p.allergies),
                    contactPhone: coerceString(p.contactPhone ?? p.contact_phone ?? p.phone ?? ''),
                    idCardAddress,
                    currentAddress,
                    landmark: coerceString(p.landmark ?? ''),
                    latitude: coerceString(p.latitude ?? ''),
                    longitude: coerceString(p.longitude ?? ''),
                    attachments: coerceArray(p.attachments),
                    registeredDate,
                    registeredBy: coerceString(p.registeredBy ?? p.registered_by ?? p.createdBy ?? p.created_by ?? 'Unknown') || 'Unknown',
                    keyInfo: coerceKeyInfo(p.keyInfo ?? p.key_info),
                    caregiverName: coerceString(p.caregiverName ?? p.caregiver_name ?? '') || undefined,
                    caregiverPhone: coerceString(p.caregiverPhone ?? p.caregiver_phone ?? '') || undefined,
                    emergencyContactName: coerceString(p.emergencyContact?.name ?? p.emergencyContactName ?? p.emergency_contact_name ?? '') || undefined,
                    emergencyContactPhone: coerceString(p.emergencyContact?.phone ?? p.emergencyContactPhone ?? p.emergency_contact_phone ?? '') || undefined,
                    emergencyContactRelation: coerceString(p.emergencyContact?.relation ?? p.emergencyContactRelation ?? p.emergency_contact_relation ?? '') || undefined,
                };
            });
            setPatients(mapped);
        } catch (err: any) {
            setRemoteError(err?.message || 'Failed to load patients');
        } finally {
            setLoadingRemote(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [filters, setFilters] = useState({ registeredBy: 'All', village: 'All', healthCoverage: 'All', startDate: '', endDate: '' });
    const [currentPage, setCurrentPage] = useState(1);
    // Remove modal-related states after migrating to full-page edit view
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

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

    const totalPages = Math.max(1, Math.ceil(filteredPatients.length / ITEMS_PER_PAGE));
    const paginatedPatients = filteredPatients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters.registeredBy, filters.village, filters.healthCoverage, filters.startDate, filters.endDate]);

    useEffect(() => {
        setCurrentPage(p => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    const handleOpenEditModal = (patient: Patient) => {
        if (setActiveView) {
            setActiveView('edit_patient', { patientId: patient.id });
        }
    };



    const handleSavePatient = async (updatedPatient: Patient) => {
        try {
            const backendData = {
                fullName: updatedPatient.fullName,
                title: updatedPatient.title,
                gender: updatedPatient.gender,
                nationalId: updatedPatient.nationalId,
                dob: updatedPatient.dob,
                patientTypes: updatedPatient.patientTypes,
                bloodType: updatedPatient.bloodType,
                rhFactor: updatedPatient.rhFactor,
                healthCoverage: updatedPatient.healthCoverage,
                chronicDiseases: updatedPatient.chronicDiseases,
                allergies: updatedPatient.allergies,
                contactPhone: updatedPatient.contactPhone,
                emergencyContactName: updatedPatient.emergencyContactName,
                emergencyContactPhone: updatedPatient.emergencyContactPhone,
                emergencyContactRelation: updatedPatient.emergencyContactRelation,
                idCardAddress: updatedPatient.idCardAddress,
                currentAddress: updatedPatient.currentAddress,
                landmark: updatedPatient.landmark,
                latitude: updatedPatient.latitude,
                longitude: updatedPatient.longitude,
                attachments: updatedPatient.attachments,
                keyInfo: updatedPatient.keyInfo,
                caregiverName: updatedPatient.caregiverName,
                caregiverPhone: updatedPatient.caregiverPhone,
            };

            if (updatedPatient.id) {
                // Update
                await patientsAPI.updatePatient(updatedPatient.id, backendData);
                showToast('✅ บันทึกข้อมูลผู้ป่วยสำเร็จ');
            } else {
                // Create
                await patientsAPI.createPatient(backendData);
                showToast('✅ ลงทะเบียนผู้ป่วยใหม่สำเร็จ');
            }
            await loadPatients();
        } catch (error: any) {
            console.error('Failed to save patient:', error);
            showToast(`❌ เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const handleDeletePatient = async (id: string) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลผู้ป่วยรายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            return;
        }
        try {
            await patientsAPI.deletePatient(id);
            showToast('✅ ลบข้อมูลผู้ป่วยสำเร็จ');
            await loadPatients();
        } catch (error: any) {
            console.error('Failed to delete patient:', error);
            showToast(`❌ เกิดข้อผิดพลาดในการลบ: ${error.message}`);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilters({ registeredBy: 'All', village: 'All', healthCoverage: 'All', startDate: '', endDate: '' });
    };

    return (
        <div className="space-y-6">
            {loadingRemote && (
                <div className="p-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded">กำลังดึงข้อมูลผู้ป่วยจากเซิร์ฟเวอร์...</div>
            )}
            {remoteError && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">เกิดข้อผิดพลาดในการดึงข้อมูล: {remoteError}</div>
            )}

            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">จัดการข้อมูลผู้ป่วยทั้งหมด</h1>
                <button onClick={() => setActiveView && setActiveView('register_patient')} className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
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
                        <label htmlFor="patientSearch" className="block text-xs font-medium text-gray-600 mb-1">ค้นหา</label>
                        <div className="flex items-center gap-2">
                            <input
                                id="patientSearch"
                                type="text"
                                placeholder="ชื่อ, รหัสผู้ป่วย..."
                                value={searchTerm}
                                onChange={e => {
                                    setSearching(true);
                                    setSearchTerm(e.target.value);
                                    setTimeout(() => setSearching(false), 300);
                                }}
                                className="flex-1"
                            />
                            {searching && <LoadingSpinner size="sm" />}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="filterRegisteredBy" className="block text-xs font-medium text-gray-600 mb-1">ชุมชน (ผู้ลงทะเบียน)</label>
                        <select id="filterRegisteredBy" name="registeredBy" value={filters.registeredBy} onChange={handleFilterChange}>
                            {uniqueRegistrars.map(r => (
                                <option key={r} value={r}>
                                    {r === 'All' ? 'ทั้งหมด' : r}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filterVillage" className="block text-xs font-medium text-gray-600 mb-1">หมู่บ้าน</label>
                        <select id="filterVillage" name="village" value={filters.village} onChange={handleFilterChange}>
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
                        <label htmlFor="filterHealthCoverage" className="block text-xs font-medium text-gray-600 mb-1">สิทธิการรักษา</label>
                        <select id="filterHealthCoverage" name="healthCoverage" value={filters.healthCoverage} onChange={handleFilterChange}>
                            {uniqueHealthCoverages.map(hc => (
                                <option key={hc} value={hc}>
                                    {hc === 'All' ? 'ทุกสิทธิ' : hc}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1">ลงทะเบียน (จากวันที่)</label>
                        <ModernDatePicker name="startDate" value={filters.startDate} onChange={handleFilterChange} placeholder="วันเริ่มต้น" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1">ลงทะเบียน (ถึงวันที่)</label>
                        <ModernDatePicker name="endDate" value={filters.endDate} onChange={handleFilterChange} placeholder="วันสิ้นสุด" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 font-medium py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                            <XCircleIcon className="w-5 h-5" />
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
                            {!loadingRemote && paginatedPatients.length === 0 && (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                                        ไม่พบผู้ป่วยตามเงื่อนไขที่เลือก
                                    </td>
                                </tr>
                            )}
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
                                            <button onClick={() => handleDeletePatient(patient.id)} className="p-2 rounded-full text-gray-400 hover:text-red-600" title="ลบ"><TrashIcon className="w-5 h-5" /></button>
                                            <button onClick={() => setActiveView && setActiveView('request_ride', { patientId: patient.id })} className="p-2 rounded-full text-gray-400 hover:text-green-600" title="ร้องขอการเดินทาง"><RidesIcon className="w-5 h-5" /></button>
                                            <button onClick={() => showToast('Feature: Print Card coming soon')} className="p-2 rounded-full text-gray-400 hover:text-gray-800" title="พิมพ์บัตรข้อมูล"><PrintIcon className="w-5 h-5" /></button>
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
                    <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} disabled={currentPage === 1} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="text-sm font-semibold">หน้า {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} disabled={currentPage === totalPages} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
            </div>
            <Toast message={toastMessage} />
        </div>
    );
};

export default OfficeManagePatientsPage;
