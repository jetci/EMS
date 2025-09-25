import { Driver, User, Team, Vehicle, VehicleStatus, SystemSettings, ShiftStatus, TeamScheduleEntry, DriverStatus, VehicleType, NewsArticle } from '../types';
import dayjs from 'dayjs';

// USERS
export const mockStaff: User[] = [
    { id: 'OFF-001', name: 'Office Operator', email: 'office1@wecare.dev', role: 'office', profileImageUrl: 'https://i.pravatar.cc/150?u=OFF-001' },
    { id: 'OFF-002', name: 'Jane Doe', email: 'jane.d@wecare.dev', role: 'office', profileImageUrl: 'https://i.pravatar.cc/150?u=OFF-002' },
    { id: 'OFF-003', name: 'John Smith', email: 'john.s@wecare.dev', role: 'office', profileImageUrl: 'https://i.pravatar.cc/150?u=OFF-003' },
    { id: 'OFF-004', name: 'Peter Jones', email: 'peter.j@wecare.dev', role: 'office', profileImageUrl: 'https://i.pravatar.cc/150?u=OFF-004' },
];

export const mockDrivers: Driver[] = [
  { id: 'DRV-001', fullName: 'สมศักดิ์ ขยันยิ่ง', phone: '081-234-5678', licensePlate: 'กท 1234', vehicleModel: 'Vios', status: DriverStatus.AVAILABLE, profileImageUrl: 'https://i.pravatar.cc/150?u=DRV-001', email: 'somsak.k@wecare.dev', address: '111/2 Bangkok, Thailand', vehicleBrand: 'Toyota', vehicleColor: 'บรอนซ์เงิน', tripsThisMonth: 25, vehicleType: 'รถยนต์ 4 ประตู', totalTrips: 152, avgReviewScore: 4.8, dateCreated: '2023-01-15T10:00:00Z' },
  { id: 'DRV-002', fullName: 'มานะ อดทน', phone: '082-345-6789', licensePlate: 'ชล 5678', vehicleModel: 'City', status: DriverStatus.ON_TRIP, profileImageUrl: 'https://i.pravatar.cc/150?u=DRV-002', email: 'mana.o@wecare.dev', address: '222/3 Chonburi, Thailand', vehicleBrand: 'Honda', vehicleColor: 'ดำ', tripsThisMonth: 31, vehicleType: 'รถยนต์ 4 ประตู', totalTrips: 210, avgReviewScore: 4.9, dateCreated: '2023-02-10T11:00:00Z' },
  { id: 'DRV-003', fullName: 'สมศรี มีวินัย', phone: '083-456-7890', licensePlate: 'กท 9012', vehicleModel: 'D-Max', status: DriverStatus.AVAILABLE, profileImageUrl: 'https://i.pravatar.cc/150?u=DRV-003', email: 'somsri.m@wecare.dev', address: '333/4 Bangkok, Thailand', vehicleBrand: 'Isuzu', vehicleColor: 'ขาว', tripsThisMonth: 18, vehicleType: 'รถกระบะ', totalTrips: 98, avgReviewScore: 4.6, dateCreated: '2023-03-15T14:00:00Z' },
  { id: 'DRV-004', fullName: 'วิชัย รักบริการ', phone: '084-567-8901', licensePlate: 'ชม 3456', vehicleModel: 'Altis', status: DriverStatus.OFFLINE, profileImageUrl: 'https://i.pravatar.cc/150?u=DRV-004', email: 'wichai.r@wecare.dev', address: '444/5 Chiang Mai, Thailand', vehicleBrand: 'Toyota', vehicleColor: 'เทา', tripsThisMonth: 22, vehicleType: 'รถยนต์ 4 ประตู', totalTrips: 120, avgReviewScore: 4.7, dateCreated: '2023-04-20T16:00:00Z' },
  { id: 'DRV-005', fullName: 'อมรเทพ พิทักษ์ไทย', phone: '085-678-9012', licensePlate: 'ภก 7890', vehicleModel: 'Triton', status: DriverStatus.INACTIVE, profileImageUrl: 'https://i.pravatar.cc/150?u=DRV-005', email: 'amornthep.p@wecare.dev', address: '555/6 Phuket, Thailand', vehicleBrand: 'Mitsubishi', vehicleColor: 'แดง', tripsThisMonth: 0, vehicleType: 'รถกระบะ', totalTrips: 5, avgReviewScore: 4.0, dateCreated: '2023-05-01T09:00:00Z' },
];

// TEAMS
export const mockTeams: Team[] = [
    { id: 'TEAM-A', name: 'ชุดเวร A', driverId: 'DRV-001', staffIds: ['OFF-001', 'OFF-002', 'OFF-003'] },
    { id: 'TEAM-B', name: 'ชุดเวร B', driverId: 'DRV-003', staffIds: ['OFF-001', 'OFF-004'] },
];

export const mockTeamsData = { 'TEAM-A': 'ชุดเวร A', 'TEAM-B': 'ชุดเวร B' };

// VEHICLE TYPES
export const mockVehicleTypes: VehicleType[] = [
  { id: 'vt-1', name: 'รถตู้' },
  { id: 'vt-2', name: 'รถพยาบาล' },
  { id: 'vt-3', name: 'รถกระบะ' },
  { id: 'vt-4', name: 'รถยนต์ 4 ประตู' },
];

// VEHICLES
export const mockVehicles: Vehicle[] = [
  { id: 'VEH-001', licensePlate: 'กท 1234', type: 'รถตู้', brand: 'Toyota', model: 'Commuter', status: VehicleStatus.AVAILABLE, nextMaintenanceDate: dayjs().add(3, 'month').toISOString() },
  { id: 'VEH-002', licensePlate: 'ชล 5678', type: 'รถกระบะ', brand: 'Isuzu', model: 'D-Max', status: VehicleStatus.AVAILABLE, nextMaintenanceDate: dayjs().add(1, 'month').toISOString() },
  { id: 'VEH-003', licensePlate: 'ชม 9012', type: 'รถพยาบาล', brand: 'Mercedes-Benz', model: 'Sprinter', status: VehicleStatus.MAINTENANCE, nextMaintenanceDate: dayjs().subtract(1, 'week').toISOString() },
  { id: 'VEH-004', licensePlate: 'กท 3456', type: 'รถตู้', brand: 'Toyota', model: 'Hiace', status: VehicleStatus.AVAILABLE, nextMaintenanceDate: dayjs().add(6, 'month').toISOString() },
  { id: 'VEH-005', licensePlate: 'ภก 7890', type: 'รถตู้', brand: 'Nissan', model: 'Urvan', status: VehicleStatus.ASSIGNED, assignedTeamId: 'TEAM-A', nextMaintenanceDate: dayjs().add(4, 'month').toISOString() },
];

// NEWS ARTICLES
export const mockNews: NewsArticle[] = [
    {
        id: 'NEWS-001',
        title: 'โครงการ WeCare เปิดตัวระบบจัดการการเดินทางเวอร์ชั่นใหม่',
        content: 'รายละเอียดเกี่ยวกับเวอร์ชั่นใหม่...',
        author: 'Admin User',
        status: 'published',
        publishedDate: dayjs().subtract(2, 'day').toISOString(),
        featuredImageUrl: 'https://images.unsplash.com/photo-1588628062483-30514a6326d7?q=80&w=800'
    },
    {
        id: 'NEWS-002',
        title: 'เปิดรับสมัครคนขับรถอาสาสมัครรอบใหม่',
        content: 'คุณสมบัติและวิธีการสมัคร...',
        author: 'Office Operator',
        status: 'published',
        publishedDate: dayjs().subtract(1, 'week').toISOString(),
        featuredImageUrl: 'https://images.unsplash.com/photo-1566642847182-95a2287f7a77?q=80&w=800'
    },
    {
        id: 'NEWS-003',
        title: 'ประกาศ: ปรับปรุงระบบประจำสัปดาห์ (ฉบับร่าง)',
        content: 'จะมีการปิดปรับปรุงระบบในวันเสาร์ที่จะถึงนี้...',
        author: 'Admin User',
        status: 'draft',
    },
];


// SYSTEM SETTINGS & SCHEDULES (as a single "database" object to simulate persistence)
interface AppData {
    systemSettings: SystemSettings;
    individualSchedules: Record<string, ShiftStatus>;
    teamSchedules: Record<string, TeamScheduleEntry>;
}

// This object will hold our "persistent" state.
export const appData: AppData = {
    systemSettings: {
        appName: 'WeCare Platform',
        organizationName: 'องค์การบริหารส่วนตำบลเวียง',
        contactEmail: 'contact@wecare.dev',
        logoUrl: '',
        googleRecaptchaSiteKey: '',
        googleRecaptchaSecretKey: '',
        maintenanceMode: false,
        maintenanceMessage: 'ระบบกำลังปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวก',
        schedulingModel: 'individual',
    },
    individualSchedules: {},
    teamSchedules: {},
};