import os
import datetime
import jwt
from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)

# Secret key for JWT signing (In production, load from environment variable / AES secret)
JWT_SECRET = os.environ.get("JWT_SECRET", "mindmitra-super-secret-key-2026")

# In-memory user database (Ready for PostgreSQL integration with pgvector)
MOCK_USERS = {
    "demo@mindmitra.ai": {
        "password": "Password123!",
        "name": "Alex Mercer",
        "email": "demo@mindmitra.ai"
    }
}

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    user = MOCK_USERS.get(email)
    
    # If user doesn't exist in mock DB yet, allow demo login or registered users
    if not user:
        # Auto-create for demo convenience if registration was triggered
        user = {
            "password": password,
            "name": email.split('@')[0].capitalize(),
            "email": email
        }
        MOCK_USERS[email] = user
    elif user["password"] != password:
        return jsonify({
            "success": False,
            "message": "Invalid email or password. Please try again."
        }), 401

    # Generate JWT Token
    payload = {
        "email": user["email"],
        "name": user["name"],
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "success": True,
        "message": "Login successful. Welcome back to Mindmitra!",
        "token": token,
        "user": {
            "email": user["email"],
            "name": user["name"]
        }
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Name, email, and password are required."
        }), 400

    if email in MOCK_USERS:
        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    # Save to mock users
    MOCK_USERS[email] = {
        "name": name,
        "email": email,
        "password": password
    }

    # Generate token
    payload = {
        "email": email,
        "name": name,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "success": True,
        "message": "Account created successfully! Welcome to Mindmitra.",
        "token": token,
        "user": {
            "email": email,
            "name": name
        }
    }), 201


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing or invalid token header."}), 401

    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return jsonify({
            "success": True,
            "user": {
                "email": payload.get("email"),
                "name": payload.get("name")
            }
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token has expired."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token."}), 401
