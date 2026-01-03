/**
 * Idempotency middleware for EMS WeCare
 * Prevents duplicate submissions within a time window
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { sqliteDB } from '../db/sqliteDB';

/**
 * Check for duplicate patient submission
 * Prevents creating duplicate patients within 5 seconds
 */
export const checkDuplicatePatient = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { fullName, nationalId } = req.body;
        const userId = req.user?.id;

        if (!userId || !fullName) {
            return next(); // Skip check if missing required data
        }

        // Check for duplicate within last 5 seconds
        const duplicate = sqliteDB.db.prepare(`
      SELECT id, created_at FROM patients 
      WHERE created_by = ? 
        AND full_name = ? 
        AND (national_id = ? OR (national_id IS NULL AND ? IS NULL))
        AND created_at > datetime('now', '-5 seconds')
    `).get(userId, fullName, nationalId || null, nationalId || null);

        if (duplicate) {
            return res.status(409).json({
                error: 'Duplicate submission detected. Please wait before submitting again.',
                message: 'คุณเพิ่งส่งข้อมูลผู้ป่วยนี้ไปแล้ว กรุณารอสักครู่ก่อนส่งอีกครั้ง',
                existingId: (duplicate as any).id,
                submittedAt: (duplicate as any).created_at
            });
        }

        next();
    } catch (error: any) {
        console.error('Error checking duplicate patient:', error);
        // Don't block request on error, just log it
        next();
    }
};

/**
 * Check for duplicate ride request
 * Prevents creating duplicate rides within 5 seconds
 */
export const checkDuplicateRide = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { patient_id, pickup_location, destination } = req.body;
        const userId = req.user?.id;

        if (!userId || !patient_id) {
            return next(); // Skip check if missing required data
        }

        // Check for duplicate within last 5 seconds
        const duplicate = sqliteDB.db.prepare(`
      SELECT id, created_at FROM rides 
      WHERE created_by = ? 
        AND patient_id = ? 
        AND pickup_location = ?
        AND (destination = ? OR (destination IS NULL AND ? IS NULL))
        AND created_at > datetime('now', '-5 seconds')
    `).get(userId, patient_id, pickup_location || '', destination || null, destination || null);

        if (duplicate) {
            return res.status(409).json({
                error: 'Duplicate ride request detected.',
                message: 'คุณเพิ่งส่งคำขอเรียกรถนี้ไปแล้ว กรุณารอสักครู่ก่อนส่งอีกครั้ง',
                existingId: (duplicate as any).id,
                submittedAt: (duplicate as any).created_at
            });
        }

        next();
    } catch (error: any) {
        console.error('Error checking duplicate ride:', error);
        // Don't block request on error, just log it
        next();
    }
};

/**
 * Generic idempotency check
 * Can be used for any resource type
 */
export const checkIdempotency = (
    table: string,
    fields: string[],
    timeWindowSeconds: number = 5
) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return next(); // Skip check if no user
            }

            // Build WHERE clause
            const conditions = ['created_by = ?'];
            const params: any[] = [userId];

            fields.forEach(field => {
                const value = req.body[field];
                if (value !== undefined) {
                    conditions.push(`${field} = ?`);
                    params.push(value);
                }
            });

            conditions.push(`created_at > datetime('now', '-${timeWindowSeconds} seconds')`);

            const sql = `SELECT id, created_at FROM ${table} WHERE ${conditions.join(' AND ')}`;
            const duplicate = sqliteDB.db.prepare(sql).get(...params);

            if (duplicate) {
                return res.status(409).json({
                    error: 'Duplicate submission detected.',
                    message: 'คุณเพิ่งส่งข้อมูลนี้ไปแล้ว กรุณารอสักครู่ก่อนส่งอีกครั้ง',
                    existingId: (duplicate as any).id,
                    submittedAt: (duplicate as any).created_at
                });
            }

            next();
        } catch (error: any) {
            console.error('Error checking idempotency:', error);
            // Don't block request on error, just log it
            next();
        }
    };
};

/**
 * Expose database instance for transaction support
 */
export const db = sqliteDB.db;
