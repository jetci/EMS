PRAGMA foreign_keys=OFF;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS teams_new (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  leader_id TEXT,
  member_ids TEXT,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO teams_new (id, name, description, leader_id, member_ids, status, created_at, updated_at)
SELECT id, name, description, leader_id, member_ids, status, created_at, updated_at
FROM teams;

DROP TABLE teams;
ALTER TABLE teams_new RENAME TO teams;

COMMIT;

PRAGMA foreign_keys=ON;

