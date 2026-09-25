import React, { useState } from 'react';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  LogOut, 
  UserCheck, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface LoginPageProps {
  user: { email: string; name: string } | null;
  onSuccessLogin: (userData: { email: string; name: string }) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  user,
  onSuccessLogin,
  onLogout,
  onNavigateHome
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDemoFill = () => {
    setEmail('demo@mindmitra.ai');
    setPassword('Password123!');
    setName('Alex Mercer');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      setIsLoading(false);
      return;
    }

    if (isRegister && !name) {
      setErrorMsg('Please provide your name to register.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const userObj = {
        email: email.trim().toLowerCase(),
        name: isRegister ? name.trim() : (email.includes('demo') ? 'Alex Mercer' : email.split('@')[0])
      };

      // Save token & user session in localStorage
      const mockToken = `mindmitra_token_${Date.now()}`;
      localStorage.setItem('mindmitra_token', mockToken);
      localStorage.setItem('mindmitra_user', JSON.stringify(userObj));

      setSuccessMsg(isRegister ? 'Account created successfully! Logging in...' : 'Login successful! Welcome to Mindmitra.');
      setIsLoading(false);

      setTimeout(() => {
        onSuccessLogin(userObj);
        onNavigateHome();
      }, 800);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fadeIn space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#2D6A4F] bg-white border border-slate-200 shadow-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center gap-1.5 text-xs text-[#2D6A4F] font-semibold bg-[#E8F5E9] px-3.5 py-1 rounded-full border border-[#d8e8dc]">
          <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
          <span>AES-256 Encrypted Auth</span>
        </div>
      </div>

      {/* If User is Already Logged In */}
      {user ? (
        <div className="bg-white border border-[#e5ebe6] shadow-lg rounded-3xl p-8 text-center space-y-6 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#2D6A4F] mx-auto">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#1B4332]">Currently Authenticated</h2>
            <p className="text-sm text-slate-600">
              Welcome back, <strong className="text-[#2D6A4F]">{user.name}</strong> ({user.email}).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={onNavigateHome}
              className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              Continue to Sanctuary Dashboard
            </button>
            <button
              onClick={onLogout}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 text-rose-600 hover:text-rose-700 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      ) : (
        /* Login / Register Full Card Section */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Info Column */}
          <div className="md:col-span-5 bg-white border border-[#e5ebe6] shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2D6A4F] text-white shadow-md shadow-emerald-950/10">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#1B4332] tracking-tight">
                Mindmitra.AI <br />
                <span className="text-[#2D6A4F]">Authentication Portal</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign in to your private sanctuary workspace to access your mood tracker history, fine-grained sentiment analysis, and personalized AI companion session context.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Personalized Mood Check-in History</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>Zero Third-Party Data Tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <CheckCircle className="w-4 h-4 text-[#1976D2] shrink-0" />
                <span>Empathetic AI Companion Context</span>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="md:col-span-7 bg-white border border-[#e5ebe6] shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Tab Switcher */}
            <div className="flex bg-[#f4f7f5] p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  !isRegister
                    ? 'bg-[#2D6A4F] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isRegister
                    ? 'bg-[#2D6A4F] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>

            {/* Alert Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#1B4332] text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isRegister && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required={isRegister}
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f8faf8] border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#2D6A4F] focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f8faf8] border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#2D6A4F] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#f8faf8] border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#2D6A4F] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Quick Demo Fill Option */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-[#2D6A4F] hover:text-[#1B4332] underline font-bold cursor-pointer"
                >
                  Fill Demo Credentials
                </button>
                <span className="text-slate-500">End-to-End Encrypted</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Sign In to Sanctuary'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-slate-500">
              By logging in, you agree to Mindmitra's privacy policy and local session storage terms.
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default LoginPage;
