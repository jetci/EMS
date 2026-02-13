/**
 * Archive Service
 * Handles archiving old data to improve performance
 */

import { db } from '../db';

interface ArchiveConfig {
  table: string;
  archiveTable: string;
  dateColumn: string;
  daysToKeep: number;
}

/**
 * Archive configurations for different tables
 */
const ARCHIVE_CONFIGS: ArchiveConfig[] = [
  {
    table: 'rides',
    archiveTable: 'rides_archive',
    dateColumn: 'created_at',
    daysToKeep: 90, // Keep 3 months
  },
  {
    table: 'audit_logs',
    archiveTable: 'audit_logs_archive',
    dateColumn: 'timestamp',
    daysToKeep: 180, // Keep 6 months
  },
  {
    table: 'notifications',
    archiveTable: 'notifications_archive',
    dateColumn: 'created_at',
    daysToKeep: 30, // Keep 1 month
  },
];

/**
 * Create archive tables if they don't exist
 */
export const createArchiveTables = async (): Promise<void> => {
  console.log('📦 Creating archive tables...');

  // Rides archive
  await db.query(`
    CREATE TABLE IF NOT EXISTS rides_archive (
      id TEXT PRIMARY KEY,
      patient_id TEXT,
      driver_id TEXT,
      status TEXT,
      pickup_location TEXT,
      destination TEXT,
      pickup_lat TEXT,
      pickup_lng TEXT,
      destination_lat TEXT,
      destination_lng TEXT,
      distance REAL,
      duration INTEGER,
      notes TEXT,
      created_by TEXT,
      created_at TEXT,
      updated_at TEXT,
      completed_at TEXT,
      archived_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Audit logs archive
  await db.query(`
    CREATE TABLE IF NOT EXISTS audit_logs_archive (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      user_role TEXT,
      action TEXT,
      resource_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      timestamp TEXT,
      archived_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notifications archive
  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications_archive (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT,
      title TEXT,
      message TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT,
      archived_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Archive tables created');
};

/**
 * Archive old records from a table
 */
export const archiveTable = async (config: ArchiveConfig): Promise<number> => {
  const { table, archiveTable, dateColumn, daysToKeep } = config;

  console.log(`📦 Archiving ${table} (older than ${daysToKeep} days)...`);

  // Calculate cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffDateStr = cutoffDate.toISOString();

  // Get count of records to archive
  const countResult = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table} WHERE ${dateColumn} < $1`,
    [cutoffDateStr]
  );

  const count = countResult?.count || 0;

  if (count === 0) {
    console.log(`  ℹ️  No records to archive`);
    return 0;
  }

  // Copy to archive table
  await db.query(`
    INSERT INTO ${archiveTable}
    SELECT *, NOW() as archived_at
    FROM ${table}
    WHERE ${dateColumn} < '${cutoffDateStr}'
  `);

  // Delete from main table
  await db.run(
    `DELETE FROM ${table} WHERE ${dateColumn} < $1`,
    [cutoffDateStr]
  );

  console.log(`  ✅ Archived ${count} records`);
  return count;
};

/**
 * Archive all configured tables
 */
export const archiveAllTables = async (): Promise<{ [table: string]: number }> => {
  console.log('📦 Starting archive process...\n');

  const results: { [table: string]: number } = {};

  for (const config of ARCHIVE_CONFIGS) {
    try {
      const count = await archiveTable(config);
      results[config.table] = count;
    } catch (error) {
      console.error(`❌ Error archiving ${config.table}:`, error);
      results[config.table] = -1;
    }
  }

  console.log('\n✅ Archive process completed');
  return results;
};

/**
 * Get archive statistics
 */
export const getArchiveStats = async (): Promise<any[]> => {
  const stats = [];

  for (const config of ARCHIVE_CONFIGS) {
    const mainCount = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${config.table}`
    );

    const archiveCount = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${config.archiveTable}`
    );

    stats.push({
      table: config.table,
      mainRecords: mainCount?.count || 0,
      archivedRecords: archiveCount?.count || 0,
      daysToKeep: config.daysToKeep,
    });
  }

  return stats;
};

/**
 * Restore records from archive
 */
export const restoreFromArchive = async (
  archiveTable: string,
  mainTable: string,
  recordIds: string[]
): Promise<number> => {
  console.log(`🔄 Restoring ${recordIds.length} records from ${archiveTable}...`);

  const placeholders = recordIds.map(() => '?').join(',');

  // Copy back to main table (remove archived_at column)
  const columns = await db.pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [mainTable]);

  const columnNames = columns.rows.map(c => c.column_name).filter(c => c !== 'archived_at').join(', ');


  await db.query(`
    INSERT INTO ${mainTable} (${columnNames})
    SELECT ${columnNames}
    FROM ${archiveTable}
    WHERE id IN (${placeholders})
  `, recordIds);

  // Delete from archive
  await db.run(
    `DELETE FROM ${archiveTable} WHERE id IN (${placeholders})`,
    recordIds
  );

  console.log(`✅ Restored ${recordIds.length} records`);
  return recordIds.length;
};

/**
 * Clean up very old archive data (optional)
 */
export const cleanupOldArchives = async (daysToKeep: number = 365): Promise<number> => {
  console.log(`🗑️  Cleaning up archives older than ${daysToKeep} days...`);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffDateStr = cutoffDate.toISOString();

  let totalDeleted = 0;

  for (const config of ARCHIVE_CONFIGS) {
    const result = await db.run(
      `DELETE FROM ${config.archiveTable} WHERE archived_at < $1`,
      [cutoffDateStr]
    );

    const deleted = result.changes || 0;
    totalDeleted += deleted;

    if (deleted > 0) {
      console.log(`  🗑️  Deleted ${deleted} records from ${config.archiveTable}`);
    }
  }

  console.log(`✅ Cleanup completed: ${totalDeleted} records deleted`);
  return totalDeleted;
};
