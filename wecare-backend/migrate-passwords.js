/**
 * Database Migration Script: Hash Existing Passwords
 * This script migrates existing plain-text passwords to bcrypt hashed passwords
 * 
 * IMPORTANT: Run this ONCE after deploying password security updates
 * 
 * Usage: node migrate-passwords.js
 */

import { sqliteDB } from './src/db/sqliteDB.js';
import { hashPassword } from './src/utils/password.js';

interface User {
    id: string;
    email: string;
    password: string;
    role: string;
    full_name: string;
}

async function migratePasswords() {
    console.log('========================================');
    console.log('Password Migration Script');
    console.log('========================================\n');

    try {
        // Get all users
        const users = sqliteDB.all < User > ('SELECT * FROM users');
        console.log(`Found ${users.length} users to migrate\n`);

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                // Check if password is already hashed (bcrypt hashes start with $2b$)
                if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
                    console.log(`⏭️  Skipping ${user.email} - already hashed`);
                    skippedCount++;
                    continue;
                }

                // Hash the plain text password
                const hashedPassword = await hashPassword(user.password);

                // Update the user's password
                sqliteDB.update('users', user.id, { password: hashedPassword });

                console.log(`✅ Migrated ${user.email}`);
                migratedCount++;
            } catch (error) {
                console.error(`❌ Error migrating ${user.email}:`, error);
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
        console.error('❌ Fatal error during migration:', error);
        process.exit(1);
    }
}

// Run migration
migratePasswords();
