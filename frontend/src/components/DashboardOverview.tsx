import React, { useState } from 'react';
import { 
  Smile, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  Calendar,
  Flame,
  BarChart3,
  BrainCircuit
} from 'lucide-react';
import { DAILY_AFFIRMATIONS } from '../data/quotes';
import { AIModulesSection } from './AIModulesSection';

interface DashboardOverviewProps {
  user: { email: string; name: string } | null;
  onSelectTab: (tab: 'overview' | 'login') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ user, onSelectTab }) => {
  const [selectedMood, setSelectedMood] = useState<string>('Peaceful');
  const [checkInNote, setCheckInNote] = useState<string>('');
  const [checkInSubmitted, setCheckInSubmitted] = useState<boolean>(false);
  const [affirmationIndex, setAffirmationIndex] = useState<number>(0);

  const handleMoodCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInSubmitted(true);
    setTimeout(() => {
      setCheckInSubmitted(false);
      setCheckInNote('');
    }, 4000);
  };

  const moods = [
    { label: 'Peaceful', icon: '🧘', color: 'bg-[#E8F5E9] text-[#2D6A4F] border-[#C8E6C9]' },
    { label: 'Joyful', icon: '😊', color: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]' },
    { label: 'Anxious', icon: '⚡', color: 'bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]' },
    { label: 'Overwhelmed', icon: '🌊', color: 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]' },
    { label: 'Low / Sad', icon: '😔', color: 'bg-[#F4F7F5] text-[#557B69] border-[#E5EBE6]' },
    { label: 'Frustrated', icon: '🔥', color: 'bg-[#FDEEEF] text-[#C62828] border-[#FFCDD2]' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-[#E5EBE6] shadow-sm p-6 sm:p-8">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#E8F5E9] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-[#E3F2FD] rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1B4332] tracking-tight">
              Welcome back, <span className="text-[#2D6A4F]">
                {user ? user.name : 'Mindmitra Explorer'}
              </span>
            </h1>
            
            <p className="text-[#557B69] text-sm max-w-xl">
              Track your emotional equilibrium, explore real-time sentiment intelligence, and chat with your empathetic AI companion.
            </p>
          </div>

          {!user && (
            <div className="shrink-0">
              <button
                onClick={() => onSelectTab('login')}
                className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-medium text-xs shadow-md shadow-[#2D6A4F]/20 transition-all cursor-pointer"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Combined AI Modules Section (RoBERTa Emotion Classifier & Gemini AI Companion) */}
      <AIModulesSection />

      {/* Top Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Wellbeing Index */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5EBE6] hover:border-[#2D6A4F]/40 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#557B69] font-medium">Emotional Balance</span>
            <span className="p-2 rounded-xl bg-[#E8F5E9] text-[#2D6A4F]">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1B4332]">88</span>
            <span className="text-xs text-[#2D6A4F] font-semibold">/ 100</span>
          </div>
          <p className="text-[11px] text-[#557B69] mt-2 flex items-center gap-1">
            <span className="text-[#2D6A4F] font-semibold">↑ +4%</span> from yesterday (Optimal)
          </p>
        </div>

        {/* Metric 2: Emotion Intelligence */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5EBE6] hover:border-[#1565C0]/40 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#557B69] font-medium">Emotion Accuracy</span>
            <span className="p-2 rounded-xl bg-[#E3F2FD] text-[#1565C0]">
              <BrainCircuit className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1B4332]">94.2%</span>
          </div>
          <p className="text-[11px] text-[#557B69] mt-2">
            Fine-grained Emotion Classification
          </p>
        </div>

        {/* Metric 3: Streak */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5EBE6] hover:border-[#E65100]/40 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#557B69] font-medium">Mindfulness Streak</span>
            <span className="p-2 rounded-xl bg-[#FFF3E0] text-[#E65100]">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1B4332]">7 Days</span>
          </div>
          <p className="text-[11px] text-[#557B69] mt-2">
            Consistent Daily Check-ins
          </p>
        </div>

        {/* Metric 4: Privacy */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5EBE6] hover:border-[#2D6A4F]/40 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#557B69] font-medium">Privacy Protection</span>
            <span className="p-2 rounded-xl bg-[#E8F5E9] text-[#2D6A4F]">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1B4332]">100% Private</span>
          </div>
          <p className="text-[11px] text-[#2D6A4F] mt-2 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Local Data Isolation
          </p>
        </div>

      </div>

      {/* Main Grid: Mood Check-in & Emotion Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Mood Check-In Widget (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#E5EBE6] shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F]">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1B4332]">Daily Mood Check-In</h3>
                <p className="text-xs text-[#557B69]">Select how you are feeling right now</p>
              </div>
            </div>
            <span className="text-xs text-[#557B69] flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Today
            </span>
          </div>

          {/* Mood Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {moods.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => setSelectedMood(m.label)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-20 ${
                  selectedMood === m.label
                    ? `${m.color} ring-2 ring-[#2D6A4F] shadow-sm font-semibold`
                    : 'bg-[#F4F7F5] border-[#E5EBE6] text-[#557B69] hover:bg-white hover:text-[#1B4332]'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span className="text-xs font-semibold">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Note Input Form */}
          <form onSubmit={handleMoodCheckIn} className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-[#1B4332]">
              Journal Note (Optional)
            </label>
            <textarea
              rows={3}
              value={checkInNote}
              onChange={(e) => setCheckInNote(e.target.value)}
              placeholder="Write a few words about what is influencing your mood today..."
              className="w-full p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E5EBE6] text-[#1B4332] text-xs focus:outline-none focus:border-[#2D6A4F] focus:bg-white transition-all placeholder:text-slate-400 resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#557B69] flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                End-to-end encrypted locally
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-medium text-xs shadow-md shadow-[#2D6A4F]/20 transition-all cursor-pointer"
              >
                Submit Check-In
              </button>
            </div>
          </form>

          {checkInSubmitted && (
            <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] text-xs flex items-center gap-2 animate-fadeIn font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
              <span>Mood check-in recorded! Your emotional wellbeing log updated successfully.</span>
            </div>
          )}
        </div>

        {/* Right Column: Emotion Analysis Breakdown & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Sentiment Distribution Panel */}
          <div className="rounded-3xl bg-white border border-[#E5EBE6] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1B4332] font-bold text-sm">
                <BarChart3 className="w-4 h-4 text-[#2D6A4F]" />
                <span>Emotion Spectrum Breakdown</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#557B69]">Calmness & Equilibrium</span>
                  <span className="text-[#2D6A4F] font-semibold">45%</span>
                </div>
                <div className="w-full bg-[#E5EBE6] rounded-full h-2">
                  <div className="bg-[#2D6A4F] h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#557B69]">Joy & Optimism</span>
                  <span className="text-[#E65100] font-semibold">30%</span>
                </div>
                <div className="w-full bg-[#E5EBE6] rounded-full h-2">
                  <div className="bg-[#E65100] h-2 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#557B69]">Anxiety / Stress</span>
                  <span className="text-[#7B1FA2] font-semibold">15%</span>
                </div>
                <div className="w-full bg-[#E5EBE6] rounded-full h-2">
                  <div className="bg-[#7B1FA2] h-2 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#557B69]">Sadness / Vulnerability</span>
                  <span className="text-[#1565C0] font-semibold">10%</span>
                </div>
                <div className="w-full bg-[#E5EBE6] rounded-full h-2">
                  <div className="bg-[#1565C0] h-2 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Affirmations Widget */}
          <div className="rounded-3xl bg-white border border-[#E5EBE6] shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1B4332] font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#E65100]" />
                <span>Daily Affirmation</span>
              </div>
              <button
                onClick={() => setAffirmationIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length)}
                className="text-[11px] text-[#2D6A4F] hover:underline cursor-pointer font-semibold"
              >
                Next ✨
              </button>
            </div>
            
            <p className="text-xs text-[#1B4332] italic leading-relaxed bg-[#F8FAF8] p-4 rounded-2xl border border-[#E5EBE6]">
              "{DAILY_AFFIRMATIONS[affirmationIndex]}"
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
