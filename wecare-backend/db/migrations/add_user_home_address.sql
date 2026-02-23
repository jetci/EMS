-- Migration: Add home address fields to users table
-- Date: 2026-02-23

ALTER TABLE users ADD COLUMN home_house_number TEXT;
ALTER TABLE users ADD COLUMN home_village TEXT;
ALTER TABLE users ADD COLUMN home_tambon TEXT;
ALTER TABLE users ADD COLUMN home_amphoe TEXT;
ALTER TABLE users ADD COLUMN home_changwat TEXT;

