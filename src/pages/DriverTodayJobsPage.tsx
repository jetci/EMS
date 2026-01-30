import React, { useState, useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Ride, RideStatus } from '../types';
import RideList from '../components/RideList';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import SparklesIcon from '../components/icons/SparklesIcon';
import { optimizeRides } from '../services/geminiService';
import RouteMiniMap from '../components/RouteMiniMap';
import DriverCalendarView from '../components/driver/DriverCalendarView';
import CalendarIcon from '../components/icons/CalendarIcon';
import ListIcon from '../components/icons/ListIcon';
import { driversAPI, ridesAPI } from '../services/api';
import DriverLocationTracker from '../components/driver/DriverLocationTracker';

// Helper to get driverId for current user
const getCurrentDriverId = (): string | null => {
    try {
        const raw = localStorage.getItem('wecare_user');
        if (!raw) return null;
        const u = JSON.parse(raw);
        return u?.driver_id || null;
    } catch {
        return null;
    }
};

type ViewMode = 'list' | 'calendar';

const DriverTodayJobsPage: React.FC = () => {
    const [rides, setRides] = useState<Ride[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
    const [showMiniMap, setShowMiniMap] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [isPolling, setIsPolling] = useState<boolean>(true);
    const intervalRef = useRef<number | null>(null);

    const fetchMyRides = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await driversAPI.getMyRides();
            const mapped: Ride[] = (data || []).map((r: any) => ({
                id: r.id,
                patientName: r.patient_name || '',
                patientPhone: r.patient_phone || '',
                pickupLocation: r.pickup_location || '',
                destination: r.destination || '',
                appointmentTime: r.appointment_time || new Date().toISOString(),
                status: (r.status as RideStatus) || RideStatus.ASSIGNED,
            }));
            setRides(mapped);
        } catch (e) {
            console.error('Failed to load driver rides', e);
            setRides([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyRides();
    }, [fetchMyRides]);

    useEffect(() => {
        if (isPolling) {
            const id = window.setInterval(() => {
                fetchMyRides();
            }, 30000);
            intervalRef.current = id;
            return () => {
                if (intervalRef.current) window.clearInterval(intervalRef.current);
            };
        } else {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, [isPolling, fetchMyRides]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    const handleUpdateStatus = useCallback(async (rideId: string, newStatus: RideStatus) => {
        const ride = rides.find(r => r.id === rideId);
        if (!ride) return;

        try {
            await ridesAPI.updateRideStatus(rideId, newStatus);
            setRides(prevRides =>
                prevRides.map(r =>
                    r.id === rideId ? { ...r, status: newStatus } : r
                )
            );

            let message = '';
            switch (newStatus) {
                case RideStatus.EN_ROUTE_TO_PICKUP: message = `✅ เริ่มเดินทางไปรับผู้ป่วยแล้ว`; break;
                case RideStatus.ARRIVED_AT_PICKUP: message = `📍 ถึงจุดรับแล้ว`; break;
                case RideStatus.IN_PROGRESS: message = `🚗 รับผู้ป่วยขึ้นรถแล้ว`; break;
                case RideStatus.COMPLETED: message = `🎉 การเดินทาง ${rideId} เสร็จสิ้น`; break;
            }
            if (message) showToast(message);
        } catch (e) {
            console.error('Failed to update ride status', e);
            showToast('❌ อัปเดตสถานะไม่สำเร็จ');
        }
    }, [rides]);

    const handleOptimizeRoute = async () => {
        const activeRides = rides.filter(r => r.status === RideStatus.ASSIGNED);
        if (activeRides.length < 2) {
            showToast("ℹ️ มีงานที่ต้องทำน้อยกว่า 2 งาน");
            return;
        }
        setIsOptimizing(true);
        try {
            const optimizedOrder = await optimizeRides(activeRides);
            const rideMap = new Map(rides.map(r => [r.id, r]));

            const optimizedRides = optimizedOrder.map(id => rideMap.get(id)).filter((r): r is Ride => r !== undefined);
            const otherRides = rides.filter(r => !optimizedOrder.includes(r.id));

            setRides([...optimizedRides, ...otherRides]);
            setShowMiniMap(true);
            setTimeout(() => setShowMiniMap(false), 5000);
            showToast("✨ จัดลำดับการเดินทางให้เรียบร้อยแล้ว!");
        } catch (error) {
            console.error("Failed to optimize route:", error);
            showToast("❌ ไม่สามารถจัดลำดับได้ โปรดลองอีกครั้ง");
        } finally {
            setIsOptimizing(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner /></div>;
    }

    const todayActiveRides = rides.filter(r => {
        const isToday = dayjs(r.appointmentTime).isSame(dayjs(), 'day');
        const isActiveStatus = r.status !== RideStatus.COMPLETED && r.status !== RideStatus.CANCELLED;
        return isToday && isActiveStatus;
    });

    return (
        <div className="space-y-6">
            <DriverLocationTracker driverId={getCurrentDriverId()} />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">งานของฉัน</h1>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex p-1 bg-gray-200/75 rounded-lg">
                        <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${viewMode === 'list' ? 'bg-white text-[var(--wecare-blue)] shadow-sm' : 'text-gray-600'}`}>
                            <ListIcon className="w-5 h-5" />
                            <span>รายการ</span>
                        </button>
                        <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-white text-[var(--wecare-blue)] shadow-sm' : 'text-gray-600'}`}>
                            <CalendarIcon className="w-5 h-5" />
                            <span>ปฏิทิน</span>
                        </button>
                    </div>
                    {/* Refresh and Auto-Update */}
                    <button
                        onClick={fetchMyRides}
                        className="px-4 py-1.5 text-sm font-semibold rounded-md transition-colors text-white bg-gray-600 hover:bg-gray-700"
                        aria-label="รีเฟรชรายการงานของฉัน"
                        title="รีเฟรช"
                    >
                        รีเฟรช
                    </button>
                    <button
                        onClick={() => setIsPolling(p => !p)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${isPolling ? 'text-white bg-green-600 hover:bg-green-700' : 'text-gray-800 bg-gray-200 hover:bg-gray-300'}`}
                        aria-label={isPolling ? 'หยุดอัปเดตอัตโนมัติ' : 'เปิดอัปเดตอัตโนมัติ'}
                        title={isPolling ? 'Auto-Update ON' : 'Auto-Update OFF'}
                    >
                        {isPolling ? 'Auto-Update ON' : 'Auto-Update OFF'}
                    </button>
                </div>
            </div>

            {viewMode === 'list' && (
                <>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <button
                            onClick={handleOptimizeRoute}
                            disabled={isOptimizing || todayActiveRides.filter(r => r.status === RideStatus.ASSIGNED).length < 2}
                            className="w-full flex items-center justify-center gap-2 bg-[var(--wecare-blue)] text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 shadow-sm border disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            {isOptimizing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                    กำลังประมวลผล...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    จัดลำดับให้ฉัน (Powered by Gemini)
                                </>
                            )}
                        </button>
                    </div>

                    {showMiniMap && <RouteMiniMap rides={todayActiveRides.filter(r => r.status === RideStatus.ASSIGNED)} />}

                    <RideList rides={todayActiveRides} onUpdateStatus={handleUpdateStatus} isActionable={true} />
                </>
            )}

            {viewMode === 'calendar' && (
                <DriverCalendarView allRides={rides} onUpdateStatus={handleUpdateStatus} />
            )}

            <Toast message={toastMessage} />
        </div>
    );
};

export default DriverTodayJobsPage;
