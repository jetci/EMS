from flask import Blueprint, request, jsonify
from src.models.ems_models import db, Patient, Ride, User
from src.routes.auth import token_required, role_required
from datetime import datetime, date
from sqlalchemy import func, and_, extract
import json

community_bp = Blueprint('community', __name__)

@community_bp.route('/stats', methods=['GET'])
@token_required
@role_required(['community'])
def get_community_stats(current_user):
    try:
        # Count patients registered by this community user
        patients_in_care = Patient.query.filter_by(registered_by_id=current_user.id).count()
        
        # Count pending ride requests by this community user
        pending_requests = Ride.query.filter_by(
            requester_id=current_user.id,
            status='PENDING'
        ).count()
        
        # Count completed rides this month by this community user
        current_month = datetime.now().month
        current_year = datetime.now().year
        completed_this_month = Ride.query.filter(
            and_(
                Ride.requester_id == current_user.id,
                Ride.status == 'COMPLETED',
                extract('month', Ride.created_at) == current_month,
                extract('year', Ride.created_at) == current_year
            )
        ).count()
        
        return jsonify({
            'patientsInCare': patients_in_care,
            'pendingRequests': pending_requests,
            'completedThisMonth': completed_this_month
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get stats', 'error': str(e)}), 500

@community_bp.route('/rides/recent', methods=['GET'])
@token_required
@role_required(['community'])
def get_recent_rides(current_user):
    try:
        rides = Ride.query.filter_by(requester_id=current_user.id)\
                         .order_by(Ride.created_at.desc())\
                         .limit(10)\
                         .all()
        
        rides_data = []
        for ride in rides:
            rides_data.append({
                'id': ride.id,
                'patientName': ride.patient.full_name if ride.patient else 'Unknown',
                'destination': ride.destination,
                'appointmentTime': ride.appointment_time.isoformat() if ride.appointment_time else None,
                'status': ride.status
            })
        
        return jsonify(rides_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get recent rides', 'error': str(e)}), 500

@community_bp.route('/patients', methods=['GET'])
@token_required
@role_required(['community'])
def get_patients(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        search = request.args.get('search', '', type=str)
        
        query = Patient.query.filter_by(registered_by_id=current_user.id)
        
        if search:
            query = query.filter(Patient.full_name.ilike(f'%{search}%'))
        
        total_patients = query.count()
        total_pages = (total_patients + limit - 1) // limit
        
        patients = query.offset((page - 1) * limit).limit(limit).all()
        
        patients_data = []
        for patient in patients:
            patients_data.append({
                'id': patient.id,
                'fullName': patient.full_name,
                'age': patient.age,
                'keyInfo': patient.key_info,
                'registeredDate': patient.registered_date.isoformat() if patient.registered_date else None
            })
        
        return jsonify({
            'patients': patients_data,
            'totalPages': total_pages
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get patients', 'error': str(e)}), 500

@community_bp.route('/patients/<patient_id>', methods=['GET'])
@token_required
@role_required(['community'])
def get_patient(current_user, patient_id):
    try:
        patient = Patient.query.filter_by(
            id=patient_id,
            registered_by_id=current_user.id
        ).first()
        
        if not patient:
            return jsonify({'message': 'Patient not found'}), 404
        
        return jsonify(patient.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get patient', 'error': str(e)}), 500

@community_bp.route('/patients', methods=['POST'])
@token_required
@role_required(['community'])
def create_patient(current_user):
    try:
        data = request.get_json()
        
        if not data or not data.get('fullName') or not data.get('contactPhone'):
            return jsonify({'message': 'Full name and contact phone are required'}), 400
        
        patient = Patient(
            full_name=data['fullName'],
            profile_image_url=data.get('profileImageUrl'),
            title=data.get('title', ''),
            gender=data.get('gender'),
            national_id=data.get('nationalId'),
            age=data.get('age'),
            blood_type=data.get('bloodType'),
            rh_factor=data.get('rhFactor'),
            health_coverage=data.get('healthCoverage'),
            contact_phone=data['contactPhone'],
            landmark=data.get('landmark'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            registered_by_id=current_user.id,
            key_info=data.get('keyInfo'),
            caregiver_name=data.get('caregiverName'),
            caregiver_phone=data.get('caregiverPhone')
        )
        
        # Handle date of birth
        if data.get('dob'):
            try:
                patient.dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'message': 'Invalid date format for dob'}), 400
        
        # Handle JSON fields
        if data.get('patientTypes'):
            patient.set_patient_types(data['patientTypes'])
        if data.get('chronicDiseases'):
            patient.set_chronic_diseases(data['chronicDiseases'])
        if data.get('allergies'):
            patient.set_allergies(data['allergies'])
        if data.get('idCardAddress'):
            patient.set_id_card_address(data['idCardAddress'])
        if data.get('currentAddress'):
            patient.set_current_address(data['currentAddress'])
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({
            'id': patient.id,
            'message': 'Patient registered successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create patient', 'error': str(e)}), 500

@community_bp.route('/patients/<patient_id>', methods=['PUT'])
@token_required
@role_required(['community'])
def update_patient(current_user, patient_id):
    try:
        patient = Patient.query.filter_by(
            id=patient_id,
            registered_by_id=current_user.id
        ).first()
        
        if not patient:
            return jsonify({'message': 'Patient not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'fullName' in data:
            patient.full_name = data['fullName']
        if 'profileImageUrl' in data:
            patient.profile_image_url = data['profileImageUrl']
        if 'title' in data:
            patient.title = data['title']
        if 'gender' in data:
            patient.gender = data['gender']
        if 'nationalId' in data:
            patient.national_id = data['nationalId']
        if 'age' in data:
            patient.age = data['age']
        if 'bloodType' in data:
            patient.blood_type = data['bloodType']
        if 'rhFactor' in data:
            patient.rh_factor = data['rhFactor']
        if 'healthCoverage' in data:
            patient.health_coverage = data['healthCoverage']
        if 'contactPhone' in data:
            patient.contact_phone = data['contactPhone']
        if 'landmark' in data:
            patient.landmark = data['landmark']
        if 'latitude' in data:
            patient.latitude = data['latitude']
        if 'longitude' in data:
            patient.longitude = data['longitude']
        if 'keyInfo' in data:
            patient.key_info = data['keyInfo']
        if 'caregiverName' in data:
            patient.caregiver_name = data['caregiverName']
        if 'caregiverPhone' in data:
            patient.caregiver_phone = data['caregiverPhone']
        
        # Handle date of birth
        if 'dob' in data and data['dob']:
            try:
                patient.dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'message': 'Invalid date format for dob'}), 400
        
        # Handle JSON fields
        if 'patientTypes' in data:
            patient.set_patient_types(data['patientTypes'])
        if 'chronicDiseases' in data:
            patient.set_chronic_diseases(data['chronicDiseases'])
        if 'allergies' in data:
            patient.set_allergies(data['allergies'])
        if 'idCardAddress' in data:
            patient.set_id_card_address(data['idCardAddress'])
        if 'currentAddress' in data:
            patient.set_current_address(data['currentAddress'])
        
        db.session.commit()
        
        return jsonify({
            'id': patient.id,
            'message': 'Patient updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update patient', 'error': str(e)}), 500

@community_bp.route('/patients/<patient_id>', methods=['DELETE'])
@token_required
@role_required(['community'])
def delete_patient(current_user, patient_id):
    try:
        patient = Patient.query.filter_by(
            id=patient_id,
            registered_by_id=current_user.id
        ).first()
        
        if not patient:
            return jsonify({'message': 'Patient not found'}), 404
        
        # Check if patient has any active rides
        active_rides = Ride.query.filter(
            and_(
                Ride.patient_id == patient_id,
                Ride.status.in_(['PENDING', 'ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS'])
            )
        ).count()
        
        if active_rides > 0:
            return jsonify({'message': 'Cannot delete patient with active rides'}), 400
        
        db.session.delete(patient)
        db.session.commit()
        
        return jsonify({'message': 'Patient deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete patient', 'error': str(e)}), 500

@community_bp.route('/rides', methods=['GET'])
@token_required
@role_required(['community'])
def get_rides(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        search = request.args.get('search', '', type=str)
        status = request.args.get('status', '', type=str)
        
        query = Ride.query.filter_by(requester_id=current_user.id)
        
        if search:
            query = query.join(Patient).filter(Patient.full_name.ilike(f'%{search}%'))
        
        if status and status != 'All':
            query = query.filter(Ride.status == status)
        
        total_rides = query.count()
        total_pages = (total_rides + limit - 1) // limit
        
        rides = query.order_by(Ride.created_at.desc())\
                    .offset((page - 1) * limit)\
                    .limit(limit)\
                    .all()
        
        rides_data = []
        for ride in rides:
            rides_data.append({
                'id': ride.id,
                'patientName': ride.patient.full_name if ride.patient else 'Unknown',
                'destination': ride.destination,
                'appointmentTime': ride.appointment_time.isoformat() if ride.appointment_time else None,
                'status': ride.status,
                'driverName': ride.driver.name if ride.driver else None
            })
        
        return jsonify({
            'rides': rides_data,
            'totalPages': total_pages
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get rides', 'error': str(e)}), 500

@community_bp.route('/rides/<ride_id>', methods=['GET'])
@token_required
@role_required(['community'])
def get_ride(current_user, ride_id):
    try:
        ride = Ride.query.filter_by(
            id=ride_id,
            requester_id=current_user.id
        ).first()
        
        if not ride:
            return jsonify({'message': 'Ride not found'}), 404
        
        return jsonify(ride.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get ride', 'error': str(e)}), 500

@community_bp.route('/rides', methods=['POST'])
@token_required
@role_required(['community'])
def create_ride(current_user):
    try:
        data = request.get_json()
        
        required_fields = ['patientId', 'pickupLocation', 'destination', 'appointmentTime']
        for field in required_fields:
            if not data or not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Verify patient belongs to this community user
        patient = Patient.query.filter_by(
            id=data['patientId'],
            registered_by_id=current_user.id
        ).first()
        
        if not patient:
            return jsonify({'message': 'Patient not found'}), 404
        
        # Parse appointment time
        try:
            appointment_time = datetime.fromisoformat(data['appointmentTime'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'message': 'Invalid appointment time format'}), 400
        
        ride = Ride(
            patient_id=data['patientId'],
            requester_id=current_user.id,
            pickup_location=data['pickupLocation'],
            destination=data['destination'],
            appointment_time=appointment_time,
            caregiver_count=data.get('caregiverCount', 0)
        )
        
        # Handle special needs
        if data.get('specialNeeds'):
            ride.set_special_needs(data['specialNeeds'])
        
        db.session.add(ride)
        db.session.commit()
        
        return jsonify({
            'id': ride.id,
            'message': 'Ride request created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create ride', 'error': str(e)}), 500

@community_bp.route('/rides/<ride_id>', methods=['DELETE'])
@token_required
@role_required(['community'])
def cancel_ride(current_user, ride_id):
    try:
        ride = Ride.query.filter_by(
            id=ride_id,
            requester_id=current_user.id
        ).first()
        
        if not ride:
            return jsonify({'message': 'Ride not found'}), 404
        
        if ride.status not in ['PENDING', 'ASSIGNED']:
            return jsonify({'message': 'Cannot cancel ride in current status'}), 400
        
        ride.status = 'CANCELLED'
        db.session.commit()
        
        return jsonify({'message': 'Ride cancelled successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to cancel ride', 'error': str(e)}), 500

@community_bp.route('/rides/<ride_id>/rating', methods=['POST'])
@token_required
@role_required(['community'])
def submit_rating(current_user, ride_id):
    try:
        ride = Ride.query.filter_by(
            id=ride_id,
            requester_id=current_user.id
        ).first()
        
        if not ride:
            return jsonify({'message': 'Ride not found'}), 404
        
        if ride.status != 'COMPLETED':
            return jsonify({'message': 'Can only rate completed rides'}), 400
        
        if ride.rating is not None:
            return jsonify({'message': 'Ride already rated'}), 400
        
        data = request.get_json()
        
        if not data or 'rating' not in data:
            return jsonify({'message': 'Rating is required'}), 400
        
        rating = data['rating']
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'message': 'Rating must be between 1 and 5'}), 400
        
        ride.rating = rating
        if data.get('tags'):
            ride.set_review_tags(data['tags'])
        if data.get('comment'):
            ride.review_comment = data['comment']
        
        db.session.commit()
        
        return jsonify({'message': 'Rating submitted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to submit rating', 'error': str(e)}), 500
