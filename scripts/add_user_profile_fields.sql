-- Migration: Add phone and profile_image_url to users table
-- Date: 2026-01-29

-- Add phone column
ALTER TABLE users ADD COLUMN phone TEXT;

-- Add profile_image_url column
ALTER TABLE users ADD COLUMN profile_image_url TEXT;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
