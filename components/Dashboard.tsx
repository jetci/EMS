import React, { useState, useCallback, useEffect } from 'react';
import { Ride, RideStatus } from '../types';
import Header from './Header';
import RideList from './RideList';
import BottomNav from './BottomNav';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast';
import SparklesIcon from './icons/SparklesIcon';
import { optimizeRides } from '../services/geminiService';

type ActiveView = 'rides' | 'history' | 'profile';

interface Driver {
  name: string;
  email: string;
}

interface DashboardProps {
    driver: Driver;
    onLogout: () => void;
}

const mockRides: Ride[] = [
  {
    id: 'RIDE-001',
    patientName: 'สมชาย ใจดี',
    pickupLocation: '123 ถนนสุขุมวิท, กรุงเทพฯ',
    destination: 'โรงพยาบาลกรุงเทพ',
    appointmentTime: '2024-09-20T09:30:00Z',
    status: RideStatus.ASSIGNED,
  },
  {
    id: 'RIDE-002',
    patientName: 'สมหญิง มีสุข',
    pickupLocation: '456 ถนนพหลโยธิน, กรุงเทพฯ',
    destination: 'โรงพยาบาลบำรุงราษฎร์',
    appointmentTime: '2024-09-20T11:00:00Z',
    status: RideStatus.ASSIGNED,
  },
  {
    id: 'RIDE-003',
    patientName: 'อาทิตย์ แจ่มใส',
    pickupLocation: '789 ถนนพระราม 4, กรุงเทพฯ',
    destination: 'โรงพยาบาลสมิติเวช',
    appointmentTime: '2024-09-20T14:00:00Z',
    status: RideStatus.ASSIGNED,
  },
  {
    id: 'RIDE-004',
    patientName: 'จันทรา งามวงศ์วาน',
    pickupLocation: '101 ถนนรัชดาภิเษก, กรุงเทพฯ',
    destination: 'โรงพยาบาลรามาธิบดี',
    appointmentTime: '2024-09-19T16:30:00Z',
    status: RideStatus.COMPLETED,
  },
    {
    id: 'RIDE-005',
    patientName: 'มานี รักเรียน',
    pickupLocation: '222 ถนนเพชรบุรี, กรุงเทพฯ',
    destination: 'โรงพยาบาลพญาไท',
    appointmentTime: '2024-09-19T17:00:00Z',
    status: RideStatus.CANCELLED,
  }
];

const Dashboard: React.FC<DashboardProps> = ({ driver, onLogout }) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<ActiveView>('rides');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setRides(mockRides);
      setIsLoading(false);
    }, 1500);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleStatusUpdate = useCallback((rideId: string, newStatus: RideStatus) => {
    setRides(prevRides =>
      prevRides.map(ride =>
        ride.id === rideId ? { ...ride, status: newStatus } : ride
      )
    );
    // FIX: Show toast message on status update
    showToast(`🎉 สถานะของ ${rideId} ได้รับการอัปเดตแล้ว`);
  }, []);
  
  const handleOptimizeRoute = async () => {
    const activeRides = rides.filter(r => r.status === RideStatus.ASSIGNED || r.status === RideStatus.IN_PROGRESS);
    if (activeRides.length < 2) {
      showToast("ℹ️ มีงานน้อยกว่า 2 งาน ไม่จำเป็นต้องจัดลำดับ");
      return;
    }
    setIsOptimizing(true);
    try {
      const optimizedOrder = await optimizeRides(activeRides);
      const rideMap = new Map(rides.map(r => [r.id, r]));
      
      const optimizedRides = optimizedOrder.map(id => rideMap.get(id)).filter((r): r is Ride => r !== undefined);
      const otherRides = rides.filter(r => !optimizedOrder.includes(r.id));
      
      setRides([...optimizedRides, ...otherRides]);
      showToast("✨ จัดลำดับการเดินทางให้เรียบร้อยแล้ว!");
    } catch (error) {
      console.error("Failed to optimize route:", error);
      showToast("❌ ไม่สามารถจัดลำดับได้ โปรดลองอีกครั้ง");
    } finally {
      setIsOptimizing(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full flex-grow">
          <LoadingSpinner />
        </div>
      );
    }

    switch(activeView) {
      case 'rides': {
        const activeRides = rides.filter(r => r.status !== RideStatus.COMPLETED && r.status !== RideStatus.CANCELLED);
        return (
          <div className="flex flex-col h-full">
            <div className="px-4 pt-2 pb-2">
              <button
                onClick={handleOptimizeRoute}
                disabled={isOptimizing}
                className="w-full flex items-center justify-center gap-2 bg-white text-[#005A9C] font-bold py-3 px-4 rounded-lg hover:bg-blue-50 transition duration-300 shadow-md border border-blue-200 disabled:bg-gray-200 disabled:text-gray-500"
              >
                {isOptimizing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    จัดลำดับให้ฉัน
                  </>
                )}
              </button>
            </div>
            {/* FIX: Pass the correct prop `onUpdateStatus` to RideList instead of the non-existent `onStartRide` and `onCompleteRide`. */}
            <RideList rides={activeRides} onUpdateStatus={handleStatusUpdate} />
          </div>
        );
      }
      case 'history':
        return <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-[#005A9C] text-center">ประวัติการเดินทาง</h2>
            {/* FIX: Pass the correct prop `onUpdateStatus` to RideList. A no-op function is sufficient as history items have no actions. */}
            <RideList rides={rides.filter(r => r.status === RideStatus.COMPLETED || r.status === RideStatus.CANCELLED)} onUpdateStatus={() => {}} />
          </div>;
      case 'profile':
        return <div className="p-8 text-center text-gray-600 bg-white rounded-lg shadow-md m-4">
          <img src={`https://i.pravatar.cc/100?u=${driver.email}`} alt="Driver Profile" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-[#005A9C]"/>
          <h2 className="text-xl font-bold text-[#005A9C]">{driver.name}</h2>
          <p className="text-gray-500">{driver.email}</p>
          <p className="text-gray-500">ID: DRV-12345</p>
          <p className="mt-4">ยอดเยี่ยม! คุณให้บริการมาแล้ว {rides.filter(r=> r.status === RideStatus.COMPLETED).length} เที่ยว</p>
          <button 
              onClick={onLogout} 
              className="mt-6 w-full bg-[#DC3545] text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition duration-300 shadow-sm"
          >
              Logout
          </button>
        </div>;
      default:
        {/* FIX: Pass the correct prop `onUpdateStatus` to RideList instead of the non-existent `onStartRide` and `onCompleteRide`. */}
        return <RideList rides={rides} onUpdateStatus={handleStatusUpdate} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">
      <Header driverName={driver.name} isOnline={isOnline} onToggleOnline={() => setIsOnline(!isOnline)} />
      <main className="flex-grow pt-20 pb-20 flex flex-col">
        {renderContent()}
      </main>
      <Toast message={toastMessage} />
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export default Dashboard;