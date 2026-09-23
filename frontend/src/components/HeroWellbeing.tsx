import React from 'react';
import { QuoteCarousel } from './QuoteCarousel';
import { ShieldCheck, BrainCircuit, MessageSquareHeart, Lock, Sparkles, Activity } from 'lucide-react';

interface HeroWellbeingProps {
  onOpenLogin: () => void;
}

export const HeroWellbeing: React.FC<HeroWellbeingProps> = ({ onOpenLogin }) => {
  return (
    <section className="space-y-12 max-w-7xl mx-auto px-6 py-8">
      
      {/* Top Welcome & Headline */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-inner">
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

        {/* CTA Login Button */}
        <div className="pt-2 flex justify-center items-center gap-4">
          <button
            onClick={onOpenLogin}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex items-center gap-2"
          >
            <span>Access Your Personal Portal</span>
            <span className="text-teal-200">→</span>
          </button>
        </div>
      </div>

      {/* Main Wellbeing Quotes & Background Carousel Section */}
      <QuoteCarousel onTriggerLogin={onOpenLogin} />

      {/* Mental Wellbeing Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* Card 1: Emotion Intelligence */}
        <div className="p-6 rounded-2xl glass-panel hover:border-teal-500/40 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-6 h-6 text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">RoBERTa Emotion Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Understands fine-grained emotional nuances (anxiety, grief, joy, distress) to tailor empathetic responses without judgment.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-teal-400 font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>PyTorch + HuggingFace Pipeline</span>
          </div>
        </div>

        {/* Card 2: Personal Sanctuary */}
        <div className="p-6 rounded-2xl glass-panel hover:border-indigo-500/40 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquareHeart className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Gemini AI Dialogue</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Interactive, reflective conversations powered by Gemini API, designed to foster mindfulness and self-compassion.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-indigo-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PostgreSQL + pgvector Memory</span>
          </div>
        </div>

        {/* Card 3: Privacy First */}
        <div className="p-6 rounded-2xl glass-panel hover:border-sky-500/40 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-sky-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">AES-256 & PII Defense</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            End-to-end data encryption with Microsoft Presidio PII scrubbing to ensure your personal thoughts remain 100% private.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-sky-400 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>AES-256-GCM Secure Encryption</span>
          </div>
        </div>

      </div>

    </section>
  );
};
