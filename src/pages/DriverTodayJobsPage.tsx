import React, { useState, useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Ride, RideStatus, DriverStatus } from '../types';
import RideList from '../components/RideList';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import SparklesIcon from '../components/icons/SparklesIcon';
import { optimizeRides } from '../services/geminiService';
import RouteMiniMap from '../components/RouteMiniMap';
import DriverCalendarView from '../components/driver/DriverCalendarView';
import CalendarIcon from '../components/icons/CalendarIcon';
import ListIcon from '../components/icons/ListIcon';
import { driversAPI, ridesAPI, systemAPI } from '../services/api';
import DriverLocationTracker from '../components/driver/DriverLocationTracker';
import DatabaseIcon from '../components/icons/DatabaseIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';
import AlertCircleIcon from '../components/icons/AlertCircleIcon';

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
    const [systemHealth, setSystemHealth] = useState<any>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState<boolean>(false);
    const [syncQueue, setSyncQueue] = useState<any[]>([]);
    const [driverStatus, setDriverStatus] = useState<DriverStatus>(DriverStatus.AVAILABLE);
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
                village: r.village || '',
                landmark: r.landmark || '',
                caregiverPhone: r.caregiver_phone || ''
            }));

            setRides(mapped);
            setLastUpdated(new Date().toISOString());
            setIsOffline(false);

            // Save to Local Cache for Offline Use
            localStorage.setItem('wecare_driver_jobs_cache', JSON.stringify({
                rides: mapped,
                timestamp: new Date().toISOString()
            }));

        } catch (e) {
            console.warn('Failed to load driver rides, checking cache...', e);

            // Try to load from Cache
            const cached = localStorage.getItem('wecare_driver_jobs_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                setRides(parsed.rides);
                setLastUpdated(parsed.timestamp);
                setIsOffline(true);
                setToastMessage('กำลังแสดงข้อมูลที่บันทึกไว้ (ออฟไลน์)');
            } else {
                setRides([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchHealth = useCallback(async () => {
        try {
            const health = await systemAPI.getHealth();
            setSystemHealth(health);
        } catch (e) {
            console.warn('Could not fetch system health');
        }
    }, []);

    const fetchDriverProfile = useCallback(async () => {
        try {
            const profile = await driversAPI.getMyProfile();
            setDriverStatus(profile.status as DriverStatus);
        } catch (error) {
            console.error('Failed to fetch driver profile', error);
        }
    }, []);

    useEffect(() => {
        fetchMyRides();
        fetchHealth();
        fetchDriverProfile();
    }, [fetchMyRides, fetchHealth, fetchDriverProfile]);

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
        // Optimistic UI Update
        const previousRides = [...rides];
        setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: newStatus } : r));

        try {
            await ridesAPI.updateRideStatus(
                rideId,
                newStatus,
                getCurrentDriverId() || undefined
            );

            let message = '';
            switch (newStatus) {
                case RideStatus.EN_ROUTE_TO_PICKUP: message = `✅ เริ่มเดินทางไปรับผู้ป่วยแล้ว`; break;
                case RideStatus.ARRIVED_AT_PICKUP: message = `📍 ถึงจุดรับแล้ว`; break;
                case RideStatus.IN_PROGRESS: message = `🚗 รับผู้ป่วยขึ้นรถแล้ว`; break;
                case RideStatus.COMPLETED: message = `🎉 การเดินทาง ${rideId} เสร็จสิ้น`; break;
            }
            if (message) showToast(message);

            // Update Cache
            localStorage.setItem('wecare_driver_jobs_cache', JSON.stringify({
                rides: rides.map(r => r.id === rideId ? { ...r, status: newStatus } : r),
                timestamp: new Date().toISOString()
            }));

        } catch (e) {
            console.warn('Status update failed, adding to sync queue:', e);

            // Add to Sync Queue
            const queued = localStorage.getItem('wecare_driver_sync_queue');
            const queue = queued ? JSON.parse(queued) : [];
            const newSyncItem = { rideId, newStatus, timestamp: new Date().toISOString() };
            const updatedQueue = [...queue, newSyncItem];
            setSyncQueue(updatedQueue);
            localStorage.setItem('wecare_driver_sync_queue', JSON.stringify(updatedQueue));

            showToast('⚠️ ออฟไลน์: จะส่งข้อมูลเมื่อมีสัญญาณ');
        }
    }, [rides, syncQueue]);

    // Background Sync Effect
    useEffect(() => {
        const syncInterval = setInterval(async () => {
            const queued = localStorage.getItem('wecare_driver_sync_queue');
            if (!queued) return;

            const queue = JSON.parse(queued);
            if (queue.length === 0) {
                if (syncQueue.length > 0) setSyncQueue([]);
                return;
            }

            const item = queue[0];
            try {
                await ridesAPI.updateRideStatus(item.rideId, item.newStatus, getCurrentDriverId() || undefined);
                const remaining = queue.slice(1);
                setSyncQueue(remaining);
                localStorage.setItem('wecare_driver_sync_queue', JSON.stringify(remaining));

                if (remaining.length === 0) {
                    showToast('✅ ซิงค์ข้อมูลที่ค้างอยู่สำเร็จ');
                }
            } catch (err) {
                // Network still down or other error, retry next time
            }
        }, 15000); // Check every 15 seconds

        return () => clearInterval(syncInterval);
    }, [syncQueue]);

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

    const handleToggleStatus = async () => {
        const newStatus = driverStatus === DriverStatus.AVAILABLE ? DriverStatus.OFF_DUTY : DriverStatus.AVAILABLE;
        try {
            await driversAPI.updateMyProfile({ status: newStatus });
            setDriverStatus(newStatus);
            showToast(`✅ เปลี่ยนสถานะเป็น ${newStatus === DriverStatus.AVAILABLE ? 'พร้อมทำงาน' : 'ปิดรับงาน'} แล้ว`);
        } catch (e: any) {
            showToast(`❌ ไม่สามารถเปลี่ยนสถานะได้: ${e.message}`);
        }
    };

    if (isLoading && rides.length === 0) {
        return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner /></div>;
    }

    const todayActiveRides = rides.filter(r => {
        const isToday = dayjs(r.appointmentTime).isSame(dayjs(), 'day');
        const isActiveStatus = r.status !== RideStatus.COMPLETED && r.status !== RideStatus.CANCELLED;
        return isToday && isActiveStatus;
    });

    return (
        <div className="space-y-6">
            {/* Offline/Cache Warning */}
            {isOffline && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 flex items-center justify-between shadow-sm rounded-r-lg">
                    <div className="flex items-center gap-3">
                        <AlertCircleIcon className="w-5 h-5 text-amber-600" />
                        <div>
                            <p className="text-sm font-bold text-amber-800">โหมดออฟไลน์</p>
                            <p className="text-xs text-amber-700">แสดงข้อมูลล่าสุดเมื่อ: {lastUpdated ? dayjs(lastUpdated).format('HH:mm') : '-'}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchMyRides}
                        className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                    >
                        ลองใหม่อีกครั้ง
                    </button>
                </div>
            )}

            {/* Sync Status Overlay */}
            {syncQueue.length > 0 && (
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between mb-4 animate-pulse">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-bold">กำลังซิงก์ข้อมูล ({syncQueue.length} รายการที่ตกค้าง)</span>
                    </div>
                </div>
            )}

            {/* Quick Status Toggle */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${driverStatus === DriverStatus.AVAILABLE ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {driverStatus === DriverStatus.AVAILABLE ? (
                            <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                        ) : (
                            <AlertCircleIcon className="w-6 h-6 text-gray-500" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">สถานะการทำงาน</h2>
                        <p className={`text-sm font-medium ${driverStatus === DriverStatus.AVAILABLE ? 'text-green-600' : 'text-gray-500'}`}>
                            {driverStatus === DriverStatus.AVAILABLE ? 'พร้อมรับงาน (Online)' : 'ปิดรับงาน (Offline)'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-sm active:scale-95 ${driverStatus === DriverStatus.AVAILABLE
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                >
                    {driverStatus === DriverStatus.AVAILABLE ? '🔴 ปิดรับงาน (Go Offline)' : '🟢 เปิดรับงาน (Go Online)'}
                </button>
            </div>

            <DriverLocationTracker driverId={getCurrentDriverId()} />

            {/* System Status Indicators */}
            {systemHealth && (
                <div className="flex flex-wrap gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${systemHealth.status === 'healthy' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>เซิร์ฟเวอร์: {systemHealth.status === 'healthy' ? 'ปกติ' : 'มีปัญหา'}</span>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${systemHealth.filesystem?.uploadsWritable ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        <DatabaseIcon className="w-4 h-4" />
                        <span>พื้นที่เก็บข้อมูล: {systemHealth.filesystem?.uploadsWritable ? 'พร้อมใช้งาน' : 'เต็ม/ขัดข้อง'}</span>
                    </div>

                    {systemHealth.diskSpace && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
                            <AlertCircleIcon className="w-4 h-4" />
                            <span>พื้นที่ว่าง: {Math.round(systemHealth.diskSpace.Free / 1024 / 1024 / 1024)} GB</span>
                        </div>
                    )}
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">งานของฉัน</h1>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex p-1 bg-gray-200/75 rounded-lg">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${viewMode === 'list' ? 'bg-white text-[var(--wecare-blue)] shadow-sm' : 'text-gray-600'}`}
                        >
                            <ListIcon className="w-5 h-5" />
                            <span>รายการ</span>
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-white text-[var(--wecare-blue)] shadow-sm' : 'text-gray-600'}`}
                        >
                            <CalendarIcon className="w-5 h-5" />
                            <span>ปฏิทิน</span>
                        </button>
                    </div>
                    {/* Refresh and Auto-Update */}
                    <button
                        onClick={fetchMyRides}
                        className="px-4 py-1.5 text-sm font-semibold rounded-md transition-colors text-white bg-gray-600 hover:bg-gray-700"
                        title="รีเฟรช"
                    >
                        รีเฟรช
                    </button>
                    <button
                        onClick={() => setIsPolling(p => !p)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${isPolling ? 'text-white bg-green-600 hover:bg-green-700' : 'text-gray-800 bg-gray-200 hover:bg-gray-300'}`}
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
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    กำลังประมวลผล...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    จัดลำดับด้วย AI (Powered by Gemini)
                                </>
                            )}
                        </button>
                    </div>

                    {showMiniMap && <RouteMiniMap rides={todayActiveRides.filter(r => r.status === RideStatus.ASSIGNED)} />}

                    {todayActiveRides.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ListIcon className="w-10 h-10 text-[var(--wecare-blue)] opacity-40" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่มีงานสำหรับวันนี้</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                คุณยังไม่มีรายการงานที่ได้รับมอบหมายสำหรับวันนี้ หากมีงานใหม่เข้ามาจะปรากฏในหน้านี้โดยอัตโนมัติ
                            </p>
                            <button
                                onClick={fetchMyRides}
                                className="mt-6 px-6 py-2 bg-[var(--wecare-blue)] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                รีเฟรชข้อมูล
                            </button>
                        </div>
                    ) : (
                        <RideList rides={todayActiveRides} onUpdateStatus={handleUpdateStatus} isActionable={true} />
                    )}
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
