# MindMitra AI Companion – Backend Architecture & API Gateway

This directory contains the independent backend API gateway, services, database migrations, and microservice endpoints for the **MindMitra AI Companion**.

---

## 📁 Directory Structure

```
backend/
├── src/                                # Node.js / Express API Architecture
│   ├── config/
│   │   ├── index.js                    # Environment variables & runtime config
│   │   └── supabase.js                 # Supabase client & service role connector
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT Bearer token authentication guard
│   │   └── piiSanitizer.js             # Zero-PII scrubbing regex pipeline
│   ├── routes/
│   │   ├── auth.js                     # Login, registration & me endpoints
│   │   ├── chat.js                     # Gemini AI companion response route
│   │   ├── emotion.js                  # Emotion analysis prep & metadata route
│   │   ├── analysis.js                 # Unified emotional multi-source analysis
│   │   └── health.js                   # Health check & architecture status
│   ├── services/
│   │   ├── cryptoService.js            # AES-256-GCM encryption & decryption
│   │   ├── geminiService.js            # Gemini 1.5 Flash API connector + fallback
│   │   └── jwtService.js               # RFC 7519 HMAC-SHA256 JWT tokens
│   └── server.js                       # HTTP server & routing dispatcher
├── python/                             # Python / Flask Architecture
│   ├── app.py                          # Flask application entry point
│   ├── requirements.txt                # Python dependencies
│   ├── routes/
│   │   ├── auth.py                     # Flask JWT authentication routes
│   │   ├── chat.py                     # Flask Gemini companion route
│   │   ├── emotion.py                  # Flask RoBERTa emotion route
│   │   ├── analysis.py                 # Flask unified analysis route
│   │   └── health.py                   # Flask health check route
│   └── utils/
│       ├── pii_sanitizer.py            # Python PII scrubbing engine
│       └── crypto_utils.py             # Python AES-256-GCM encryption utility
├── database/                           # Database Schema & Migrations
│   ├── DATABASE_SCHEMA.md              # Complete DB & cryptographic specification
│   └── migrations/                     # 20 PostgreSQL migrations (001 to 020)
├── .env.example                        # Template for environment variables
├── package.json                        # Node.js backend dependencies & scripts
├── requirements.txt                    # Root Python dependencies
├── app.py                              # Python direct entry point
├── server.js                           # Node.js direct entry point
└── README.md                           # Backend documentation
```

---

## 🚀 Getting Started

You can run the backend using either **Node.js** or **Python (Flask)**. Both implement the exact same `/api/*` endpoints on port `5000`.

### Option A: Running with Node.js

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. (Optional) Copy `.env.example` to `.env` and configure your keys:
   ```bash
   cp .env.example .env
   ```
3. Start the server (runs out of the box with built-in zero-dependency HTTP server or Express):
   ```bash
   node server.js
   ```
   Or with npm:
   ```bash
   npm start
   ```

### Option B: Running with Python Flask

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```bash
   python app.py
   ```

---

## 📡 API Endpoints Catalog

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, version, and architecture telemetry |
| `POST` | `/api/auth/login` | User authentication returning 24-hour JWT token |
| `POST` | `/api/auth/register`| New user account registration |
| `GET` | `/api/auth/me` | Validates JWT token and returns authenticated user |
| `POST` | `/api/chat/respond` | Sanitizes PII and generates Gemini 1.5 Flash empathetic companion responses |
| `POST` | `/api/emotion/analyze` | PII scrubbing and metadata validation for DistilRoBERTa ONNX inference |
| `POST` | `/api/analysis/unified`| Multi-source contextual emotional analysis fusing RoBERTa + Gemini 1.5 Flash |

---

## 🔐 Security & Privacy Implementation

1. **Zero-PII Transmission:** All incoming user messages pass through `piiSanitizer` prior to any external LLM invocation, stripping emails, phone numbers, and government ID patterns.
2. **AES-256-GCM Encryption:** Server-side encryption handles sensitive fields using unique 12-byte initialization vectors and 16-byte authentication tags.
3. **JWT Authentication:** Strict authorization enforcement with 24-hour expiration tokens.

