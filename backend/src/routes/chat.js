import express from 'express';
import { sanitizePII } from '../middleware/piiSanitizer.js';
import { generateEmpatheticResponse } from '../services/geminiService.js';

const router = express.Router();

/**
 * POST /api/chat/respond
 * Empathetic Companion AI Endpoint
 */
router.post('/respond', async (req, res) => {
  try {
    const userMsg = req.body?.message || '';
    const { sanitized, wasSanitized, entities } = sanitizePII(userMsg);

    const { replyText, suggestedActions } = await generateEmpatheticResponse(sanitized);

    return res.status(200).json({
      success: true,
      response: replyText,
      suggested_actions: suggestedActions,
      scrubbed_input: sanitized,
      pii_protected: wasSanitized,
      pii_entities_detected: entities
    });
  } catch (err) {
    console.error('[Chat API Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal chat processing error'
    });
  }
});

export default router;

