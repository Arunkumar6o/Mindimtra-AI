import React, { useState } from 'react';
import { 
  HeartPulse, 
  LogIn, 
  UserCheck, 
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  BrainCircuit,
  BarChart3,
  Sparkles
} from 'lucide-react';

export type NavOption = 'option1' | 'option2' | 'option3' | 'option4' | 'login';

interface NavbarProps {
  activeOption: string;
  onSelectOption: (option: string) => void;
  user: { email: string; name: string } | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeOption,
  onSelectOption,
  user,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'option1', label: 'Option 1', icon: LayoutDashboard },
    { id: 'option2', label: 'Option 2', icon: BrainCircuit },
    { id: 'option3', label: 'Option 3', icon: BarChart3 },
    { id: 'option4', label: 'Option 4', icon: Sparkles }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 transition-all">
      
      {/* Main Top Bar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title with Dashboard Sanctuary Badge */}
          <div 
            onClick={() => onSelectOption('option1')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold bg-gradient-to-r from-teal-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent tracking-wide">
                  Mindmitra<span className="text-teal-400 font-black">.AI</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-500/30">
                  Dashboard Sanctuary
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Empathetic Mental Wellbeing Sanctuary
              </p>
            </div>
          </div>

          {/* Right Action & User Profile Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span className="font-semibold">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectOption('login')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  activeOption === 'login'
                    ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md shadow-teal-500/30 ring-2 ring-teal-400'
                    : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-md shadow-teal-500/20'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Secondary Navbar Below Main Bar (Four Options Navigation Bar) */}
      <div className="bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-2.5 border-t border-slate-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <nav className="hidden md:flex items-center justify-between w-full max-w-5xl mx-auto gap-4 lg:gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeOption === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectOption(item.id)}
                  className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/25 ring-1 ring-teal-400/50 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90 border border-slate-800/70 bg-slate-900/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 border-t border-slate-800 space-y-2 animate-fadeIn bg-slate-950">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeOption === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectOption(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

    </header>
  );
};

export default Navbar;
