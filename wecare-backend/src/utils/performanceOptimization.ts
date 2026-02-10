/**
 * Performance Optimization Utilities
 * Fixes N+1 queries and implements caching
 */

import { sqliteDB } from '../db/sqliteDB';

// Simple in-memory cache
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    set<T>(key: string, data: T, ttl: number = 300000): void { // Default 5 minutes
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    // Clear expired entries
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

// Export singleton instance
export const cache = new SimpleCache();

// Auto-cleanup every 5 minutes (disabled in test environment to prevent open handles)
if (process.env.NODE_ENV !== 'test') {
    setInterval(() => {
        cache.cleanup();
    }, 300000);
}

/**
 * Optimized Patient Queries (Fixes N+1 Problem)
 */

export interface PatientWithAttachments {
    id: string;
    full_name: string;
    national_id: string;
    phone: string;
    address: string;
    latitude: string;
    longitude: string;
    medical_info: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    attachments?: Array<{
        id: string;
        file_name: string;
        file_path: string;
        file_type: string;
        file_size: number;
        uploaded_at: string;
    }>;
}

/**
 * Get all patients with attachments (optimized - single query)
 * Fixes PERF-002: N+1 Query Problem
 */
export function getPatientsWithAttachments(): PatientWithAttachments[] {
    // Check cache first
    const cacheKey = 'patients:all';
    const cached = cache.get<PatientWithAttachments[]>(cacheKey);

    if (cached) {
        console.log('✅ Cache hit: patients:all');
        return cached;
    }

    console.log('🔍 Cache miss: patients:all - querying database');

    // ✅ OPTIMIZED: Single query with LEFT JOIN
    const query = `
    SELECT 
      p.*,
      pa.id as attachment_id,
      pa.file_name,
      pa.file_path,
      pa.file_type,
      pa.file_size,
      pa.uploaded_at
    FROM patients p
    LEFT JOIN patient_attachments pa ON p.id = pa.patient_id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC, pa.uploaded_at ASC
  `;

    const rows = sqliteDB.all<any>(query);

    // Group attachments by patient
    const patientsMap = new Map<string, PatientWithAttachments>();

    for (const row of rows) {
        if (!patientsMap.has(row.id)) {
            patientsMap.set(row.id, {
                id: row.id,
                full_name: row.full_name,
                national_id: row.national_id,
                phone: row.phone,
                address: row.address,
                latitude: row.latitude,
                longitude: row.longitude,
                medical_info: row.medical_info,
                created_by: row.created_by,
                created_at: row.created_at,
                updated_at: row.updated_at,
                attachments: []
            });
        }

        // Add attachment if exists
        if (row.attachment_id) {
            patientsMap.get(row.id)!.attachments!.push({
                id: row.attachment_id,
                file_name: row.file_name,
                file_path: row.file_path,
                file_type: row.file_type,
                file_size: row.file_size,
                uploaded_at: row.uploaded_at
            });
        }
    }

    const patients = Array.from(patientsMap.values());

    // Cache for 5 minutes
    cache.set(cacheKey, patients, 300000);

    return patients;
}

/**
 * Get single patient with attachments (optimized)
 */
export function getPatientWithAttachments(patientId: string): PatientWithAttachments | null {
    // Check cache first
    const cacheKey = `patient:${patientId}`;
    const cached = cache.get<PatientWithAttachments>(cacheKey);

    if (cached) {
        console.log(`✅ Cache hit: patient:${patientId}`);
        return cached;
    }

    console.log(`🔍 Cache miss: patient:${patientId} - querying database`);

    // ✅ OPTIMIZED: Single query with LEFT JOIN
    const query = `
    SELECT 
      p.*,
      pa.id as attachment_id,
      pa.file_name,
      pa.file_path,
      pa.file_type,
      pa.file_size,
      pa.uploaded_at
    FROM patients p
    LEFT JOIN patient_attachments pa ON p.id = pa.patient_id
    WHERE p.id = ? AND p.deleted_at IS NULL
    ORDER BY pa.uploaded_at ASC
  `;

    const rows = sqliteDB.all<any>(query, [patientId]);

    if (rows.length === 0) {
        return null;
    }

    const patient: PatientWithAttachments = {
        id: rows[0].id,
        full_name: rows[0].full_name,
        national_id: rows[0].national_id,
        phone: rows[0].phone,
        address: rows[0].address,
        latitude: rows[0].latitude,
        longitude: rows[0].longitude,
        medical_info: rows[0].medical_info,
        created_by: rows[0].created_by,
        created_at: rows[0].created_at,
        updated_at: rows[0].updated_at,
        attachments: []
    };

    // Add attachments
    for (const row of rows) {
        if (row.attachment_id) {
            patient.attachments!.push({
                id: row.attachment_id,
                file_name: row.file_name,
                file_path: row.file_path,
                file_type: row.file_type,
                file_size: row.file_size,
                uploaded_at: row.uploaded_at
            });
        }
    }

    // Cache for 5 minutes
    cache.set(cacheKey, patient, 300000);

    return patient;
}

/**
 * Invalidate cache when data changes
 */
export function invalidatePatientCache(patientId?: string): void {
    if (patientId) {
        cache.delete(`patient:${patientId}`);
        console.log(`🗑️  Cache invalidated: patient:${patientId}`);
    }

    // Always invalidate the list cache
    cache.delete('patients:all');
    console.log('🗑️  Cache invalidated: patients:all');
}

/**
 * Optimized Ride Queries
 */

export interface RideWithDetails {
    id: string;
    patient_id: string;
    patient_name: string;
    driver_id: string | null;
    driver_name: string | null;
    pickup_location: string;
    destination: string;
    status: string;
    created_at: string;
    updated_at: string;
}

/**
 * Get all rides with patient and driver names (optimized)
 * Fixes PERF-002: N+1 Query Problem
 */
export function getRidesWithDetails(): RideWithDetails[] {
    // Check cache
    const cacheKey = 'rides:all';
    const cached = cache.get<RideWithDetails[]>(cacheKey);

    if (cached) {
        console.log('✅ Cache hit: rides:all');
        return cached;
    }

    console.log('🔍 Cache miss: rides:all - querying database');

    // ✅ OPTIMIZED: Single query with JOINs
    const query = `
    SELECT 
      r.*,
      p.full_name as patient_name,
      d.full_name as driver_name
    FROM rides r
    LEFT JOIN patients p ON r.patient_id = p.id
    LEFT JOIN drivers d ON r.driver_id = d.id
    ORDER BY r.created_at DESC
  `;

    const rides = sqliteDB.all<RideWithDetails>(query);

    // Cache for 2 minutes (rides change frequently)
    cache.set(cacheKey, rides, 120000);

    return rides;
}

/**
 * Invalidate ride cache
 */
export function invalidateRideCache(rideId?: string): void {
    if (rideId) {
        cache.delete(`ride:${rideId}`);
    }
    cache.delete('rides:all');
    console.log('🗑️  Cache invalidated: rides');
}

/**
 * Performance monitoring
 */
export function getCacheStats() {
    return {
        size: (cache as any).cache.size,
        keys: Array.from((cache as any).cache.keys())
    };
}
