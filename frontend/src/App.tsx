import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroWellbeing } from './components/HeroWellbeing';
import { LoginModal } from './components/LoginModal';
import { CheckCircle2, Cpu, Database, Shield, Sparkles, Heart } from 'lucide-react';

export function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'checking' | 'disconnected'>('checking');

  // Check if saved user token exists or check Flask backend health
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
        }
      } catch (e) {
        setBackendStatus('disconnected');
      }
    };
    checkBackend();
  }, []);

  const handleSuccessLogin = (userData: { email: string; name: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('mindmitra_token');
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950">
      
      {/* Top Header Navbar */}
      <Navbar
        onOpenLogin={() => setIsLoginModalOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Backend Connection Indicator Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              backendStatus === 'connected' ? 'bg-teal-400 animate-pulse' :
              backendStatus === 'checking' ? 'bg-amber-400 animate-ping' : 'bg-rose-500'
            }`} />
            <span className="text-slate-400">
              Flask API: <strong className="text-slate-200">{backendStatus === 'connected' ? 'Active (http://localhost:5000)' : 'Offline / Standalone Mode'}</strong>
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-1.5 text-teal-300 font-medium bg-teal-950/60 px-3 py-0.5 rounded-full border border-teal-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Authenticated Session Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        <HeroWellbeing onOpenLogin={() => setIsLoginModalOpen(true)} />
      </main>

      {/* Floating Login Container / Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={handleSuccessLogin}
      />

      {/* Footer Section presenting the Project Tech Stack */}
      <footer className="glass-panel border-t border-slate-800/80 py-10 px-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                <Cpu className="w-4 h-4 text-teal-400" />
                <span>Frontend & UI</span>
              </div>
              <p className="text-slate-400 text-xs">React.js, TypeScript, Vite, Tailwind CSS</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI / ML & NLP</span>
              </div>
              <p className="text-slate-400 text-xs">PyTorch RoBERTa Emotion Classifier, Gemini API, spaCy</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                <Database className="w-4 h-4 text-sky-400" />
                <span>Backend & Database</span>
              </div>
              <p className="text-slate-400 text-xs">Python Flask, PostgreSQL + pgvector, Redis Cache</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Security & PII</span>
              </div>
              <p className="text-slate-400 text-xs">JWT + OAuth 2.0, AES-256-GCM, Presidio Pipeline</p>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500">
              © 2026 Mindmitra-AI Major Project • Empathetic Mental Wellbeing System
            </p>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Made with care for Mental Health</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default App;
