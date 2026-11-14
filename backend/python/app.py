import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import route blueprints
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.emotion import emotion_bp
from routes.analysis import analysis_bp
from routes.health import health_bp

app = Flask(__name__)

# Enable CORS for frontend requests (React app running on localhost:5173 or preview)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(health_bp, url_prefix='/api/health')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(emotion_bp, url_prefix='/api/emotion')
app.register_blueprint(analysis_bp, url_prefix='/api/analysis')

@app.route('/')
def root():
    return jsonify({
        "service": "MindMitra AI Companion - Backend Server",
        "status": "online",
        "documentation": "/api/health"
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("=" * 55)
    print(f"🌟 Mindmitra-AI Flask Backend running on http://localhost:{port}")
    print(f"📡 API Health Check: http://localhost:{port}/api/health")
    print(f"💬 Chat: http://localhost:{port}/api/chat/respond")
    print(f"🧠 Emotion: http://localhost:{port}/api/emotion/analyze")
    print(f"📊 Analysis: http://localhost:{port}/api/analysis/unified")
    print(f"🔐 Auth: http://localhost:{port}/api/auth/login")
    print("=" * 55)
    app.run(host='0.0.0.0', port=port, debug=True)

