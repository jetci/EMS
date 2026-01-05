const db = require('better-sqlite3')('db/wecare.db');
const bcrypt = require('bcrypt');

(async () => {
    console.log('Creating Admin and Developer...\n');

    const adminHash = await bcrypt.hash('password', 10);
    const devHash = await bcrypt.hash('devpass123', 10);

    // Delete old users
    db.prepare('DELETE FROM users WHERE email IN (?, ?)').run('admin@wecare.dev', 'jetci.jm@gmail.com');

    // Insert Admin
    db.prepare(`INSERT INTO users (id, email, password, role, full_name, date_created, status) 
                VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`).run(
        'USR-001', 'admin@wecare.dev', adminHash, 'admin', 'Admin User', 'Active'
    );

    // Insert Developer
    db.prepare(`INSERT INTO users (id, email, password, role, full_name, date_created, status) 
                VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`).run(
        'USR-000', 'jetci.jm@gmail.com', devHash, 'DEVELOPER', 'System Developer', 'Active'
    );

    console.log('✅ Admin and Developer created!\n');
    console.log('Credentials:');
    console.log('  Admin: admin@wecare.dev / password');
    console.log('  Developer: jetci.jm@gmail.com / devpass123');

    db.close();
})();
