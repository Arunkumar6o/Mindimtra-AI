import React, { useState } from 'react';
import { 
  Heart, 
  Compass, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw,
  Activity
} from 'lucide-react';
import { saveActivityLogToDb } from '../../../services/sanctuaryDbService';

interface SelfCareSectionProps {
  user?: { id?: string; email?: string; name?: string } | null;
}

export const SelfCareSection: React.FC<SelfCareSectionProps> = ({ user }) => {
  const userId = user?.id || '00000000-0000-0000-0000-000000000001';

  // 5-4-3-2-1 Grounding interactive step state
  const [groundingStep, setGroundingStep] = useState<number>(0);
  const [groundingAnswers, setGroundingAnswers] = useState<{ [key: number]: string }>({});
  const [isGroundingFinished, setIsGroundingFinished] = useState<boolean>(false);
  const [groundingToast, setGroundingToast] = useState<string>('');

  // Selected quick tool
  const [activeTab, setActiveTab] = useState<'grounding' | 'pmr' | 'defusion'>('grounding');

  const groundingPrompts = [
    {
      num: 5,
      sense: 'Sight',
      title: 'Acknowledge 5 things you can see around you',
      desc: 'Look around your space: Notice a color, a pattern on the wall, the lighting, an object on your desk, or leaves outside.'
    },
    {
      num: 4,
      sense: 'Touch',
      title: 'Notice 4 things you can physically feel',
      desc: 'Feel the fabric of your clothes, the texture of your chair, the cool air on your skin, or your feet grounded on the floor.'
    },
    {
      num: 3,
      sense: 'Sound',
      title: 'Listen for 3 distinct sounds in your environment',
      desc: 'Listen closely: distant traffic, the hum of a fan, birds outside, or your own gentle breath.'
    },
    {
      num: 2,
      sense: 'Smell',
      title: 'Identify 2 scents or aromas nearby',
      desc: 'Notice the smell of fresh tea, clean linen, the room air, or step near a window.'
    },
    {
      num: 1,
      sense: 'Taste',
      title: 'Notice 1 taste or the resting sensation of your mouth',
      desc: 'Take a sip of water, notice the taste of mint, or simply feel the relaxed resting position of your tongue.'
    }
  ];

  const handleFinishGrounding = async () => {
    setIsGroundingFinished(true);
    await saveActivityLogToDb(userId, {
      activitySlug: '5-4-3-2-1-sensory-grounding',
      activityTitle: '5-4-3-2-1 Sensory Grounding Technique',
      durationSeconds: 300,
      userRating: 5,
      userReflection: 'Completed 5-4-3-2-1 sensory grounding. Felt mind tether back to the present moment.'
    });
    setGroundingToast('Grounding exercise completed and saved to your sanctuary logs!');
    setTimeout(() => setGroundingToast(''), 4500);
  };

  const handleResetGrounding = () => {
    setGroundingStep(0);
    setGroundingAnswers({});
    setIsGroundingFinished(false);
  };

  const pmrSteps = [
    { title: 'Hands & Wrists', guidance: 'Clench both fists tightly for 5 seconds. Feel the tension... now release completely. Notice the warm, tingling relaxation spreading into your fingers.' },
    { title: 'Shoulders & Neck', guidance: 'Gently pull your shoulders up toward your ears. Hold for 5 seconds... now let them drop completely. Feel the heavy tension dissolve.' },
    { title: 'Face & Jaw', guidance: 'Scrunch up your eyes and clench your jaw gently. Hold 4 seconds... and let go. Part your lips slightly and let your facial muscles soften.' },
    { title: 'Abdomen & Core', guidance: 'Gently tighten your stomach muscles. Hold for 5 seconds... exhale and release. Let your belly soften and expand naturally.' },
    { title: 'Feet & Toes', guidance: 'Curl your toes downward toward the soles of your feet. Hold for 5 seconds... and relax. Feel peaceful grounding from your toes up.' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#eaf4eb] via-[#f7f5fa] to-[#faeee7] p-6 rounded-3xl border border-[#d8e8dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-bold">
            <Heart className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Somatic Self-Care & Grounding Toolkit</span>
          </div>
          <h2 className="text-2xl font-black text-[#1B4332] tracking-tight">
            Nurture Your Mind & Body
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Evidence-based somatic anchoring protocols to interrupt acute overwhelm, release physical tension, and guide you back to emotional safety.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('grounding')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'grounding'
                ? 'bg-[#2D6A4F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5-4-3-2-1 Sensory
          </button>
          <button
            onClick={() => setActiveTab('pmr')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pmr'
                ? 'bg-[#2D6A4F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Muscle Relaxation
          </button>
        </div>
      </div>

      {groundingToast && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#1B4332] text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>{groundingToast}</span>
        </div>
      )}

      {/* Main Tool Stage */}
      {activeTab === 'grounding' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-[#1B4332] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#2D6A4F]" />
                <span>5-4-3-2-1 Somatic Grounding Exercise</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Step-by-step interactive exercise to anchor racing thoughts through your five physical senses.
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {groundingPrompts.map((p, idx) => (
                <div
                  key={p.num}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    idx === groundingStep
                      ? 'bg-[#2D6A4F] text-white scale-110 shadow-xs'
                      : idx < groundingStep || isGroundingFinished
                      ? 'bg-[#E8F5E9] text-[#2D6A4F] font-bold'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {p.num}
                </div>
              ))}
            </div>
          </div>

          {!isGroundingFinished ? (
            <div className="space-y-6 p-4 sm:p-6 bg-[#fafcfb] rounded-2xl border border-slate-200">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2D6A4F] text-xs font-extrabold">
                  <span>Sense: {groundingPrompts[groundingStep].sense}</span>
                </div>
                <h4 className="text-xl font-black text-slate-800">
                  {groundingPrompts[groundingStep].title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {groundingPrompts[groundingStep].desc}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={groundingAnswers[groundingStep] || ''}
                  onChange={e => setGroundingAnswers({ ...groundingAnswers, [groundingStep]: e.target.value })}
                  placeholder="Type what you notice right now (e.g. green plant, sunlight, sound of AC)..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setGroundingStep(Math.max(0, groundingStep - 1))}
                  disabled={groundingStep === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                >
                  Previous
                </button>

                {groundingStep < groundingPrompts.length - 1 ? (
                  <button
                    onClick={() => setGroundingStep(groundingStep + 1)}
                    className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Next Sense</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinishGrounding}
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer animate-pulse"
                  >
                    <span>Complete Grounding</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-[#E8F5E9] rounded-2xl border border-[#b7e4c7] text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#2D6A4F] mx-auto" />
              <h4 className="text-xl font-black text-[#1B4332]">
                You Are Grounded and Centered.
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                By noticing your immediate physical environment, your brain has disengaged from fight-or-flight mode. Carry this steady calm with you.
              </p>
              <button
                onClick={handleResetGrounding}
                className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repeat Grounding Exercise</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* Progressive Muscle Relaxation */}
      {activeTab === 'pmr' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-[#1B4332] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2D6A4F]" />
              <span>Progressive Muscle Relaxation (PMR)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Systematically tense muscle groups for 5 seconds, then deliberately release to relieve stored physical stress.
            </p>
          </div>

          <div className="space-y-3">
            {pmrSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200 text-xs space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold text-[#1B4332]">
                  <span className="w-6 h-6 rounded-full bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center text-xs font-black shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step.title}</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-8">
                  {step.guidance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default SelfCareSection;
