import React, { useState, useMemo, useEffect } from 'react';
import { Ride, RideStatus, CommunityView } from '../types';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import SearchIcon from '../components/icons/SearchIcon';
import FilterIcon from '../components/icons/FilterIcon';
import StatusBadge from '../components/ui/StatusBadge';
import EyeIcon from '../components/icons/EyeIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import RidesIcon from '../components/icons/RidesIcon';
import { formatDateTimeToThai } from '../utils/dateUtils';
import RideDetailsModal from '../components/modals/RideDetailsModal';
import RideRatingModal from '../components/modals/RideRatingModal';
import Toast from '../components/Toast';
import StarIcon from '../components/icons/StarIcon';

const mockRides: Ride[] = [
    { id: 'RIDE-201', patientName: 'สมชาย ใจดี', destination: 'โรงพยาบาลกรุงเทพ', appointmentTime: '2024-08-10T09:30:00Z', status: RideStatus.COMPLETED, driverName: 'Driver One', pickupLocation: '', rating: 5, reviewTags: ['ตรงต่อเวลา', 'สุภาพ'] },
    // FIX: Changed `specialNeeds` from a string to an array of strings to match the `Ride` type definition.
    { id: 'RIDE-202', patientName: 'สมหญิง มีสุข', destination: 'โรงพยาบาลบำรุงราษฎร์', appointmentTime: '2024-08-11T11:00:00Z', status: RideStatus.IN_PROGRESS, driverName: 'Driver Two', pickupLocation: '', specialNeeds: ['ต้องการรถวีลแชร์'], caregiverCount: 1, contactPhone: '089-123-4567', driverInfo: { id: 'DRV-002', fullName: 'มานะ อดทน', phone: '082-345-6789', licensePlate: 'ชล 5678', vehicleModel: 'Honda City' } },
    { id: 'RIDE-203', patientName: 'อาทิตย์ แจ่มใส', destination: 'โรงพยาบาลสมิติเวช', appointmentTime: '2024-08-12T14:00:00Z', status: RideStatus.ASSIGNED, driverName: 'Driver One', pickupLocation: '' },
    // FIX: Changed `specialNeeds` from a string to an array of strings to match the `Ride` type definition.
    { id: 'RIDE-204', patientName: 'จันทรา งามวงศ์วาน', destination: 'โรงพยาบาลรามาธิบดี', appointmentTime: '2024-08-12T16:30:00Z', status: RideStatus.PENDING, pickupLocation: '', specialNeeds: ['ผู้ป่วยมีอาการเหนื่อยง่าย'] },
    { id: 'RIDE-205', patientName: 'มานี รักเรียน', destination: 'โรงพยาบาลพญาไท', appointmentTime: '2024-08-13T17:00:00Z', status: RideStatus.PENDING, pickupLocation: '' },
    { id: 'RIDE-206', patientName: 'ปิติ ชูใจ', destination: 'โรงพยาบาลศิริราช', appointmentTime: '2024-08-14T08:00:00Z', status: RideStatus.PENDING, pickupLocation: '' },
    { id: 'RIDE-207', patientName: 'สมชาย ใจดี', destination: 'โรงพยาบาลจุฬาลงกรณ์', appointmentTime: '2024-08-15T10:00:00Z', status: RideStatus.CANCELLED, pickupLocation: '' },
];

const ITEMS_PER_PAGE = 5;

interface ManageRidesPageProps {
    setActiveView: (view: CommunityView) => void;
    initialFilter?: RideStatus;
}

const ManageRidesPage: React.FC<ManageRidesPageProps> = ({ setActiveView, initialFilter }) => {
    const [rides, setRides] = useState<Ride[]>(mockRides);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RideStatus | 'All'>(initialFilter || 'All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [rideToRate, setRideToRate] = useState<Ride | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    useEffect(() => {
        if (initialFilter) {
            setStatusFilter(initialFilter);
        }
    }, [initialFilter]);
    
    const filteredRides = useMemo(() => {
        return rides.filter(r => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = r.patientName.toLowerCase().includes(searchLower) || r.id.toLowerCase().includes(searchLower);
            const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [rides, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredRides.length / ITEMS_PER_PAGE);
    const paginatedRides = filteredRides.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleViewDetails = (ride: Ride) => {
        setSelectedRide(ride);
        setIsDetailsModalOpen(true);
    };

    const handleOpenRatingModal = (ride: Ride) => {
        setRideToRate(ride);
        setIsRatingModalOpen(true);
    };
    
    const handleSubmitRating = (rideId: string, ratingData: { rating: number; tags: string[]; comment: string }) => {
        setRides(prevRides => 
            prevRides.map(ride =>
                ride.id === rideId
                    ? { ...ride, rating: ratingData.rating, reviewTags: ratingData.tags, reviewComment: ratingData.comment }
                    : ride
            )
        );
        setIsRatingModalOpen(false);
        showToast('ขอบคุณสำหรับความคิดเห็น!');
    };
    
    if (rides.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-[60vh]">
                <RidesIcon className="w-24 h-24 text-gray-300" />
                <h2 className="mt-6 text-2xl font-semibold text-gray-700">คุณยังไม่มีรายการเดินทาง</h2>
                <p className="mt-2 text-gray-500">เริ่มต้นด้วยการสร้างคำขอการเดินทางครั้งแรกของคุณ</p>
                <button 
                    onClick={() => setActiveView('request_ride')}
                    className="mt-6 flex items-center justify-center px-5 py-3 font-medium text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    ร้องขอการเดินทางแรกของคุณ
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">จัดการการเดินทาง</h1>
                    <p className="mt-1 text-[var(--text-secondary)]">ตรวจสอบสถานะและรายละเอียดการเดินทางทั้งหมด</p>
                </div>
                <button 
                    onClick={() => setActiveView('request_ride')}
                    className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    <span>ร้องขอการเดินทางใหม่</span>
                </button>
            </div>

            {/* Toolbar */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--border-color)]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-auto flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="ค้นหาด้วยชื่อผู้ป่วย หรือ Ride ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 pl-10"
                        />
                    </div>
                    <div className="relative w-full md:w-auto">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FilterIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as RideStatus | 'All')}
                            className="w-full md:w-56 pl-10"
                        >
                            <option value="All">สถานะทั้งหมด</option>
                            <option value={RideStatus.PENDING}>รอดำเนินการ</option>
                            <option value={RideStatus.ASSIGNED}>อนุมัติแล้ว</option>
                            <option value={RideStatus.IN_PROGRESS}>กำลังเดินทาง</option>
                            <option value={RideStatus.COMPLETED}>เสร็จสิ้น</option>
                            <option value={RideStatus.CANCELLED}>ยกเลิก</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[var(--border-color)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-[var(--text-secondary)]">
                        <thead className="text-xs text-[var(--text-primary)] uppercase bg-gray-50/75">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">ชื่อผู้ป่วย</th>
                                <th scope="col" className="px-6 py-4 font-semibold">ปลายทาง</th>
                                <th scope="col" className="px-6 py-4 font-semibold">วัน-เวลานัดหมาย</th>
                                <th scope="col" className="px-6 py-4 font-semibold">สถานะ</th>
                                <th scope="col" className="px-6 py-4 font-semibold">คนขับ</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-center">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {paginatedRides.map(ride => (
                                <tr key={ride.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-[var(--text-primary)] whitespace-nowrap">{ride.patientName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{ride.destination}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDateTimeToThai(ride.appointmentTime)}</td>
                                    <td className="px-6 py-4"><StatusBadge status={ride.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap">{ride.driverName || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleViewDetails(ride)} className="p-2 rounded-full hover:bg-blue-100 text-blue-600" title="ดูรายละเอียด"><EyeIcon className="w-5 h-5" /></button>
                                            {ride.status === RideStatus.PENDING && (
                                                <button className="p-2 rounded-full hover:bg-red-100 text-red-600" title="ยกเลิก"><TrashIcon className="w-5 h-5" /></button>
                                            )}
                                            {ride.status === RideStatus.COMPLETED && (
                                                <button
                                                    onClick={() => handleOpenRatingModal(ride)}
                                                    disabled={!!ride.rating}
                                                    className="p-2 rounded-full disabled:text-gray-400 disabled:cursor-not-allowed disabled:bg-transparent enabled:hover:bg-yellow-100 enabled:text-yellow-600 transition-colors"
                                                    title={ride.rating ? `ให้คะแนนแล้ว: ${ride.rating} ดาว` : "ให้คะแนนการเดินทาง"}
                                                >
                                                    {ride.rating ? (
                                                        <div className="flex items-center text-yellow-500">
                                                            <StarIcon className="w-5 h-5" />
                                                            <span className="text-sm font-bold ml-1">{ride.rating}</span>
                                                        </div>
                                                    ) : (
                                                        <StarIcon className="w-5 h-5 fill-none" />
                                                    )}
                                                </button>
                                            )}
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
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <RideDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} ride={selectedRide} />
            <RideRatingModal 
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                ride={rideToRate}
                onSubmit={handleSubmitRating}
            />
            <Toast message={toastMessage} />
        </div>
    );
};

export default ManageRidesPage;