import { config } from '../config/index.js';

// Candidate models in preference order for maximum compatibility with Gemini API
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];

/**
 * Helper to call Gemini Generative Language API across candidate models
 */
async function callGeminiApi({ apiKey, contents, generationConfig = {} }) {
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { text: text.trim(), modelUsed: model };
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[Gemini Service] Model ${model} returned HTTP ${res.status}: ${errText.substring(0, 200)}`);
      }
    } catch (e) {
      console.warn(`[Gemini Service] Model ${model} request error:`, e.message);
    }
  }
  return null;
}

/**
 * Call Gemini to generate an empathetic companion response
 */
export async function generateEmpatheticResponse(sanitizedText, options = {}) {
  const geminiApiKey = config.geminiApiKey;
  let replyText = '';
  let suggestedActions = [
    'Log this session in Mood Tracker',
    'Try a 2-minute Guided Breathing session',
    'Read Resilience Affirmation'
  ];

  if (geminiApiKey) {
    try {
      const styleInstruction = options.style === 'gentle'
        ? 'Use a gentle, soothing, soft grounding tone with calming presence.'
        : options.style === 'direct'
        ? 'Be clear, solution-oriented, compassionate yet structured.'
        : options.style === 'reflective'
        ? 'Ask gentle, thoughtful inquiry questions that help the user explore their feelings.'
        : 'Respond with genuine empathy, warmth, and non-judgmental validation.';

      const prompt = `You are MindMitra, a compassionate and supportive emotional well-being AI companion.
Guidance style: ${styleInstruction}

A user shares their personal reflection:
"${sanitizedText}"

Instructions:
1. Respond with genuine empathy, warmth, and non-judgmental emotional support in 2-3 concise paragraphs.
2. Do NOT clinically diagnose mental illnesses or make medical claims. Offer a gentle grounding reflection.
3. At the very end of your response on a new line, suggest 3 practical next steps in this format:
SUGGESTIONS: [Short action 1 | Short action 2 | Short action 3]`;

      const result = await callGeminiApi({
        apiKey: geminiApiKey,
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6 }
      });

      if (result?.text) {
        let fullText = result.text;
        
        // Extract SUGGESTIONS if present
        const suggestionMatch = fullText.match(/SUGGESTIONS:\s*\[([^\]]+)\]/i);
        if (suggestionMatch && suggestionMatch[1]) {
          const parsed = suggestionMatch[1]
            .split('|')
            .map(s => s.trim())
            .filter(Boolean);
          if (parsed.length > 0) {
            suggestedActions = parsed;
          }
          fullText = fullText.replace(/SUGGESTIONS:\s*\[([^\]]+)\]/i, '').trim();
        }

        replyText = fullText;
      }
    } catch (e) {
      console.warn('[Gemini Service] API call failed, using empathetic fallback:', e.message);
    }
  }

  // Empathetic fallback if Gemini is offline or unreachable
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
 * Call Gemini to compute Unified Emotional Analysis across user conversations
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

    const result = await callGeminiApi({
      apiKey: geminiApiKey,
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    if (result?.text) {
      return JSON.parse(result.text);
    }
  } catch (err) {
    console.warn('[Gemini Service] Unified Analysis API call failed:', err.message);
  }

  return null;
}
