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
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E5EBE6] transition-all">
      
      {/* Main Top Bar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-[#E5EBE6]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title with Dashboard Sanctuary Badge */}
          <div 
            onClick={() => onSelectOption('option1')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#2D6A4F] flex items-center justify-center shadow-md shadow-[#2D6A4F]/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#1B4332] tracking-wide">
                  Mindmitra<span className="text-[#2D6A4F] font-black">.AI</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9]">
                  Dashboard Sanctuary
                </span>
              </div>
              <p className="text-[11px] text-[#557B69] hidden sm:block">
                Empathetic Mental Wellbeing Sanctuary
              </p>
            </div>
          </div>

          {/* Right Action & User Profile Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-xs text-[#1B4332]">
                  <UserCheck className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="font-semibold">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-2 rounded-xl bg-[#F4F7F5] hover:bg-[#E5EBE6] border border-[#E5EBE6] text-[#557B69] hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectOption('login')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  activeOption === 'login'
                    ? 'bg-[#1B4332] text-white shadow-md ring-2 ring-[#2D6A4F]'
                    : 'bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-sm'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#F4F7F5] text-[#1B4332] border border-[#E5EBE6] hover:bg-[#E5EBE6] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Secondary Navbar Below Main Bar (Four Options Navigation Bar) */}
      <div className="bg-[#F4F7F5]/90 backdrop-blur-md px-4 sm:px-6 py-2.5 border-t border-[#E5EBE6]">
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
                      ? 'bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20 font-bold'
                      : 'text-[#4A6B5D] hover:text-[#1B4332] hover:bg-white border border-[#E5EBE6] bg-white/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#557B69]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 border-t border-[#E5EBE6] space-y-2 animate-fadeIn bg-[#F4F7F5]">
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
                    ? 'bg-[#2D6A4F] text-white shadow'
                    : 'text-[#4A6B5D] hover:text-[#1B4332] bg-white border border-[#E5EBE6]'
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
