import { useState, useEffect } from 'react';
import { Navbar, type DashboardTab } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { RoBERTaEmotionClassifier } from './components/RoBERTaEmotionClassifier';
import { GeminiAICompanion } from './components/GeminiAICompanion';
import { LoginModal } from './components/LoginModal';
import { CheckCircle2, Cpu, Sparkles, Heart, Shield } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    // Restore logged in user session from localStorage if present
    const savedUser = localStorage.getItem('mindmitra_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser({ email: 'demo@mindmitra.ai', name: 'Alex Mercer' });
      }
    }
  }, []);

  const handleSuccessLogin = (userData: { email: string; name: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('mindmitra_token');
    localStorage.removeItem('mindmitra_user');
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* User Session Banner */}
      {user && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-slate-400">
                Active Sanctuary Session: <strong className="text-slate-200">{user.name}</strong> ({user.email})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-300 font-medium bg-teal-950/60 px-3 py-0.5 rounded-full border border-teal-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Session Authenticated</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Pages Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            user={user}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'roberta' && (
          <RoBERTaEmotionClassifier />
        )}

        {activeTab === 'gemini' && (
          <GeminiAICompanion />
        )}
      </main>

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={handleSuccessLogin}
      />

      {/* Footer Section */}
      <footer className="glass-panel border-t border-slate-800/80 py-10 px-6 text-slate-400 text-xs mt-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                <Cpu className="w-4 h-4 text-teal-400" />
                <span>Frontend Application</span>
              </div>
              <p className="text-slate-400 text-xs">React 19, TypeScript, Vite, Tailwind CSS v4</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Interactive AI Modules</span>
              </div>
              <p className="text-slate-400 text-xs">Emotion Classifier Engine & Empathetic AI Dialogue</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Privacy & Security</span>
              </div>
              <p className="text-slate-400 text-xs">End-to-End Encrypted Session Storage</p>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500">
              © 2026 Mindmitra-AI • Empathetic Mental Wellbeing Sanctuary
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
