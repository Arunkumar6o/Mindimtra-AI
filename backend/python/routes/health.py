from datetime import datetime, timezone
from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Mindmitra-AI Flask Backend API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "architecture": {
            "auth": "JWT",
            "security": "AES-256-GCM + RLS Ready",
            "privacy": "Zero-PII Scrubbing Pipeline",
            "ml_pipeline": "RoBERTa + PyTorch (Ready)",
            "nlp": "spaCy (Ready)",
            "llm": "Gemini 1.5 Flash API",
            "database": "PostgreSQL + pgvector (Supabase Ready)"
        }
    }), 200

