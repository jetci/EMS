const db = require('better-sqlite3')('db/wecare.db');
const drivers = db.prepare("SELECT id, email, role FROM users WHERE role LIKE '%driver%'").all();
console.log('Drivers in users table:', drivers);

const driverRecords = db.prepare('SELECT * FROM drivers LIMIT 3').all();
console.log('\nDrivers table:', driverRecords);
