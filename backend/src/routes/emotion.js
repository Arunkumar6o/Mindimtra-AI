import express from 'express';
import { sanitizePII } from '../middleware/piiSanitizer.js';

const router = express.Router();

/**
 * POST /api/emotion/analyze
 * Emotion Classifier Endpoint
 * Prepares and scrubs text for client-side or server-side RoBERTa ONNX inference
 */
router.post('/analyze', (req, res) => {
  try {
    const text = req.body?.text || '';
    const { sanitized, wasSanitized, entities } = sanitizePII(text);

    return res.status(200).json({
      success: true,
      client_inference_required: true,
      scrubbed_text: sanitized,
      pii_protected: wasSanitized,
      pii_entities_detected: entities,
      model_identifier: 'nicky48/emotion-english-distilroberta-base-ONNX',
      model_used: 'DistilRoBERTa-base (Transformers.js ONNX Runtime)',
      nlp_engine: 'ONNX Runtime WebAssembly Engine (Transformers.js)'
    });
  } catch (err) {
    console.error('[Emotion API Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal emotion analysis error'
    });
  }
});

export default router;

