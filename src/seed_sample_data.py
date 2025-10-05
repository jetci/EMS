#!/usr/bin/env python3
"""Seed sample data for development"""
import sys
from pathlib import Path
from datetime import datetime, timedelta

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.models.ems_models import db, User, Patient, Ride, DriverProfile
from src.main import app

def seed_sample_data():
    with app.app_context():
        print("Creating sample data...")
        
        # Get existing users
        admin = User.query.filter_by(email='admin@wecare.dev').first()
        officer = User.query.filter_by(email='officer1@wecare.dev').first()
        driver = User.query.filter_by(email='driver1@wecare.dev').first()
        community = User.query.filter_by(email='community1@wecare.dev').first()
        
        if not all([admin, officer, driver, community]):
            print("Error: Users not found. Run seed_test_users.py first.")
            return
        
        # Create sample patients
        patients_data = [
            {'full_name': 'กานดา สุขใจ', 'contact_phone': '081-111-1111', 'current_address': '{"address": "123 ถนนสุขุมวิท"}'},
            {'full_name': 'วิชัย มีนัย', 'contact_phone': '082-222-2222', 'current_address': '{"address": "456 ถนนพหลโยธิน"}'},
            {'full_name': 'มานี ใจดี', 'contact_phone': '083-333-3333', 'current_address': '{"address": "789 ถนนรัชดา"}'},
            {'full_name': 'สมศรี รักสงบ', 'contact_phone': '084-444-4444', 'current_address': '{"address": "321 ถนนเพชรบุรี"}'},
            {'full_name': 'อรุณ รุ่งเรือง', 'contact_phone': '085-555-5555', 'current_address': '{"address": "654 ถนนสาทร"}'},
        ]
        
        patients = []
        for data in patients_data:
            existing = Patient.query.filter_by(full_name=data['full_name']).first()
            if existing:
                print(f"  - Patient exists: {data['full_name']}")
                patients.append(existing)
            else:
                patient = Patient(
                    full_name=data['full_name'],
                    contact_phone=data['contact_phone'],
                    current_address=data['current_address'],
                    registered_by_id=officer.id
                )
                db.session.add(patient)
                patients.append(patient)
                print(f"  ✓ Created patient: {data['full_name']}")
        
        db.session.commit()
        
        # Create sample rides
        rides_data = [
            {'patient': patients[0], 'destination': 'โรงพยาบาลศิริราช', 'status': 'pending', 'days_offset': 1},
            {'patient': patients[1], 'destination': 'โรงพยาบาลรามาธิบดี', 'status': 'assigned', 'days_offset': 0},
            {'patient': patients[2], 'destination': 'โรงพยาบาลจุฬาลงกรณ์', 'status': 'completed', 'days_offset': -1},
            {'patient': patients[3], 'destination': 'โรงพยาบาลบำรุงราษฎร์', 'status': 'completed', 'days_offset': -2},
            {'patient': patients[4], 'destination': 'โรงพยาบาลกรุงเทพ', 'status': 'cancelled', 'days_offset': -3},
        ]
        
        for data in rides_data:
            appointment_time = datetime.now() + timedelta(days=data['days_offset'])
            ride = Ride(
                patient_id=data['patient'].id,
                requester_id=community.id,
                pickup_location='{"address": "ตามที่อยู่ผู้ป่วย"}',
                destination=data['destination'],
                appointment_time=appointment_time,
                status=data['status']
            )
            if data['status'] in ['assigned', 'completed']:
                ride.driver_id = driver.id
            db.session.add(ride)
            print(f"  ✓ Created ride: {data['patient'].full_name} -> {data['destination']} ({data['status']})")
        
        db.session.commit()
        print("\n✓ Sample data created successfully")

if __name__ == '__main__':
    seed_sample_data()
