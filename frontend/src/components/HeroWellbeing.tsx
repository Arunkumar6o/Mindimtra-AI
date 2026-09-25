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
          Mindmitra combines real-time <strong>RoBERTa emotion classification</strong>, 
          <strong> Gemini LLM responses</strong>, and <strong>AES-256 PII protection</strong> to support your mental wellbeing journey.
        </p>

        {/* CTA Login Button */}
        <div className="pt-2 flex justify-center items-center gap-4">
          <button
            onClick={onOpenLogin}
            className="px-8 py-3.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-semibold text-base shadow-lg shadow-[#2D6A4F]/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
          >
            <span>Access Your Personal Portal</span>
            <span className="text-emerald-200">→</span>
          </button>
        </div>
      </div>

      {/* Main Wellbeing Quotes & Background Carousel Section */}
      <QuoteCarousel onTriggerLogin={onOpenLogin} />

      {/* Mental Wellbeing Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* Card 1: Emotion Intelligence */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5EBE6] hover:border-[#2D6A4F]/40 shadow-xs hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-6 h-6 text-[#2D6A4F]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B4332] mb-2">RoBERTa Emotion Engine</h3>
          <p className="text-xs text-[#557B69] leading-relaxed">
            Understands fine-grained emotional nuances (anxiety, grief, joy, distress) to tailor empathetic responses without judgment.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#2D6A4F] font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>PyTorch + HuggingFace Pipeline</span>
          </div>
        </div>

        {/* Card 2: Personal Sanctuary */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5EBE6] hover:border-[#1565C0]/40 shadow-xs hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-[#E3F2FD] border border-[#BBDEFB] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <MessageSquareHeart className="w-6 h-6 text-[#1565C0]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B4332] mb-2">Gemini AI Dialogue</h3>
          <p className="text-xs text-[#557B69] leading-relaxed">
            Interactive, reflective conversations powered by Gemini API, designed to foster mindfulness and self-compassion.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#1565C0] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PostgreSQL + pgvector Memory</span>
          </div>
        </div>

        {/* Card 3: Privacy First */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5EBE6] hover:border-[#7B1FA2]/40 shadow-xs hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-[#F3E5F5] border border-[#E1BEE7] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-[#7B1FA2]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B4332] mb-2">AES-256 & PII Defense</h3>
          <p className="text-xs text-[#557B69] leading-relaxed">
            End-to-end data encryption with Microsoft Presidio PII scrubbing to ensure your personal thoughts remain 100% private.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#7B1FA2] font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>AES-256-GCM Secure Encryption</span>
          </div>
        </div>

      </div>

    </section>
  );
};
