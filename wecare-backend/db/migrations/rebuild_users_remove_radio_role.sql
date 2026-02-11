PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS users_new (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('DEVELOPER', 'admin', 'OFFICER', 'radio_center', 'driver', 'community', 'EXECUTIVE')),
    full_name TEXT NOT NULL,
    date_created TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
    phone TEXT,
    profile_image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users_new (
    id,
    email,
    password,
    role,
    full_name,
    date_created,
    status,
    phone,
    profile_image_url,
    created_at,
    updated_at
)
SELECT
    id,
    email,
    password,
    CASE WHEN role = 'radio' THEN 'radio_center' ELSE role END,
    full_name,
    date_created,
    status,
    phone,
    profile_image_url,
    created_at,
    updated_at
FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

PRAGMA foreign_keys=ON;
