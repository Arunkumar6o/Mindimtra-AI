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
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#1B4332] text-white border border-[#2D6A4F]/40 shadow-xl transition-all duration-700">
      
      {/* Background Image Layer with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105 opacity-40"
        style={{ backgroundImage: `url('${currentQuote.bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F281E]/95 via-[#1B4332]/85 to-[#2D6A4F]/70 backdrop-blur-xs" />

      {/* Foreground Content */}
      <div className="relative z-10 p-8 sm:p-12 md:p-16 flex flex-col justify-between min-h-[440px]">
        
        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2D6A4F]/60 text-[#E8F5E9] border border-[#40916C]/40 backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-emerald-300" />
              {currentQuote.category}
            </span>
            <span className="text-xs text-emerald-100/80 font-medium hidden sm:inline-block">
              {currentQuote.tagline}
            </span>
          </div>

          <button
            onClick={handleCycleAffirmation}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#2D6A4F]/40 text-emerald-100 border border-[#40916C]/40 hover:bg-[#2D6A4F]/70 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-emerald-300 animate-spin-slow" />
            <span>Cycle Affirmation</span>
          </button>
        </div>

        {/* Quote & Author Centerpiece */}
        <div className="my-8 space-y-4 max-w-3xl">
          <Quote className="w-10 h-10 text-emerald-300/40 mb-2" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white italic leading-relaxed tracking-wide">
            "{currentQuote.quote}"
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-300" />
            <p className="text-sm sm:text-base font-semibold text-emerald-300">
              — {currentQuote.author}
            </p>
          </div>
        </div>

        {/* Daily Affirmation Pill Banner */}
        <div className="p-4 rounded-2xl bg-[#0F281E]/80 border border-[#2D6A4F]/60 backdrop-blur-md flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/50 flex items-center justify-center shrink-0">
            <Sun className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-300 block">Daily Mental Affirmation</span>
            <p className="text-xs sm:text-sm text-emerald-50 font-medium">"{DAILY_AFFIRMATIONS[affirmationIndex]}"</p>
          </div>
        </div>

        {/* Bottom Carousel Controls & Login CTA Prompt */}
        <div className="mt-8 pt-6 border-t border-[#2D6A4F]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-xl bg-[#0F281E]/80 border border-[#2D6A4F]/60 flex items-center justify-center text-emerald-100 hover:text-white hover:bg-[#2D6A4F] transition-all cursor-pointer"
              title="Previous quote"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-emerald-200/80 font-medium">
              {currentIndex + 1} / {WELLBEING_QUOTES.length}
            </span>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-xl bg-[#0F281E]/80 border border-[#2D6A4F]/60 flex items-center justify-center text-emerald-100 hover:text-white hover:bg-[#2D6A4F] transition-all cursor-pointer"
              title="Next quote"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-100/80">Ready to track your mood and talk to AI?</span>
            <button
              onClick={onTriggerLogin}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2D6A4F] hover:bg-[#40916C] text-white border border-[#52B788]/40 transition-all cursor-pointer"
            >
              Open Login Portal →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default QuoteCarousel;
