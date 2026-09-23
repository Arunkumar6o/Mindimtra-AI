import os
from flask import Flask, jsonify
from flask_cors import CORS
from routes.auth import auth_bp

app = Flask(__name__)
# Enable CORS for frontend requests (React app running on localhost:5173 or dev environment)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Mindmitra-AI Backend API",
        "version": "1.0.0",
        "architecture": {
            "auth": "JWT",
            "ml_pipeline": "RoBERTa + PyTorch (Ready)",
            "nlp": "spaCy (Ready)",
            "llm": "Gemini API (Ready)",
            "database": "PostgreSQL + pgvector (Ready)"
        }
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🌟 Mindmitra-AI Flask Backend running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
