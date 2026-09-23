import React from 'react';
import { HeartPulse, LogIn, Sparkles, UserCheck } from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  user: { email: string; name: string } | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, user, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <HeartPulse className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-teal-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent tracking-wide">
                Mindmitra<span className="text-teal-400 font-extrabold">.AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-teal-950/80 text-teal-300 border border-teal-500/30 rounded-full">
                RoBERTa + Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Empathetic AI Companion & Wellbeing Platform</p>
          </div>
        </div>

        {/* Center Tech Stack Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Flask Backend • PyTorch • PostgreSQL • AES-256</span>
        </div>

        {/* Right Auth Action */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
                <UserCheck className="w-4 h-4 text-teal-400" />
                <span className="font-medium">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-3 py-1.5"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-teal-500/20 hover:shadow-teal-500/35 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
