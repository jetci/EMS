from flask import Blueprint, request, jsonify, current_app
from src.models.ems_models import db, User
import jwt
from datetime import datetime, timedelta
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Token format invalid'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in allowed_roles:
                return jsonify({'message': 'Insufficient permissions'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        email = data['email'].lower()
        password = data['password']
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        if user.status != 'Active':
            return jsonify({'message': 'Account is inactive'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Name, email, and password are required'}), 400
        
        email = data['email'].lower()
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'User with this email already exists'}), 409
        
        # Create new user (default role is 'community')
        user = User(
            name=data['name'],
            email=email,
            role=data.get('role', 'community'),
            phone=data.get('phone'),
            profile_image_url=data.get('profile_image_url')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'Registration successful'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({'user': current_user.to_dict()}), 200

@auth_bp.route('/refresh', methods=['POST'])
@token_required
def refresh_token(current_user):
    try:
        # Generate new JWT token
        token = jwt.encode({
            'user_id': current_user.id,
            'email': current_user.email,
            'role': current_user.role,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({'token': token}), 200
        
    except Exception as e:
        return jsonify({'message': 'Token refresh failed', 'error': str(e)}), 500
