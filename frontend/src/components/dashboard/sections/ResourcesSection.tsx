import React, { useState } from 'react';
import { 
  PhoneCall, 
  Copy, 
  Check, 
  ShieldAlert, 
  BookOpen, 
  UserCheck
} from 'lucide-react';

export const ResourcesSection: React.FC = () => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const copyToClipboard = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const hotlines = [
    {
      country: 'India (National)',
      name: 'KIRAN Mental Health Helpline',
      number: '1800-599-0019',
      hours: '24/7 Toll-Free',
      languages: 'Hindi, English, Tamil, Telugu, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Kannada, Odia, Assamese, Urdu'
    },
    {
      country: 'India (Tele-MANAS)',
      name: 'National Tele-Mental Health Programme',
      number: '14416',
      hours: '24/7 Free Support',
      languages: '20+ Regional Indian Languages'
    },
    {
      country: 'United States & Canada',
      name: 'Suicide & Crisis Lifeline',
      number: '988',
      hours: '24/7 Call or Text',
      languages: 'English, Spanish'
    },
    {
      country: 'United Kingdom',
      name: 'Samaritans Emotional Support',
      number: '116 123',
      hours: '24/7 Free Call',
      languages: 'English'
    }
  ];

  const therapistDirectory = [
    {
      name: 'Dr. Anita Desai, Ph.D.',
      specialty: 'Cognitive Behavioral Therapy (CBT) & Anxiety',
      experience: '12+ Years Experience',
      location: 'Virtual Telehealth & Mumbai',
      rating: '4.9 ★ (120+ reviews)'
    },
    {
      name: 'David Miller, LMFT',
      specialty: 'Mindfulness-Based Stress Reduction (MBSR)',
      experience: '9+ Years Experience',
      location: 'Virtual Telehealth & Bangalore',
      rating: '4.8 ★ (85+ reviews)'
    },
    {
      name: 'Dr. Priya Sharma, MD',
      specialty: 'Trauma-Informed Care & Emotional Regulation',
      experience: '15+ Years Experience',
      location: 'Virtual Telehealth & Delhi NCR',
      rating: '5.0 ★ (210+ reviews)'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Crisis Alert Banner */}
      <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-rose-800 font-black text-base">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Immediate Crisis & Safety Support</span>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed max-w-2xl">
          If you or someone you know is in immediate emotional distress, facing severe overwhelming thoughts, or in danger of self-harm, please reach out to trusted professionals right now. Compassionate, confidential help is available 24/7 at zero cost.
        </p>

        {/* Hotlines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {hotlines.map(h => (
            <div
              key={h.name}
              className="p-4 bg-white rounded-2xl border border-rose-200/80 shadow-xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider block">
                  {h.country}
                </span>
                <strong className="text-slate-900 block font-bold">{h.name}</strong>
                <span className="text-[11px] text-slate-500 font-mono block">
                  {h.hours} • {h.languages}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <a
                  href={`tel:${h.number.replace(/[^0-9]/g, '')}`}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{h.number}</span>
                </a>

                <button
                  onClick={() => copyToClipboard(h.number)}
                  className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedNumber === h.number ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy number</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Licensed Professional Directory */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#1B4332] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#2D6A4F]" />
            <span>Licensed Mental Health Practitioner Directory</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Verified Credentials</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {therapistDirectory.map(t => (
            <div
              key={t.name}
              className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200 text-xs space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                <p className="text-[11px] text-[#2D6A4F] font-semibold">{t.specialty}</p>
                <p className="text-[10px] text-slate-500">{t.experience} • {t.location}</p>
                <div className="text-amber-500 text-[11px] font-bold">{t.rating}</div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert(`Connecting with ${t.name} consultation calendar.`)}
                  className="w-full py-2 rounded-xl bg-white hover:bg-[#E8F5E9] border border-slate-200 text-[#2D6A4F] font-bold text-xs transition-all cursor-pointer text-center"
                >
                  View Profile & Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wellness & Psychoeducation Guides */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#1B4332] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2D6A4F]" />
            <span>Curated Psychoeducation Articles & Guides</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Free Reading</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
              Anxiety Relief
            </span>
            <h4 className="font-bold text-slate-800 text-sm">Understanding the Sympathetic Nervous System</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Why your heart races during stressful moments, and how diaphragmatic exhalations physically trigger the vagal brake to signal safety to your brain.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              Cognitive Balance
            </span>
            <h4 className="font-bold text-slate-800 text-sm">Recognizing & Softening Thought Distortions</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Practical techniques from cognitive reframing to challenge catastrophizing and all-or-nothing thinking with gentle curiosity.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResourcesSection;
