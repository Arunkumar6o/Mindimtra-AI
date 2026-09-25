import React from 'react';
import { QuoteCarousel } from './QuoteCarousel';
import { 
  ShieldCheck, 
  BrainCircuit, 
  MessageSquareHeart, 
  Lock, 
  Sparkles, 
  Activity,
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] text-xs font-semibold shadow-xs">
          <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
          <span>Your Safe Haven for Mental & Emotional Health</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1B4332] leading-tight">
          Nurture Your Mind with <br />
          <span className="bg-gradient-to-r from-[#2D6A4F] via-[#1B4332] to-[#40916C] bg-clip-text text-transparent">
            AI-Powered Empathy & Insights
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-[#557B69] max-w-2xl mx-auto leading-relaxed">
          Mindmitra is developing  to support your mental wellbeing journey.
        </p>

        {/* CTA Actions */}
        <div className="pt-3 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={onOpenLogin}
            className="px-8 py-3.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#2D6A4F]/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Sign Up</span>
            <ArrowRight className="w-4 h-4 text-emerald-200" />
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
          className="p-6 rounded-3xl bg-white border border-[#E5EBE6] hover:border-[#2D6A4F]/40 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-6 h-6 text-[#2D6A4F]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B4332] group-hover:text-[#2D6A4F] transition-colors">
            RoBERTa Emotion Engine
          </h3>
          <p className="text-xs text-[#557B69] leading-relaxed">
            Understands fine-grained emotional nuances (anxiety, grief, joy, distress) to tailor empathetic responses without judgment.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-[#2D6A4F] font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Try Sentiment Classifier →</span>
          </div>
        </div>

        {/* Card 2: AI Dialogue */}
        <div 
          onClick={onOpenLogin}
          className="p-6 rounded-3xl bg-white border border-[#E5EBE6] hover:border-[#2D6A4F]/40 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] border border-[#BBDEFB] flex items-center justify-center group-hover:scale-105 transition-transform">
            <MessageSquareHeart className="w-6 h-6 text-[#1565C0]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B4332] group-hover:text-[#1565C0] transition-colors">
            Gemini Empathetic AI Companion
          </h3>
          <p className="text-xs text-[#557B69] leading-relaxed">
            Interactive, reflective conversations powered by Gemini AI, designed to foster mindfulness, grounding, and self-compassion.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-[#1565C0] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chat with AI Companion →</span>
          </div>
        </div>

        {/* Card 3: Privacy First */}
        <div 
          onClick={onOpenLogin}
          className="p-6 rounded-3xl bg-white border border-[#E5EBE6] hover:border-[#2D6A4F]/40 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#F3E5F5] border border-[#E1BEE7] flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-[#7B1FA2]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B4332] group-hover:text-[#7B1FA2] transition-colors">
            Private Dashboard & Tracker
          </h3>
          <p className="text-xs text-[#557B69] leading-relaxed">
            Log in to record your daily mood, track emotional equilibrium trends, and store encrypted mindfulness check-ins.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-[#7B1FA2] font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Unlock Personal Sanctuary →</span>
          </div>
        </div>

      </div>

      {/* Bottom Sign In Prompt Banner */}
      <div className="rounded-3xl bg-white border border-[#E5EBE6] shadow-sm p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-[#1B4332]">Ready to start your mental wellbeing journey?</h2>
        <p className="text-xs sm:text-sm text-[#557B69] max-w-lg mx-auto">
          Create a free account or log in to unlock your personal mood dashboard, daily equilibrium metrics, and saved companion chat sessions.
        </p>
        <button
          onClick={onOpenLogin}
          className="px-6 py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-semibold text-xs shadow-md shadow-[#2D6A4F]/20 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Login / Register Now</span>
        </button>
      </div>

    </div>
  );
};

export default LandingPage;
