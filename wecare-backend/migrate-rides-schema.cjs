const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

console.log('Starting migration to update rides table schema...');

const createNewTableSQL = `
CREATE TABLE rides_new (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT,
    driver_id TEXT,
    driver_name TEXT,
    vehicle_id TEXT,
    
    pickup_location TEXT NOT NULL,
    pickup_lat TEXT,
    pickup_lng TEXT,
    destination TEXT NOT NULL,
    destination_lat TEXT,
    destination_lng TEXT,
    
    appointment_time DATETIME NOT NULL,
    pickup_time TEXT,
    dropoff_time TEXT,
    
    trip_type TEXT,
    special_needs TEXT,
    notes TEXT,
    distance_km REAL,
    
    status TEXT NOT NULL, -- Removed CHECK constraint to allow new statuses
    cancellation_reason TEXT,
    
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
`;

const transaction = db.transaction(() => {
    // 1. Rename existing table
    console.log('Renaming existing table...');
    db.prepare("ALTER TABLE rides RENAME TO rides_old").run();

    // 2. Create new table
    console.log('Creating new table...');
    db.exec(createNewTableSQL);

    // 3. Copy data
    console.log('Copying data...');
    // We need to list columns explicitly to be safe, but SELECT * usually works if columns match.
    // However, let's check columns of rides_old first to be sure.
    const oldColumns = db.prepare("PRAGMA table_info(rides_old)").all().map(c => c.name);
    const newColumns = db.prepare("PRAGMA table_info(rides_new)").all().map(c => c.name);

    // Find common columns
    const commonColumns = newColumns.filter(c => oldColumns.includes(c));
    const columnsStr = commonColumns.join(', ');

    console.log(`Copying columns: ${columnsStr}`);

    db.prepare(`INSERT INTO rides_new (${columnsStr}) SELECT ${columnsStr} FROM rides_old`).run();

    // 4. Drop old table
    console.log('Dropping old table...');
    db.prepare("DROP TABLE rides_old").run();
});

try {
    transaction();
    console.log('✅ Migration completed successfully!');
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
}
