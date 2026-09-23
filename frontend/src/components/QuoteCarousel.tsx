import React, { useState, useEffect } from 'react';
import { WELLBEING_QUOTES, DAILY_AFFIRMATIONS } from '../data/quotes';
import { Quote, ChevronLeft, ChevronRight, RefreshCw, Sun, Compass } from 'lucide-react';

interface QuoteCarouselProps {
  onTriggerLogin: () => void;
}

export const QuoteCarousel: React.FC<QuoteCarouselProps> = ({ onTriggerLogin }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentQuote = WELLBEING_QUOTES[currentIndex];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % WELLBEING_QUOTES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % WELLBEING_QUOTES.length);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + WELLBEING_QUOTES.length) % WELLBEING_QUOTES.length);
  };

  const handleCycleAffirmation = () => {
    setAffirmationIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-slate-700/60 shadow-2xl transition-all duration-700">
      
      {/* Background Image Layer with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{ backgroundImage: `url('${currentQuote.bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/60 backdrop-blur-xs" />

      {/* Foreground Content */}
      <div className="relative z-10 p-8 sm:p-12 md:p-16 flex flex-col justify-between min-h-[440px]">
        
        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              {currentQuote.category}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
              {currentQuote.tagline}
            </span>
          </div>

          <button
            onClick={handleCycleAffirmation}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin-slow" />
            <span>Cycle Affirmation</span>
          </button>
        </div>

        {/* Quote & Author Centerpiece */}
        <div className="my-8 space-y-4 max-w-3xl">
          <Quote className="w-10 h-10 text-teal-400/50 mb-2" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-100 italic leading-relaxed tracking-wide">
            "{currentQuote.quote}"
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-0.5 bg-gradient-to-r from-teal-400 to-indigo-500" />
            <p className="text-sm sm:text-base font-semibold text-teal-300">
              — {currentQuote.author}
            </p>
          </div>
        </div>

        {/* Daily Affirmation Pill Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0">
            <Sun className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 block">Daily Mental Affirmation</span>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">"{DAILY_AFFIRMATIONS[affirmationIndex]}"</p>
          </div>
        </div>

        {/* Bottom Carousel Controls & Login CTA Prompt */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/70 flex items-center justify-center text-slate-300 hover:text-white hover:bg-teal-600/30 hover:border-teal-500/50 transition-all cursor-pointer"
              title="Previous quote"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-400 font-medium">
              {currentIndex + 1} / {WELLBEING_QUOTES.length}
            </span>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/70 flex items-center justify-center text-slate-300 hover:text-white hover:bg-teal-600/30 hover:border-teal-500/50 transition-all cursor-pointer"
              title="Next quote"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Ready to track your mood and talk to AI?</span>
            <button
              onClick={onTriggerLogin}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition-all cursor-pointer"
            >
              Open Login Portal →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
