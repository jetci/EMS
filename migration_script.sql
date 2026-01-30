-- Migration Script: แปลงข้อมูลจาก Schema เดิมเป็น Schema ใหม่
-- Database: wiangwec_wecare

-- ขั้นตอนที่ 1: สร้าง Schema ใหม่
-- รัน: database_schema.sql ก่อน

-- ขั้นตอนที่ 2: Migration ข้อมูล

-- 1. Migrate Users (ต้องเพิ่ม password_hash)
-- หมายเหตุ: ต้องสร้าง password hash ด้วย Python script ก่อน
INSERT INTO users (id, name, email, password_hash, role, phone, profile_image_url, status, created_at, updated_at)
SELECT 
    id,
    full_name as name,
    email,
    'TEMP_HASH_REPLACE_ME' as password_hash,  -- ต้องแทนที่ด้วย hash จริง
    role,
    phone,
    profile_image_url,
    status,
    date_created as created_at,
    updated_at
FROM old_users;  -- ต้อง rename table เดิมเป็น old_users ก่อน

-- 2. Migrate Drivers → Driver Profiles
INSERT INTO driver_profiles (user_id, license_plate, address, vehicle_id, avg_review_score, date_created)
SELECT 
    d.id as user_id,
    d.license_plate,
    d.address,
    NULL as vehicle_id,  -- ต้อง map ภายหลัง
    d.avg_review_score,
    d.date_created
FROM old_drivers d;

-- 3. Migrate Patients
INSERT INTO patients (
    id, full_name, profile_image_url, title, gender, national_id, dob, age,
    patient_types, blood_type, rh_factor, health_coverage, chronic_diseases, allergies,
    contact_phone, id_card_address, current_address, landmark, latitude, longitude,
    registered_date, registered_by_id, key_info, caregiver_name, caregiver_phone
)
SELECT 
    id, full_name, profile_image_url, title, gender, national_id, dob, age,
    patient_types, blood_type, rh_factor, health_coverage, chronic_diseases, allergies,
    contact_phone, id_card_address, current_address, landmark, latitude, longitude,
    registered_date, registered_by as registered_by_id, key_info, caregiver_name, caregiver_phone
FROM old_patients;

-- 4. Migrate Vehicles
INSERT INTO vehicles (id, license_plate, model, brand, type, status, assigned_team_id, next_maintenance_date)
SELECT 
    id, license_plate, model, brand, type, status, assigned_team_id, next_maintenance_date
FROM old_vehicles;

-- 5. Migrate Rides
INSERT INTO rides (
    id, patient_id, requester_id, pickup_location, destination, appointment_time,
    status, driver_id, vehicle_id, special_needs, caregiver_count,
    rating, review_tags, review_comment, created_at, updated_at
)
SELECT 
    id, patient_id, requested_by as requester_id, pickup_location, destination, appointment_time,
    status, driver_id, NULL as vehicle_id, special_needs, caregiver_count,
    rating, review_tags, review_comment, NOW() as created_at, NOW() as updated_at
FROM old_rides;

-- 6. Migrate News Articles
INSERT INTO news_articles (id, title, content, author, status, published_date, scheduled_date, featured_image_url, created_at, updated_at)
SELECT 
    id, title, content, author, status, published_date, scheduled_date, featured_image_url,
    NOW() as created_at, NOW() as updated_at
FROM old_news_articles;

-- 7. Migrate Audit Logs
INSERT INTO audit_logs (id, timestamp, user_email, user_role, action, target_id, ip_address, data_payload)
SELECT 
    id, timestamp, user_email, user_role, action, target_id, ip_address, data_payload
FROM old_audit_logs;

-- หมายเหตุ:
-- 1. Rename tables เดิมเป็น old_* ก่อนรัน migration
-- 2. สร้าง password hash สำหรับ users ด้วย Python script
-- 3. ทดสอบบน development database ก่อน
-- 4. Backup ข้อมูลก่อนรัน migration
