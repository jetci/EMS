
const Database = require('better-sqlite3');
const db = new Database('db/wecare.db');

try {
    // Create team_schedules table
    console.log('Creating team_schedules table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS team_schedules (
            id TEXT PRIMARY KEY,
            team_id TEXT NOT NULL,
            vehicle_id TEXT,
            date TEXT NOT NULL,
            shift_type TEXT DEFAULT '24H',
            status TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(team_id) REFERENCES teams(id)
        );
    `);

    // Create index for performance
    db.exec(`CREATE INDEX IF NOT EXISTS idx_team_schedules_team_date ON team_schedules(team_id, date);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_team_schedules_date ON team_schedules(date);`);

    console.log('✅ team_schedules table created successfully.');
} catch (err) {
    console.error('❌ Error creating table:', err);
}
