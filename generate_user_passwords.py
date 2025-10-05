#!/usr/bin/env python3
"""
Script to generate password hashes for all users from old database
Run this before migration to create password hashes
"""

from werkzeug.security import generate_password_hash
import uuid

# Default password for all migrated users
DEFAULT_PASSWORD = "wecare123"

print("=" * 70)
print("EMS WeCare - Generate Password Hashes for Migration")
print("=" * 70)
print(f"\nDefault Password: {DEFAULT_PASSWORD}")
print("(Users should change this after first login)")
print("\n" + "=" * 70)

# Generate password hash
password_hash = generate_password_hash(DEFAULT_PASSWORD)

print("\nPassword Hash:")
print("-" * 70)
print(password_hash)
print("-" * 70)

print("\n\nSQL UPDATE Statement:")
print("=" * 70)

sql = f"""
-- Update all users with default password hash
UPDATE users 
SET password_hash = '{password_hash}'
WHERE password_hash = 'TEMP_HASH_REPLACE_ME';

-- Or update specific user by email
UPDATE users 
SET password_hash = '{password_hash}'
WHERE email = 'user@example.com';
"""

print(sql)

print("\n" + "=" * 70)
print("Instructions:")
print("=" * 70)
print("1. Copy the password hash above")
print("2. Replace 'TEMP_HASH_REPLACE_ME' in migration_script.sql")
print("3. Or run the UPDATE statement after migration")
print("4. Inform users to change password after first login")
print("=" * 70)
