import React, { useState, useCallback, useEffect } from 'react';
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

const generateMockRides = (): Ride[] => {
    const today = dayjs();
    return [
      {
        id: 'RIDE-003',
        patientName: 'อาทิตย์ แจ่มใส',
        patientPhone: '083-456-7890',
        pickupLocation: '789 ถนนพระราม 4, คลองเตย',
        village: 'หมู่บ้านรุ่งเรือง',
        landmark: 'ใกล้กับวัดคลองเตยใน',
        destination: 'โรงพยาบาลสมิติเวช',
        appointmentTime: today.hour(14).minute(0).second(0).toISOString(),
        status: RideStatus.ASSIGNED,
        specialNeeds: [],
        pickupCoordinates: { lat: 13.7169, lng: 100.5654 },
      },
      {
        id: 'RIDE-001',
        patientName: 'สมชาย ใจดี',
        patientPhone: '081-234-5678',
        pickupLocation: '123 ถนนสุขุมวิท, วัฒนา',
        village: 'หมู่บ้านสุขใจ',
        landmark: 'ตรงข้าม 7-Eleven',
        destination: 'โรงพยาบาลกรุงเทพ',
        appointmentTime: today.hour(9).minute(30).second(0).toISOString(),
        status: RideStatus.ASSIGNED,
        specialNeeds: ['ต้องใช้วีลแชร์', 'มีอาการเมารถ'],
        caregiverPhone: '088-765-4321',
        pickupCoordinates: { lat: 13.7384, lng: 100.5839 },
      },
      {
        id: 'RIDE-002',
        patientName: 'สมหญิง มีสุข',
        patientPhone: '082-345-6789',
        pickupLocation: '456 ถนนพหลโยธิน, จตุจักร',
        village: 'คอนโด LPN',
        destination: 'โรงพยาบาลบำรุงราษฎร์',
        appointmentTime: today.hour(11).minute(0).second(0).toISOString(),
        status: RideStatus.ASSIGNED,
        specialNeeds: [],
        pickupCoordinates: { lat: 13.8284, lng: 100.5611 },
      },
      // Ride for tomorrow
      {
        id: 'RIDE-101',
        patientName: 'พรุ่งนี้ สดใส',
        pickupLocation: '111 ถนนลาดพร้าว, วังทองหลาง',
        destination: 'โรงพยาบาลลาดพร้าว',
        appointmentTime: today.add(1, 'day').hour(10).minute(0).toISOString(),
        status: RideStatus.ASSIGNED,
        specialNeeds: ['ต้องการความช่วยเหลือในการขึ้นลง'],
        pickupCoordinates: { lat: 13.7885, lng: 100.6053 },
      },
      // Another ride for tomorrow
      {
        id: 'RIDE-102',
        patientName: 'วันถัดไป เบิกบาน',
        pickupLocation: '222 ถนนรามคำแหง, บางกะปิ',
        destination: 'โรงพยาบาลรามคำแหง',
        appointmentTime: today.add(1, 'day').hour(15).minute(0).toISOString(),
        status: RideStatus.ASSIGNED,
        specialNeeds: [],
        pickupCoordinates: { lat: 13.7656, lng: 100.6441 },
      },
       // Ride for yesterday (completed)
      {
        id: 'RIDE-004',
        patientName: 'จันทรา งามวงศ์วาน',
        patientPhone: '084-567-8901',
        pickupLocation: '101 ถนนรัชดาภิเษก, ห้วยขวาง',
        destination: 'โรงพยาบาลรามาธิบดี',
        appointmentTime: today.subtract(1, 'day').hour(16).minute(30).toISOString(),
        status: RideStatus.COMPLETED,
        pickupCoordinates: { lat: 13.7749, lng: 100.5694 },
      },
        // Ride for 2 days ago (cancelled)
        {
        id: 'RIDE-005',
        patientName: 'มานี รักเรียน',
        patientPhone: '085-678-9012',
        pickupLocation: '222 ถนนเพชรบุรี, ราชเทวี',
        destination: 'โรงพยาบาลพญาไท',
        appointmentTime: today.subtract(2, 'day').hour(17).minute(0).toISOString(),
        status: RideStatus.CANCELLED,
        pickupCoordinates: { lat: 13.7548, lng: 100.5372 },
      }
    ];
};

type ViewMode = 'list' | 'calendar';

const DriverTodayJobsPage: React.FC = () => {
    const [rides, setRides] = useState<Ride[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
    const [showMiniMap, setShowMiniMap] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setRides(generateMockRides());
            setIsLoading(false);
        }, 1500);
    }, []);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
        setToastMessage(null);
        }, 3000);
    };

    const handleUpdateStatus = useCallback((rideId: string, newStatus: RideStatus) => {
        const ride = rides.find(r => r.id === rideId);
        if(!ride) return;

        setRides(prevRides =>
            prevRides.map(r =>
                r.id === rideId ? { ...r, status: newStatus } : r
            )
        );
        
        let message = '';
        switch(newStatus) {
            case RideStatus.EN_ROUTE_TO_PICKUP: message = `✅ เริ่มเดินทางไปรับผู้ป่วยแล้ว`; break;
            case RideStatus.ARRIVED_AT_PICKUP: message = `📍 ถึงจุดรับแล้ว`; break;
            case RideStatus.IN_PROGRESS: message = `🚗 รับผู้ป่วยขึ้นรถแล้ว`; break;
            case RideStatus.COMPLETED: message = `🎉 การเดินทาง ${rideId} เสร็จสิ้น`; break;
        }
        if (message) showToast(message);

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