import React, { useState, useEffect } from 'react';
import { Play, Pause, X, RefreshCw } from 'lucide-react';

export const OneMinuteBreatherCard: React.FC = () => {
  const [showBreatherModal, setShowBreatherModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // Breathing timer & phase controller
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
        
        // Cycle phase every 4 seconds
        const sec = 60 - secondsLeft;
        if (sec % 12 < 4) setBreathPhase('Inhale');
        else if (sec % 12 < 8) setBreathPhase('Hold');
        else setBreathPhase('Exhale');
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handleStartBreather = () => {
    setShowBreatherModal(true);
    setSecondsLeft(60);
    setIsActive(true);
    setBreathPhase('Inhale');
  };

  const handleReset = () => {
    setSecondsLeft(60);
    setIsActive(true);
    setBreathPhase('Inhale');
  };

  return (
    <>
      {/* Breather Card */}
      <div className="relative overflow-hidden bg-[#E8F5E9] rounded-3xl p-6 border border-[#d8e8dc] shadow-xs space-y-3">
        
        {/* Botanical Leaf Art */}
        <div className="absolute right-0 top-0 bottom-0 pointer-events-none opacity-80">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <path d="M80 10C50 40 40 80 90 90C40 70 30 30 80 10Z" fill="#2D6A4F" fillOpacity="0.18" />
            <path d="M90 90C60 70 20 60 10 10C30 50 50 80 90 90Z" fill="#1B4332" fillOpacity="0.15" />
          </svg>
        </div>

        <div className="relative z-10 space-y-1">
          <h3 className="text-sm font-extrabold text-[#1B4332]">Take a Moment</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-[200px]">
            Pause. Breathe. You're doing enough. 🌿
          </p>
        </div>

        {/* Start Button */}
        <div className="pt-1 relative z-10">
          <button
            onClick={handleStartBreather}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start a 1-Minute Breather</span>
          </button>
        </div>

      </div>

      {/* Interactive Breather Modal */}
      {showBreatherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 border border-emerald-100 shadow-2xl text-center space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setShowBreatherModal(false);
                setIsActive(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-[#1B4332]">1-Minute Breather</h3>
              <p className="text-xs text-slate-500">Follow the circle to align your breath</p>
            </div>

            {/* Breathing Circle Animation */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-[#E8F5E9] border-2 border-[#2D6A4F] transition-all duration-1000 transform ${
                  breathPhase === 'Inhale'
                    ? 'scale-110 opacity-90'
                    : breathPhase === 'Hold'
                    ? 'scale-105 opacity-100'
                    : 'scale-90 opacity-70'
                }`}
              />
              
              <div className="relative z-10 text-center space-y-1">
                <span className="text-2xl font-black text-[#1B4332] block">
                  {secondsLeft}s
                </span>
                <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider block">
                  {breathPhase}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center items-center gap-3 pt-2">
              <button
                onClick={() => setIsActive(!isActive)}
                className="px-5 py-2 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isActive ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
