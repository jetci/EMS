import React, { useState, useMemo } from 'react';
import { Ride, RideStatus, Driver } from '../types';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import SearchIcon from '../components/icons/SearchIcon';
import StatusBadge from '../components/ui/StatusBadge';
import EyeIcon from '../components/icons/EyeIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditIcon from '../components/icons/EditIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import UserCheckIcon from '../components/icons/UserCheckIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import AssignDriverModal from '../components/modals/AssignDriverModal';
import Toast from '../components/Toast';
import { formatDateTimeToThai } from '../utils/dateUtils';
import ThaiDatePicker from '../components/ui/ThaiDatePicker';
import { mockDrivers } from '../data/mockData';
import UserSwitchIcon from '../components/icons/UserSwitchIcon';
import WheelchairIcon from '../components/icons/WheelchairIcon';

const mockRides: Ride[] = [
    { id: 'RIDE-201', patientName: 'สมชาย ใจดี', village: 'หมู่ 1 บ้านหนองตุ้ม', destination: 'โรงพยาบาลฝาง', appointmentTime: '2024-09-16T09:30:00Z', status: RideStatus.COMPLETED, driverName: 'สมศักดิ์ ขยันยิ่ง', driverInfo: { id: 'DRV-001', fullName: 'สมศักดิ์ ขยันยิ่ง', phone: '081-234-5678', licensePlate: 'กท 1234', vehicleModel: 'Toyota Vios' }, requestedBy: 'น.ส.มานี มีนา', pickupLocation: '123 สุขุมวิท', rating: 5, reviewTags: ['ตรงต่อเวลา', 'สุภาพ'], tripType: 'นัดหมอตามปกติ' },
    { id: 'RIDE-202', patientName: 'สมหญิง มีสุข', village: 'หมู่ 9 ริมฝาง', destination: 'โรงพยาบาลฝาง', appointmentTime: '2024-09-16T11:00:00Z', status: RideStatus.IN_PROGRESS, driverName: 'มานะ อดทน', driverInfo: { id: 'DRV-002', fullName: 'มานะ อดทน', phone: '082-345-6789', licensePlate: 'ชล 5678', vehicleModel: 'Honda City' }, requestedBy: 'นายปิติ ชูใจ', pickupLocation: '456 พหลโยธิน', tripType: 'กายภาพบำบัด' },
    { id: 'RIDE-203', patientName: 'อาทิตย์ แจ่มใส', village: 'หมู่ 3 เต๋าดิน', destination: 'โรงพยาบาลฝาง', appointmentTime: '2024-09-17T14:00:00Z', status: RideStatus.ASSIGNED, driverName: 'สมศักดิ์ ขยันยิ่ง', driverInfo: { id: 'DRV-001', fullName: 'สมศักดิ์ ขยันยิ่ง', phone: '081-234-5678', licensePlate: 'กท 1234', vehicleModel: 'Toyota Vios' }, requestedBy: 'น.ส.มานี มีนา', pickupLocation: '789 พระราม 4', tripType: 'นัดหมอตามปกติ' },
    { id: 'RIDE-204', patientName: 'จันทรา งามวงศ์วาน', village: 'หมู่ 4 สวนดอก', destination: 'โรงพยาบาลฝาง', appointmentTime: '2024-09-17T11:30:00Z', status: RideStatus.PENDING, requestedBy: 'นางสาวสมศรี ใจดี', pickupLocation: '101 รัชดา', tripType: 'รับยา', specialNeeds: ['ต้องการวีลแชร์'] },
    { id: 'RIDE-205', patientName: 'มานี รักเรียน', village: 'หมู่ 5 ต้นหนุน', destination: 'โรงพยาบาลฝาง', appointmentTime: '2024-09-18T17:00:00Z', status: RideStatus.PENDING, requestedBy: 'นายปิติ ชูใจ', pickupLocation: '222 เพชรบุรี', tripType: 'ฉุกเฉิน' },
    { id: 'RIDE-206', patientName: 'ปิติ ชูใจ', village: 'หมู่ 6 สันทรายคองน้อย', destination: 'โรงพยาบาลฝาง', appointmentTime: '2024-09-18T08:00:00Z', status: RideStatus.PENDING, requestedBy: 'น.ส.มานี มีนา', pickupLocation: '333 จรัญสนิทวงศ์', tripType: 'นัดหมอตามปกติ' },
    { id: 'RIDE-207', patientName: 'สมชาย ใจดี', village: 'หมู่ 1 บ้านหนองตุ้ม', destination: 'โรงพยาบาลฝาง', appointmentTime: '2024-09-19T10:00:00Z', status: RideStatus.CANCELLED, requestedBy: 'นางสาวสมศรี ใจดี', pickupLocation: '123 สุขุมวิท', tripType: 'นัดหมอตามปกติ' },
];

const ITEMS_PER_PAGE = 10;
const tripTypes = ['All', 'นัดหมอตามปกติ', 'รับยา', 'กายภาพบำบัด', 'ฉุกเฉิน'];

const OfficeManageRidesPage: React.FC = () => {
    const [rides, setRides] = useState<Ride[]>(mockRides);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'All',
        driver: 'All',
        village: 'All',
        tripType: 'All',
        startDate: '',
        endDate: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const uniqueVillages = useMemo(() => {
        const villages = new Set(rides.map(r => r.village).filter((v): v is string => !!v));
        return ['All', ...Array.from(villages)];
    }, [rides]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFilters(f => ({ ...f, [name]: value }));
    };

    const filteredRides = useMemo(() => {
        return rides.filter(r => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = r.patientName.toLowerCase().includes(searchLower) || r.id.toLowerCase().includes(searchLower);
            const matchesStatus = filters.status === 'All' || r.status === filters.status;
            const matchesDriver = filters.driver === 'All' || r.driverName === filters.driver;
            const matchesVillage = filters.village === 'All' || r.village === filters.village;
            const matchesTripType = filters.tripType === 'All' || r.tripType === filters.tripType;
            
            let matchesDate = true;
            if (filters.startDate && filters.endDate) {
                const rideDate = new Date(r.appointmentTime);
                matchesDate = rideDate >= new Date(filters.startDate) && rideDate <= new Date(filters.endDate);
            }

            return matchesSearch && matchesStatus && matchesDriver && matchesVillage && matchesTripType && matchesDate;
        });
    }, [rides, searchTerm, filters]);

    const totalPages = Math.ceil(filteredRides.length / ITEMS_PER_PAGE);
    const paginatedRides = filteredRides.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenAssignModal = (ride: Ride) => {
        setSelectedRide(ride);
        setIsModalOpen(true);
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };
    
    const handleAssignDriver = (rideId: string, driverId: string) => {
        const driver = mockDrivers.find(d => d.id === driverId);
        if (!driver) return;

        setRides(prevRides =>
            prevRides.map(r =>
                r.id === rideId
                    ? { 
                        ...r, 
                        driverName: driver.fullName, 
                        status: RideStatus.ASSIGNED,
                        driverInfo: {
                            id: driver.id,
                            fullName: driver.fullName,
                            phone: driver.phone,
                            licensePlate: driver.licensePlate,
                            vehicleModel: `${driver.vehicleBrand} ${driver.vehicleModel}`
                        }
                      }
                    : r
            )
        );
        showToast(`✅ มอบหมายงาน ${rideId} ให้กับ ${driver.fullName} สำเร็จแล้ว`);
        setIsModalOpen(false);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilters({ status: 'All', driver: 'All', village: 'All', tripType: 'All', startDate: '', endDate: '' });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">จัดการการเดินทางทั้งหมด</h1>
                <button className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600 transition-colors">
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    <span>ร้องขอการเดินทางใหม่</span>
                </button>
            </div>

            {/* Advanced Filtering Toolbar */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <div className="xl:col-span-2">
                        <label className="text-xs font-medium text-gray-600">ค้นหา</label>
                        <input type="text" placeholder="ชื่อผู้ป่วย หรือ Ride ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600">สถานะ</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="All">สถานะทั้งหมด</option>
                            <option value={RideStatus.PENDING}>รอดำเนินการ</option>
                            <option value={RideStatus.ASSIGNED}>อนุมัติแล้ว</option>
                            <option value={RideStatus.IN_PROGRESS}>กำลังเดินทาง</option>
                            <option value={RideStatus.COMPLETED}>เสร็จสิ้น</option>
                            <option value={RideStatus.CANCELLED}>ยกเลิก</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600">คนขับ</label>
                        <select name="driver" value={filters.driver} onChange={handleFilterChange}>
                            <option value="All">คนขับทั้งหมด</option>
                            {mockDrivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600">หมู่บ้าน</label>
                        <select name="village" value={filters.village} onChange={handleFilterChange}>
                            {uniqueVillages.map(v => (<option key={v} value={v}>{v === 'All' ? 'ทุกหมู่บ้าน' : v}</option>))}
                        </select>
                    </div>
                     <div>
                        <label className="text-xs font-medium text-gray-600">ประเภท</label>
                        <select name="tripType" value={filters.tripType} onChange={handleFilterChange}>
                            {tripTypes.map(t => (<option key={t} value={t}>{t === 'All' ? 'ทุกประเภท' : t}</option>))}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                     <div className="xl:col-span-2 grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="text-xs font-medium text-gray-600">จากวันที่</label>
                            <ThaiDatePicker name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                        </div>
                        <div className="col-span-1">
                            <label className="text-xs font-medium text-gray-600">ถึงวันที่</label>
                            <ThaiDatePicker name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 font-medium py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                            <XCircleIcon className="w-5 h-5"/>
                            <span>ล้างตัวกรอง</span>
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
                                <th className="px-4 py-3 font-semibold">Ride ID</th>
                                <th className="px-4 py-3 font-semibold">ชื่อผู้ป่วย</th>
                                <th className="px-4 py-3 font-semibold">ประเภท/ความต้องการ</th>
                                <th className="px-4 py-3 font-semibold">คนขับ</th>
                                <th className="px-4 py-3 font-semibold">เวลานัดหมาย</th>
                                <th className="px-4 py-3 font-semibold">สถานะ</th>
                                <th className="px-4 py-3 font-semibold text-center">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedRides.map(ride => {
                                const canEdit = ride.status === RideStatus.PENDING || ride.status === RideStatus.ASSIGNED;
                                const canCancel = ride.status === RideStatus.PENDING || ride.status === RideStatus.ASSIGNED;
                                return (
                                <tr key={ride.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{ride.id}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{ride.patientName}
                                        <div className="text-xs text-gray-500 font-normal">{ride.village}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span>{ride.tripType}</span>
                                            {ride.specialNeeds?.includes('ต้องการวีลแชร์') && (
                                                <span title="ต้องการวีลแชร์">
                                                    <WheelchairIcon className="w-5 h-5 text-blue-600" />
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{ride.driverName || 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTimeToThai(ride.appointmentTime)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={ride.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button className="p-2 rounded-full text-gray-400 hover:text-blue-600" title="ดูรายละเอียด"><EyeIcon className="w-5 h-5" /></button>
                                            {ride.status === RideStatus.PENDING && (
                                                <button onClick={() => handleOpenAssignModal(ride)} className="p-2 rounded-full text-gray-400 hover:text-blue-600" title="จ่ายงาน"><UserCheckIcon className="w-5 h-5" /></button>
                                            )}
                                            {(ride.status === RideStatus.ASSIGNED || ride.status === RideStatus.IN_PROGRESS) && (
                                                <button onClick={() => handleOpenAssignModal(ride)} className="p-2 rounded-full text-gray-400 hover:text-yellow-600" title="เปลี่ยนคนขับ"><UserSwitchIcon className="w-5 h-5" /></button>
                                            )}
                                            {canEdit && (
                                                <button className="p-2 rounded-full text-gray-400 hover:text-gray-800" title="แก้ไข"><EditIcon className="w-5 h-5" /></button>
                                            )}
                                            {canCancel && (
                                                <button className="p-2 rounded-full text-gray-400 hover:text-red-600" title="ยกเลิก"><TrashIcon className="w-5 h-5" /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
             {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">ผลลัพธ์ {paginatedRides.length} จาก {filteredRides.length} รายการ</span>
                <div className="inline-flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} disabled={currentPage === 1} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <span className="text-sm font-semibold">หน้า {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} disabled={currentPage === totalPages} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronRightIcon className="w-5 h-5"/></button>
                </div>
            </div>
            
            {selectedRide && <AssignDriverModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ride={selectedRide} onAssign={handleAssignDriver} allDrivers={mockDrivers} allRides={rides} />}
            <Toast message={toastMessage} />
        </div>
    );
};

export default OfficeManageRidesPage;