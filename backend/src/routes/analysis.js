import express from 'express';
import { sanitizePII } from '../middleware/piiSanitizer.js';
import { generateUnifiedAnalysis } from '../services/geminiService.js';

const router = express.Router();

/**
 * POST /api/analysis/unified
 * Multi-Source Unified Emotional Analysis Endpoint
 */
router.post('/unified', async (req, res) => {
  try {
    const { messages = [], robertaSnapshot, previousScore } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(200).json({
        success: true,
        analysis: null,
        source: 'fallback_required',
        message: 'No messages provided for analysis'
      });
    }

    // Sanitize all conversation messages for zero PII exposure to Gemini API
    const sanitizedMessages = messages.map((m, idx) => {
      const { sanitized } = sanitizePII(m.content || '');
      return `Message ${idx + 1} [Source: ${m.source || 'unknown'}]: "${sanitized}"`;
    });

    const conversationContext = sanitizedMessages.join('\n');

    const analysisJson = await generateUnifiedAnalysis({
      conversationContext,
      robertaSnapshot,
      previousScore
    });

    return res.status(200).json({
      success: true,
      analysis: analysisJson,
      source: analysisJson ? 'gemini_unified_engine' : 'fallback_required'
    });
  } catch (err) {
    console.error('[Unified Analysis API Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal unified analysis error'
    });
  }
});

export default router;

