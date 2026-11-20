import http from 'http';
import { config } from './config/index.js';
import { sanitizePII } from './middleware/piiSanitizer.js';
import { generateEmpatheticResponse, generateUnifiedAnalysis } from './services/geminiService.js';
import { handleLogin, handleRegister } from './routes/auth.js';
import { verifyToken } from './services/jwtService.js';

/**
 * Parse incoming JSON body
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', err => reject(err));
  });
}

/**
 * Send JSON response with CORS headers
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

/**
 * Core Request Dispatcher
 */
export async function handleRequest(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const url = req.url ? req.url.split('?')[0] : '';

  // 1. Root / Welcome
  if ((url === '/' || url === '') && req.method === 'GET') {
    sendJson(res, 200, {
      service: 'MindMitra AI Companion - Backend Server',
      status: 'online',
      documentation: '/api/health'
    });
    return;
  }

  // 2. Health Check: GET /api/health
  if (url === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, {
      status: 'healthy',
      service: 'MindMitra AI Companion - Backend API Gateway',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      architecture: {
        auth: 'JWT + Supabase Auth Bridge',
        security: 'AES-256-GCM + Row Level Security (RLS)',
        privacy: 'Zero-PII Scrubbing Pipeline',
        ml_pipeline: 'DistilRoBERTa ONNX Engine (HuggingFace/Transformers.js)',
        llm: 'Google Gemini 1.5 Flash API',
        database: 'PostgreSQL 15+ (Supabase with pgvector)'
      }
    });
    return;
  }

  // 3. Auth Routes
  if (url === '/api/auth/login' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const result = handleLogin(body);
      sendJson(res, result.status, result.body);
      return;
    } catch (err) {
      sendJson(res, 400, { success: false, message: 'Invalid JSON request payload' });
      return;
    }
  }

  if (url === '/api/auth/register' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const result = handleRegister(body);
      sendJson(res, result.status, result.body);
      return;
    } catch (err) {
      sendJson(res, 400, { success: false, message: 'Invalid JSON request payload' });
      return;
    }
  }

  if (url === '/api/auth/me' && req.method === 'GET') {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendJson(res, 401, { success: false, message: 'Missing or invalid token header.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    try {
      const user = verifyToken(token);
      sendJson(res, 200, { success: true, user });
      return;
    } catch (err) {
      sendJson(res, 401, { success: false, message: err.message || 'Invalid token.' });
      return;
    }
  }

  // 4. Emotion Classifier Endpoint: POST /api/emotion/analyze
  if (url === '/api/emotion/analyze' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const text = body.text || '';
      const { sanitized, wasSanitized, entities } = sanitizePII(text);

      sendJson(res, 200, {
        success: true,
        client_inference_required: true,
        scrubbed_text: sanitized,
        pii_protected: wasSanitized,
        pii_entities_detected: entities,
        model_identifier: 'nicky48/emotion-english-distilroberta-base-ONNX',
        model_used: 'DistilRoBERTa-base (Transformers.js ONNX Runtime)',
        nlp_engine: 'ONNX Runtime WebAssembly Engine (Transformers.js)'
      });
      return;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message || 'Internal emotion analysis error' });
      return;
    }
  }

  // 5. Gemini Companion Chat Endpoint: POST /api/chat/respond
  if (url === '/api/chat/respond' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const userMsg = body.message || '';
      const style = body.style || 'empathetic';
      const { sanitized, wasSanitized, entities } = sanitizePII(userMsg);

      const { replyText, suggestedActions } = await generateEmpatheticResponse(sanitized, { style });

      sendJson(res, 200, {
        success: true,
        response: replyText,
        suggested_actions: suggestedActions,
        scrubbed_input: sanitized,
        pii_protected: wasSanitized,
        pii_entities_detected: entities
      });
      return;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message || 'Internal chat processing error' });
      return;
    }
  }

  // 6. Unified Emotional Analysis Endpoint: POST /api/analysis/unified
  if (url === '/api/analysis/unified' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const messages = body.messages || [];
      const robertaSnapshot = body.robertaSnapshot;
      const previousScore = body.previousScore;

      if (!Array.isArray(messages) || messages.length === 0) {
        sendJson(res, 200, {
          success: true,
          analysis: null,
          source: 'fallback_required',
          message: 'No messages provided for analysis'
        });
        return;
      }

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

      sendJson(res, 200, {
        success: true,
        analysis: analysisJson,
        source: analysisJson ? 'gemini_unified_engine' : 'fallback_required'
      });
      return;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message || 'Internal unified analysis error' });
      return;
    }
  }

  // 7. Not Found
  sendJson(res, 404, {
    success: false,
    error: `Endpoint ${req.method} ${url} not found`
  });
}

/**
 * Start Backend HTTP Server
 */
export function startServer(port = config.port) {
  const server = http.createServer(handleRequest);

  server.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🌟 MindMitra AI Companion - Backend Server Running`);
    console.log(`📡 URL: http://localhost:${port}`);
    console.log(`🔍 Health Check: http://localhost:${port}/api/health`);
    console.log(`🔐 Auth: /api/auth/login, /api/auth/register, /api/auth/me`);
    console.log(`💬 AI Chat: /api/chat/respond`);
    console.log(`🧠 Emotion Classifier: /api/emotion/analyze`);
    console.log(`📊 Unified Analysis: /api/analysis/unified`);
    console.log(`====================================================`);
  });

  return server;
}
