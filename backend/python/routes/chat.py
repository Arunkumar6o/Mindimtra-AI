import os
import requests
from flask import Blueprint, request, jsonify
from utils.pii_sanitizer import sanitize_pii

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/respond', methods=['POST'])
def chat_respond():
    data = request.get_json() or {}
    user_msg = data.get('message', '')
    sanitized_res = sanitize_pii(user_msg)
    sanitized_text = sanitized_res["sanitized"]

    gemini_api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("VITE_GEMINI_API_KEY", "")
    reply_text = ""
    suggested_actions = [
        "Log this session in Mood Tracker",
        "Try a 2-minute Guided Breathing session",
        "Read Resilience Affirmation"
    ]

    if gemini_api_key:
        try:
            prompt = (
                f"You are MindMitra, a compassionate and supportive emotional well-being AI companion.\n"
                f"A user shares: \"{sanitized_text}\".\n"
                f"Respond with genuine empathy, warmth, and non-judgmental support in 2-3 concise paragraphs.\n"
                f"Do NOT clinically diagnose mental illnesses or make medical claims. Offer a gentle grounding reflection."
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
            resp = requests.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.6}},
                timeout=10
            )
            if resp.status_code == 200:
                result = resp.json()
                candidate = (
                    result.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )
                if candidate:
                    reply_text = candidate.strip()
        except Exception as e:
            print(f"[Gemini Python] API error, falling back: {e}")

    # Empathetic Fallback
    if not reply_text:
        lower = user_msg.lower()
        if any(w in lower for w in ['anxious', 'overwhelm', 'deadline']):
            reply_text = (
                "Thank you for sharing that with me. It is completely natural to feel overwhelmed when deadlines and demands pile up. "
                "Taking a deep, gentle breath right now can give your mind the pause it deserves. What is one small task you can set aside for today to give yourself some breathing room?"
            )
            suggested_actions = ["Start 4-7-8 Breathing", "Break workload into small steps", "Take a 5-minute breather"]
        elif any(w in lower for w in ['sad', 'alone', 'down']):
            reply_text = (
                "I hear you, and your feelings are completely valid. Experiencing heavy days can feel draining, but you don't have to carry all of it alone. "
                "I am right here with you. What would feel most comforting to you in this exact moment?"
            )
            suggested_actions = ["Listen to soothing music", "Drink a glass of warm water", "Rest and pause"]
        else:
            reply_text = (
                "Thank you for opening up to me. Hearing your thoughts helps us find steady ground together. "
                "When feelings swirl, grounding yourself in the present moment is deeply restorative. How does your body feel right now as we talk?"
            )

    return jsonify({
        "success": True,
        "response": reply_text,
        "suggested_actions": suggested_actions,
        "scrubbed_input": sanitized_text,
        "pii_protected": sanitized_res["was_sanitized"],
        "pii_entities_detected": sanitized_res["entities"]
    }), 200

