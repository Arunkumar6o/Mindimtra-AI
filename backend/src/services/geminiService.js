import { config } from '../config/index.js';

/**
 * Call Gemini 1.5 Flash to generate an empathetic companion response
 */
export async function generateEmpatheticResponse(sanitizedText) {
  const geminiApiKey = config.geminiApiKey;
  let replyText = '';
  let suggestedActions = [
    'Log this session in Mood Tracker',
    'Try a 2-minute Guided Breathing session',
    'Read Resilience Affirmation'
  ];

  if (geminiApiKey) {
    try {
      const prompt = `You are MindMitra, a compassionate and supportive emotional well-being AI companion.
A user shares: "${sanitizedText}".
Respond with genuine empathy, warmth, and non-judgmental support in 2-3 concise paragraphs.
Do NOT clinically diagnose mental illnesses or make medical claims. Offer a gentle grounding reflection.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.6 }
          })
        }
      );

      if (geminiRes.ok) {
        const gData = await geminiRes.json();
        const candidate = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          replyText = candidate.trim();
        }
      }
    } catch (e) {
      console.warn('[Gemini Service] API call failed, using empathetic fallback:', e.message);
    }
  }

  // Empathetic fallback
  if (!replyText) {
    const lower = sanitizedText.toLowerCase();
    if (lower.includes('anxious') || lower.includes('overwhelm') || lower.includes('deadline')) {
      replyText = `Thank you for sharing that with me. It is completely natural to feel overwhelmed when deadlines and demands pile up. Taking a deep, gentle breath right now can give your mind the pause it deserves. What is one small task you can set aside for today to give yourself some breathing room?`;
      suggestedActions = ['Start 4-7-8 Breathing', 'Break workload into small steps', 'Take a 5-minute breather'];
    } else if (lower.includes('sad') || lower.includes('alone') || lower.includes('down')) {
      replyText = `I hear you, and your feelings are completely valid. Experiencing heavy days can feel draining, but you don't have to carry all of it alone. I am right here with you. What would feel most comforting to you in this exact moment?`;
      suggestedActions = ['Listen to soothing music', 'Drink a glass of warm water', 'Rest and pause'];
    } else {
      replyText = `Thank you for opening up to me. Hearing your thoughts helps us find steady ground together. When feelings swirl, grounding yourself in the present moment is deeply restorative. How does your body feel right now as we talk?`;
    }
  }

  return { replyText, suggestedActions };
}

/**
 * Call Gemini 1.5 Flash to compute Unified Emotional Analysis across user conversations
 */
export async function generateUnifiedAnalysis({ conversationContext, robertaSnapshot, previousScore }) {
  const geminiApiKey = config.geminiApiKey;
  if (!geminiApiKey || !conversationContext) {
    return null;
  }

  try {
    const robertaContext = robertaSnapshot ? JSON.stringify(robertaSnapshot.emotions_breakdown || {}) : 'None';
    const systemPrompt = `You are an expert, compassionate emotional well-being analysis engine for the MindMitra application.
Analyze ONLY the user's messages across both sources (Emotion Classifier entries and Gemini Companion chat messages).

Latest RoBERTa Transformer Detected Emotions: ${robertaContext}

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
4. Determine trend (improving, stable, increasing_concern) comparing with previous score: ${previousScore ?? 'none'}.
5. Return strictly valid JSON adhering to this exact schema:
{
  "overall_score": 7.0,
  "concern_level": "Significant concern",
  "summary": "Compassionate, non-clinical summary explaining emotional signals in 2-3 sentences.",
  "dimensions": {
    "anxiety_stress": 8,
    "sadness_grief": 6,
    "anger_frustration": 4,
    "fear_vulnerability": 7,
    "positive_emotion": 3,
    "emotional_stability": 5
  },
  "dominant_emotions": ["Anxiety / Stress", "Fear / Vulnerability"],
  "key_indicators": [
    "Repeated expressions of workload pressure",
    "Future-related deadline worry",
    "Fatigue noted in conversation"
  ],
  "trend": "increasing_concern"
}

Here are the user's messages:
${conversationContext}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      }
    );

    if (geminiRes.ok) {
      const gData = await geminiRes.json();
      const rawJsonText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJsonText) {
        return JSON.parse(rawJsonText);
      }
    }
  } catch (err) {
    console.warn('[Gemini Service] Unified Analysis API call failed:', err.message);
  }

  return null;
}

