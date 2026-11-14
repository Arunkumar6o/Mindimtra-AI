import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'MindMitra AI Companion - Backend API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    architecture: {
      auth: 'JWT + Supabase Auth Bridge',
      security: 'AES-256-GCM + Row Level Security (RLS)',
      privacy: 'Client & Server PII Sanitization Pipeline',
      ml_pipeline: 'DistilRoBERTa ONNX Engine (HuggingFace/Transformers.js)',
      llm: 'Google Gemini 1.5 Flash API',
      database: 'PostgreSQL 15+ (Supabase with pgvector)'
    }
  });
});

export default router;

