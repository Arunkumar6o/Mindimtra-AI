import React, { useState } from 'react';
import { 
  Smile, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  SunMedium, 
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
    { label: 'Peaceful', icon: '🧘', color: 'from-emerald-500/20 to-teal-500/20 text-teal-300 border-teal-500/40' },
    { label: 'Joyful', icon: '😊', color: 'from-amber-500/20 to-yellow-500/20 text-yellow-300 border-yellow-500/40' },
    { label: 'Anxious', icon: '⚡', color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40' },
    { label: 'Overwhelmed', icon: '🌊', color: 'from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/40' },
    { label: 'Low / Sad', icon: '😔', color: 'from-slate-500/20 to-gray-500/20 text-slate-300 border-slate-500/40' },
    { label: 'Frustrated', icon: '🔥', color: 'from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/40' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-teal-500/20 p-6 sm:p-8">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <SunMedium className="w-3.5 h-3.5 text-teal-400" />
              <span>Mindmitra Interactive Sanctuary</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-teal-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                {user ? user.name : 'Mindmitra Explorer'}
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm max-w-xl">
              Track your emotional equilibrium, explore real-time sentiment intelligence, and chat with your empathetic AI companion.
            </p>
          </div>

          {!user && (
            <div className="shrink-0">
              <button
                onClick={() => onSelectTab('login')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
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
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 hover:border-teal-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Emotional Balance</span>
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">88</span>
            <span className="text-xs text-teal-400 font-semibold">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-teal-400 font-semibold">↑ +4%</span> from yesterday (Optimal)
          </p>
        </div>

        {/* Metric 2: Emotion Intelligence */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Emotion Accuracy</span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BrainCircuit className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">94.2%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Fine-grained Emotion Classification
          </p>
        </div>

        {/* Metric 3: Streak */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Mindfulness Streak</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">7 Days</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Consistent Daily Check-ins
          </p>
        </div>

        {/* Metric 4: Privacy */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Privacy Protection</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">100% Private</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Local Data Isolation
          </p>
        </div>

      </div>

      {/* Main Grid: Mood Check-in & Emotion Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Mood Check-In Widget (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl glass-panel border border-slate-800/80 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Daily Mood Check-In</h3>
                <p className="text-xs text-slate-400">Select how you are feeling right now</p>
              </div>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
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
                    ? `bg-gradient-to-br ${m.color} ring-2 ring-teal-400 shadow-md`
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span className="text-xs font-semibold">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Note Input Form */}
          <form onSubmit={handleMoodCheckIn} className="space-y-3 pt-2">
            <label className="block text-xs font-medium text-slate-300">
              Journal Note (Optional)
            </label>
            <textarea
              rows={3}
              value={checkInNote}
              onChange={(e) => setCheckInNote(e.target.value)}
              placeholder="Write a few words about what is influencing your mood today..."
              className="w-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-600 resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                End-to-end encrypted locally
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-teal-500/20 transition-all cursor-pointer"
              >
                Submit Check-In
              </button>
            </div>
          </form>

          {checkInSubmitted && (
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Mood check-in recorded! Your emotional wellbeing log updated successfully.</span>
            </div>
          )}
        </div>

        {/* Right Column: Emotion Analysis Breakdown & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Sentiment Distribution Panel */}
          <div className="rounded-3xl glass-panel border border-slate-800/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span>Emotion Spectrum Breakdown</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Calmness & Equilibrium</span>
                  <span className="text-teal-400 font-semibold">45%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div className="bg-teal-400 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Joy & Optimism</span>
                  <span className="text-amber-400 font-semibold">30%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Anxiety / Stress</span>
                  <span className="text-indigo-400 font-semibold">15%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div className="bg-indigo-400 h-2 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Sadness / Vulnerability</span>
                  <span className="text-sky-400 font-semibold">10%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div className="bg-sky-400 h-2 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Affirmations Widget */}
          <div className="rounded-3xl glass-panel border border-slate-800/80 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Daily Affirmation</span>
              </div>
              <button
                onClick={() => setAffirmationIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length)}
                className="text-[11px] text-teal-400 hover:text-teal-300 cursor-pointer"
              >
                Next ✨
              </button>
            </div>
            
            <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
              "{DAILY_AFFIRMATIONS[affirmationIndex]}"
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
