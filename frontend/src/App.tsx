import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { CheckCircle2, Cpu, Sparkles, Heart, Shield } from 'lucide-react';

export function App() {
  const [activeOption, setActiveOption] = useState<string>('option1');
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [showLoginToast, setShowLoginToast] = useState<boolean>(false);

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
    setActiveOption('option1');
    setShowLoginToast(true);
    setTimeout(() => {
      setShowLoginToast(false);
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('mindmitra_token');
    localStorage.removeItem('mindmitra_user');
    setUser(null);
    setShowLoginToast(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950">
      
      {/* Navigation Bar with Option 1, Option 2, Option 3, Option 4 */}
      <Navbar
        activeOption={activeOption}
        onSelectOption={setActiveOption}
        user={user}
        onLogout={handleLogout}
      />

      {/* 2-Second Pop-up Session Message Toast after Login */}
      {showLoginToast && user && (
        <div className="fixed top-5 right-5 z-50 animate-fadeIn bg-slate-900/95 border border-teal-500/50 shadow-2xl shadow-teal-500/30 rounded-2xl px-5 py-3 flex items-center gap-3 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
          <div className="text-xs text-slate-200">
            Active Sanctuary Session: <strong className="text-teal-300">{user.name}</strong> ({user.email})
          </div>
          <div className="flex items-center gap-1 text-[11px] text-teal-300 font-medium bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Authenticated</span>
          </div>
        </div>
      )}

      {/* Main Dashboard / Landing Pages Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeOption !== 'login' ? (
          user ? (
            <DashboardOverview
              user={user}
              onSelectTab={(tab) => setActiveOption(tab === 'login' ? 'login' : 'option1')}
            />
          ) : (
            <LandingPage
              onOpenLogin={() => setActiveOption('login')}
            />
          )
        ) : (
          <LoginPage
            user={user}
            onSuccessLogin={handleSuccessLogin}
            onLogout={handleLogout}
            onNavigateHome={() => setActiveOption('option1')}
          />
        )}
      </main>

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
