#!/usr/bin/env python3
"""Seed test users for development using Flask-SQLAlchemy models"""
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.models.ems_models import db, User
from src.main import app

def seed_users():
    with app.app_context():
        # Create tables if not exist
        db.create_all()
        
        test_users = [
            ('admin@wecare.dev', 'password', 'Admin User', 'Admin'),
            ('office1@wecare.dev', 'password', 'Office Staff', 'Officer'),
            ('officer1@wecare.dev', 'password', 'Officer User', 'Officer'),
            ('driver1@wecare.dev', 'password', 'Driver User', 'Driver'),
            ('community1@wecare.dev', 'password', 'Community User', 'Community'),
            ('executive1@wecare.dev', 'password', 'Executive User', 'Executive'),
        ]
        
        for email, password, name, role in test_users:
            existing = User.query.filter_by(email=email).first()
            if existing:
                print(f"- Exists: {email}")
                continue
            
            user = User(
                name=name,
                email=email,
                role=role,
                status='Active'
            )
            user.set_password(password)
            db.session.add(user)
            print(f"✓ Created: {email} / {password} ({role})")
        
        db.session.commit()
        print(f"\n✓ Seed complete.")

if __name__ == '__main__':
    seed_users()
