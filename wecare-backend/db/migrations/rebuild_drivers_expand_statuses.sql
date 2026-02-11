PRAGMA foreign_keys=OFF;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS drivers_new (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  license_expiry TEXT,
  status TEXT DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'ON_TRIP', 'OFFLINE', 'INACTIVE', 'ON_DUTY', 'OFF_DUTY', 'UNAVAILABLE')),
  current_vehicle_id TEXT,
  profile_image_url TEXT,
  total_trips INTEGER DEFAULT 0,
  trips_this_month INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (current_vehicle_id) REFERENCES vehicles(id)
);

INSERT INTO drivers_new (
  id,
  user_id,
  full_name,
  phone,
  license_number,
  license_expiry,
  status,
  current_vehicle_id,
  profile_image_url,
  total_trips,
  trips_this_month,
  created_at,
  updated_at
)
SELECT
  id,
  user_id,
  full_name,
  phone,
  license_number,
  license_expiry,
  CASE status
    WHEN 'ON_DUTY' THEN 'ON_TRIP'
    WHEN 'OFF_DUTY' THEN 'OFFLINE'
    WHEN 'UNAVAILABLE' THEN 'INACTIVE'
    ELSE status
  END as status,
  current_vehicle_id,
  profile_image_url,
  total_trips,
  trips_this_month,
  created_at,
  updated_at
FROM drivers;

DROP TABLE drivers;
ALTER TABLE drivers_new RENAME TO drivers;

COMMIT;

PRAGMA foreign_keys=ON;

