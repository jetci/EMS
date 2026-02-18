-- Team Shifts Tables for scheduling model "team"
-- 1) team_shifts: one row per team per date (high level)
-- 2) team_shift_assignments: optional detail per vehicle or sub-shift (future-proof)

CREATE TABLE IF NOT EXISTS team_shifts (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    shift_date TEXT NOT NULL,
    status TEXT NOT NULL, -- e.g. ON_DUTY, REST_DAY
    notes TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, shift_date),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS team_shift_assignments (
    id TEXT PRIMARY KEY,
    team_shift_id TEXT NOT NULL,
    vehicle_id TEXT,
    driver_id TEXT,
    helper_ids TEXT, -- JSON array of staff ids
    properties TEXT, -- JSON for future extensions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_shift_id) REFERENCES team_shifts(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

