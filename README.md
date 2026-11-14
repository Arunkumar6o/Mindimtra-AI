# MindMitra – AI Companion for Emotional Well-being

MindMitra is an AI-powered emotional wellness and mental health support application designed with privacy-first architecture, multi-source emotional intelligence, and non-clinical empathetic support.

---

## 🏛️ Project Architecture

The project is cleanly separated into dedicated frontend and backend directories:

```
Mindmitra-AI Major project/
├── frontend/             # React 19 + TypeScript + Vite + TailwindCSS + Transformers.js
│   ├── src/              # Components, contexts, services & UI views
│   ├── vite.config.ts    # Configured with proxy to backend on http://localhost:5000
│   └── package.json      # Frontend dependencies & scripts
│
├── backend/              # Node.js Express & Python Flask API Gateway (Port 5000)
│   ├── src/              # Node.js backend routes, services, crypto & middleware
│   ├── python/           # Python Flask alternative backend
│   ├── database/         # Database schema docs & PostgreSQL migrations
│   ├── server.js         # Node.js server entry point
│   ├── app.py            # Python Flask server entry point
│   └── package.json      # Backend dependencies & scripts
│
├── supabase/             # Supabase PostgreSQL database migrations & RLS policies
│   └── migrations/       # 20 incremental database migrations
│
└── DATABASE_SCHEMA.md    # System architecture, ERD, and cryptographic specifications
```

---

## 🚀 Running the Project

### 1. Start the Backend (Port 5000)

Choose either **Node.js** or **Python**:

- **Node.js**:
  ```bash
  cd backend
  node server.js
  ```

- **Python**:
  ```bash
  cd backend
  python app.py
  ```

The backend starts on `http://localhost:5000`. You can verify health at `http://localhost:5000/api/health`.

### 2. Start the Frontend (Port 5173)

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and automatically proxies all `/api/*` requests to the backend server at `http://localhost:5000`.

---

## 🧠 Key Technologies

- **Frontend:** React 19, TypeScript, TailwindCSS v4, Lucide Icons, Transformers.js (DistilRoBERTa ONNX inference).
- **Backend:** Node.js HTTP/Express API Gateway & Python 3.14 Flask with JWT Auth.
- **AI/LLM:** Google Gemini 1.5 Flash API with server-side regex PII sanitization.
- **Security:** AES-256-GCM authenticated encryption, Row Level Security (RLS) on PostgreSQL 15+.

