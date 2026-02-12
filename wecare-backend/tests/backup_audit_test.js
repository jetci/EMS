const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

async function runTests() {
    console.log('📋 Running Backup Audit Log Test...');

    try {
        const BASE_URL = 'http://localhost:3001/api';

        // 1. Trigger Backup (requires Admin)
        console.log('   🔄 Logging in as Admin...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@wecare.ems', password: 'password123' })
        });
        const { token } = await loginRes.json();

        console.log('   🔄 Creating backup via API...');
        const backupRes = await fetch(`${BASE_URL}/backup/create`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!backupRes.ok) {
            throw new Error('Backup creation failed via API: ' + backupRes.status);
        }
        const backupData = await backupRes.json();
        console.log('   ✅ Backup created:', backupData.filename);

        // 2. Verify Audit Log in DB
        const dbPath = path.join(__dirname, '../db', 'wecare.db');
        const db = new Database(dbPath);

        const latestLog = db.prepare('SELECT * FROM audit_logs WHERE action = ? ORDER BY timestamp DESC LIMIT 1').get('SYSTEM_BACKUP');

        if (latestLog) {
            console.log('   ✅ Audit Log for SYSTEM_BACKUP found');
            console.log('      Details:', latestLog.details);
            console.log('      Resource ID:', latestLog.resource_id);
        } else {
            db.close();
            throw new Error('Audit Log for SYSTEM_BACKUP not found');
        }

        db.close();
        console.log('\n🎉 BACKUP AUDIT LOG TEST PASSED!');
    } catch (err) {
        console.error('❌ Backup Test Failed:', err.message);
        process.exit(1);
    }
}

runTests();
