const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

const email = 'jetci.jm@gmail.com';
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (user) {
    console.log('Found user:', user);
} else {
    console.log('User not found');
}
