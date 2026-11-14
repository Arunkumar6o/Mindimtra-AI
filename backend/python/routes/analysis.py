import os
import json
import requests
from flask import Blueprint, request, jsonify
from utils.pii_sanitizer import sanitize_pii

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/unified', methods=['POST'])
def unified_analysis():
    data = request.get_json() or {}
    messages = data.get('messages', [])
    roberta_snapshot = data.get('robertaSnapshot')
    previous_score = data.get('previousScore')

    if not messages:
        return jsonify({
            "success": True,
            "analysis": None,
            "source": "fallback_required",
            "message": "No messages provided for analysis"
        }), 200

    gemini_api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("VITE_GEMINI_API_KEY", "")
    analysis_json = None

    if gemini_api_key:
        try:
            scrubbed_msgs = []
            for idx, m in enumerate(messages):
                s_res = sanitize_pii(m.get("content", ""))
                scrubbed_msgs.append(f"Message {idx + 1} [Source: {m.get('source', 'unknown')}]: \"{s_res['sanitized']}\"")

            conversation_context = "\n".join(scrubbed_msgs)
            roberta_context = json.dumps(roberta_snapshot.get("emotions_breakdown", {})) if roberta_snapshot else "None"

            system_prompt = f"""You are an expert, compassionate emotional well-being analysis engine for the MindMitra application.
Analyze ONLY the user's messages across both sources (Emotion Classifier entries and Gemini Companion chat messages).

Latest RoBERTa Transformer Detected Emotions: {roberta_context}

IMPORTANT SAFETY & COMPLIANCE RULES:
1. Do NOT diagnose mental illnesses or clinical disorders (e.g. do not say "You have major depression" or "You have panic disorder").
2. Compute an emotional well-being score on a 1–10 scale:
   1 = very good / emotionally stable
   10 = very concerning / high emotional distress
   (1-2: Very positive / stable, 3-4: Generally stable, 5-6: Mild concern, 7-8: Significant concern, 9-10: High concern).
3. Evaluate emotional dimensions from 1 to 10 each:
   - anxiety_stress (1=none to 10=severe)
   - sadness_grief (1=none to 10=severe)
   - anger_frustration (1=calm to 10=high)
   - fear_vulnerability (1=safe to 10=high)
   - positive_emotion (1=depleted to 10=abundant)
   - emotional_stability (1=volatile to 10=grounded)
4. Determine trend (improving, stable, increasing_concern) comparing with previous score: {previous_score if previous_score is not None else 'none'}.
5. Return strictly valid JSON adhering to this exact schema:
{{
  "overall_score": 7.0,
  "concern_level": "Significant concern",
  "summary": "Compassionate, non-clinical summary explaining emotional signals in 2-3 sentences.",
  "dimensions": {{
    "anxiety_stress": 8,
    "sadness_grief": 6,
    "anger_frustration": 4,
    "fear_vulnerability": 7,
    "positive_emotion": 3,
    "emotional_stability": 5
  }},
  "dominant_emotions": ["Anxiety / Stress", "Fear / Vulnerability"],
  "key_indicators": [
    "Repeated expressions of workload pressure",
    "Future-related deadline worry",
    "Fatigue noted in conversation"
  ],
  "trend": "increasing_concern"
}}

Here are the user's messages:
{conversation_context}"""

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
            resp = requests.post(
                url,
                json={
                    "contents": [{"parts": [{"text": system_prompt}]}],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.2
                    }
                },
                timeout=15
            )

            if resp.status_code == 200:
                result = resp.json()
                raw_text = (
                    result.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )
                if raw_text:
                    analysis_json = json.loads(raw_text)
        except Exception as e:
            print(f"[Gemini Python Analysis] Error: {e}")

    return jsonify({
        "success": True,
        "analysis": analysis_json,
        "source": "gemini_unified_engine" if analysis_json else "fallback_required"
    }), 200

