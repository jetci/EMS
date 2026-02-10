import React, { useState, useMemo, useEffect } from 'react';
import { Ride, RideStatus, CommunityView, Driver } from '../types';
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
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { ridesAPI } from '../services/api';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

// Backend data will be loaded on mount via ridesAPI

const ITEMS_PER_PAGE = 5;

interface ManageRidesPageProps {
    setActiveView: (view: CommunityView) => void;
    initialFilter?: RideStatus;
}

const ManageRidesPage: React.FC<ManageRidesPageProps> = ({ setActiveView, initialFilter }) => {
    const [rides, setRides] = useState<Ride[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RideStatus | 'All'>(initialFilter || 'All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [rideToRate, setRideToRate] = useState<Ride | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [rideToCancel, setRideToCancel] = useState<Ride | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [searching, setSearching] = useState(false);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    const handleViewDetails = (ride: Ride) => {
        setSelectedRide(ride);
        setIsDetailsModalOpen(true);
    };

    const handleOpenRatingModal = (ride: Ride) => {
        setRideToRate(ride);
        setIsRatingModalOpen(true);
    };

    // Load rides from backend and map to local Ride interface
    const fetchRides = async () => {
        setLoading(true);
        try {
            const response = await ridesAPI.getRides();
            // ✅ Backward compatible: support both old (array) and new (object) formats
            const rawData = response?.data || response || [];
            const data = Array.isArray(rawData) ? rawData : [];
            const mapped: Ride[] = data.map((r: any) => ({
                id: r.id,
                patientId: r.patient_id || r.patientId || '',
                patientName: r.patient_name || r.patientName || '',
                destination: r.destination || '',
                appointmentTime: r.appointment_time || r.appointmentTime || new Date().toISOString(),
                status: (r.status as RideStatus) || RideStatus.PENDING,
                driverName: r.driver_name || r.driverName || undefined,
                pickupLocation: r.pickup_location || r.pickupLocation || '',
                contactPhone: r.patient_phone || r.patientPhone || r.contact_phone || r.contactPhone || '',
                specialNeeds: r.special_needs || r.specialNeeds || [],
            }));
            setRides(mapped);
        } catch (e) {
            setToastMessage('ไม่สามารถดึงข้อมูลการเดินทางได้');
            setTimeout(() => setToastMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRides();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



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

    const handleClickCancel = (ride: Ride) => {
        setRideToCancel(ride);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!rideToCancel) return;
        setIsCancelModalOpen(false);
        try {
            await ridesAPI.cancelRide(rideToCancel.id);
            setRides(prev => prev.filter(r => r.id !== rideToCancel.id));
            showToast('ยกเลิกรายการเดินทางเรียบร้อยแล้ว');
        } catch (error: any) {
            showToast('เกิดข้อผิดพลาดในการยกเลิก: ' + error.message);
        }
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

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">จัดการการเดินทาง</h1>
                    <Button onClick={fetchRides} variant="secondary" size="sm">รีเฟรช</Button>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border">กำลังโหลดข้อมูลการเดินทาง...</div>
            </div>
        );
    }

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
                <div className="mt-4">
                    <Button onClick={fetchRides} variant="secondary" size="sm">รีเฟรช</Button>
                </div>
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
                <div className="flex items-center gap-2">
                    <Button onClick={fetchRides} variant="secondary" size="sm" title="รีเฟรชข้อมูล">รีเฟรช</Button>
                    <button
                        onClick={() => setActiveView('request_ride')}
                        className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600 transition-colors"
                    >
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        <span>ร้องขอการเดินทางใหม่</span>
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--border-color)]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-auto flex-grow flex items-center gap-2">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="ค้นหาด้วยชื่อผู้ป่วย หรือ Ride ID..."
                                value={searchTerm}
                                onChange={e => {
                                    setSearching(true);
                                    setSearchTerm(e.target.value);
                                    setTimeout(() => setSearching(false), 300);
                                }}
                                className="w-full md:w-80 pl-10"
                            />
                        </div>
                        {searching && <LoadingSpinner size="sm" />}
                    </div>
                    <div className="relative w-full md:w-auto">
                        <label htmlFor="statusFilter" className="sr-only">กรองตามสถานะ</label>
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FilterIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <Select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as RideStatus | 'All')}
                            className="w-full md:w-56 pl-10"
                            aria-label="กรองตามสถานะ"
                        >
                            <option value="All">สถานะทั้งหมด</option>
                            <option value={RideStatus.PENDING}>รอดำเนินการ</option>
                            <option value={RideStatus.ASSIGNED}>อนุมัติแล้ว</option>
                            <option value={RideStatus.IN_PROGRESS}>กำลังเดินทาง</option>
                            <option value={RideStatus.COMPLETED}>เสร็จสิ้น</option>
                            <option value={RideStatus.CANCELLED}>ยกเลิก</option>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Data Table using primitives */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[var(--border-color)]">
                <div className="overflow-x-auto">
                    <Table className="text-left text-[var(--text-secondary)]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>ชื่อผู้ป่วย</TableHead>
                                <TableHead>ปลายทาง</TableHead>
                                <TableHead>วัน-เวลานัดหมาย</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead>คนขับ</TableHead>
                                <TableHead className="text-center">การดำเนินการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRides.map(ride => (
                                <TableRow key={ride.id}>
                                    <TableCell className="font-medium text-[var(--text-primary)] whitespace-nowrap">{ride.patientName}</TableCell>
                                    <TableCell className="whitespace-nowrap">{ride.destination}</TableCell>
                                    <TableCell className="whitespace-nowrap">{formatDateTimeToThai(ride.appointmentTime)}</TableCell>
                                    <TableCell><StatusBadge status={ride.status} /></TableCell>
                                    <TableCell className="whitespace-nowrap">{ride.driverName || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleViewDetails(ride)} className="p-2 rounded-full hover:bg-blue-100 text-blue-600" title="ดูรายละเอียด" aria-label={`ดูรายละเอียดของ ${ride.patientName}`}><EyeIcon className="w-5 h-5" /></button>
                                            {ride.status === RideStatus.PENDING && (
                                                <>
                                                    <button onClick={() => handleClickCancel(ride)} className="p-2 rounded-full hover:bg-red-100 text-red-600" title="ยกเลิก" aria-label={`ยกเลิกรายการของ ${ride.patientName}`}><TrashIcon className="w-5 h-5" /></button>

                                                </>
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            <RideDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} ride={selectedRide} />
            <RideRatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                ride={rideToRate}
                onSubmit={handleSubmitRating}
            />
            <ConfirmationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                title="ยืนยันการยกเลิก"
                message={`คุณต้องการยกเลิกการเดินทางของ ${rideToCancel?.patientName} ใช่หรือไม่?`}
                confirmText="ยืนยันยกเลิก"
                cancelText="ปิด"
            />
            <Toast message={toastMessage} />
        </div>
    );
};

export default ManageRidesPage;
