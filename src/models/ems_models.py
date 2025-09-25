from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    profile_image_url = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='Active')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    driver_profile = db.relationship('DriverProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    registered_patients = db.relationship('Patient', backref='registered_by_user', lazy='dynamic')
    requested_rides = db.relationship('Ride', foreign_keys='Ride.requester_id', backref='requester', lazy='dynamic')
    assigned_rides = db.relationship('Ride', foreign_keys='Ride.driver_id', backref='driver', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'profile_image_url': self.profile_image_url,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class DriverProfile(db.Model):
    __tablename__ = 'driver_profiles'
    
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), primary_key=True)
    license_plate = db.Column(db.String(50), nullable=False)
    address = db.Column(db.Text, nullable=True)
    vehicle_id = db.Column(db.String(36), db.ForeignKey('vehicles.id'), nullable=True)
    avg_review_score = db.Column(db.Numeric(3, 2), nullable=False, default=5.00)
    date_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'license_plate': self.license_plate,
            'address': self.address,
            'vehicle_id': self.vehicle_id,
            'avg_review_score': float(self.avg_review_score),
            'date_created': self.date_created.isoformat() if self.date_created else None
        }

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = db.Column(db.String(255), nullable=False)
    profile_image_url = db.Column(db.String(255), nullable=True)
    title = db.Column(db.String(50), nullable=False)
    gender = db.Column(db.String(50), nullable=True)
    national_id = db.Column(db.String(20), unique=True, nullable=True)
    dob = db.Column(db.Date, nullable=True)
    age = db.Column(db.Integer, nullable=True)
    patient_types = db.Column(db.Text, nullable=True)  # JSON string
    blood_type = db.Column(db.String(10), nullable=True)
    rh_factor = db.Column(db.String(10), nullable=True)
    health_coverage = db.Column(db.String(100), nullable=True)
    chronic_diseases = db.Column(db.Text, nullable=True)  # JSON string
    allergies = db.Column(db.Text, nullable=True)  # JSON string
    contact_phone = db.Column(db.String(50), nullable=False)
    id_card_address = db.Column(db.Text, nullable=True)  # JSON string
    current_address = db.Column(db.Text, nullable=False)  # JSON string
    landmark = db.Column(db.Text, nullable=True)
    latitude = db.Column(db.Numeric(9, 6), nullable=True)
    longitude = db.Column(db.Numeric(9, 6), nullable=True)
    registered_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    registered_by_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    key_info = db.Column(db.Text, nullable=True)
    caregiver_name = db.Column(db.String(255), nullable=True)
    caregiver_phone = db.Column(db.String(50), nullable=True)
    
    # Relationships
    rides = db.relationship('Ride', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    
    def get_patient_types(self):
        return json.loads(self.patient_types) if self.patient_types else []
    
    def set_patient_types(self, types_list):
        self.patient_types = json.dumps(types_list)
    
    def get_chronic_diseases(self):
        return json.loads(self.chronic_diseases) if self.chronic_diseases else []
    
    def set_chronic_diseases(self, diseases_list):
        self.chronic_diseases = json.dumps(diseases_list)
    
    def get_allergies(self):
        return json.loads(self.allergies) if self.allergies else []
    
    def set_allergies(self, allergies_list):
        self.allergies = json.dumps(allergies_list)
    
    def get_id_card_address(self):
        return json.loads(self.id_card_address) if self.id_card_address else {}
    
    def set_id_card_address(self, address_dict):
        self.id_card_address = json.dumps(address_dict)
    
    def get_current_address(self):
        return json.loads(self.current_address) if self.current_address else {}
    
    def set_current_address(self, address_dict):
        self.current_address = json.dumps(address_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'fullName': self.full_name,
            'profileImageUrl': self.profile_image_url,
            'title': self.title,
            'gender': self.gender,
            'nationalId': self.national_id,
            'dob': self.dob.isoformat() if self.dob else None,
            'age': self.age,
            'patientTypes': self.get_patient_types(),
            'bloodType': self.blood_type,
            'rhFactor': self.rh_factor,
            'healthCoverage': self.health_coverage,
            'chronicDiseases': self.get_chronic_diseases(),
            'allergies': self.get_allergies(),
            'contactPhone': self.contact_phone,
            'idCardAddress': self.get_id_card_address(),
            'currentAddress': self.get_current_address(),
            'landmark': self.landmark,
            'latitude': str(self.latitude) if self.latitude else None,
            'longitude': str(self.longitude) if self.longitude else None,
            'registeredDate': self.registered_date.isoformat() if self.registered_date else None,
            'registeredBy': self.registered_by_user.name if self.registered_by_user else None,
            'keyInfo': self.key_info,
            'caregiverName': self.caregiver_name,
            'caregiverPhone': self.caregiver_phone
        }

class Ride(db.Model):
    __tablename__ = 'rides'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.id'), nullable=False)
    requester_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    pickup_location = db.Column(db.Text, nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    appointment_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='PENDING')
    driver_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    vehicle_id = db.Column(db.String(36), db.ForeignKey('vehicles.id'), nullable=True)
    special_needs = db.Column(db.Text, nullable=True)  # JSON string
    caregiver_count = db.Column(db.Integer, nullable=False, default=0)
    rating = db.Column(db.Integer, nullable=True)
    review_tags = db.Column(db.Text, nullable=True)  # JSON string
    review_comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_special_needs(self):
        return json.loads(self.special_needs) if self.special_needs else []
    
    def set_special_needs(self, needs_list):
        self.special_needs = json.dumps(needs_list)
    
    def get_review_tags(self):
        return json.loads(self.review_tags) if self.review_tags else []
    
    def set_review_tags(self, tags_list):
        self.review_tags = json.dumps(tags_list)
    
    def to_dict(self):
        driver_info = None
        if self.driver:
            driver_profile = self.driver.driver_profile
            if driver_profile:
                driver_info = {
                    'id': self.driver.id,
                    'fullName': self.driver.name,
                    'phone': self.driver.phone,
                    'licensePlate': driver_profile.license_plate,
                    'vehicleModel': 'Unknown'  # Would need vehicle table for this
                }
        
        return {
            'id': self.id,
            'patientName': self.patient.full_name if self.patient else None,
            'patientPhone': self.patient.contact_phone if self.patient else None,
            'pickupLocation': self.pickup_location,
            'destination': self.destination,
            'appointmentTime': self.appointment_time.isoformat() if self.appointment_time else None,
            'status': self.status,
            'driverName': self.driver.name if self.driver else None,
            'requestedBy': self.requester.name if self.requester else None,
            'specialNeeds': self.get_special_needs(),
            'caregiverCount': self.caregiver_count,
            'rating': self.rating,
            'reviewTags': self.get_review_tags(),
            'reviewComment': self.review_comment,
            'driverInfo': driver_info,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    license_plate = db.Column(db.String(50), unique=True, nullable=False)
    model = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='AVAILABLE')
    assigned_team_id = db.Column(db.String(36), nullable=True)
    next_maintenance_date = db.Column(db.Date, nullable=True)
    
    # Relationships
    driver_profiles = db.relationship('DriverProfile', backref='vehicle')
    rides = db.relationship('Ride', backref='vehicle')
    
    def to_dict(self):
        return {
            'id': self.id,
            'licensePlate': self.license_plate,
            'model': self.model,
            'brand': self.brand,
            'type': self.type,
            'status': self.status,
            'assignedTeamId': self.assigned_team_id,
            'nextMaintenanceDate': self.next_maintenance_date.isoformat() if self.next_maintenance_date else None
        }

class NewsArticle(db.Model):
    __tablename__ = 'news_articles'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='draft')
    published_date = db.Column(db.DateTime, nullable=True)
    scheduled_date = db.Column(db.DateTime, nullable=True)
    featured_image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author': self.author,
            'status': self.status,
            'publishedDate': self.published_date.isoformat() if self.published_date else None,
            'scheduledDate': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'featuredImageUrl': self.featured_image_url,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_email = db.Column(db.String(255), nullable=False)
    user_role = db.Column(db.String(50), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    target_id = db.Column(db.String(36), nullable=True)
    ip_address = db.Column(db.String(45), nullable=False)
    data_payload = db.Column(db.Text, nullable=True)  # JSON string
    
    def get_data_payload(self):
        return json.loads(self.data_payload) if self.data_payload else {}
    
    def set_data_payload(self, payload_dict):
        self.data_payload = json.dumps(payload_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'userEmail': self.user_email,
            'userRole': self.user_role,
            'action': self.action,
            'targetId': self.target_id,
            'ipAddress': self.ip_address,
            'dataPayload': self.get_data_payload()
        }
