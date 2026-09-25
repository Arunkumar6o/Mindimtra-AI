import React from 'react';
import { QuoteCarousel } from './QuoteCarousel';
import { 
  ShieldCheck, 
  BrainCircuit, 
  MessageSquareHeart, 
  Lock, 
  Sparkles, 
  Activity,
  HeartPulse,
  LogIn,
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin }) => {
  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      
      {/* Hero Welcome Header */}
      <div className="text-center space-y-5 max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Your Safe Haven for Mental & Emotional Health</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Nurture Your Mind with <br />
          <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            AI-Powered Empathy & Insights
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Mindmitra combines real-time <strong>RoBERTa emotion classification</strong>, 
          <strong> Gemini LLM responses</strong>, and <strong>AES-256 PII protection</strong> to support your mental wellbeing journey.
        </p>

        {/* CTA Actions */}
        <div className="pt-3 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={onOpenLogin}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Access Dashboard</span>
            <ArrowRight className="w-4 h-4 text-teal-200" />
          </button>
        </div>
      </div>

      {/* Main Wellbeing Quotes & Background Carousel */}
      <QuoteCarousel onTriggerLogin={onOpenLogin} />

      {/* Mental Wellbeing Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        {/* Card 1: Emotion Intelligence */}
        <div 
          onClick={onOpenLogin}
          className="p-6 rounded-3xl glass-panel hover:border-teal-500/40 transition-all cursor-pointer group space-y-3 border border-slate-800"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-6 h-6 text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
            RoBERTa Emotion Engine
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Understands fine-grained emotional nuances (anxiety, grief, joy, distress) to tailor empathetic responses without judgment.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-teal-400 font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>Try Sentiment Classifier →</span>
          </div>
        </div>

        {/* Card 2: AI Dialogue */}
        <div 
          onClick={onOpenLogin}
          className="p-6 rounded-3xl glass-panel hover:border-indigo-500/40 transition-all cursor-pointer group space-y-3 border border-slate-800"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquareHeart className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
            Gemini Empathetic AI Companion
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Interactive, reflective conversations powered by Gemini AI, designed to foster mindfulness, grounding, and self-compassion.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-indigo-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chat with AI Companion →</span>
          </div>
        </div>

        {/* Card 3: Privacy First */}
        <div 
          onClick={onOpenLogin}
          className="p-6 rounded-3xl glass-panel hover:border-sky-500/40 transition-all cursor-pointer group space-y-3 border border-slate-800"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-sky-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
            Private Dashboard & Tracker
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Log in to record your daily mood, track emotional equilibrium trends, and store encrypted mindfulness check-ins.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-sky-400 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Unlock Personal Sanctuary →</span>
          </div>
        </div>

      </div>

      {/* Bottom Sign In Prompt Banner */}
      <div className="rounded-3xl glass-panel border border-teal-500/30 p-8 text-center space-y-4 bg-gradient-to-b from-slate-900/60 to-slate-950/80">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/30">
          <HeartPulse className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Ready to start your mental wellbeing journey?</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Create a free account or log in to unlock your personal mood dashboard, daily equilibrium metrics, and saved companion chat sessions.
        </p>
        <button
          onClick={onOpenLogin}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Login / Register Now</span>
        </button>
      </div>

    </div>
  );
};

export default LandingPage;
