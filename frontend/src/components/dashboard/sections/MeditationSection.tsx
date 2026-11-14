import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Flame, 
  Award,
  Wind
} from 'lucide-react';
import { 
  saveActivityLogToDb, 
  getActivityLogsFromDb, 
  type ActivityLogRecord 
} from '../../../services/sanctuaryDbService';

interface MeditationSectionProps {
  user?: { id?: string; email?: string; name?: string } | null;
  onNavigateHome?: () => void;
}

type BreathingTechnique = '4-7-8' | 'box' | 'calm-4-6' | 'open';

interface TechniqueConfig {
  id: BreathingTechnique;
  name: string;
  tagline: string;
  phases: { name: 'Inhale' | 'Hold' | 'Exhale'; seconds: number; cue: string }[];
  defaultDurationMin: number;
}

const TECHNIQUES: TechniqueConfig[] = [
  {
    id: '4-7-8',
    name: '4-7-8 Relaxing Breath',
    tagline: 'Activates parasympathetic relaxation to melt away acute stress and invite deep calm.',
    phases: [
      { name: 'Inhale', seconds: 4, cue: 'Inhale deeply through your nose...' },
      { name: 'Hold', seconds: 7, cue: 'Hold breath gently and softly...' },
      { name: 'Exhale', seconds: 8, cue: 'Exhale smoothly through your mouth...' }
    ],
    defaultDurationMin: 3
  },
  {
    id: 'box',
    name: 'Box Breathing (Sama Vritti)',
    tagline: 'Four equal phases to steady racing heart rate and restore focused clarity.',
    phases: [
      { name: 'Inhale', seconds: 4, cue: 'Inhale slowly...' },
      { name: 'Hold', seconds: 4, cue: 'Hold lungs comfortably full...' },
      { name: 'Exhale', seconds: 4, cue: 'Exhale smoothly...' },
      { name: 'Hold', seconds: 4, cue: 'Hold gently empty...' }
    ],
    defaultDurationMin: 4
  },
  {
    id: 'calm-4-6',
    name: 'Calming 4-6 Breath',
    tagline: 'Extended exhalation stimulates the vagus nerve for emotional grounding.',
    phases: [
      { name: 'Inhale', seconds: 4, cue: 'Inhale peace...' },
      { name: 'Exhale', seconds: 6, cue: 'Exhale tension...' }
    ],
    defaultDurationMin: 5
  },
  {
    id: 'open',
    name: 'Open Mindful Meditation',
    tagline: 'Free-form mindful stillness with subtle ambient focus and gentle bells.',
    phases: [
      { name: 'Inhale', seconds: 5, cue: 'Notice your breath...' },
      { name: 'Exhale', seconds: 5, cue: 'Release all thoughts...' }
    ],
    defaultDurationMin: 10
  }
];

export const MeditationSection: React.FC<MeditationSectionProps> = ({ user }) => {
  const userId = user?.id || '00000000-0000-0000-0000-000000000001';

  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>('4-7-8');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(3);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [phaseSecondsRemaining, setPhaseSecondsRemaining] = useState<number>(4);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Post-session reflection state
  const [userRating, setUserRating] = useState<number>(5);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [hasSavedSession, setHasSavedSession] = useState<boolean>(false);
  const [recentLogs, setRecentLogs] = useState<ActivityLogRecord[]>([]);

  // Web Audio Context for Bell Chimes & Ambient Rain
  const audioCtxRef = useRef<AudioContext | null>(null);

  const activeTechConfig = TECHNIQUES.find(t => t.id === selectedTechnique) || TECHNIQUES[0];

  // Play synthesized singing bowl chime bell via Web Audio API
  const playChime = (frequency: number = 432, duration: number = 2.2) => {
    if (!isAudioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Smooth bell envelope (instant strike, long harmonic decay)
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Load activity history on mount
  useEffect(() => {
    getActivityLogsFromDb(userId).then(logs => setRecentLogs(logs));
  }, [userId]);

  // Reset timer whenever technique or duration changes
  const handleSelectTechnique = (techId: BreathingTechnique) => {
    const tech = TECHNIQUES.find(t => t.id === techId) || TECHNIQUES[0];
    setSelectedTechnique(techId);
    setTargetDurationMinutes(tech.defaultDurationMin);
    setSecondsRemaining(tech.defaultDurationMin * 60);
    setIsActive(false);
    setIsCompleted(false);
    setCurrentPhaseIndex(0);
    setPhaseSecondsRemaining(tech.phases[0].seconds);
  };

  const handleSelectDuration = (mins: number) => {
    setTargetDurationMinutes(mins);
    setSecondsRemaining(mins * 60);
    setIsActive(false);
    setIsCompleted(false);
  };

  // Main Timer & Phase Cycle
  useEffect(() => {
    let interval: any = null;

    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            // Timer Finished!
            setIsActive(false);
            setIsCompleted(true);
            playChime(528, 4.0); // 528Hz Miracle tone for completion
            return 0;
          }
          return prev - 1;
        });

        setPhaseSecondsRemaining(prevPhase => {
          if (prevPhase <= 1) {
            // Advance to next breathing phase
            const nextIdx = (currentPhaseIndex + 1) % activeTechConfig.phases.length;
            setCurrentPhaseIndex(nextIdx);
            playChime(nextIdx === 0 ? 432 : 360, 1.2);
            return activeTechConfig.phases[nextIdx].seconds;
          }
          return prevPhase - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, currentPhaseIndex, activeTechConfig]);

  // Save session to database on complete
  const handleSaveReflection = async () => {
    const totalSecs = targetDurationMinutes * 60 - secondsRemaining;
    const duration = totalSecs > 0 ? totalSecs : targetDurationMinutes * 60;

    const saved = await saveActivityLogToDb(userId, {
      activitySlug: activeTechConfig.id,
      activityTitle: activeTechConfig.name,
      durationSeconds: duration,
      userRating,
      userReflection: reflectionText
    });

    setHasSavedSession(true);
    setRecentLogs(prev => [saved, ...prev]);
  };

  const toggleTimer = () => {
    if (!isActive) {
      playChime(432, 1.8);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsCompleted(false);
    setHasSavedSession(false);
    setSecondsRemaining(targetDurationMinutes * 60);
    setCurrentPhaseIndex(0);
    setPhaseSecondsRemaining(activeTechConfig.phases[0].seconds);
  };

  // Formatting helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalMinutesMeditated = Math.round(
    recentLogs.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0) / 60
  );
  const totalSessionsCount = recentLogs.length;

  const currentPhase = activeTechConfig.phases[currentPhaseIndex] || activeTechConfig.phases[0];
  const progressPercent = Math.min(
    100,
    Math.max(0, 100 - (secondsRemaining / (targetDurationMinutes * 60)) * 100)
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#eaf4eb] via-[#f3f9f4] to-[#fcf5eb] p-6 rounded-3xl border border-[#d8e8dc]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-bold">
            <Wind className="w-3.5 h-3.5" />
            <span>Mindful Meditation & Breathing Suite</span>
          </div>
          <h2 className="text-2xl font-black text-[#1B4332] tracking-tight">
            Find Stillness in Every Breath
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Choose a guided breathing rhythm or set your own stillness timer. Ground your mind and record each completion to your well-being journey.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[#2D6A4F] font-black text-lg">
              <Clock className="w-4 h-4" />
              <span>{totalMinutesMeditated}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Min Meditated</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[#E65100] font-black text-lg">
              <Flame className="w-4 h-4" />
              <span>{totalSessionsCount}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Sessions</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Breathing Orb & Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e5ebe6] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Breathing Visual Orb Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-6">
          
          {/* Circular Countdown & Animated Breathing Orb */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            
            {/* Background Circular Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                className="stroke-slate-100"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                className="stroke-[#2D6A4F] transition-all duration-1000 ease-linear"
                strokeWidth="8"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Breathing Orb with Animated Scale */}
            <div
              className={`absolute rounded-full flex flex-col items-center justify-center text-center shadow-xl transition-all duration-1000 ease-in-out ${
                isActive && currentPhase.name === 'Inhale'
                  ? 'w-48 h-48 bg-gradient-to-tr from-[#2D6A4F] to-[#52B788] text-white scale-110 shadow-emerald-500/30'
                  : isActive && currentPhase.name === 'Hold'
                  ? 'w-48 h-48 bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] text-white scale-105 shadow-emerald-700/30'
                  : isActive && currentPhase.name === 'Exhale'
                  ? 'w-48 h-48 bg-gradient-to-tr from-[#D8F3DC] to-[#B7E4C7] text-[#1B4332] scale-90 shadow-slate-200'
                  : 'w-44 h-44 bg-gradient-to-br from-[#f2f7f3] to-[#e8f2e9] text-[#1B4332]'
              }`}
            >
              {isActive ? (
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest font-extrabold opacity-80">
                    {currentPhase.name}
                  </span>
                  <div className="text-4xl font-black tracking-tight">
                    {phaseSecondsRemaining}s
                  </div>
                  <span className="text-[11px] font-medium px-3 block line-clamp-1 opacity-90">
                    {currentPhase.cue}
                  </span>
                </div>
              ) : isCompleted ? (
                <div className="space-y-1 p-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 animate-bounce" />
                  <span className="text-xs font-black uppercase text-emerald-800">
                    Session Complete
                  </span>
                  <span className="text-[10px] text-slate-600 block">
                    Breathe deeply and reflect
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Wind className="w-6 h-6 mx-auto text-[#2D6A4F]" />
                  <span className="text-3xl font-black text-[#1B4332] tracking-tight">
                    {formatTime(secondsRemaining)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Ready to Begin
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Current Overall Timer Display */}
          <div className="text-center space-y-1">
            <div className="text-2xl font-black text-slate-800 tracking-tight font-mono">
              {formatTime(secondsRemaining)}
            </div>
            <p className="text-xs text-slate-500">
              {activeTechConfig.name} • {targetDurationMinutes} min session
            </p>
          </div>

          {/* Player Controls Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/10'
                  : 'bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-emerald-950/20 hover:scale-105'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{secondsRemaining < targetDurationMinutes * 60 ? 'Resume' : 'Start Meditation'}</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsAudioEnabled(!isAudioEnabled);
                if (!isAudioEnabled) playChime(432, 1.0);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                isAudioEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-[#2D6A4F]'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
              title={isAudioEnabled ? 'Mute Chimes' : 'Enable Bell Chimes'}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Right Column: Technique Selector & Duration Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-slate-100 lg:pl-8">
          
          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Select Session Duration</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 10].map(mins => (
                <button
                  key={mins}
                  onClick={() => handleSelectDuration(mins)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    targetDurationMinutes === mins
                      ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xs'
                      : 'bg-[#fafcfb] hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Technique Picker */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Breathing Techniques</span>
            </label>
            
            <div className="space-y-2">
              {TECHNIQUES.map(tech => {
                const isSelected = selectedTechnique === tech.id;
                return (
                  <button
                    key={tech.id}
                    onClick={() => handleSelectTechnique(tech.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8F5E9] border-[#2D6A4F]/40 shadow-xs'
                        : 'bg-[#fafcfb] hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#1B4332]' : 'text-slate-800'}`}>
                        {tech.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {tech.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Completion & Reflection Card (Shows upon completion) */}
      {isCompleted && (
        <div className="p-6 rounded-3xl bg-[#E8F5E9] border border-[#b7e4c7] shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1B4332]">
              <Award className="w-5 h-5 text-[#2D6A4F]" />
              <h3 className="font-bold text-sm">Session Completed! Record Your Well-being Reflection</h3>
            </div>
            <span className="text-xs font-extrabold text-[#2D6A4F] bg-white px-3 py-1 rounded-full border border-[#d8e8dc]">
              +1 Mindful Session Logged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">How calm do you feel now?</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      userRating >= star
                        ? 'bg-amber-400 text-slate-900 shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-400'
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-7 space-y-2">
              <input
                type="text"
                value={reflectionText}
                onChange={e => setReflectionText(e.target.value)}
                placeholder="Optional reflection: e.g. 'Felt peaceful, my shoulders released tension...'"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2D6A4F]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSaveReflection}
                  disabled={hasSavedSession}
                  className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {hasSavedSession ? 'Saved to Sanctuary Database!' : 'Save Reflection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Meditation & Breathwork Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#1B4332] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#2D6A4F]" />
            <span>Recent Completed Sessions (Activity Logs)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Stored in Sanctuary Database
          </span>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No completed sessions yet. Start your first breathwork session above!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentLogs.slice(0, 4).map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-[#fafcfb] border border-slate-200 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-[#1B4332] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{log.activity_title}</span>
                  </div>
                  {log.user_reflection && (
                    <p className="text-[11px] text-slate-600 italic">
                      "{log.user_reflection}"
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(log.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#2D6A4F] font-bold text-[10px] border border-emerald-200">
                    {Math.round(log.duration_seconds / 60)} min
                  </span>
                  {log.user_rating && (
                    <div className="text-amber-500 text-[10px] font-bold mt-1">
                      {'★'.repeat(log.user_rating)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MeditationSection;
