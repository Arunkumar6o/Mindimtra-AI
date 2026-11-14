import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Download, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  getUserPreferences, 
  saveUserPreferencesToDb 
} from '../../../services/sanctuaryDbService';
import { useLanguage, LANGUAGES } from '../../../context/LanguageContext';
import { clearUserConversationHistory } from '../../../services/unifiedAnalysisService';

interface SettingsSectionProps {
  user?: { id?: string; email?: string; name?: string } | null;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ user }) => {
  const userId = user?.id || '00000000-0000-0000-0000-000000000001';
  const { currentLanguage, setLanguage } = useLanguage();

  const [communicationStyle, setCommunicationStyle] = useState<'empathetic' | 'gentle' | 'direct' | 'reflective'>('empathetic');
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState<boolean>(true);
  const [dailyReminderTime, setDailyReminderTime] = useState<string>('09:00');
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  useEffect(() => {
    getUserPreferences(userId).then(prefs => {
      setCommunicationStyle(prefs.communication_style);
      setDailyReminderEnabled(prefs.daily_reminder_enabled);
      setDailyReminderTime(prefs.daily_reminder_time);
      setPushNotifications(prefs.push_notifications);
      setEmailNotifications(prefs.email_notifications);
    });
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await saveUserPreferencesToDb(userId, {
      preferred_language: currentLanguage,
      communication_style: communicationStyle,
      daily_reminder_enabled: dailyReminderEnabled,
      daily_reminder_time: dailyReminderTime,
      push_notifications: pushNotifications,
      email_notifications: emailNotifications
    });
    setIsSaving(false);
    setToastMsg('Preferences successfully updated in Sanctuary Database!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleClearChatHistory = async () => {
    if (window.confirm('Reset all saved emotional conversation history? This will start your emotional analysis fresh.')) {
      await clearUserConversationHistory(userId);
      setToastMsg('Conversation history and reflections reset.');
      setTimeout(() => setToastMsg(''), 3500);
    }
  };

  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      user: { id: userId, email: user?.email, name: user?.name },
      moodEntries: localStorage.getItem(`mindmitra_mood_entries_${userId}`),
      activityLogs: localStorage.getItem(`mindmitra_activity_logs_${userId}`),
      journalEntries: localStorage.getItem(`mindmitra_journal_entries_${userId}`)
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmitra_sanctuary_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMsg('Your confidential sanctuary data export has been downloaded.');
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#eaf4eb] via-[#f7f5fa] to-[#faeee7] p-6 rounded-3xl border border-[#d8e8dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-bold">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Preferences & Sanctuary Settings</span>
          </div>
          <h2 className="text-2xl font-black text-[#1B4332] tracking-tight">
            Personalize Your Sanctuary Experience
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Configure your preferred regional language, companion communication style, reminder notifications, and private data controls.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#2D6A4F] bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
          <span>Syncs with User Preferences DB</span>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#1B4332] text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-8">
        
        {/* Regional Language Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <label className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#2D6A4F]" />
              <span>Regional App Language</span>
            </label>
            <span className="text-[11px] text-slate-500 font-semibold">10 Regional Indian Languages Available</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {LANGUAGES.map(lang => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E8F5E9] border-[#2D6A4F] shadow-xs'
                      : 'bg-[#fafcfb] hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white text-slate-700">
                      {lang.scriptBadge}
                    </span>
                  </div>
                  <strong className={`block text-xs mt-1.5 ${isSelected ? 'text-[#1B4332]' : 'text-slate-800'}`}>
                    {lang.name}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">{lang.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Companion Communication Style */}
        <div className="space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <label className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Companion Tone & Guidance Style</span>
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose how your companion responds to your reflections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { id: 'empathetic', label: 'Empathetic & Warm', desc: 'Deep emotional validation, gentle listening, and supportive warmth.' },
              { id: 'gentle', label: 'Gentle & Calming', desc: 'Soft grounding reminders, breathing cues, and quiet presence.' },
              { id: 'reflective', label: 'Reflective & Inquisitive', desc: 'Thought-provoking questions to help untangle inner feelings.' },
              { id: 'direct', label: 'Structured & Actionable', desc: 'Clear step-by-step coping strategies and somatic exercises.' }
            ].map(style => {
              const isSelected = communicationStyle === style.id;
              return (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => setCommunicationStyle(style.id as any)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E8F5E9] border-[#2D6A4F] shadow-xs'
                      : 'bg-[#fafcfb] hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className={`text-xs ${isSelected ? 'text-[#1B4332]' : 'text-slate-800'}`}>
                      {style.label}
                    </strong>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {style.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Reminder & Notifications */}
        <div className="space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <label className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#2D6A4F]" />
              <span>Daily Reflection Reminders</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-xs text-slate-800 block">Daily Check-in Reminder</strong>
                <span className="text-[11px] text-slate-500">Gentle notification to reflect once a day</span>
              </div>
              <input
                type="checkbox"
                checked={dailyReminderEnabled}
                onChange={e => setDailyReminderEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#2D6A4F] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-xs text-slate-800 block">Preferred Reminder Time</strong>
                <span className="text-[11px] text-slate-500">Time of day for your sanctuary pause</span>
              </div>
              <input
                type="time"
                value={dailyReminderTime}
                onChange={e => setDailyReminderTime(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>
        </div>

        {/* Submit Preferences */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Preferences...' : 'Save All Preferences'}</span>
          </button>
        </div>

      </form>

      {/* Data Privacy & Sanctuary Management Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
            <span>Confidentiality & Data Ownership Controls</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your mental health data belongs solely to you. You can export or clear your reflections anytime.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#E8F5E9] border border-slate-200 text-[#2D6A4F] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Sanctuary Reflections (JSON)</span>
          </button>

          <button
            onClick={handleClearChatHistory}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 hover:text-rose-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Reset All Conversation History</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default SettingsSection;
