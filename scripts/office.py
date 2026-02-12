from flask import Blueprint, request, jsonify
from src.models.ems_models import db, Ride, User, Patient, DriverProfile
from src.routes.auth import token_required, role_required
from datetime import datetime, date
from sqlalchemy import and_, func, extract
import json

office_bp = Blueprint('office', __name__)

@office_bp.route('/stats', methods=['GET'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def get_office_stats(current_user):
    try:
        # Count new ride requests (pending)
        new_requests = Ride.query.filter_by(status='PENDING').count()
        
        # Count today's total rides
        today = date.today()
        today_total_rides = Ride.query.filter(
            func.date(Ride.appointment_time) == today
        ).count()
        
        # Count available drivers
        available_drivers = User.query.filter_by(role='driver', status='Active').count()
        total_drivers = User.query.filter_by(role='driver').count()
        
        # Count total patients
        total_patients = Patient.query.count()
        
        return jsonify({
            'newRequests': new_requests,
            'todayTotalRides': today_total_rides,
            'availableDrivers': available_drivers,
            'totalDrivers': total_drivers,
            'totalPatients': total_patients
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get office stats', 'error': str(e)}), 500

@office_bp.route('/rides/urgent', methods=['GET'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def get_urgent_rides(current_user):
    try:
        # Get all pending rides that need assignment
        rides = Ride.query.filter_by(status='PENDING')\
                         .order_by(Ride.appointment_time.asc())\
                         .all()
        
        rides_data = []
        for ride in rides:
            ride_dict = ride.to_dict()
            
            # Add additional fields needed by the office view
            if ride.patient:
                current_address = ride.patient.get_current_address()
                ride_dict['village'] = current_address.get('village', '')
                
            # Mock trip type - in real app this would be stored
            ride_dict['tripType'] = 'นัดหมอตามปกติ'
            
            rides_data.append(ride_dict)
        
        return jsonify(rides_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get urgent rides', 'error': str(e)}), 500

@office_bp.route('/rides/today-schedule', methods=['GET'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def get_today_schedule(current_user):
    try:
        today = date.today()
        
        # Get all rides scheduled for today (assigned, in-progress, etc.)
        rides = Ride.query.filter(
            and_(
                func.date(Ride.appointment_time) == today,
                Ride.status.in_(['ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS', 'COMPLETED'])
            )
        ).order_by(Ride.appointment_time.asc()).all()
        
        rides_data = []
        for ride in rides:
            ride_dict = ride.to_dict()
            rides_data.append(ride_dict)
        
        return jsonify(rides_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get today schedule', 'error': str(e)}), 500

@office_bp.route('/drivers/live-status', methods=['GET'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def get_drivers_live_status(current_user):
    try:
        # Get all drivers with their current status
        drivers = User.query.filter_by(role='driver').all()
        
        drivers_data = []
        for driver in drivers:
            # Check if driver has any active ride
            active_ride = Ride.query.filter(
                and_(
                    Ride.driver_id == driver.id,
                    Ride.status.in_(['ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS'])
                )
            ).first()
            
            # Mock location data - in real app this would come from GPS tracking
            mock_locations = {
                'driver1@wecare.dev': {'lat': 13.7563, 'lng': 100.5018},
                'driver2@wecare.dev': {'lat': 13.7367, 'lng': 100.5532},
                'driver3@wecare.dev': {'lat': 13.7278, 'lng': 100.5241}
            }
            
            driver_data = {
                'id': driver.id,
                'fullName': driver.name,
                'status': 'ON_TRIP' if active_ride else 'AVAILABLE',
                'currentLocation': mock_locations.get(driver.email, {'lat': 13.7563, 'lng': 100.5018}),
                'currentRideId': active_ride.id if active_ride else None
            }
            
            drivers_data.append(driver_data)
        
        return jsonify(drivers_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get drivers live status', 'error': str(e)}), 500

@office_bp.route('/rides/<ride_id>/assign', methods=['POST'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def assign_driver_to_ride(current_user, ride_id):
    try:
        data = request.get_json()
        
        if not data or 'driverId' not in data:
            return jsonify({'message': 'Driver ID is required'}), 400
        
        driver_id = data['driverId']
        
        # Verify ride exists and is pending
        ride = Ride.query.filter_by(id=ride_id, status='PENDING').first()
        if not ride:
            return jsonify({'message': 'Ride not found or not pending'}), 404
        
        # Verify driver exists and is available
        driver = User.query.filter_by(id=driver_id, role='driver', status='Active').first()
        if not driver:
            return jsonify({'message': 'Driver not found or not available'}), 404
        
        # Check if driver already has an active ride at the same time
        conflicting_ride = Ride.query.filter(
            and_(
                Ride.driver_id == driver_id,
                Ride.status.in_(['ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS']),
                func.abs(func.extract('epoch', Ride.appointment_time - ride.appointment_time)) < 3600  # Within 1 hour
            )
        ).first()
        
        if conflicting_ride:
            return jsonify({'message': 'Driver has conflicting ride at similar time'}), 400
        
        # Assign driver to ride
        ride.driver_id = driver_id
        ride.status = 'ASSIGNED'
        
        db.session.commit()
        
        return jsonify({'message': 'Driver assigned successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to assign driver', 'error': str(e)}), 500

@office_bp.route('/rides', methods=['GET'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def get_all_rides(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        status = request.args.get('status', '', type=str)
        search = request.args.get('search', '', type=str)
        
        query = Ride.query
        
        if status and status != 'All':
            query = query.filter(Ride.status == status)
        
        if search:
            query = query.join(Patient).filter(Patient.full_name.ilike(f'%{search}%'))
        
        total_rides = query.count()
        total_pages = (total_rides + limit - 1) // limit
        
        rides = query.order_by(Ride.created_at.desc())\
                    .offset((page - 1) * limit)\
                    .limit(limit)\
                    .all()
        
        rides_data = []
        for ride in rides:
            rides_data.append(ride.to_dict())
        
        return jsonify({
            'rides': rides_data,
            'totalPages': total_pages
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get rides', 'error': str(e)}), 500

@office_bp.route('/patients', methods=['GET'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def get_all_patients(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        search = request.args.get('search', '', type=str)
        
        query = Patient.query
        
        if search:
            query = query.filter(Patient.full_name.ilike(f'%{search}%'))
        
        total_patients = query.count()
        total_pages = (total_patients + limit - 1) // limit
        
        patients = query.order_by(Patient.registered_date.desc())\
                       .offset((page - 1) * limit)\
                       .limit(limit)\
                       .all()
        
        patients_data = []
        for patient in patients:
            patients_data.append(patient.to_dict())
        
        return jsonify({
            'patients': patients_data,
            'totalPages': total_pages
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get patients', 'error': str(e)}), 500

@office_bp.route('/drivers', methods=['GET'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def get_all_drivers(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        search = request.args.get('search', '', type=str)
        
        query = User.query.filter_by(role='driver')
        
        if search:
            query = query.filter(User.name.ilike(f'%{search}%'))
        
        total_drivers = query.count()
        total_pages = (total_drivers + limit - 1) // limit
        
        drivers = query.order_by(User.created_at.desc())\
                      .offset((page - 1) * limit)\
                      .limit(limit)\
                      .all()
        
        drivers_data = []
        for driver in drivers:
            driver_dict = driver.to_dict()
            
            if driver.driver_profile:
                driver_dict.update({
                    'licensePlate': driver.driver_profile.license_plate,
                    'address': driver.driver_profile.address,
                    'avgReviewScore': float(driver.driver_profile.avg_review_score)
                })
            
            # Add trip statistics
            total_trips = Ride.query.filter_by(driver_id=driver.id, status='COMPLETED').count()
            trips_this_month = Ride.query.filter(
                and_(
                    Ride.driver_id == driver.id,
                    Ride.status == 'COMPLETED',
                    extract('month', Ride.created_at) == datetime.now().month,
                    extract('year', Ride.created_at) == datetime.now().year
                )
            ).count()
            
            driver_dict.update({
                'totalTrips': total_trips,
                'tripsThisMonth': trips_this_month
            })
            
            drivers_data.append(driver_dict)
        
        return jsonify({
            'drivers': drivers_data,
            'totalPages': total_pages
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get drivers', 'error': str(e)}), 500
