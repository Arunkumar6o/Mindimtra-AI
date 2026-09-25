import React, { useState } from 'react';
import { Quote } from 'lucide-react';

export const DailyAffirmation: React.FC = () => {
  const affirmations = [
    "You are enough, just as you are.",
    "Breathe in peace, breathe out tension.",
    "Small progress every day adds up to big results.",
    "Your feelings are valid, and it is okay to rest."
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative overflow-hidden bg-[#fafcfb] rounded-3xl p-6 border border-[#e5ebe6] shadow-xs flex flex-col justify-between h-full group">
      
      {/* Botanical Leaf Art in Bottom Right */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-80 group-hover:scale-105 transition-transform duration-500">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path d="M110 110C90 70 50 60 10 70C50 40 90 40 110 110Z" fill="#2D6A4F" fillOpacity="0.12" />
          <path d="M110 110C80 90 70 50 80 10C50 50 40 90 110 110Z" fill="#1B4332" fillOpacity="0.15" />
          <path d="M110 110Q65 65 20 20" stroke="#2D6A4F" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      </div>

      <div className="space-y-3 relative z-10">
        {/* Quote Icon */}
        <Quote className="w-6 h-6 text-[#2D6A4F] fill-[#2D6A4F]/20" />

        <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#2D6A4F]">
          Today's Affirmation
        </h2>

        {/* Main Quote Text */}
        <p className="text-base sm:text-lg font-serif italic text-slate-800 leading-relaxed max-w-[220px]">
          "{affirmations[currentIndex]}"
        </p>
      </div>

      {/* Carousel Pagination Dots */}
      <div className="flex items-center gap-1.5 pt-4 relative z-10">
        {affirmations.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentIndex === idx
                ? 'w-6 bg-[#2D6A4F]'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            title={`Affirmation ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
};
