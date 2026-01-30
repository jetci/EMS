/**
 * Database Migration Script: Hash Existing Passwords
 * This script migrates existing plain-text passwords to bcrypt hashed passwords
 * 
 * IMPORTANT: Run this ONCE after deploying password security updates
 * 
 * Usage: node migrate-passwords.cjs
 */

const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
}

async function migratePasswords() {
    console.log('========================================');
    console.log('Password Migration Script');
    console.log('========================================\n');

    let db;

    try {
        // Connect to SQLite database
        const dbPath = path.join(__dirname, 'db', 'wecare.db');
        console.log(`Connecting to database: ${dbPath}\n`);

        db = new Database(dbPath);

        // Get all users
        const users = db.prepare('SELECT * FROM users').all();
        console.log(`Found ${users.length} users to migrate\n`);

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                // Check if password is already hashed (bcrypt hashes start with $2b$)
                if (user.password && (user.password.startsWith('$2b$') || user.password.startsWith('$2a$'))) {
                    console.log(`⏭️  Skipping ${user.email} - already hashed`);
                    skippedCount++;
                    continue;
                }

                // Hash the plain text password
                const hashedPassword = await hashPassword(user.password);

                // Update the user's password
                const updateStmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
                updateStmt.run(hashedPassword, user.id);

                console.log(`✅ Migrated ${user.email}`);
                migratedCount++;
            } catch (error) {
                console.error(`❌ Error migrating ${user.email}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n========================================');
        console.log('Migration Complete');
        console.log('========================================');
        console.log(`✅ Migrated: ${migratedCount}`);
        console.log(`⏭️  Skipped: ${skippedCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📊 Total: ${users.length}`);
        console.log('========================================\n');

        if (errorCount > 0) {
            console.warn('⚠️  Some passwords failed to migrate. Please review errors above.');
            process.exit(1);
        } else {
            console.log('✅ All passwords migrated successfully!');
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Fatal error during migration:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (db) {
            db.close();
        }
    }
}

// Run migration
migratePasswords();
