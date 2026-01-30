import fs from 'fs';
import path from 'path';

// JSON Database helper for data persistence
// Data is stored in .json files in the db/data directory

const DATA_DIR = path.join(__dirname, '..', '..', 'db', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generic JSON DB functions
export const jsonDB = {
    // Read data from JSON file
    read: <T>(filename: string, defaultData: T[] = []): T[] => {
        const filePath = path.join(DATA_DIR, `${filename}.json`);
        try {
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error(`Error reading ${filename}.json:`, error);
        }
        return defaultData;
    },

    // Write data to JSON file
    write: <T>(filename: string, data: T[]): boolean => {
        const filePath = path.join(DATA_DIR, `${filename}.json`);
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error(`Error writing ${filename}.json:`, error);
            return false;
        }
    },

    // Get single item by ID
    findById: <T extends { id: string }>(filename: string, id: string): T | null => {
        const data = jsonDB.read<T>(filename);
        return data.find(item => item.id === id) || null;
    },

    // Create new item
    create: <T extends { id: string }>(filename: string, item: T): T => {
        const data = jsonDB.read<T>(filename);
        data.push(item);
        jsonDB.write(filename, data);
        return item;
    },

    // Update item by ID
    update: <T extends { id: string }>(filename: string, id: string, updates: Partial<T>): T | null => {
        const data = jsonDB.read<T>(filename);
        const index = data.findIndex(item => item.id === id);
        if (index === -1) return null;

        data[index] = { ...data[index], ...updates };
        jsonDB.write(filename, data);
        return data[index];
    },

    // Delete item by ID
    delete: <T extends { id: string }>(filename: string, id: string): boolean => {
        const data = jsonDB.read<T>(filename);
        const index = data.findIndex(item => item.id === id);
        if (index === -1) return false;

        data.splice(index, 1);
        jsonDB.write(filename, data);
        return true;
    },

    // Generate next ID
    generateId: (filename: string, prefix: string): string => {
        const data = jsonDB.read<{ id: string }>(filename);
        const maxNum = data.reduce((max, item) => {
            const match = item.id.match(new RegExp(`${prefix}-(\\d+)`));
            if (match) {
                const num = parseInt(match[1], 10);
                return num > max ? num : max;
            }
            return max;
        }, 0);
        return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
    }
};

// Initialize default data if files don't exist
const initializeData = () => {
    const patientsPath = path.join(DATA_DIR, 'patients.json');
    const ridesPath = path.join(DATA_DIR, 'rides.json');

    // Initialize patients
    if (!fs.existsSync(patientsPath)) {
        const defaultPatients = [
            { id: 'PAT-001', full_name: 'Patient One', phone: '0891111111', address: 'หมู่ 1', patient_types: 'ฟอกไต', key_info: 'ต้องการรถเข็น', registered_date: '2024-01-01' },
            { id: 'PAT-002', full_name: 'Patient Two', phone: '0892222222', address: 'หมู่ 2', patient_types: 'กายภาพบำบัด', key_info: '', registered_date: '2024-01-02' },
            { id: 'PAT-003', full_name: 'Patient Three', phone: '0893333333', address: 'หมู่ 3', patient_types: 'รับยา', key_info: '', registered_date: '2024-01-03' },
        ];
        jsonDB.write('patients', defaultPatients);
        console.log('📂 Initialized patients.json with default data');
    }

    // Initialize rides
    if (!fs.existsSync(ridesPath)) {
        const defaultRides = [
            { id: 'RIDE-001', patient_id: 'PAT-001', patient_name: 'Patient One', driver_id: 'DRV-001', driver_name: 'Driver One', status: 'COMPLETED', appointmentTime: '2024-09-16T09:00:00Z', appointment_time: '2024-09-16T09:00:00Z', pickupLocation: 'บ้านผู้ป่วย', pickup_location: 'บ้านผู้ป่วย', dropoffLocation: 'โรงพยาบาล', destination: 'โรงพยาบาล' },
            { id: 'RIDE-002', patient_id: 'PAT-002', patient_name: 'Patient Two', driver_id: 'DRV-002', driver_name: 'Driver Two', status: 'IN_PROGRESS', appointmentTime: '2024-09-16T10:00:00Z', appointment_time: '2024-09-16T10:00:00Z', pickupLocation: 'บ้านผู้ป่วย', pickup_location: 'บ้านผู้ป่วย', dropoffLocation: 'คลินิก', destination: 'คลินิก' },
            { id: 'RIDE-003', patient_id: 'PAT-003', patient_name: 'Patient Three', driver_id: null, driver_name: null, status: 'PENDING', appointmentTime: '2024-09-16T11:00:00Z', appointment_time: '2024-09-16T11:00:00Z', pickupLocation: 'บ้านผู้ป่วย', pickup_location: 'บ้านผู้ป่วย', dropoffLocation: 'โรงพยาบาล', destination: 'โรงพยาบาล' },
        ];
        jsonDB.write('rides', defaultRides);
        console.log('📂 Initialized rides.json with default data');
    }
};

// Run initialization
initializeData();

export default jsonDB;
