/**
 * Soft Delete Middleware
 * Implements soft delete pattern for data retention
 */

import { sqliteDB } from '../db/sqliteDB';

/**
 * Add deleted_at column to tables
 */
export const enableSoftDelete = (tables: string[]): void => {
  console.log('🗑️  Enabling soft delete...');

  for (const table of tables) {
    try {
      // Check if column exists
      const columns = sqliteDB
        .prepare(`PRAGMA table_info(${table})`)
        .all() as any[];

      const hasDeletedAt = columns.some(c => c.name === 'deleted_at');

      if (!hasDeletedAt) {
        sqliteDB.exec(`ALTER TABLE ${table} ADD COLUMN deleted_at TEXT`);
        console.log(`  ✅ Added deleted_at to ${table}`);
      } else {
        console.log(`  ℹ️  ${table} already has deleted_at`);
      }
    } catch (error) {
      console.error(`  ❌ Error adding deleted_at to ${table}:`, error);
    }
  }

  console.log('✅ Soft delete enabled');
};

/**
 * Soft delete a record
 */
export const softDelete = (table: string, id: string): void => {
  const now = new Date().toISOString();

  sqliteDB.run(
    `UPDATE ${table} SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL`,
    [now, id]
  );
};

/**
 * Restore a soft-deleted record
 */
export const restoreSoftDeleted = (table: string, id: string): void => {
  sqliteDB.run(
    `UPDATE ${table} SET deleted_at = NULL WHERE id = ?`,
    [id]
  );
};

/**
 * Permanently delete soft-deleted records older than X days
 */
export const permanentlyDeleteOld = (
  table: string,
  daysOld: number = 30
): number => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  const cutoffDateStr = cutoffDate.toISOString();

  const result = sqliteDB.run(
    `DELETE FROM ${table} WHERE deleted_at IS NOT NULL AND deleted_at < ?`,
    [cutoffDateStr]
  );

  return result.changes || 0;
};

/**
 * Get all soft-deleted records
 */
export const getSoftDeleted = <T>(table: string): T[] => {
  return sqliteDB.all<T>(
    `SELECT * FROM ${table} WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`
  );
};

/**
 * Count soft-deleted records
 */
export const countSoftDeleted = (table: string): number => {
  const result = sqliteDB.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table} WHERE deleted_at IS NOT NULL`
  );

  return result?.count || 0;
};

/**
 * Modified sqliteDB wrapper with soft delete support
 */
export const softDeleteDB = {
  /**
   * Get all records (excluding soft-deleted)
   */
  all: <T>(sql: string, params?: any[]): T[] => {
    // Add WHERE clause to exclude deleted
    if (sql.toLowerCase().includes('where')) {
      sql = sql.replace(/where/i, 'WHERE deleted_at IS NULL AND');
    } else if (sql.toLowerCase().includes('from')) {
      sql = sql.replace(/from\s+(\w+)/i, 'FROM $1 WHERE deleted_at IS NULL');
    }

    return sqliteDB.all<T>(sql, params);
  },

  /**
   * Get single record (excluding soft-deleted)
   */
  get: <T>(sql: string, params?: any[]): T | undefined => {
    // Add WHERE clause to exclude deleted
    if (sql.toLowerCase().includes('where')) {
      sql = sql.replace(/where/i, 'WHERE deleted_at IS NULL AND');
    } else if (sql.toLowerCase().includes('from')) {
      sql = sql.replace(/from\s+(\w+)/i, 'FROM $1 WHERE deleted_at IS NULL');
    }

    return sqliteDB.get<T>(sql, params);
  },

  /**
   * Soft delete instead of hard delete
   */
  delete: (table: string, id: string): void => {
    softDelete(table, id);
  },

  /**
   * Insert (same as regular)
   */
  insert: (table: string, data: any): void => {
    sqliteDB.insert(table, data);
  },

  /**
   * Update (same as regular)
   */
  update: (table: string, id: string, data: any): void => {
    sqliteDB.update(table, id, data);
  },
};
