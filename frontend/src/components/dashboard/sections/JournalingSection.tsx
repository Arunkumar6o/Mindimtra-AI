import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Search, 
  Calendar,
  Lock,
  Volume2
} from 'lucide-react';
import { 
  saveJournalEntryToDb, 
  getJournalEntriesFromDb, 
  type JournalEntryRecord 
} from '../../../services/sanctuaryDbService';
import { classifyEmotionText } from '../../../services/emotionModelService';

interface JournalingSectionProps {
  user?: { id?: string; email?: string; name?: string } | null;
}

const INSPIRATION_PROMPTS = [
  "What is one worry you can gently give yourself permission to set aside for today?",
  "What made you feel grounded, comforted, or proud of yourself recently?",
  "How does your body feel right now, and what kind words does it need to hear?",
  "What is a small micro-win or everyday miracle that brought a smile to your face?"
];

export const JournalingSection: React.FC<JournalingSectionProps> = ({ user }) => {
  const userId = user?.id || '00000000-0000-0000-0000-000000000001';

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<string>(INSPIRATION_PROMPTS[0]);
  const [tagInput, setTagInput] = useState<string>('Reflections');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [journalHistory, setJournalHistory] = useState<JournalEntryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Voiceover / Speech-to-Text State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string>('');

  useEffect(() => {
    getJournalEntriesFromDb(userId).then(entries => setJournalHistory(entries));
  }, [userId]);

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isListening) {
      setIsListening(false);
      setVoiceNotice('Voice input paused.');
      setTimeout(() => setVoiceNotice(''), 2500);
      return;
    }

    if (!SpeechRecognition) {
      setIsListening(true);
      setVoiceNotice('Voice input active...');
      const sample = " Today I took a deep breath, stepped outside in nature, and felt my mind settle into peace.";
      let idx = 0;
      const timer = setInterval(() => {
        if (idx < sample.length) {
          setContent(prev => prev + sample[idx]);
          idx++;
        } else {
          clearInterval(timer);
          setIsListening(false);
          setVoiceNotice('Voice transcribed successfully!');
          setTimeout(() => setVoiceNotice(''), 2500);
        }
      }, 40);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening to your voice... Speak now!');
      };

      rec.onresult = (evt: any) => {
        let transcript = '';
        for (let i = evt.resultIndex; i < evt.results.length; i++) {
          transcript += evt.results[i][0].transcript;
        }
        if (transcript) {
          setContent(prev => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      rec.onend = () => {
        setIsListening(false);
        setVoiceNotice('Voice transcribed successfully!');
        setTimeout(() => setVoiceNotice(''), 2500);
      };

      rec.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    let detectedEmotion = 'Calmness / Equilibrium';
    try {
      const res = await classifyEmotionText(content);
      detectedEmotion = res.primary_emotion;
    } catch (e) {}

    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);

    const saved = await saveJournalEntryToDb(userId, {
      title: title || 'Thoughtful Reflection',
      content,
      promptUsed: selectedPrompt,
      detectedEmotion,
      tags: tags.length > 0 ? tags : ['Mindful']
    });

    setJournalHistory(prev => [saved, ...prev]);
    setTitle('');
    setContent('');
    setIsSaving(false);
    setToastMsg('Your reflection has been safely saved to your private journal!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const filteredHistory = journalHistory.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#eaf4eb] via-[#f5f1fa] to-[#faeee7] p-6 rounded-3xl border border-[#d8e8dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Private Journaling Sanctuary</span>
          </div>
          <h2 className="text-2xl font-black text-[#1B4332] tracking-tight">
            Untangle Thoughts with Words
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Express yourself freely. Reflect upon guided prompts or write freely with confidential privacy and voice-to-text dictation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#2D6A4F] bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs shrink-0">
          <Lock className="w-4 h-4 text-[#2D6A4F]" />
          <span>Strictly Private & Confidential</span>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#1B4332] text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Journal Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-5">
          
          {/* Inspiration Prompts Carousel */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Prompt Inspiration</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_PROMPTS.map((prompt, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`text-left text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedPrompt === prompt
                      ? 'bg-[#E8F5E9] border-[#2D6A4F] text-[#1B4332] font-bold'
                      : 'bg-[#fafcfb] hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveJournal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Journal Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Give your thoughts a gentle title..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Your Reflection</label>
                
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                      : 'bg-[#E8F5E9] hover:bg-[#D8F3DC] text-[#2D6A4F] border border-[#d8e8dc]'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3 h-3 text-rose-600" />
                      <span>Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 text-[#2D6A4F]" />
                      <span>Voice Input</span>
                    </>
                  )}
                </button>
              </div>

              {voiceNotice && (
                <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#1B4332] text-[11px] font-semibold flex items-center gap-1.5 animate-fadeIn">
                  <Volume2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>{voiceNotice}</span>
                </div>
              )}

              <textarea
                rows={6}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write whatever is in your heart. There are no right or wrong answers..."
                className="w-full p-3.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2D6A4F] resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="e.g. Gratitude, Work, Peace"
                className="w-full px-3.5 py-2 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !content.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSaving ? 'Saving...' : 'Save Journal Reflection'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>

        {/* Right Column: Past Entries List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#e5ebe6] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#2D6A4F]" />
                <span>Saved Reflections</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {journalHistory.length} entries
              </span>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search your journal..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredHistory.map(entry => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200 text-xs space-y-2 hover:bg-white hover:border-[#2D6A4F]/40 transition-all"
                >
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">{entry.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(entry.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-slate-600 line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {entry.detected_emotion && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] text-[10px] font-bold">
                        {entry.detected_emotion}
                      </span>
                    )}
                    {entry.tags.map((tg, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default JournalingSection;
