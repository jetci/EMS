/**
 * Database Optimization Script
 * Creates indexes and optimizes queries
 */

import { sqliteDB } from '../src/db/sqliteDB';

console.log('⚡ Database Optimization Script');
console.log('================================\n');

/**
 * Create indexes for better query performance
 */
const createIndexes = () => {
  console.log('📊 Creating indexes...\n');

  const indexes = [
    // Users table
    {
      name: 'idx_users_email',
      table: 'users',
      columns: ['email'],
      unique: true,
    },
    {
      name: 'idx_users_role',
      table: 'users',
      columns: ['role'],
      unique: false,
    },

    // Patients table
    {
      name: 'idx_patients_national_id',
      table: 'patients',
      columns: ['national_id'],
      unique: false,
    },
    {
      name: 'idx_patients_created_by',
      table: 'patients',
      columns: ['created_by'],
      unique: false,
    },
    {
      name: 'idx_patients_registered_date',
      table: 'patients',
      columns: ['registered_date'],
      unique: false,
    },

    // Drivers table
    {
      name: 'idx_drivers_user_id',
      table: 'drivers',
      columns: ['user_id'],
      unique: true,
    },
    {
      name: 'idx_drivers_status',
      table: 'drivers',
      columns: ['status'],
      unique: false,
    },

    // Rides table
    {
      name: 'idx_rides_patient_id',
      table: 'rides',
      columns: ['patient_id'],
      unique: false,
    },
    {
      name: 'idx_rides_driver_id',
      table: 'rides',
      columns: ['driver_id'],
      unique: false,
    },
    {
      name: 'idx_rides_status',
      table: 'rides',
      columns: ['status'],
      unique: false,
    },
    {
      name: 'idx_rides_created_at',
      table: 'rides',
      columns: ['created_at'],
      unique: false,
    },
    {
      name: 'idx_rides_status_created',
      table: 'rides',
      columns: ['status', 'created_at'],
      unique: false,
    },

    // Audit logs table
    {
      name: 'idx_audit_user_email',
      table: 'audit_logs',
      columns: ['user_email'],
      unique: false,
    },
    {
      name: 'idx_audit_action',
      table: 'audit_logs',
      columns: ['action'],
      unique: false,
    },
    {
      name: 'idx_audit_timestamp',
      table: 'audit_logs',
      columns: ['timestamp'],
      unique: false,
    },

    // Notifications table
    {
      name: 'idx_notifications_user_id',
      table: 'notifications',
      columns: ['user_id'],
      unique: false,
    },
    {
      name: 'idx_notifications_read',
      table: 'notifications',
      columns: ['read'],
      unique: false,
    },
    {
      name: 'idx_notifications_created_at',
      table: 'notifications',
      columns: ['created_at'],
      unique: false,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const index of indexes) {
    try {
      const uniqueStr = index.unique ? 'UNIQUE ' : '';
      const columnsStr = index.columns.join(', ');

      sqliteDB.exec(
        `CREATE ${uniqueStr}INDEX IF NOT EXISTS ${index.name} ON ${index.table} (${columnsStr})`
      );

      console.log(`  ✅ ${index.name} on ${index.table}(${columnsStr})`);
      created++;
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log(`  ℹ️  ${index.name} already exists`);
        skipped++;
      } else {
        console.error(`  ❌ Error creating ${index.name}:`, error.message);
      }
    }
  }

  console.log(`\n✅ Indexes created: ${created}, skipped: ${skipped}\n`);
};

/**
 * Analyze tables for query optimization
 */
const analyzeTables = () => {
  console.log('📈 Analyzing tables...\n');

  const tables = [
    'users',
    'patients',
    'drivers',
    'rides',
    'audit_logs',
    'notifications',
  ];

  for (const table of tables) {
    try {
      sqliteDB.exec(`ANALYZE ${table}`);
      console.log(`  ✅ Analyzed ${table}`);
    } catch (error: any) {
      console.error(`  ❌ Error analyzing ${table}:`, error.message);
    }
  }

  console.log('\n✅ Analysis completed\n');
};

/**
 * Vacuum database to reclaim space
 */
const vacuumDatabase = () => {
  console.log('🧹 Vacuuming database...\n');

  try {
    // Get database size before
    const beforeStats = sqliteDB.prepare('PRAGMA page_count').get() as any;
    const pageSize = (sqliteDB.prepare('PRAGMA page_size').get() as any).page_size;
    const beforeSize = beforeStats.page_count * pageSize;

    console.log(`  Before: ${(beforeSize / 1024 / 1024).toFixed(2)} MB`);

    // Vacuum
    sqliteDB.exec('VACUUM');

    // Get database size after
    const afterStats = sqliteDB.prepare('PRAGMA page_count').get() as any;
    const afterSize = afterStats.page_count * pageSize;

    console.log(`  After: ${(afterSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Saved: ${((beforeSize - afterSize) / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n✅ Vacuum completed\n');
  } catch (error: any) {
    console.error('  ❌ Error vacuuming database:', error.message);
  }
};

/**
 * Optimize database settings
 */
const optimizeSettings = () => {
  console.log('⚙️  Optimizing database settings...\n');

  const settings = [
    { pragma: 'journal_mode', value: 'WAL', description: 'Write-Ahead Logging' },
    { pragma: 'synchronous', value: 'NORMAL', description: 'Sync mode' },
    { pragma: 'cache_size', value: '-64000', description: 'Cache size (64MB)' },
    { pragma: 'temp_store', value: 'MEMORY', description: 'Temp storage' },
    { pragma: 'mmap_size', value: '30000000000', description: 'Memory-mapped I/O' },
  ];

  for (const setting of settings) {
    try {
      sqliteDB.exec(`PRAGMA ${setting.pragma} = ${setting.value}`);
      const result = sqliteDB.prepare(`PRAGMA ${setting.pragma}`).get() as any;
      console.log(`  ✅ ${setting.description}: ${result[setting.pragma]}`);
    } catch (error: any) {
      console.error(`  ❌ Error setting ${setting.pragma}:`, error.message);
    }
  }

  console.log('\n✅ Settings optimized\n');
};

/**
 * Show database statistics
 */
const showStatistics = () => {
  console.log('📊 Database Statistics');
  console.log('=====================\n');

  const tables = [
    'users',
    'patients',
    'drivers',
    'rides',
    'audit_logs',
    'notifications',
  ];

  for (const table of tables) {
    try {
      const count = sqliteDB.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${table}`
      );

      console.log(`  ${table.padEnd(20)} ${(count?.count || 0).toLocaleString()} rows`);
    } catch (error) {
      console.log(`  ${table.padEnd(20)} [table not found]`);
    }
  }

  console.log('');
};

/**
 * Main optimization function
 */
const optimizeDatabase = () => {
  try {
    console.log('Starting optimization...\n');

    // 1. Show current stats
    showStatistics();

    // 2. Create indexes
    createIndexes();

    // 3. Analyze tables
    analyzeTables();

    // 4. Optimize settings
    optimizeSettings();

    // 5. Vacuum database
    vacuumDatabase();

    // 6. Show final stats
    showStatistics();

    console.log('🎉 Optimization completed successfully!\n');
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  }
};

// Run optimization
optimizeDatabase();
