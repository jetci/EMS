#!/usr/bin/env python3
"""
Script to create initial DEVELOPER user with hashed password
Run this to generate the password hash for initial_data.sql
"""

from werkzeug.security import generate_password_hash
import uuid

# Generate password hash
password = "dev123"
password_hash = generate_password_hash(password)

# Generate UUID
user_id = str(uuid.uuid4())

print("=" * 60)
print("EMS WeCare - Create Developer User")
print("=" * 60)
print(f"\nUser ID: {user_id}")
print(f"Email: jetci.jm@gmail.com")
print(f"Password: {password}")
print(f"Password Hash: {password_hash}")
print("\n" + "=" * 60)
print("\nSQL INSERT Statement:")
print("=" * 60)

sql = f"""
INSERT INTO users (id, name, email, password_hash, role, phone, status, created_at, updated_at)
VALUES (
    '{user_id}',
    'Developer Admin',
    'jetci.jm@gmail.com',
    '{password_hash}',
    'DEVELOPER',
    '0812345678',
    'Active',
    NOW(),
    NOW()
);
"""

print(sql)
print("\nCopy the above SQL and run it in your MySQL database.")
print("=" * 60)
