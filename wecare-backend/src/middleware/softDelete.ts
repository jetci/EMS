/**
 * Soft Delete Middleware
 * Implements soft delete pattern for data retention (PostgreSQL Version)
 */

import { db } from '../db';

/**
 * Add deleted_at column to tables
 * Note: In PostgreSQL, this should ideally be part of migration scripts.
 */
export const enableSoftDelete = async (tables: string[]): Promise<void> => {
  console.log('🗑️  Enabling soft delete...');

  for (const table of tables) {
    try {
      // Check if column exists in PostgreSQL
      const query = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = 'deleted_at'
      `;
      const res = await db.query(query, [table]);

      if (res.rowCount === 0) {
        await db.query(`ALTER TABLE ${table} ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE`);
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
export const softDelete = async (table: string, id: string): Promise<void> => {
  await db.query(
    `UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
};

/**
 * Restore a soft-deleted record
 */
export const restoreSoftDeleted = async (table: string, id: string): Promise<void> => {
  await db.query(
    `UPDATE ${table} SET deleted_at = NULL WHERE id = $1`,
    [id]
  );
};

/**
 * Permanently delete soft-deleted records older than X days
 */
export const permanentlyDeleteOld = async (
  table: string,
  daysOld: number = 30
): Promise<number> => {
  const result = await db.query(
    `DELETE FROM ${table} WHERE deleted_at IS NOT NULL AND deleted_at < CURRENT_TIMESTAMP - INTERVAL '$1 days'`,
    [daysOld]
  );

  return result.rowCount || 0;
};

/**
 * Get all soft-deleted records
 */
export const getSoftDeleted = async <T>(table: string): Promise<T[]> => {
  const res = await db.query(
    `SELECT * FROM ${table} WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`
  );
  return res.rows;
};

/**
 * Count soft-deleted records
 */
export const countSoftDeleted = async (table: string): Promise<number> => {
  const result = await db.query(
    `SELECT COUNT(*) as count FROM ${table} WHERE deleted_at IS NOT NULL`
  );

  return parseInt(result.rows[0].count) || 0;
};
