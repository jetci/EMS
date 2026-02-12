#!/usr/bin/env python3
"""
Seed data script for EMS application
This script creates initial users and sample data for testing
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, date, timedelta
from src.models.ems_models import db, User, Patient, Ride, DriverProfile, Vehicle, NewsArticle
from src.main import app

def create_users():
    """Create initial users for testing"""
    users_data = [
        {
            'name': 'Driver One',
            'email': 'driver1@wecare.dev',
            'password': 'password',
            'role': 'driver',
            'phone': '081-234-5678'
        },
        {
            'name': 'Community User',
            'email': 'community1@wecare.dev',
            'password': 'password',
            'role': 'community',
            'phone': '082-345-6789'
        },
        {
            'name': 'Office Operator',
            'email': 'office1@wecare.dev',
            'password': 'password',
            'role': 'office',
            'phone': '083-456-7890'
        },
        {
            'name': 'Officer User',
            'email': 'officer1@wecare.dev',
            'password': 'password',
            'role': 'OFFICER',
            'phone': '084-567-8901'
        },
        {
            'name': 'Executive User',
            'email': 'executive1@wecare.dev',
            'password': 'password',
            'role': 'EXECUTIVE',
            'phone': '085-678-9012'
        },
        {
            'name': 'Admin User',
            'email': 'admin@wecare.dev',
            'password': 'password',
            'role': 'admin',
            'phone': '086-789-0123'
        },
        {
            'name': 'Developer User',
            'email': 'jetci.j@gmail.com',
            'password': 'g0KEk,^],k;yo',
            'role': 'DEVELOPER',
            'phone': '087-890-1234'
        }
    ]
    
    created_users = {}
    for user_data in users_data:
        # Check if user already exists
        existing_user = User.query.filter_by(email=user_data['email']).first()
        if existing_user:
            created_users[user_data['role']] = existing_user
            continue
            
        user = User(
            name=user_data['name'],
            email=user_data['email'],
            role=user_data['role'],
            phone=user_data['phone']
        )
        user.set_password(user_data['password'])
        db.session.add(user)
        created_users[user_data['role']] = user
    
    db.session.commit()
    print(f"Created {len(users_data)} users")
    return created_users

def create_vehicles():
    """Create sample vehicles"""
    vehicles_data = [
        {
            'license_plate': 'กท 1234',
            'model': 'Vios',
            'brand': 'Toyota',
            'type': 'Sedan'
        },
        {
            'license_plate': 'ชล 5678',
            'model': 'City',
            'brand': 'Honda',
            'type': 'Sedan'
        },
        {
            'license_plate': 'กท 9012',
            'model': 'D-Max',
            'brand': 'Isuzu',
            'type': 'Pickup'
        }
    ]
    
    created_vehicles = []
    for vehicle_data in vehicles_data:
        # Check if vehicle already exists
        existing_vehicle = Vehicle.query.filter_by(license_plate=vehicle_data['license_plate']).first()
        if existing_vehicle:
            created_vehicles.append(existing_vehicle)
            continue
            
        vehicle = Vehicle(**vehicle_data)
        db.session.add(vehicle)
        created_vehicles.append(vehicle)
    
    db.session.commit()
    print(f"Created {len(vehicles_data)} vehicles")
    return created_vehicles

def create_driver_profiles(users, vehicles):
    """Create driver profiles for driver users"""
    if 'driver' not in users:
        return
        
    driver_user = users['driver']
    
    # Check if profile already exists
    if driver_user.driver_profile:
        return
        
    profile = DriverProfile(
        user_id=driver_user.id,
        license_plate='กท 1234',
        address='123 ถนนสุขุมวิท, วัฒนา, กรุงเทพฯ',
        vehicle_id=vehicles[0].id if vehicles else None
    )
    db.session.add(profile)
    db.session.commit()
    print("Created driver profile")

def create_patients(users):
    """Create sample patients"""
    if 'community' not in users:
        return []
        
    community_user = users['community']
    
    patients_data = [
        {
            'full_name': 'สมชาย ใจดี',
            'title': 'นาย',
            'gender': 'ชาย',
            'national_id': '1234567890123',
            'dob': date(1952, 1, 15),
            'age': 72,
            'patient_types': ['ผู้สูงอายุ', 'ผู้ป่วยภาวะพึงพิง'],
            'blood_type': 'A',
            'rh_factor': 'Rh+',
            'health_coverage': 'สิทธิบัตรทอง (UC)',
            'chronic_diseases': ['เบาหวาน', 'ความดันสูง'],
            'allergies': ['ไม่มี'],
            'contact_phone': '081-111-2222',
            'current_address': {
                'houseNumber': '123',
                'village': 'หมู่ 1 บ้านหนองตุ้ม',
                'tambon': 'เวียง',
                'amphoe': 'ฝาง',
                'changwat': 'เชียงใหม่'
            },
            'landmark': 'ใกล้ตลาด',
            'latitude': '19.9213',
            'longitude': '99.2131',
            'key_info': 'โรคเบาหวาน, ความดันสูง'
        },
        {
            'full_name': 'สมหญิง มีสุข',
            'title': 'นาง',
            'gender': 'หญิง',
            'national_id': '2345678901234',
            'dob': date(1956, 2, 20),
            'age': 68,
            'patient_types': ['ผู้ป่วยติดเตียง'],
            'blood_type': 'B',
            'rh_factor': 'Rh+',
            'health_coverage': 'ประกันสังคม',
            'chronic_diseases': ['ผู้ป่วยติดเตียง'],
            'allergies': ['เพนนิซิลลิน'],
            'contact_phone': '082-222-3333',
            'current_address': {
                'houseNumber': '456',
                'village': 'หมู่ 2 ป่าบง',
                'tambon': 'เวียง',
                'amphoe': 'ฝาง',
                'changwat': 'เชียงใหม่'
            },
            'landmark': '',
            'latitude': '19.9250',
            'longitude': '99.2100',
            'key_info': 'ผู้ป่วยติดเตียง',
            'caregiver_name': 'สมศักดิ์ มีสุข',
            'caregiver_phone': '089-999-9999'
        },
        {
            'full_name': 'อาทิตย์ แจ่มใส',
            'title': 'นาย',
            'gender': 'ชาย',
            'national_id': '3456789012345',
            'dob': date(1944, 3, 10),
            'age': 80,
            'patient_types': ['ผู้สูงอายุ'],
            'blood_type': 'O',
            'rh_factor': 'Rh+',
            'health_coverage': 'ข้าราชการ',
            'chronic_diseases': ['โรคหัวใจ'],
            'allergies': ['ไม่มี'],
            'contact_phone': '083-333-4444',
            'current_address': {
                'houseNumber': '789',
                'village': 'หมู่ 3 เต๋าดิน, เวียงสุทโธ',
                'tambon': 'เวียง',
                'amphoe': 'ฝาง',
                'changwat': 'เชียงใหม่'
            },
            'landmark': '',
            'latitude': '19.9111',
            'longitude': '99.2222',
            'key_info': 'โรคหัวใจ'
        }
    ]
    
    created_patients = []
    for patient_data in patients_data:
        # Check if patient already exists
        existing_patient = Patient.query.filter_by(national_id=patient_data['national_id']).first()
        if existing_patient:
            created_patients.append(existing_patient)
            continue
            
        patient = Patient(
            full_name=patient_data['full_name'],
            title=patient_data['title'],
            gender=patient_data['gender'],
            national_id=patient_data['national_id'],
            dob=patient_data['dob'],
            age=patient_data['age'],
            blood_type=patient_data['blood_type'],
            rh_factor=patient_data['rh_factor'],
            health_coverage=patient_data['health_coverage'],
            contact_phone=patient_data['contact_phone'],
            landmark=patient_data['landmark'],
            latitude=patient_data['latitude'],
            longitude=patient_data['longitude'],
            registered_by_id=community_user.id,
            key_info=patient_data['key_info'],
            caregiver_name=patient_data.get('caregiver_name'),
            caregiver_phone=patient_data.get('caregiver_phone')
        )
        
        # Set JSON fields
        patient.set_patient_types(patient_data['patient_types'])
        patient.set_chronic_diseases(patient_data['chronic_diseases'])
        patient.set_allergies(patient_data['allergies'])
        patient.set_current_address(patient_data['current_address'])
        patient.set_id_card_address(patient_data['current_address'])  # Same as current for simplicity
        
        db.session.add(patient)
        created_patients.append(patient)
    
    db.session.commit()
    print(f"Created {len(patients_data)} patients")
    return created_patients

def create_rides(users, patients):
    """Create sample rides"""
    if 'community' not in users or 'driver' not in users or not patients:
        return []
        
    community_user = users['community']
    driver_user = users['driver']
    
    rides_data = [
        {
            'patient_id': patients[0].id,
            'pickup_location': '123 ถนนสุขุมวิท, วัฒนา',
            'destination': 'โรงพยาบาลกรุงเทพ',
            'appointment_time': datetime.now() + timedelta(days=1, hours=9, minutes=30),
            'status': 'ASSIGNED',
            'driver_id': driver_user.id,
            'special_needs': ['ต้องใช้วีลแชร์', 'มีอาการเมารถ'],
            'caregiver_count': 1
        },
        {
            'patient_id': patients[1].id,
            'pickup_location': '456 ถนนพหลโยธิน, จตุจักร',
            'destination': 'โรงพยาบาลบำรุงราษฎร์',
            'appointment_time': datetime.now() + timedelta(days=1, hours=11),
            'status': 'ASSIGNED',
            'driver_id': driver_user.id,
            'special_needs': ['ต้องการรถวีลแชร์'],
            'caregiver_count': 1
        },
        {
            'patient_id': patients[2].id,
            'pickup_location': '789 ถนนพระราม 4, คลองเตย',
            'destination': 'โรงพยาบาลสมิติเวช',
            'appointment_time': datetime.now() + timedelta(days=1, hours=14),
            'status': 'PENDING',
            'special_needs': [],
            'caregiver_count': 0
        },
        {
            'patient_id': patients[0].id,
            'pickup_location': '123 ถนนสุขุมวิท, วัฒนา',
            'destination': 'โรงพยาบาลจุฬาลงกรณ์',
            'appointment_time': datetime.now() - timedelta(days=1, hours=9),
            'status': 'COMPLETED',
            'driver_id': driver_user.id,
            'special_needs': [],
            'caregiver_count': 0,
            'rating': 5,
            'review_tags': ['ตรงต่อเวลา', 'สุภาพ'],
            'review_comment': 'บริการดีมาก ขอบคุณครับ'
        }
    ]
    
    created_rides = []
    for ride_data in rides_data:
        ride = Ride(
            patient_id=ride_data['patient_id'],
            requester_id=community_user.id,
            pickup_location=ride_data['pickup_location'],
            destination=ride_data['destination'],
            appointment_time=ride_data['appointment_time'],
            status=ride_data['status'],
            driver_id=ride_data.get('driver_id'),
            caregiver_count=ride_data['caregiver_count'],
            rating=ride_data.get('rating'),
            review_comment=ride_data.get('review_comment')
        )
        
        # Set JSON fields
        ride.set_special_needs(ride_data['special_needs'])
        if ride_data.get('review_tags'):
            ride.set_review_tags(ride_data['review_tags'])
        
        db.session.add(ride)
        created_rides.append(ride)
    
    db.session.commit()
    print(f"Created {len(rides_data)} rides")
    return created_rides

def create_news_articles(users):
    """Create sample news articles"""
    if 'office' not in users:
        return []
        
    office_user = users['office']
    
    articles_data = [
        {
            'title': 'ประกาศเปิดบริการรถพยาบาลฉุกเฉินใหม่',
            'content': '''<p>ด้วยความมุ่งมั่นในการให้บริการที่ดีที่สุดแก่ประชาชน เราขอประกาศเปิดบริการรถพยาบาลฉุกเฉินใหม่ที่มีอุปกรณ์ทันสมัยและทีมแพทย์ที่มีประสบการณ์</p>
            
            <h3>บริการใหม่ที่เพิ่มเข้ามา:</h3>
            <ul>
                <li>รถพยาบาลพร้อมอุปกรณ์ช่วยชีวิตขั้นสูง</li>
                <li>ทีมแพทย์และพยาบาลเฉพาะทาง</li>
                <li>ระบบติดตาม GPS แบบเรียลไทม์</li>
                <li>บริการ 24 ชั่วโมง ทุกวัน</li>
            </ul>
            
            <p>สำหรับข้อมูลเพิ่มเติม กรุณาติดต่อ 1669</p>''',
            'author': office_user.name,
            'status': 'published',
            'published_date': datetime.now() - timedelta(days=2)
        },
        {
            'title': 'การอบรมเจ้าหน้าที่ขับรถพยาบาล',
            'content': '''<p>เพื่อยยกระดับคุณภาพการบริการ เราจัดการอบรมเจ้าหน้าที่ขับรถพยาบาลเกี่ยวกับ:</p>
            
            <ul>
                <li>เทคนิคการขับขี่อย่างปลอดภัย</li>
                <li>การดูแลผู้ป่วยระหว่างการเดินทาง</li>
                <li>การใช้อุปกรณ์การแพทย์เบื้องต้น</li>
                <li>มารยาทในการให้บริการ</li>
            </ul>
            
            <p>การอบรมจะจัดขึ้นทุกเดือน เพื่อให้เจ้าหน้าที่มีความรู้และทักษะที่ทันสมัยอยู่เสมอ</p>''',
            'author': office_user.name,
            'status': 'published',
            'published_date': datetime.now() - timedelta(days=5)
        },
        {
            'title': 'ข่าวประชาสัมพันธ์ใหม่ (ฉบับร่าง)',
            'content': '''<p>นี่คือเนื้อหาข่าวที่อยู่ในขั้นตอนการเตรียม...</p>''',
            'author': office_user.name,
            'status': 'draft'
        }
    ]
    
    created_articles = []
    for article_data in articles_data:
        # Check if article already exists
        existing_article = NewsArticle.query.filter_by(title=article_data['title']).first()
        if existing_article:
            created_articles.append(existing_article)
            continue
            
        article = NewsArticle(
            title=article_data['title'],
            content=article_data['content'],
            author=article_data['author'],
            status=article_data['status'],
            published_date=article_data.get('published_date')
        )
        
        db.session.add(article)
        created_articles.append(article)
    
    db.session.commit()
    print(f"Created {len(articles_data)} news articles")
    return created_articles

def main():
    """Main function to seed all data"""
    with app.app_context():
        print("Starting database seeding...")
        
        # Create all tables
        db.create_all()
        
        # Create seed data
        users = create_users()
        vehicles = create_vehicles()
        create_driver_profiles(users, vehicles)
        patients = create_patients(users)
        rides = create_rides(users, patients)
        articles = create_news_articles(users)
        
        print("Database seeding completed successfully!")
        print("\nTest accounts:")
        print("Driver: driver1@wecare.dev / password")
        print("Community: community1@wecare.dev / password")
        print("Office: office1@wecare.dev / password")
        print("Admin: admin@wecare.dev / password")
        print("Developer: jetci.j@gmail.com / g0KEk,^],k;yo")

if __name__ == '__main__':
    main()
