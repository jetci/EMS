const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database path: wecare-backend/db/wecare.db
const dbPath = path.resolve(__dirname, 'db', 'wecare.db');
console.log('Connecting to DB at:', dbPath);

const db = new Database(dbPath, { verbose: console.log });

async function checkAndSeed() {
    try {
        const row = db.prepare("SELECT * FROM users WHERE role = 'EXECUTIVE'").get();

        if (row) {
            console.log('✅ Found EXECUTIVE user:', row.email);
        } else {
            console.log('⚠️ No EXECUTIVE user found. Seeding one...');

            const hashedPassword = await bcrypt.hash('executive123', 10);
            const user = {
                id: 'USR-EXEC-01',
                email: 'executive@wecare.dev',
                password: hashedPassword,
                role: 'EXECUTIVE',
                full_name: 'Executive Director',
                date_created: new Date().toISOString(),
                status: 'Active'
            };

            const stmt = db.prepare(`
        INSERT INTO users (id, email, password, role, full_name, date_created, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

            stmt.run(user.id, user.email, user.password, user.role, user.full_name, user.date_created, user.status);
            console.log('✅ Created user:', user.email);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

checkAndSeed();
