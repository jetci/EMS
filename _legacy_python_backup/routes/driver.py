from flask import Blueprint, request, jsonify
from src.models.ems_models import db, Ride, User, DriverProfile
from src.routes.auth import token_required, role_required
from datetime import datetime, timedelta
from sqlalchemy import and_, extract, func
import json

driver_bp = Blueprint('driver', __name__)

@driver_bp.route('/jobs', methods=['GET'])
@token_required
@role_required(['driver'])
def get_driver_jobs(current_user):
    try:
        # Get all assigned rides for this driver
        rides = Ride.query.filter_by(driver_id=current_user.id)\
                         .order_by(Ride.appointment_time.asc())\
                         .all()
        
        rides_data = []
        for ride in rides:
            ride_dict = ride.to_dict()
            # Add additional fields needed by the frontend
            if ride.patient:
                ride_dict['patientPhone'] = ride.patient.contact_phone
                ride_dict['village'] = ride.patient.get_current_address().get('village', '')
                ride_dict['landmark'] = ride.patient.landmark
                
                # Add pickup coordinates if available
                if ride.patient.latitude and ride.patient.longitude:
                    ride_dict['pickupCoordinates'] = {
                        'lat': float(ride.patient.latitude),
                        'lng': float(ride.patient.longitude)
                    }
            
            rides_data.append(ride_dict)
        
        return jsonify(rides_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get driver jobs', 'error': str(e)}), 500

@driver_bp.route('/rides/<ride_id>/status', methods=['PATCH'])
@token_required
@role_required(['driver'])
def update_ride_status(current_user, ride_id):
    try:
        ride = Ride.query.filter_by(
            id=ride_id,
            driver_id=current_user.id
        ).first()
        
        if not ride:
            return jsonify({'message': 'Ride not found'}), 404
        
        data = request.get_json()
        
        if not data or 'status' not in data:
            return jsonify({'message': 'Status is required'}), 400
        
        new_status = data['status']
        valid_statuses = [
            'EN_ROUTE_TO_PICKUP',
            'ARRIVED_AT_PICKUP',
            'IN_PROGRESS',
            'COMPLETED'
        ]
        
        if new_status not in valid_statuses:
            return jsonify({'message': 'Invalid status'}), 400
        
        # Validate status transitions
        current_status = ride.status
        valid_transitions = {
            'ASSIGNED': ['EN_ROUTE_TO_PICKUP'],
            'EN_ROUTE_TO_PICKUP': ['ARRIVED_AT_PICKUP'],
            'ARRIVED_AT_PICKUP': ['IN_PROGRESS'],
            'IN_PROGRESS': ['COMPLETED']
        }
        
        if current_status not in valid_transitions or new_status not in valid_transitions[current_status]:
            return jsonify({'message': f'Cannot transition from {current_status} to {new_status}'}), 400
        
        ride.status = new_status
        db.session.commit()
        
        return jsonify({'message': 'Status updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update status', 'error': str(e)}), 500

@driver_bp.route('/optimize-route', methods=['POST'])
@token_required
@role_required(['driver'])
def optimize_route(current_user):
    try:
        data = request.get_json()
        
        if not data or 'rideIds' not in data:
            return jsonify({'message': 'Ride IDs are required'}), 400
        
        ride_ids = data['rideIds']
        
        # Verify all rides belong to this driver and are in ASSIGNED status
        rides = Ride.query.filter(
            and_(
                Ride.id.in_(ride_ids),
                Ride.driver_id == current_user.id,
                Ride.status == 'ASSIGNED'
            )
        ).all()
        
        if len(rides) != len(ride_ids):
            return jsonify({'message': 'Some rides not found or not eligible for optimization'}), 400
        
        # Simple optimization: sort by appointment time
        # In a real implementation, you would use a more sophisticated algorithm
        # considering geographical locations, traffic, etc.
        sorted_rides = sorted(rides, key=lambda r: r.appointment_time)
        optimized_order = [ride.id for ride in sorted_rides]
        
        return jsonify({'optimizedOrder': optimized_order}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to optimize route', 'error': str(e)}), 500

@driver_bp.route('/history', methods=['GET'])
@token_required
@role_required(['driver'])
def get_driver_history(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        period = request.args.get('period', 'all', type=str)
        
        query = Ride.query.filter_by(driver_id=current_user.id)
        
        # Filter by period
        if period == 'this_week':
            start_of_week = datetime.now() - timedelta(days=datetime.now().weekday())
            query = query.filter(Ride.created_at >= start_of_week)
        elif period == 'this_month':
            current_month = datetime.now().month
            current_year = datetime.now().year
            query = query.filter(
                and_(
                    extract('month', Ride.created_at) == current_month,
                    extract('year', Ride.created_at) == current_year
                )
            )
        elif period == 'last_month':
            last_month = datetime.now().replace(day=1) - timedelta(days=1)
            query = query.filter(
                and_(
                    extract('month', Ride.created_at) == last_month.month,
                    extract('year', Ride.created_at) == last_month.year
                )
            )
        
        total_rides = query.count()
        total_pages = (total_rides + limit - 1) // limit
        
        rides = query.order_by(Ride.created_at.desc())\
                    .offset((page - 1) * limit)\
                    .limit(limit)\
                    .all()
        
        rides_data = []
        total_earnings = 0
        for ride in rides:
            # Mock earnings calculation (in a real app, this would be stored)
            earnings = 100 if ride.status == 'COMPLETED' else 0
            total_earnings += earnings
            
            rides_data.append({
                'id': ride.id,
                'patientName': ride.patient.full_name if ride.patient else 'Unknown',
                'destination': ride.destination,
                'appointmentTime': ride.appointment_time.isoformat() if ride.appointment_time else None,
                'status': ride.status,
                'earnings': earnings
            })
        
        # Calculate stats
        completed_rides = query.filter(Ride.status == 'COMPLETED').count()
        total_assigned = query.filter(Ride.status.in_(['ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS', 'COMPLETED'])).count()
        acceptance_rate = (completed_rides / total_assigned * 100) if total_assigned > 0 else 0
        
        stats = {
            'totalRides': completed_rides,
            'totalEarnings': total_earnings,
            'acceptanceRate': round(acceptance_rate, 1)
        }
        
        return jsonify({
            'rides': rides_data,
            'totalPages': total_pages,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get driver history', 'error': str(e)}), 500

@driver_bp.route('/profile', methods=['GET'])
@token_required
@role_required(['driver'])
def get_driver_profile(current_user):
    try:
        profile_data = current_user.to_dict()
        
        if current_user.driver_profile:
            profile_data.update({
                'licensePlate': current_user.driver_profile.license_plate,
                'address': current_user.driver_profile.address,
                'avgReviewScore': float(current_user.driver_profile.avg_review_score),
                'dateCreated': current_user.driver_profile.date_created.isoformat() if current_user.driver_profile.date_created else None
            })
        
        # Add trip statistics
        total_trips = Ride.query.filter_by(driver_id=current_user.id, status='COMPLETED').count()
        trips_this_month = Ride.query.filter(
            and_(
                Ride.driver_id == current_user.id,
                Ride.status == 'COMPLETED',
                extract('month', Ride.created_at) == datetime.now().month,
                extract('year', Ride.created_at) == datetime.now().year
            )
        ).count()
        
        profile_data.update({
            'totalTrips': total_trips,
            'tripsThisMonth': trips_this_month
        })
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get driver profile', 'error': str(e)}), 500

@driver_bp.route('/profile', methods=['PUT'])
@token_required
@role_required(['driver'])
def update_driver_profile(current_user):
    try:
        data = request.get_json()
        
        # Update user fields
        if 'name' in data:
            current_user.name = data['name']
        if 'phone' in data:
            current_user.phone = data['phone']
        if 'profileImageUrl' in data:
            current_user.profile_image_url = data['profileImageUrl']
        
        # Update or create driver profile
        if not current_user.driver_profile:
            current_user.driver_profile = DriverProfile(user_id=current_user.id)
        
        if 'licensePlate' in data:
            current_user.driver_profile.license_plate = data['licensePlate']
        if 'address' in data:
            current_user.driver_profile.address = data['address']
        
        db.session.commit()
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update profile', 'error': str(e)}), 500
