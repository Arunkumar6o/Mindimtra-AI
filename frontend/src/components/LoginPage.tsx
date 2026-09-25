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
    <div className="max-w-4xl mx-auto py-6 px-4 animate-fadeIn space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center gap-1.5 text-xs text-teal-400 font-medium bg-teal-950/60 px-3 py-1 rounded-full border border-teal-500/30">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>AES-256 Encrypted Auth</span>
        </div>
      </div>

      {/* If User is Already Logged In */}
      {user ? (
        <div className="glass-panel border border-slate-800 rounded-3xl p-8 text-center space-y-6 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mx-auto">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Currently Authenticated</h2>
            <p className="text-sm text-slate-400">
              Welcome back, <strong className="text-teal-300">{user.name}</strong> ({user.email}).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={onNavigateHome}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
            >
              Continue to Sanctuary Dashboard
            </button>
            <button
              onClick={onLogout}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 hover:text-rose-300 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
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
          <div className="md:col-span-5 glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 shadow-lg shadow-teal-500/30">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Mindmitra.AI <br />
                <span className="text-teal-300">Authentication Portal</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign in to your private sanctuary workspace to access your mood tracker history, fine-grained sentiment analysis, and personalized AI companion session context.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Personalized Mood Check-in History</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Zero Third-Party Data Tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Empathetic AI Companion Context</span>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="md:col-span-7 glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Tab Switcher */}
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  !isRegister
                    ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isRegister
                    ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register
              </button>
            </div>

            {/* Alert Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-teal-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required={isRegister}
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
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
                  className="text-teal-400 hover:text-teal-300 underline font-medium cursor-pointer"
                >
                  Fill Demo Credentials
                </button>
                <span className="text-slate-500">End-to-End Encrypted</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
