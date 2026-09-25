import React from 'react';
import { ArrowRight, Leaf } from 'lucide-react';

interface HeroBannerProps {
  userName?: string;
  onOpenMoodCheckIn?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  userName = 'Priya',
  onOpenMoodCheckIn
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e3efe4] via-[#edf5ee] to-[#faedd9] border border-[#d8e8dc] p-7 sm:p-9 shadow-sm transition-all">
      
      {/* Decorative Scenic Hills SVG Illustration Background */}
      <div className="absolute right-0 bottom-0 top-0 w-full md:w-1/2 pointer-events-none opacity-40 md:opacity-90 overflow-hidden flex items-end justify-end">
        <svg viewBox="0 0 500 250" className="w-full h-full object-cover">
          {/* Sun */}
          <circle cx="360" cy="110" r="45" fill="#FDE68A" opacity="0.85" />
          {/* Distant Hills */}
          <path d="M150,250 Q280,110 500,250 Z" fill="#A7F3D0" opacity="0.4" />
          <path d="M0,250 Q180,130 420,250 Z" fill="#6EE7B7" opacity="0.5" />
          {/* Foreground Mountain Ranges */}
          <path d="M220,250 Q350,140 500,220 L500,250 Z" fill="#2D6A4F" opacity="0.75" />
          <path d="M80,250 Q220,160 450,250 Z" fill="#1B4332" opacity="0.9" />
          {/* Pine Trees */}
          <polygon points="410,250 425,190 440,250" fill="#081C15" />
          <polygon points="430,250 442,175 454,250" fill="#1B4332" />
          <polygon points="450,250 465,185 480,250" fill="#2D6A4F" />
        </svg>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-xl space-y-4">
        
        {/* Greeting Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B4332] tracking-tight flex items-center gap-2">
            <span>Good Morning, {userName}</span>
            <Leaf className="w-6 h-6 text-[#40916C] animate-pulse shrink-0" />
          </h1>

          <p className="text-sm text-slate-700 font-medium leading-relaxed max-w-lg">
            Your mental wellbeing matters. Take a deep breath — you're doing better than you think.
          </p>
        </div>

        {/* Interactive Feeling Check-in CTA Button */}
        <div className="pt-2">
          <button
            onClick={onOpenMoodCheckIn}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>How are you feeling today?</span>
            <ArrowRight className="w-4 h-4 text-emerald-200" />
          </button>
        </div>

      </div>

    </div>
  );
};
