-- Migration: Add Missing Patient Fields
-- Date: 2026-01-29
-- Purpose: Add emergency contact and title fields to patients table

-- Add Emergency Contact fields
ALTER TABLE patients ADD COLUMN emergency_contact_name TEXT;
ALTER TABLE patients ADD COLUMN emergency_contact_phone TEXT;
ALTER TABLE patients ADD COLUMN emergency_contact_relation TEXT;

-- Add Title field
ALTER TABLE patients ADD COLUMN title TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_emergency_phone ON patients(emergency_contact_phone);
CREATE INDEX IF NOT EXISTS idx_patients_title ON patients(title);

-- Verify changes
SELECT sql FROM sqlite_master WHERE type='table' AND name='patients';
