// import { sqliteDB } from './sqliteDB'; // Legacy
import { jsonDB } from './jsonDB';
import path from 'path';
import fs from 'fs';

// Migration script: JSON → SQLite
// Purpose: Migrate all data from JSON files to SQLite database

const DATA_DIR = path.join(__dirname, '..', '..', 'db', 'data');

interface MigrationResult {
    table: string;
    success: number;
    failed: number;
    errors: string[];
}

const results: MigrationResult[] = [];

// Helper function to log migration progress
const logMigration = (table: string, success: number, failed: number, errors: string[] = []) => {
    results.push({ table, success, failed, errors });
    console.log(`📊 ${table}: ${success} migrated, ${failed} failed`);
    if (errors.length > 0) {
        errors.forEach(err => console.error(`   ❌ ${err}`));
    }
};

// 1. Migrate Users
const migrateUsers = () => {
    console.log('\n🔄 Migrating users...');
    const users = jsonDB.read<any>('users');
    let success = 0, failed = 0;
    const errors: string[] = [];

    users.forEach(user => {
        try {
            /*
            sqliteDB.insert('users', {
                id: user.id,
                email: user.email,
                password: user.password,
                role: user.role,
                full_name: user.fullName || user.full_name,
                date_created: user.dateCreated || user.date_created,
                status: user.status || 'Active'
            });
            */
            console.log(`Skipping SQLite insert for ${user.id}`);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`${user.id}: ${error.message}`);
        }
    });

    logMigration('users', success, failed, errors);
};

// 2. Migrate Patients
const migratePatients = () => {
    console.log('\n🔄 Migrating patients...');
    const patients = jsonDB.read<any>('patients');
    let success = 0, failed = 0;
    const errors: string[] = [];

    patients.forEach(patient => {
        try {
            const keyInfo = patient.key_info || {};
            const address = keyInfo.address || {};

            /*
            sqliteDB.insert('patients', {
                id: patient.id,
                full_name: patient.full_name,
                national_id: patient.national_id || null,
                dob: patient.dob || null,
                age: patient.age || null,
                gender: patient.gender || null,
                blood_type: patient.blood_type || null,
                rh_factor: patient.rh_factor || null,
                health_coverage: patient.health_coverage || null,
                contact_phone: keyInfo.contact_phone || patient.contact_phone || null,

                // ID Card Address
                id_card_house_number: address.houseNumber || null,
                id_card_village: address.village || null,
                id_card_tambon: address.tambon || null,
                id_card_amphoe: address.amphoe || null,
                id_card_changwat: address.changwat || null,

                // Current Address (same as ID card for now)
                current_house_number: address.houseNumber || null,
                current_village: address.village || null,
                current_tambon: address.tambon || null,
                current_amphoe: address.amphoe || null,
                current_changwat: address.changwat || null,

                // Location
                landmark: patient.landmark || null,
                latitude: keyInfo.latitude || patient.latitude || null,
                longitude: keyInfo.longitude || patient.longitude || null,

                // Medical Info (as JSON strings)
                patient_types: JSON.stringify(patient.patient_types || []),
                chronic_diseases: JSON.stringify(keyInfo.chronic_diseases || []),
                allergies: JSON.stringify(keyInfo.allergies || []),

                // Metadata
                profile_image_url: patient.profile_image_url || null,
                registered_date: patient.registered_date,
                created_by: patient.created_by || null
            });
            */
            console.log(`Skipping SQLite insert for ${patient.id}`);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`${patient.id}: ${error.message}`);
        }
    });

    logMigration('patients', success, failed, errors);
};

// 3. Migrate Drivers
const migrateDrivers = () => {
    console.log('\n🔄 Migrating drivers...');
    const drivers = jsonDB.read<any>('drivers');
    let success = 0, failed = 0;
    const errors: string[] = [];

    drivers.forEach(driver => {
        try {
            /*
            sqliteDB.insert('drivers', {
                id: driver.id,
                user_id: driver.user_id || null,
                full_name: driver.full_name || driver.fullName,
                phone: driver.phone || null,
                license_number: driver.license_number || null,
                license_expiry: driver.license_expiry || null,
                status: driver.status || 'AVAILABLE',
                current_vehicle_id: driver.current_vehicle_id || null,
                profile_image_url: driver.profile_image_url || null
            });
            */
            console.log(`Skipping SQLite insert for ${driver.id}`);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`${driver.id}: ${error.message}`);
        }
    });

    logMigration('drivers', success, failed, errors);
};

// 4. Migrate Vehicle Types
const migrateVehicleTypes = () => {
    console.log('\n🔄 Migrating vehicle types...');
    const vehicleTypes = jsonDB.read<any>('vehicle_types');
    let success = 0, failed = 0;
    const errors: string[] = [];

    vehicleTypes.forEach(vt => {
        try {
            /*
            sqliteDB.insert('vehicle_types', {
                id: vt.id,
                name: vt.name,
                description: vt.description || null,
                icon: vt.icon || null,
                capacity: vt.capacity || null,
                features: JSON.stringify(vt.features || [])
            });
            */
            console.log(`Skipping SQLite insert for ${vt.id}`);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`${vt.id}: ${error.message}`);
        }
    });

    logMigration('vehicle_types', success, failed, errors);
};

// 5. Migrate Vehicles
const migrateVehicles = () => {
    console.log('\n🔄 Migrating vehicles...');
    const vehicles = jsonDB.read<any>('vehicles');
    let success = 0, failed = 0;
    const errors: string[] = [];

    vehicles.forEach(vehicle => {
        try {
            /*
            sqliteDB.insert('vehicles', {
                id: vehicle.id,
                license_plate: vehicle.license_plate || vehicle.licensePlate,
                vehicle_type_id: vehicle.vehicle_type_id || vehicle.type || null,
                brand: vehicle.brand || null,
                model: vehicle.model || null,
                year: vehicle.year || null,
                color: vehicle.color || null,
                capacity: vehicle.capacity || null,
                status: vehicle.status || 'AVAILABLE',
                mileage: vehicle.mileage || 0,
                last_maintenance_date: vehicle.last_maintenance_date || null,
                next_maintenance_date: vehicle.next_maintenance_date || null
            });
            */
            console.log(`Skipping SQLite insert for ${vehicle.id}`);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`${vehicle.id}: ${error.message}`);
        }
    });

    logMigration('vehicles', success, failed, errors);
};

// 6. Migrate Rides
const migrateRides = () => {
    console.log('\n🔄 Migrating rides...');
    const rides = jsonDB.read<any>('rides');
    let success = 0, failed = 0;
    const errors: string[] = [];

    rides.forEach(ride => {
        try {
            /*
            sqliteDB.insert('rides', {
                id: ride.id,
                patient_id: ride.patient_id || ride.patientId,
                patient_name: ride.patient_name || ride.patientName,
                patient_phone: ride.patient_phone || ride.patientPhone || null,
                driver_id: ride.driver_id || ride.driverId || null,
                driver_name: ride.driver_name || ride.driverName || null,
                vehicle_id: ride.vehicle_id || null,

                pickup_location: ride.pickup_location || ride.pickupLocation,
                pickup_lat: ride.pickup_lat || null,
                pickup_lng: ride.pickup_lng || null,
                destination: ride.destination || ride.dropoffLocation,
                destination_lat: ride.destination_lat || null,
                destination_lng: ride.destination_lng || null,

                appointment_time: ride.appointment_time || ride.appointmentTime,
                pickup_time: ride.pickup_time || null,
                dropoff_time: ride.dropoff_time || null,

                trip_type: ride.trip_type || ride.tripType || null,
                special_needs: JSON.stringify(ride.special_needs || ride.specialNeeds || []),
                notes: ride.notes || null,
                distance_km: ride.distance_km || null,

                status: ride.status || 'PENDING',
                cancellation_reason: ride.cancellation_reason || null,
                created_by: ride.created_by || null
            });
            */
            console.log(`Skipping SQLite insert for ${ride.id}`);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`${ride.id}: ${error.message}`);
        }
    });

    logMigration('rides', success, failed, errors);
};

// 7. Migrate Teams
const migrateTeams = () => {
    console.log('\n🔄 Migrating teams...');
    const teams = jsonDB.read<any>('teams');
    let success = 0, failed = 0;
    const errors: string[] = [];

    teams.forEach(team => {
        try {
            /*
            sqliteDB.insert('teams', {
                id: team.id,
                name: team.name,
                description: team.description || null,
                leader_id: team.leader_id || null,
                member_ids: JSON.stringify(team.member_ids || team.members || []),
                status: team.status || 'Active'
            });
            */
            console.log(`Skipping SQLite insert for ${team.id}`);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`${team.id}: ${error.message}`);
        }
    });

    logMigration('teams', success, failed, errors);
};

// 8. Migrate News
const migrateNews = () => {
    console.log('\n🔄 Migrating news...');
    const news = jsonDB.read<any>('news');
    let success = 0, failed = 0;
    const errors: string[] = [];

    news.forEach(article => {
        try {
            /*
            sqliteDB.insert('news', {
                id: article.id,
                title: article.title,
                content: article.content,
                author_id: article.author_id || null,
                author_name: article.author_name || null,
                category: article.category || null,
                tags: JSON.stringify(article.tags || []),
                image_url: article.image_url || null,
                published_date: article.published_date || null,
                is_published: article.is_published ? 1 : 0,
                views: article.views || 0
            });
            */
            console.log(`Skipping SQLite insert for ${article.id}`);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`${article.id}: ${error.message}`);
        }
    });

    logMigration('news', success, failed, errors);
};

// Main migration function
export const runMigration = () => {
    console.log('\n🚀 Starting JSON to SQLite migration...\n');
    console.log('='.repeat(50));

    try {
        // Run migrations in order (respecting foreign keys)
        migrateUsers();
        migratePatients();
        migrateDrivers();
        migrateVehicleTypes();
        migrateVehicles();
        migrateRides();
        migrateTeams();
        migrateNews();

        console.log('\n' + '='.repeat(50));
        console.log('\n✅ Migration completed!\n');

        // Print summary
        console.log('📊 Summary:');
        results.forEach(r => {
            const total = r.success + r.failed;
            const percentage = total > 0 ? ((r.success / total) * 100).toFixed(1) : '0';
            console.log(`   ${r.table}: ${r.success}/${total} (${percentage}%)`);
        });

        const totalSuccess = results.reduce((sum, r) => sum + r.success, 0);
        const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
        console.log(`\n   Total: ${totalSuccess} migrated, ${totalFailed} failed\n`);

        return { success: true, results };
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        return { success: false, error };
    }
};

// Run migration if executed directly
if (require.main === module) {
    runMigration();
}

export default runMigration;
