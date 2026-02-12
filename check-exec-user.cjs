const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'wecare-backend/wecare.db');
const db = new sqlite3.Database(dbPath);

async function checkAndSeed() {
    db.get("SELECT * FROM users WHERE role = 'EXECUTIVE'", async (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
            return;
        }

        if (row) {
            console.log('✅ Found EXECUTIVE user:', row.email);
        } else {
            console.log('⚠️ No EXECUTIVE user found. Seeding one...');

            const hashedPassword = await bcrypt.hash('executive123', 10);
            const user = {
                id: 'USR-EXEC-01',
                email: 'executive@wecare.dev',
                password: hashedPassword,
                role: 'EXECUTIVE', // Ensure this matches what the test expects (case-sensitive pending backend check)
                full_name: 'Executive Director',
                date_created: new Date().toISOString(),
                status: 'Active'
            };

            db.run(`INSERT INTO users (id, email, password, role, full_name, date_created, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user.id, user.email, user.password, user.role, user.full_name, user.date_created, user.status],
                (err) => {
                    if (err) console.error('Error creating user:', err);
                    else console.log('✅ Created user:', user.email);
                }
            );
        }
    });
}

checkAndSeed();
