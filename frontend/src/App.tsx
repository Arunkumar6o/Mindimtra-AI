import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { MindmitraDashboard } from './components/dashboard/MindmitraDashboard';
import { CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen selection:bg-[#2D6A4F] selection:text-white">
      
      {/* 2-Second Pop-up Session Message Toast after Login */}
      {showLoginToast && user && (
        <div className="fixed top-5 right-5 z-50 animate-fadeIn bg-[#1B4332] text-white border border-emerald-500/50 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="text-xs text-slate-100">
            Active Sanctuary Session: <strong className="text-emerald-300">{user.name}</strong> ({user.email})
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authenticated</span>
          </div>
        </div>
      )}

      {/* Main View Display */}
      {user ? (
        <MindmitraDashboard
          user={user}
          onLogout={handleLogout}
          onNavigateToLogin={() => setActiveOption('login')}
        />
      ) : activeOption === 'login' ? (
        <LoginPage
          user={user}
          onSuccessLogin={handleSuccessLogin}
          onLogout={handleLogout}
          onNavigateHome={() => setActiveOption('option1')}
        />
      ) : (
        <LandingPage
          onOpenLogin={() => setActiveOption('login')}
        />
      )}

    </div>
  );
}

export default App;
