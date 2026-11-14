import React, { useState, useEffect } from 'react';
import { 
  Smile, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Tag, 
  FileText, 
  ShieldCheck
} from 'lucide-react';
import { 
  saveMoodEntryToDb, 
  getMoodEntriesFromDb, 
  type MoodEntryRecord 
} from '../../../services/sanctuaryDbService';

interface MoodTrackingSectionProps {
  user?: { id?: string; email?: string; name?: string } | null;
}

const PRIMARY_EMOTIONS = [
  'Calmness / Equilibrium',
  'Joy / Serenity',
  'Anxiety / Stress',
  'Sadness / Grief',
  'Anger / Frustration',
  'Fear / Vulnerability',
  'Hopeful / Optimistic'
];

const TRIGGER_OPTIONS = [
  'Work & Deadlines',
  'Relationships',
  'Sleep Quality',
  'Physical Health',
  'Family',
  'Finances',
  'Social & Friends',
  'Environment'
];

const SECONDARY_TAGS = [
  'Grateful',
  'Overwhelmed',
  'Peaceful',
  'Restless',
  'Tired',
  'Inspired',
  'Content',
  'Lonely'
];

export const MoodTrackingSection: React.FC<MoodTrackingSectionProps> = ({ user }) => {
  const userId = user?.id || '00000000-0000-0000-0000-000000000001';

  const [moodScore, setMoodScore] = useState<number>(7);
  const [selectedPrimary, setSelectedPrimary] = useState<string>('Calmness / Equilibrium');
  const [selectedSecondary, setSelectedSecondary] = useState<string[]>(['Grateful']);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['Sleep Quality']);
  const [personalNotes, setPersonalNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [history, setHistory] = useState<MoodEntryRecord[]>([]);

  // Load history on mount
  useEffect(() => {
    getMoodEntriesFromDb(userId).then(entries => setHistory(entries));
  }, [userId]);

  const toggleSecondaryTag = (tag: string) => {
    setSelectedSecondary(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleTriggerTag = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
    );
  };

  const getMoodLabel = (score: number) => {
    if (score >= 9) return 'Joyful & Thriving';
    if (score >= 7) return 'Calm & Good';
    if (score >= 5) return 'Balanced / Neutral';
    if (score >= 3) return 'Low / Stressed';
    return 'Distressed / Overwhelmed';
  };

  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');

    try {
      const saved = await saveMoodEntryToDb(userId, {
        moodScore,
        moodLabel: getMoodLabel(moodScore),
        primaryEmotion: selectedPrimary,
        secondaryEmotions: selectedSecondary,
        triggers: selectedTriggers,
        notes: personalNotes
      });

      setHistory(prev => [saved, ...prev]);
      setSaveSuccessMsg('Your mood check-in has been saved to your sanctuary logs!');
      setPersonalNotes('');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.warn('Error saving mood:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Average mood score
  const avgMood = history.length > 0
    ? (history.reduce((acc, h) => acc + h.mood_score, 0) / history.length).toFixed(1)
    : '7.0';

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#eaf4eb] via-[#f4f8f4] to-[#faeee7] p-6 rounded-3xl border border-[#d8e8dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-bold">
            <Smile className="w-3.5 h-3.5" />
            <span>Daily Emotional Check-in</span>
          </div>
          <h2 className="text-2xl font-black text-[#1B4332] tracking-tight">
            How Are You Feeling Right Now?
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Tuning into your emotions builds lasting emotional awareness. Record your daily score, identify your life triggers, and trace your journey over time.
          </p>
        </div>

        {/* Quick Average Score Badge */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center shadow-xs shrink-0">
          <div className="text-2xl font-black text-[#2D6A4F] tracking-tight">
            {avgMood} <span className="text-xs text-slate-400 font-bold">/ 10</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
            Average Mood Score
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Check-in Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-6">
          <form onSubmit={handleSaveMood} className="space-y-6">
            
            {/* 1–10 Mood Score Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  1. Overall Emotional Tone (1–10 Scale)
                </label>
                <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2D6A4F] font-black text-xs border border-[#d8e8dc]">
                  {moodScore} / 10 • {getMoodLabel(moodScore)}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={moodScore}
                onChange={e => setMoodScore(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2D6A4F]"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
                <span>1 (Heavy / Distressed)</span>
                <span>5 (Balanced)</span>
                <span>10 (Joyful / Serene)</span>
              </div>
            </div>

            {/* Primary Emotion Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Primary Dominant Emotion</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRIMARY_EMOTIONS.map(emotion => {
                  const isSelected = selectedPrimary === emotion;
                  return (
                    <button
                      type="button"
                      key={emotion}
                      onClick={() => setSelectedPrimary(emotion)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xs'
                          : 'bg-[#fafcfb] hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {emotion}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Feelings Tags */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>3. Nuanced Feelings (Select All That Apply)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SECONDARY_TAGS.map(tag => {
                  const isSelected = selectedSecondary.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleSecondaryTag(tag)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#E8F5E9] border-[#2D6A4F] text-[#2D6A4F] font-bold'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Triggers Tags */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span>4. Factors & Triggers Influencing You Today</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TRIGGER_OPTIONS.map(trigger => {
                  const isSelected = selectedTriggers.includes(trigger);
                  return (
                    <button
                      type="button"
                      key={trigger}
                      onClick={() => toggleTriggerTag(trigger)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#E3F2FD] border-[#1976D2] text-[#1976D2] font-bold'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {isSelected ? `✓ ${trigger}` : `+ ${trigger}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Personal Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>5. Confidential Personal Note (Optional)</span>
              </label>
              <textarea
                rows={3}
                value={personalNotes}
                onChange={e => setPersonalNotes(e.target.value)}
                placeholder="What happened today? Write anything on your mind..."
                className="w-full p-3 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2D6A4F] transition-all resize-none"
              />
            </div>

            {/* Save Notice */}
            {saveSuccessMsg && (
              <div className="p-3 rounded-2xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#1B4332] text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Stored Privately in Sanctuary Database</span>
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSaving ? 'Recording...' : 'Log Mood Check-in'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Mood History & Insights Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-[#e5ebe6] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2D6A4F]" />
                <span>Recorded Mood History</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {history.length} entries
              </span>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No entries recorded yet. Submit your first check-in!
              </p>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200 text-xs space-y-2 transition-all hover:bg-white hover:border-[#2D6A4F]/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {item.mood_score >= 8 ? '😊' : item.mood_score >= 5 ? '😌' : '😔'}
                        </span>
                        <div>
                          <strong className="text-slate-900 block">{item.mood_label}</strong>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-white font-extrabold text-[11px] bg-[#2D6A4F]">
                        {item.mood_score} / 10
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 font-medium">
                      Emotion: <strong className="text-[#1B4332]">{item.primary_emotion}</strong>
                    </div>

                    {item.triggers && item.triggers.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.triggers.map((trig, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold"
                          >
                            #{trig}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default MoodTrackingSection;
