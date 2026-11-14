/**
 * MindMitra Unified Emotional Analysis Service
 * Combines messages from:
 *   1. Emotion Classifier (user journal/statement inputs)
 *   2. Gemini AI Companion (user conversational chat messages)
 * 
 * Computes:
 *   - Overall Emotional Well-being Score (1 = very good / stable, 10 = high concern / distress)
 *   - Multi-dimensional emotional scores (1-10 for Anxiety, Sadness, Anger, Fear, Positive Emotion, Stability)
 *   - Dominant emotions
 *   - Emotional trend (improving, stable, increasing_concern)
 *   - Key indicators & compassionate non-clinical summary
 * 
 * Integrates with Supabase database (with seamless offline/cache persistence).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type MessageSource = 'emotion_classifier' | 'gemini_companion';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface StoredMessage {
  id: string;
  user_id: string;
  conversation_id: string;
  source: MessageSource;
  role: MessageRole;
  content: string;
  detected_emotion?: string;
  emotion_confidence?: number;
  timestamp: string;
  created_at: string;
}

export interface DimensionScores {
  anxiety_stress: number;      // 1 (minimal) to 10 (severe)
  sadness_grief: number;       // 1 (minimal) to 10 (severe)
  anger_frustration: number;   // 1 (calm) to 10 (severe)
  fear_vulnerability: number;  // 1 (secure) to 10 (severe)
  positive_emotion: number;    // 1 (depleted) to 10 (abundant vitality)
  emotional_stability: number; // 1 (volatile) to 10 (grounded equilibrium)
}

export interface UnifiedAnalysisResult {
  id?: string;
  user_id: string;
  overall_score: number;       // 1.0 to 10.0 (1=best, 10=worst)
  concern_level: string;       // 'Very positive / stable', 'Generally stable', 'Mild concern', 'Significant concern', 'High concern'
  summary: string;
  dimensions: DimensionScores;
  dominant_emotions: string[];
  key_indicators: string[];
  trend: 'improving' | 'stable' | 'increasing_concern';
  previous_score?: number;
  messages_analyzed_count: number;
  classifier_messages_count: number;
  companion_messages_count: number;
  roberta_snapshot?: {
    primary_emotion: string;
    confidence: number;
    emotions_breakdown: Record<string, number>;
  };
  created_at: string;
}

/**
 * Helper to ensure a valid UUID or user identifier
 */
export function resolveUserId(user?: { id?: string; email?: string } | null): string {
  if (user?.id && user.id.includes('-')) return user.id;
  if (user?.email) {
    if (user.email.toLowerCase().includes('demo')) {
      return '00000000-0000-0000-0000-000000000001';
    }
    // Return standard deterministic test UUID for non-demo users if ID missing
    return '11111111-1111-1111-1111-111111111111';
  }
  return '00000000-0000-0000-0000-000000000001';
}

/**
 * Helper to get a stable conversation/session ID per user
 */
export function getActiveConversationId(userId: string): string {
  const key = `mindmitra_conv_${userId}`;
  let convId = localStorage.getItem(key);
  if (!convId) {
    convId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(key, convId);
  }
  return convId;
}

/**
 * Save a new interaction message with explicit source attribution
 */
export async function saveConversationMessage(params: {
  userId: string;
  source: MessageSource;
  role: MessageRole;
  content: string;
  detectedEmotion?: string;
  emotionConfidence?: number;
}): Promise<StoredMessage> {
  const { userId, source, role, content, detectedEmotion, emotionConfidence } = params;
  const conversationId = getActiveConversationId(userId);

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newMessage: StoredMessage = {
    id: messageId,
    user_id: userId,
    conversation_id: conversationId,
    source,
    role,
    content: content.trim(),
    detected_emotion: detectedEmotion,
    emotion_confidence: emotionConfidence,
    timestamp: timeStr,
    created_at: nowIso
  };

  // 1. Local Cache storage (User-isolated)
  const cacheKey = `mindmitra_messages_${userId}`;
  try {
    const raw = localStorage.getItem(cacheKey);
    const existing: StoredMessage[] = raw ? JSON.parse(raw) : [];
    existing.push(newMessage);
    localStorage.setItem(cacheKey, JSON.stringify(existing));
  } catch (e) {
    console.warn('Error saving message to local cache:', e);
  }

  // 2. Supabase DB storage (if configured and valid UUID)
  if (isSupabaseConfigured() && userId.includes('-')) {
    try {
      await supabase.from('messages').insert([
        {
          id: crypto.randomUUID ? crypto.randomUUID() : undefined,
          conversation_id: conversationId.includes('-') ? conversationId : undefined,
          user_id: userId,
          role,
          source,
          content: content.trim(),
          detected_emotion: detectedEmotion,
          emotion_confidence: emotionConfidence,
          created_at: nowIso
        }
      ]);
    } catch (dbErr) {
      // Non-blocking: local cache preserves state
      console.warn('Supabase message insert non-blocking error:', dbErr);
    }
  }

  return newMessage;
}

/**
 * Clear all stored conversation messages & reset analysis history for a fresh session
 */
export async function clearUserConversationHistory(userId: string): Promise<void> {
  const cacheKey = `mindmitra_messages_${userId}`;
  const analysisCacheKey = `mindmitra_analyses_${userId}`;
  const convKey = `mindmitra_conv_${userId}`;
  
  try {
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(analysisCacheKey);
    localStorage.removeItem(convKey);
  } catch (e) {
    console.warn('Error clearing localStorage:', e);
  }

  // If Supabase configured, clear remote records for this user
  if (isSupabaseConfigured() && userId.includes('-')) {
    try {
      await supabase.from('messages').delete().eq('user_id', userId);
      await supabase.from('emotional_analyses').delete().eq('user_id', userId);
    } catch (e) {
      console.warn('Non-blocking error clearing Supabase records:', e);
    }
  }
}

/**
 * Retrieve all conversation messages for a given user from both sources
 */
export async function getStoredUserMessages(userId: string): Promise<{
  allMessages: StoredMessage[];
  allUserMessages: StoredMessage[];
  classifierUserMessages: StoredMessage[];
  companionUserMessages: StoredMessage[];
}> {
  let messages: StoredMessage[] = [];

  // Attempt to load from Supabase if configured
  if (isSupabaseConfigured() && userId.includes('-')) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        messages = data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          conversation_id: d.conversation_id || getActiveConversationId(userId),
          source: (d.source as MessageSource) || 'gemini_companion',
          role: (d.role as MessageRole) || 'user',
          content: d.content || '',
          detected_emotion: d.detected_emotion,
          emotion_confidence: d.emotion_confidence,
          timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          created_at: d.created_at
        }));
      }
    } catch (e) {
      console.warn('Could not fetch messages from Supabase, using local cache:', e);
    }
  }

  // Fallback / merge with local cache
  const cacheKey = `mindmitra_messages_${userId}`;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cachedMessages: StoredMessage[] = JSON.parse(raw);
      if (messages.length === 0) {
        messages = cachedMessages;
      } else {
        // Merge without duplicates
        const existingIds = new Set(messages.map(m => m.id));
        for (const cm of cachedMessages) {
          if (!existingIds.has(cm.id)) {
            messages.push(cm);
          }
        }
      }
    }
  } catch (e) {}

  // Filter ONLY user messages for emotional analysis
  const allUserMessages = messages.filter(m => m.role === 'user');
  const classifierUserMessages = allUserMessages.filter(m => m.source === 'emotion_classifier');
  const companionUserMessages = allUserMessages.filter(m => m.source === 'gemini_companion');

  return {
    allMessages: messages,
    allUserMessages,
    classifierUserMessages,
    companionUserMessages
  };
}

/**
 * Interpret numerical score to compassionate concern level
 */
export function getConcernLevel(score: number): {
  level: string;
  badgeColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
} {
  if (score <= 2.5) {
    return {
      level: 'Very positive / stable',
      badgeColor: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    };
  }
  if (score <= 4.5) {
    return {
      level: 'Generally stable',
      badgeColor: 'bg-teal-600',
      textColor: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    };
  }
  if (score <= 6.5) {
    return {
      level: 'Mild concern',
      badgeColor: 'bg-amber-500',
      textColor: 'text-amber-800',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    };
  }
  if (score <= 8.5) {
    return {
      level: 'Significant concern',
      badgeColor: 'bg-orange-600',
      textColor: 'text-orange-800',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    };
  }
  return {
    level: 'High concern',
    badgeColor: 'bg-rose-600',
    textColor: 'text-rose-800',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200'
  };
}

/**
 * Emotional Lexicons with Comprehensive Coverage & Slang Support
 */
const EMOTION_LEXICON = {
  anger: [
    'angry', 'anger', 'furious', 'mad', 'pissed', 'hate', 'irritated', 'irritating',
    'annoyed', 'annoying', 'rage', 'raging', 'frustrated', 'frustrating', 'frustration',
    'screaming', 'yelling', 'temper', 'disgusted', 'hostile', 'wrath', 'livid', 'fed up',
    'infuriated', 'outraged', 'bitter', 'offended', 'boiling'
  ],
  anxiety: [
    'tension', 'tense', 'stress', 'stressed', 'stressful', 'anxious', 'anxiety',
    'overwhelmed', 'overwhelming', 'overwhelm', 'panic', 'panicking', 'worried', 'worry',
    'worries', 'nervous', 'pressure', 'deadline', 'deadlines', 'freaking', 'burnout',
    'restless', 'uneasy', 'racing thoughts', 'apprehensive', 'jittery', 'on edge', 'tension full'
  ],
  sadness: [
    'sad', 'sadness', 'lonely', 'loneliness', 'alone', 'hopeless', 'depressed',
    'depressing', 'depression', 'crying', 'cry', 'cried', 'tears', 'heartbroken',
    'grief', 'grieving', 'miserable', 'empty', 'exhausted', 'exhausting', 'tired',
    'drained', 'giving up', 'worthless', 'unhappy', 'sorrow', 'despair', 'hurt', 'hurting'
  ],
  fear: [
    'fear', 'fearful', 'scared', 'terrified', 'terrifying', 'dread', 'dreading',
    'frightened', 'vulnerable', 'helpless', 'horrified', 'unsafe', 'threatened', 'intimidated', 'phobic'
  ],
  positive: [
    'happy', 'happiness', 'calm', 'calmness', 'peace', 'peaceful', 'grateful', 'gratitude',
    'amazing', 'hope', 'hopeful', 'better', 'good', 'great', 'love', 'relax', 'relaxed',
    'relaxing', 'friend', 'friends', 'joy', 'joyful', 'smile', 'smiling', 'rest', 'ease',
    'relief', 'relieved', 'content', 'blessed', 'proud', 'excited', 'excitement',
    'wonderful', 'fantastic', 'serene', 'tranquil', 'optimistic', 'uplifted', 'delighted'
  ]
};

function scoreMessageVector(msg: StoredMessage, isLatest: boolean, robertaSnapshot?: any) {
  const text = msg.content.toLowerCase();

  let angerCount = 0;
  let anxietyCount = 0;
  let sadnessCount = 0;
  let fearCount = 0;
  let positiveCount = 0;

  EMOTION_LEXICON.anger.forEach(w => { if (text.includes(w)) angerCount++; });
  EMOTION_LEXICON.anxiety.forEach(w => { if (text.includes(w)) anxietyCount++; });
  EMOTION_LEXICON.sadness.forEach(w => { if (text.includes(w)) sadnessCount++; });
  EMOTION_LEXICON.fear.forEach(w => { if (text.includes(w)) fearCount++; });
  EMOTION_LEXICON.positive.forEach(w => { if (text.includes(w)) positiveCount++; });

  const hasIntenseAnger = text.includes('very angry') || text.includes('so angry') || text.includes('furious') || text.includes('rage') || text.includes('hate');
  const hasIntenseAnxiety = text.includes('tension full') || text.includes('panic') || text.includes('so stressed') || text.includes('overwhelmed') || text.includes('cant take');
  const hasIntenseSadness = text.includes('crying') || text.includes('hopeless') || text.includes('depressed') || text.includes('so sad');
  const hasIntenseFear = text.includes('terrified') || text.includes('so scared') || text.includes('in fear');
  const hasIntensePositive = text.includes('so happy') || text.includes('amazing') || text.includes('wonderful') || text.includes('so grateful');

  let aScore = 1;
  let axScore = 1;
  let sScore = 1;
  let fScore = 1;
  let pScore = 5;
  let stScore = 6;

  // 1. Direct Transformer Probabilities (if latest message with snapshot)
  if (isLatest && robertaSnapshot?.emotions_breakdown) {
    const bd = robertaSnapshot.emotions_breakdown;
    const angerProb = bd['Anger / Frustration'] ?? bd['anger'] ?? 0;
    const anxietyProb = bd['Anxiety / Stress'] ?? bd['nervousness'] ?? 0;
    const sadnessProb = bd['Sadness / Grief'] ?? bd['sadness'] ?? 0;
    const fearProb = bd['Fear / Vulnerability'] ?? bd['fear'] ?? 0;
    const joyProb = bd['Joy / Serenity'] ?? bd['joy'] ?? 0;
    const calmProb = bd['Calmness / Equilibrium'] ?? bd['neutral'] ?? 0;

    if (angerProb > 10) aScore = Math.max(aScore, Math.round(angerProb / 10));
    if (anxietyProb > 10) axScore = Math.max(axScore, Math.round(anxietyProb / 10));
    if (sadnessProb > 10) sScore = Math.max(sScore, Math.round(sadnessProb / 10));
    if (fearProb > 10) fScore = Math.max(fScore, Math.round(fearProb / 10));
    if (joyProb > 10) pScore = Math.max(1, Math.round(joyProb / 10));
    if (calmProb > 10) stScore = Math.max(1, Math.round((calmProb + joyProb * 0.3) / 10));
  }

  // 2. Factor in detected_emotion tag on stored message
  if (msg.detected_emotion) {
    if (msg.detected_emotion.includes('Anger') || msg.detected_emotion.includes('Frustration')) aScore = Math.max(aScore, 7);
    if (msg.detected_emotion.includes('Anxiety') || msg.detected_emotion.includes('Stress')) axScore = Math.max(axScore, 7);
    if (msg.detected_emotion.includes('Sadness') || msg.detected_emotion.includes('Grief')) sScore = Math.max(sScore, 7);
    if (msg.detected_emotion.includes('Fear') || msg.detected_emotion.includes('Vulnerability')) fScore = Math.max(fScore, 7);
    if (msg.detected_emotion.includes('Joy') || msg.detected_emotion.includes('Serenity')) pScore = Math.max(pScore, 8);
    if (msg.detected_emotion.includes('Calm') || msg.detected_emotion.includes('Equilibrium')) stScore = Math.max(stScore, 8);
  }

  // 3. Keyword intensity overrides
  if (angerCount > 0) aScore = Math.max(aScore, 6 + Math.min(3, angerCount) + (hasIntenseAnger ? 2 : 0));
  if (anxietyCount > 0) axScore = Math.max(axScore, 6 + Math.min(3, anxietyCount) + (hasIntenseAnxiety ? 2 : 0));
  if (sadnessCount > 0) sScore = Math.max(sScore, 6 + Math.min(3, sadnessCount) + (hasIntenseSadness ? 2 : 0));
  if (fearCount > 0) fScore = Math.max(fScore, 6 + Math.min(3, fearCount) + (hasIntenseFear ? 2 : 0));
  if (positiveCount > 0) pScore = Math.max(pScore, 6 + Math.min(3, positiveCount) + (hasIntensePositive ? 2 : 0));

  // Cap bounds
  aScore = Math.min(10, Math.max(1, aScore));
  axScore = Math.min(10, Math.max(1, axScore));
  sScore = Math.min(10, Math.max(1, sScore));
  fScore = Math.min(10, Math.max(1, fScore));
  pScore = Math.min(10, Math.max(1, pScore));
  stScore = Math.min(10, Math.max(1, stScore));

  // 4. Dynamic Cross-coupling: High distress actively suppresses joy & stability
  const peakDistress = Math.max(aScore, axScore, sScore, fScore);
  if (peakDistress >= 6) {
    pScore = Math.max(1, Math.min(pScore, Math.max(1, 10 - peakDistress)));
    stScore = Math.max(1, Math.min(stScore, Math.max(1, 11 - peakDistress)));
  } else if (pScore >= 7) {
    aScore = Math.min(aScore, 2);
    axScore = Math.min(axScore, 3);
    sScore = Math.min(sScore, 2);
    fScore = Math.min(fScore, 2);
    stScore = Math.max(stScore, 7);
  }

  return { aScore, axScore, sScore, fScore, pScore, stScore, peakDistress };
}

/**
 * Deterministic multi-dimensional emotion analyzer
 * Fuses Transformer probabilities, keywords, sentence urgency, and multi-message momentum
 * Uses Recency-Weighted Primacy: The active message leads the emotional state.
 */
export function calculateLocalEmotionalAnalysis(
  userMessages: StoredMessage[],
  robertaSnapshot?: any,
  previousScore?: number
): UnifiedAnalysisResult {
  const classifierCount = userMessages.filter(m => m.source === 'emotion_classifier').length;
  const companionCount = userMessages.filter(m => m.source === 'gemini_companion').length;

  if (userMessages.length === 0) {
    // Default baseline state when no messages exist yet
    return {
      user_id: '',
      overall_score: 3.5,
      concern_level: 'Generally stable',
      summary: 'No conversation messages analyzed yet. Share thoughts in the Emotion Classifier or Gemini Companion to begin emotional tracking.',
      dimensions: {
        anxiety_stress: 3,
        sadness_grief: 2,
        anger_frustration: 2,
        fear_vulnerability: 2,
        positive_emotion: 6,
        emotional_stability: 7
      },
      dominant_emotions: ['Calmness / Equilibrium'],
      key_indicators: ['Baseline initialization awaiting user messages'],
      trend: 'stable',
      messages_analyzed_count: 0,
      classifier_messages_count: 0,
      companion_messages_count: 0,
      created_at: new Date().toISOString()
    };
  }

  const msgCount = userMessages.length;
  const latestMessage = userMessages[msgCount - 1];
  const latestScore = scoreMessageVector(latestMessage, true, robertaSnapshot);

  let finalAnxiety: number;
  let finalSadness: number;
  let finalAnger: number;
  let finalFear: number;
  let finalPositive: number;
  let finalStability: number;

  if (msgCount <= 1) {
    // 100% current active message
    finalAnxiety = latestScore.axScore;
    finalSadness = latestScore.sScore;
    finalAnger = latestScore.aScore;
    finalFear = latestScore.fScore;
    finalPositive = latestScore.pScore;
    finalStability = latestScore.stScore;
  } else {
    // Compute recency-decayed historical average for previous messages (0 to msgCount - 2)
    const pastMessages = userMessages.slice(0, msgCount - 1);
    let hA = 0, hAx = 0, hS = 0, hF = 0, hP = 0, hSt = 0;
    pastMessages.forEach(m => {
      const v = scoreMessageVector(m, false);
      hA += v.aScore;
      hAx += v.axScore;
      hS += v.sScore;
      hF += v.fScore;
      hP += v.pScore;
      hSt += v.stScore;
    });
    const pCount = pastMessages.length;
    const histA = hA / pCount;
    const histAx = hAx / pCount;
    const histS = hS / pCount;
    const histF = hF / pCount;
    const histP = hP / pCount;
    const histSt = hSt / pCount;

    // Current message dominates with 70% weight, history retains 30% background context
    const currentWeight = 0.70;
    const historyWeight = 0.30;

    finalAnger = Math.min(10, Math.max(1, Math.round(currentWeight * latestScore.aScore + historyWeight * histA)));
    finalAnxiety = Math.min(10, Math.max(1, Math.round(currentWeight * latestScore.axScore + historyWeight * histAx)));
    finalSadness = Math.min(10, Math.max(1, Math.round(currentWeight * latestScore.sScore + historyWeight * histS)));
    finalFear = Math.min(10, Math.max(1, Math.round(currentWeight * latestScore.fScore + historyWeight * histF)));
    finalPositive = Math.min(10, Math.max(1, Math.round(currentWeight * latestScore.pScore + historyWeight * histP)));
    finalStability = Math.min(10, Math.max(1, Math.round(currentWeight * latestScore.stScore + historyWeight * histSt)));

    // Guarantee that if current message is strongly angry/stressed, it is never suppressed below 7
    if (latestScore.aScore >= 8) finalAnger = Math.max(finalAnger, latestScore.aScore - 1);
    if (latestScore.axScore >= 8) finalAnxiety = Math.max(finalAnxiety, latestScore.axScore - 1);
    if (latestScore.sScore >= 8) finalSadness = Math.max(finalSadness, latestScore.sScore - 1);
    if (latestScore.fScore >= 8) finalFear = Math.max(finalFear, latestScore.fScore - 1);

    // Cross-coupling on blended dimensions:
    const blendedPeakDistress = Math.max(finalAnger, finalAnxiety, finalSadness, finalFear);
    if (blendedPeakDistress >= 6) {
      finalPositive = Math.max(1, Math.min(finalPositive, Math.max(1, 10 - blendedPeakDistress)));
      finalStability = Math.max(1, Math.min(finalStability, Math.max(1, 11 - blendedPeakDistress)));
    }
  }

  // Calculate Overall Well-being Score (1.0 = Best/Stable, 10.0 = High Distress)
  const peakDistress = Math.max(finalAnger, finalAnxiety, finalSadness, finalFear);
  const otherDistressAvg = (finalAnger + finalAnxiety + finalSadness + finalFear - peakDistress) / 3;
  const rawDistress = (peakDistress * 0.60) + (otherDistressAvg * 0.20) + ((10 - finalPositive) * 0.20);
  const rawScore = Math.min(10.0, Math.max(1.0, Math.round(rawDistress * 10) / 10));

  // Determine Dominant Emotions by sorting dimensions descending
  const dimensionRanks = [
    { name: 'Anger / Frustration', val: finalAnger },
    { name: 'Anxiety / Stress', val: finalAnxiety },
    { name: 'Sadness / Grief', val: finalSadness },
    { name: 'Fear / Vulnerability', val: finalFear },
    { name: 'Joy / Serenity', val: finalPositive },
    { name: 'Calmness / Equilibrium', val: finalStability }
  ].sort((a, b) => b.val - a.val);

  const dominantEmotions = dimensionRanks.slice(0, 2).map(r => r.name);
  if (dominantEmotions.length === 0) dominantEmotions.push('Calmness / Equilibrium');

  // Key indicators reflecting reality
  const indicators: string[] = [];
  if (finalAnger >= 6) indicators.push('Intense frustration, anger, or irritation expressed in recent thoughts');
  if (finalAnxiety >= 6) indicators.push('Elevated tension, pressure, or workload worry detected');
  if (finalSadness >= 6) indicators.push('Feelings of emotional fatigue, sorrow, or feeling down');
  if (finalFear >= 6) indicators.push('Heightened fear, vulnerability, or apprehension');
  if (finalPositive >= 6 && peakDistress < 5) indicators.push('Positive emotional vitality and gratitude noted');
  if (finalStability >= 7 && peakDistress < 5) indicators.push('Grounded resilience and emotional equilibrium maintained');
  if (indicators.length === 0) {
    indicators.push('Mixed conversational tone across both sections');
  }

  // Trend determination: lower score is better!
  let trend: 'improving' | 'stable' | 'increasing_concern' = 'stable';
  if (previousScore !== undefined && previousScore !== null) {
    const diff = rawScore - previousScore;
    if (diff <= -0.5) trend = 'improving';
    else if (diff >= 0.5) trend = 'increasing_concern';
    else trend = 'stable';
  }

  const concernInfo = getConcernLevel(rawScore);

  // Compassionate, non-clinical summary
  let summary = '';
  if (rawScore <= 3.0) {
    summary = `Your conversation patterns show healthy emotional stability and resilience (${rawScore}/10). You appear to be navigating daily challenges with positive balance.`;
  } else if (rawScore <= 5.5) {
    summary = `Mild emotional strain detected (${rawScore}/10), with elements of stress or worry surfacing in your messages. Taking a short breather or practicing a grounding technique can help restore equilibrium.`;
  } else if (rawScore <= 7.5) {
    summary = `Noticeable emotional pressure and elevated strain are prominent across your messages (${rawScore}/10). Be gentle with yourself today, prioritize rest, and consider reaching out to supportive friends or guidance.`;
  } else {
    summary = `High emotional distress is reflected in recent interactions (${rawScore}/10). Your feelings are completely valid. Please remember you do not have to carry this alone—supportive resources and crisis help are always here.`;
  }

  return {
    user_id: userMessages[0]?.user_id || '',
    overall_score: rawScore,
    concern_level: concernInfo.level,
    summary,
    dimensions: {
      anxiety_stress: finalAnxiety,
      sadness_grief: finalSadness,
      anger_frustration: finalAnger,
      fear_vulnerability: finalFear,
      positive_emotion: finalPositive,
      emotional_stability: finalStability
    },
    dominant_emotions: dominantEmotions,
    key_indicators: indicators,
    trend,
    previous_score: previousScore,
    messages_analyzed_count: userMessages.length,
    classifier_messages_count: classifierCount,
    companion_messages_count: companionCount,
    roberta_snapshot: robertaSnapshot,
    created_at: new Date().toISOString()
  };
}

/**
 * Execute the Unified Emotional Analysis
 * Communicates with `/api/analysis/unified` (Gemini API contextual engine)
 * With robust fallback to local deterministic emotion fusion if network is unavailable.
 */
export async function runUnifiedEmotionalAnalysis(params: {
  userId: string;
  robertaSnapshot?: any;
}): Promise<UnifiedAnalysisResult> {
  const { userId, robertaSnapshot } = params;

  // 1. Fetch all user messages across both sources
  const { allUserMessages, classifierUserMessages, companionUserMessages } = await getStoredUserMessages(userId);

  // 2. Fetch previous analysis for trend calculation
  const prevAnalysis = await getLatestAnalysis(userId);
  const previousScore = prevAnalysis?.overall_score;

  let result: UnifiedAnalysisResult | null = null;

  // 3. Try Calling Unified Backend API Endpoint
  try {
    const res = await fetch('/api/analysis/unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        messages: allUserMessages.map(m => ({
          source: m.source,
          content: m.content,
          timestamp: m.timestamp,
          detected_emotion: m.detected_emotion
        })),
        robertaSnapshot,
        previousScore
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.analysis) {
        result = {
          ...data.analysis,
          user_id: userId,
          messages_analyzed_count: allUserMessages.length,
          classifier_messages_count: classifierUserMessages.length,
          companion_messages_count: companionUserMessages.length,
          previous_score: previousScore,
          created_at: new Date().toISOString()
        };
      }
    }
  } catch (apiErr) {
    console.info('Backend API /api/analysis/unified offline or unreachable, using local analyzer.');
  }

  // 4. Fallback to local multi-source fusion engine if backend API didn't return
  if (!result) {
    result = calculateLocalEmotionalAnalysis(allUserMessages, robertaSnapshot, previousScore);
    result.user_id = userId;
  }

  // 5. Save the analysis record for history & trends
  await saveAnalysisRecord(result);

  return result;
}

/**
 * Persist an analysis run in Supabase and local cache
 */
async function saveAnalysisRecord(analysis: UnifiedAnalysisResult): Promise<void> {
  const userId = analysis.user_id;
  if (!userId) return;

  // 1. Local Cache history
  const historyKey = `mindmitra_analyses_${userId}`;
  try {
    const raw = localStorage.getItem(historyKey);
    const history: UnifiedAnalysisResult[] = raw ? JSON.parse(raw) : [];
    history.unshift(analysis); // latest first
    // keep at most 50 historical runs
    localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50)));
  } catch (e) {}

  // 2. Supabase DB record
  if (isSupabaseConfigured() && userId.includes('-')) {
    try {
      await supabase.from('emotional_analyses').insert([
        {
          id: crypto.randomUUID ? crypto.randomUUID() : undefined,
          user_id: userId,
          overall_score: analysis.overall_score,
          concern_level: analysis.concern_level,
          dominant_emotions: analysis.dominant_emotions,
          dimensions: analysis.dimensions,
          summary: analysis.summary,
          key_indicators: analysis.key_indicators,
          trend: analysis.trend,
          previous_score: analysis.previous_score,
          messages_analyzed_count: analysis.messages_analyzed_count,
          classifier_messages_count: analysis.classifier_messages_count,
          companion_messages_count: analysis.companion_messages_count,
          roberta_snapshot: analysis.roberta_snapshot,
          created_at: analysis.created_at
        }
      ]);
    } catch (dbErr) {
      console.warn('Supabase emotional_analyses insert error:', dbErr);
    }
  }
}

/**
 * Retrieve the most recent analysis run for a user
 */
export async function getLatestAnalysis(userId: string): Promise<UnifiedAnalysisResult | null> {
  if (!userId) return null;

  // Check Supabase if configured
  if (isSupabaseConfigured() && userId.includes('-')) {
    try {
      const { data, error } = await supabase
        .from('emotional_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          user_id: data.user_id,
          overall_score: Number(data.overall_score),
          concern_level: data.concern_level,
          summary: data.summary,
          dimensions: data.dimensions,
          dominant_emotions: data.dominant_emotions || [],
          key_indicators: data.key_indicators || [],
          trend: data.trend || 'stable',
          previous_score: data.previous_score ? Number(data.previous_score) : undefined,
          messages_analyzed_count: data.messages_analyzed_count || 0,
          classifier_messages_count: data.classifier_messages_count || 0,
          companion_messages_count: data.companion_messages_count || 0,
          roberta_snapshot: data.roberta_snapshot,
          created_at: data.created_at
        };
      }
    } catch (e) {}
  }

  // Local cache fallback
  try {
    const raw = localStorage.getItem(`mindmitra_analyses_${userId}`);
    if (raw) {
      const history: UnifiedAnalysisResult[] = JSON.parse(raw);
      if (history.length > 0) return history[0];
    }
  } catch (e) {}

  return null;
}

/**
 * Retrieve full analysis history for trend chart
 */
export async function getAnalysisHistory(userId: string): Promise<UnifiedAnalysisResult[]> {
  if (!userId) return [];

  // Check Supabase
  if (isSupabaseConfigured() && userId.includes('-')) {
    try {
      const { data, error } = await supabase
        .from('emotional_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(30);

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          overall_score: Number(d.overall_score),
          concern_level: d.concern_level,
          summary: d.summary,
          dimensions: d.dimensions,
          dominant_emotions: d.dominant_emotions || [],
          key_indicators: d.key_indicators || [],
          trend: d.trend || 'stable',
          previous_score: d.previous_score ? Number(d.previous_score) : undefined,
          messages_analyzed_count: d.messages_analyzed_count || 0,
          classifier_messages_count: d.classifier_messages_count || 0,
          companion_messages_count: d.companion_messages_count || 0,
          roberta_snapshot: d.roberta_snapshot,
          created_at: d.created_at
        }));
      }
    } catch (e) {}
  }

  // Local cache fallback
  try {
    const raw = localStorage.getItem(`mindmitra_analyses_${userId}`);
    if (raw) {
      const history: UnifiedAnalysisResult[] = JSON.parse(raw);
      return history.reverse(); // ascending order
    }
  } catch (e) {}

  return [];
}
