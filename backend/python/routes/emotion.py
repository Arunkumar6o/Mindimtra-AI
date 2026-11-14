from flask import Blueprint, request, jsonify
from utils.pii_sanitizer import sanitize_pii

emotion_bp = Blueprint('emotion', __name__)

@emotion_bp.route('/analyze', methods=['POST'])
def analyze_emotion():
    data = request.get_json() or {}
    text = data.get('text', '')
    sanitized_res = sanitize_pii(text)

    return jsonify({
        "success": True,
        "client_inference_required": True,
        "scrubbed_text": sanitized_res["sanitized"],
        "pii_protected": sanitized_res["was_sanitized"],
        "pii_entities_detected": sanitized_res["entities"],
        "model_identifier": "nicky48/emotion-english-distilroberta-base-ONNX",
        "model_used": "DistilRoBERTa-base (Transformers.js ONNX Runtime)",
        "nlp_engine": "ONNX Runtime WebAssembly Engine (Transformers.js)"
    }), 200

