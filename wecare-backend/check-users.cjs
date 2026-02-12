const Database = require('better-sqlite3');
const db = new Database('./db/wecare.db', { readonly: true });

console.log('=== Users in Database ===\n');
const users = db.prepare('SELECT id, email, role, full_name FROM users LIMIT 10').all();
users.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - ${user.full_name}`);
});

console.log(`\nTotal users: ${users.length}`);
db.close();
