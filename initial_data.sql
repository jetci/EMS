-- EMS WeCare Initial Data
-- Insert default DEVELOPER user for first login

-- Generate UUID for developer user (replace with actual UUID in production)
SET @dev_user_id = UUID();

-- Insert DEVELOPER user
-- Password: dev123 (hashed with werkzeug.security)
INSERT INTO users (id, name, email, password_hash, role, phone, status, created_at, updated_at)
VALUES (
    @dev_user_id,
    'Developer Admin',
    'jetci.jm@gmail.com',
    'scrypt:32768:8:1$YourHashHere$hash',  -- Replace with actual hash
    'DEVELOPER',
    '0812345678',
    'Active',
    NOW(),
    NOW()
);

-- Insert sample vehicles
INSERT INTO vehicles (id, license_plate, model, brand, type, status) VALUES
(UUID(), 'กข-1234', 'Ambulance Standard', 'Toyota', 'AMBULANCE', 'AVAILABLE'),
(UUID(), 'กข-5678', 'Ambulance Advanced', 'Mercedes-Benz', 'AMBULANCE', 'AVAILABLE'),
(UUID(), 'กข-9012', 'Van', 'Toyota', 'VAN', 'AVAILABLE');

-- Note: To create the actual password hash, run this in Python:
-- from werkzeug.security import generate_password_hash
-- print(generate_password_hash('dev123'))
