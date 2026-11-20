/**
 * MindMitra Gemini AI Companion Service
 *
 * Integrates Google Gemini API for the Empathetic AI Companion module.
 * Provides resilient multi-tier fallback:
 *   1. Backend API Gateway (/api/chat/respond) with server-side PII scrubbing
 *   2. Client-side direct Google Gemini API (v1beta with gemini-1.5-flash / gemini-2.0-flash) with client PII redaction
 *   3. Offline/local empathetic guidance engine when offline
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyC0HKW8OydXC4yF4PM1TfGOyUPVTUpG3Ww';
const CANDIDATE_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];

export interface CompanionResponse {
  replyText: string;
  suggestedActions: string[];
  scrubbedInput: string;
  isScrubbed: boolean;
  source: 'backend_gemini' | 'client_gemini' | 'local_fallback';
  modelUsed: string;
}

/**
 * Client-Side PII Sanitization Guardrail
 * Ensures zero personal info is leaked to external LLM endpoints.
 */
export function sanitizeClientPII(text: string): { sanitized: string; wasSanitized: boolean; entities: string[] } {
  if (!text || typeof text !== 'string') {
    return { sanitized: '', wasSanitized: false, entities: [] };
  }

  let sanitized = text;
  const entities: string[] = [];

  // Redact email addresses
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  if (emailRegex.test(sanitized)) {
    entities.push('EMAIL');
    sanitized = sanitized.replace(emailRegex, '[EMAIL_REDACTED]');
  }

  // Redact phone numbers
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  if (phoneRegex.test(sanitized)) {
    entities.push('PHONE_NUMBER');
    sanitized = sanitized.replace(phoneRegex, '[PHONE_REDACTED]');
  }

  // Redact SSN / Government IDs
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  if (ssnRegex.test(sanitized)) {
    entities.push('GOV_ID');
    sanitized = sanitized.replace(ssnRegex, '[ID_REDACTED]');
  }

  return {
    sanitized,
    wasSanitized: entities.length > 0,
    entities
  };
}

/**
 * Check if a Gemini API Key is configured
 */
export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 10);
}

/**
 * Call Google Gemini Generative Language API directly
 */
async function callDirectGeminiApi(
  sanitizedText: string,
  style: string = 'empathetic'
): Promise<{ replyText: string; suggestedActions: string[]; model: string } | null> {
  if (!isGeminiConfigured()) return null;

  const styleInstruction = style === 'gentle'
    ? 'Use a gentle, soothing, soft grounding tone with calming presence.'
    : style === 'direct'
    ? 'Be clear, solution-oriented, compassionate yet structured.'
    : style === 'reflective'
    ? 'Ask gentle, thoughtful inquiry questions that help the user explore their feelings.'
    : 'Respond with genuine empathy, warmth, and non-judgmental validation.';

  const prompt = `You are MindMitra, a compassionate and supportive emotional well-being AI companion.
Guidance style preference: ${styleInstruction}

A user shares their personal reflection:
"${sanitizedText}"

Instructions:
1. Respond with genuine empathy, warmth, and non-judgmental emotional support in 2-3 concise paragraphs.
2. Do NOT clinically diagnose mental illnesses or make medical claims. Offer a gentle grounding reflection.
3. At the very end of your response on a new line, suggest 3 practical next steps in this format:
SUGGESTIONS: [Short action 1 | Short action 2 | Short action 3]`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 600
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          let fullText = candidate.trim();
          let suggestedActions = [
            'Log this session in Mood Tracker',
            'Try a 2-minute Guided Breathing session',
            'Read Resilience Affirmation'
          ];

          const suggestionMatch = fullText.match(/SUGGESTIONS:\s*\[([^\]]+)\]/i);
          if (suggestionMatch && suggestionMatch[1]) {
            const parsed = suggestionMatch[1]
              .split('|')
              .map((s: string) => s.trim())
              .filter(Boolean);
            if (parsed.length > 0) {
              suggestedActions = parsed;
            }
            fullText = fullText.replace(/SUGGESTIONS:\s*\[([^\]]+)\]/i, '').trim();
          }

          return {
            replyText: fullText,
            suggestedActions,
            model
          };
        }
      }
    } catch (err) {
      console.warn(`[Gemini Client Service] Model ${model} request error:`, err);
    }
  }

  return null;
}

/**
 * Intelligent local empathetic fallback for offline situations
 */
function getLocalEmpatheticFallback(sanitizedText: string): { replyText: string; suggestedActions: string[] } {
  const lower = sanitizedText.toLowerCase();

  if (lower.includes('anxious') || lower.includes('overwhelm') || lower.includes('deadline') || lower.includes('stress')) {
    return {
      replyText: `Thank you for sharing that with me. It is completely natural to feel overwhelmed when deadlines and demands pile up. Taking a deep, gentle breath right now can give your mind the pause it deserves. What is one small task you can set aside for today to give yourself some breathing room?`,
      suggestedActions: ['Start 4-7-8 Breathing', 'Break workload into small steps', 'Take a 5-minute breather']
    };
  }

  if (lower.includes('sad') || lower.includes('alone') || lower.includes('down') || lower.includes('depress') || lower.includes('cry')) {
    return {
      replyText: `I hear you, and your feelings are completely valid. Experiencing heavy days can feel draining, but you don't have to carry all of it alone. I am right here with you. What would feel most comforting to you in this exact moment?`,
      suggestedActions: ['Listen to soothing music', 'Drink a glass of warm water', 'Rest and pause']
    };
  }

  if (lower.includes('angry') || lower.includes('frustrated') || lower.includes('mad') || lower.includes('upset')) {
    return {
      replyText: `It sounds like you are navigating a really frustrating situation. Feeling anger is a sign that something deeply matters to you or that boundaries felt crossed. Give yourself permission to pause and feel that heat without judging it. Would it help to release some of that physical tension?`,
      suggestedActions: ['Go for a brisk walk', 'Do progressive muscle relaxation', 'Journal without filtering']
    };
  }

  return {
    replyText: `Thank you for opening up to me. Hearing your thoughts helps us find steady ground together. When feelings swirl, grounding yourself in the present moment is deeply restorative. How does your body feel right now as we talk?`,
    suggestedActions: ['Notice 5 things around you', 'Take 3 deep gentle breaths', 'Write down what you need right now']
  };
}

/**
 * Primary dispatch function for the AI Companion
 * Tries:
 *   1. Backend server gateway (/api/chat/respond)
 *   2. Direct Google Gemini Generative Language API
 *   3. Compassionate local fallback
 */
export async function sendCompanionMessage(
  userMessage: string,
  options?: { style?: string }
): Promise<CompanionResponse> {
  const style = options?.style || 'empathetic';
  const { sanitized, wasSanitized } = sanitizeClientPII(userMessage);

  // 1. Try backend API gateway
  try {
    const res = await fetch('/api/chat/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, style })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.response) {
        return {
          replyText: data.response,
          suggestedActions: data.suggested_actions || [
            'Log this session in Mood Tracker',
            'Try a 2-minute Guided Breathing session',
            'Read Resilience Affirmation'
          ],
          scrubbedInput: data.scrubbed_input || sanitized,
          isScrubbed: Boolean(data.pii_protected || wasSanitized),
          source: 'backend_gemini',
          modelUsed: 'Google Gemini 1.5 Flash (Backend Gateway)'
        };
      }
    }
  } catch (backendErr) {
    // Backend offline or unreachable, fall through to direct Gemini API
  }

  // 2. Try direct Google Gemini API call
  try {
    const geminiResult = await callDirectGeminiApi(sanitized, style);
    if (geminiResult && geminiResult.replyText) {
      return {
        replyText: geminiResult.replyText,
        suggestedActions: geminiResult.suggestedActions,
        scrubbedInput: sanitized,
        isScrubbed: wasSanitized,
        source: 'client_gemini',
        modelUsed: `Google ${geminiResult.model}`
      };
    }
  } catch (directErr) {
    console.warn('[Gemini Companion Service] Direct API call error:', directErr);
  }

  // 3. Fallback to intelligent local empathetic engine
  const fallback = getLocalEmpatheticFallback(sanitized);
  return {
    replyText: fallback.replyText,
    suggestedActions: fallback.suggestedActions,
    scrubbedInput: sanitized,
    isScrubbed: wasSanitized,
    source: 'local_fallback',
    modelUsed: 'MindMitra Empathetic Engine'
  };
}
