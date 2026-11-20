import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Headphones, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Compass, 
  CheckCircle2, 
  Leaf, 
  Sun, 
  Activity, 
  Clock, 
  Feather, 
  HeartHandshake, 
  Check, 
  Lightbulb, 
  LayoutDashboard
} from 'lucide-react';
import { saveActivityLogToDb } from '../../../services/sanctuaryDbService';

interface WellnessActivitiesSectionProps {
  user?: { id?: string; email?: string; name?: string } | null;
  onNavigateHome?: () => void;
}

type ActivityTab = 'soundscapes' | 'gratitude' | 'worry-vault' | 'somatic' | 'nature' | 'mantras';

interface SoundPreset {
  id: string;
  title: string;
  subtitle: string;
  baseFreq: number;
  beatFreq: number;
  tag: string;
  color: string;
  description: string;
  noiseType?: 'pink' | 'none';
}

const SOUND_PRESETS: SoundPreset[] = [
  {
    id: 'alpha-calm',
    title: 'Alpha Flow & Cortisol Relief',
    subtitle: '432 Hz Solfeggio + 10 Hz Alpha Wave',
    baseFreq: 432,
    beatFreq: 10,
    tag: 'Stress & Anxiety Relief',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800',
    description: '432 Hz harmonizes with natural biological rhythms while 10 Hz Alpha waves induce relaxed mental presence without drowsiness.'
  },
  {
    id: 'theta-healing',
    title: 'Theta Emotional Reset',
    subtitle: '528 Hz Healing Tone + 6 Hz Theta Wave',
    baseFreq: 528,
    beatFreq: 6,
    tag: 'Emotional Release & Deep Calm',
    color: 'from-purple-500/10 to-indigo-500/10 border-purple-200 text-purple-800',
    description: 'Known as the transformation frequency, 528 Hz combined with 6 Hz Theta rhythms quiets racing subconscious anxiety.'
  },
  {
    id: 'delta-sleep',
    title: 'Delta Somatic Unwinding',
    subtitle: '174 Hz Grounding + 2.5 Hz Delta Wave',
    baseFreq: 174,
    beatFreq: 2.5,
    tag: 'Pre-Sleep & Body Tension',
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-200 text-blue-800',
    description: '174 Hz provides low-frequency somatic grounding while 2.5 Hz Delta waves slow neural oscillations for restorative sleep.'
  },
  {
    id: 'pink-waterfall',
    title: 'Pink Noise Waterfall',
    subtitle: 'Soft Acoustic Spectral Rain',
    baseFreq: 220,
    beatFreq: 0,
    tag: 'Thought Quieting & Focus',
    color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-800',
    noiseType: 'pink',
    description: 'Balanced frequency distribution mimics gentle rainfall, blocking background noise and quieting intrusive thoughts.'
  }
];

export const WellnessActivitiesSection: React.FC<WellnessActivitiesSectionProps> = ({ 
  user,
  onNavigateHome 
}) => {
  const userId = user?.id || '00000000-0000-0000-0000-000000000001';
  const [activeTab, setActiveTab] = useState<ActivityTab>('soundscapes');
  const [toastMessage, setToastMessage] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // =========================================================================
  // 1. SOUND THERAPY & BINAURAL BEATS ENGINE (Web Audio API)
  // =========================================================================
  const [selectedSound, setSelectedSound] = useState<SoundPreset>(SOUND_PRESETS[0]);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [soundVolume, setSoundVolume] = useState<number>(0.4);
  const [soundDurationMin, setSoundDurationMin] = useState<number>(5);
  const [soundTimeLeft, setSoundTimeLeft] = useState<number>(300);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscLeftRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Timer countdown for soundscape
  useEffect(() => {
    let interval: any = null;
    if (isPlayingSound && soundTimeLeft > 0) {
      interval = setInterval(() => {
        setSoundTimeLeft(prev => {
          if (prev <= 1) {
            stopAudio();
            saveActivityLogToDb(userId, {
              activitySlug: 'binaural-soundscape-completed',
              activityTitle: `Sound Sanctuary: ${selectedSound.title}`,
              durationSeconds: soundDurationMin * 60,
              userRating: 5,
              userReflection: 'Completed audio frequency sound therapy session.'
            });
            triggerToast('Sound session completed! Well done taking time for your nervous system.');
            return soundDurationMin * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingSound, soundTimeLeft, soundDurationMin, selectedSound, userId]);

  const stopAudio = () => {
    try {
      if (oscLeftRef.current) {
        oscLeftRef.current.stop();
        oscLeftRef.current.disconnect();
        oscLeftRef.current = null;
      }
      if (oscRightRef.current) {
        oscRightRef.current.stop();
        oscRightRef.current.disconnect();
        oscRightRef.current = null;
      }
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    } catch (e) {}
    setIsPlayingSound(false);
  };

  const startAudio = async (preset: SoundPreset) => {
    stopAudio();

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(soundVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (preset.noiseType === 'pink') {
        // Generate soothing pink/brown noise
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(800, ctx.currentTime);

        noiseSource.connect(lowpass);
        lowpass.connect(masterGain);
        noiseSource.start();
        noiseSourceRef.current = noiseSource;
      } else {
        // Binaural stereo synthesis
        const merger = ctx.createChannelMerger(2);

        // Left Ear
        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(preset.baseFreq, ctx.currentTime);
        const gainL = ctx.createGain();
        gainL.gain.setValueAtTime(0.5, ctx.currentTime);
        oscL.connect(gainL);
        gainL.connect(merger, 0, 0);

        // Right Ear (Base + Beat Frequency)
        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(preset.baseFreq + preset.beatFreq, ctx.currentTime);
        const gainR = ctx.createGain();
        gainR.gain.setValueAtTime(0.5, ctx.currentTime);
        oscR.connect(gainR);
        gainR.connect(merger, 0, 1);

        merger.connect(masterGain);

        oscL.start();
        oscR.start();
        oscLeftRef.current = oscL;
        oscRightRef.current = oscR;
      }

      setIsPlayingSound(true);
    } catch (err) {
      console.warn('Audio playback error:', err);
      setIsPlayingSound(false);
    }
  };

  const handleToggleSound = () => {
    if (isPlayingSound) {
      stopAudio();
    } else {
      startAudio(selectedSound);
    }
  };

  const handleSelectSound = (preset: SoundPreset) => {
    setSelectedSound(preset);
    if (isPlayingSound) {
      startAudio(preset);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setSoundVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // =========================================================================
  // 2. GRATITUDE MATRIX & POSITIVE NEUROPLASTICITY (Three Good Things)
  // =========================================================================
  const gratitudePrompts = [
    'A tiny comfort you experienced today (e.g. warm tea, a comfortable chair, gentle light)',
    'A person who treated you with kindness, patience, or a warm smile',
    'A challenge or stressful moment that you navigated with strength and calm',
    'A small personal victory or effort you are quietly proud of',
    'Something in nature or your environment that brought a moment of wonder',
    'A favorite memory or melody that brought peace to your heart'
  ];

  const [promptIndex, setPromptIndex] = useState(0);
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [selectedTag, setSelectedTag] = useState('Peace & Calm');
  const [gratitudeSaved, setGratitudeSaved] = useState(false);

  const handleSaveGratitude = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitude1.trim() && !gratitude2.trim() && !gratitude3.trim()) {
      triggerToast('Please write at least one positive reflection before saving.');
      return;
    }

    const reflectionText = `1: ${gratitude1} | 2: ${gratitude2} | 3: ${gratitude3} [Tag: ${selectedTag}]`;

    await saveActivityLogToDb(userId, {
      activitySlug: 'three-good-things-gratitude',
      activityTitle: 'Positive Neuroplasticity: Three Good Things',
      durationSeconds: 180,
      userRating: 5,
      userReflection: reflectionText
    });

    setGratitudeSaved(true);
    triggerToast('Gratitude entries saved! Celebrating your positive neuroplasticity step.');
    setTimeout(() => setGratitudeSaved(false), 5000);
  };

  // =========================================================================
  // 3. CBT DE-CATASTROPHIZING WORRY VAULT
  // =========================================================================
  const [worryThought, setWorryThought] = useState('');
  const [worryWorstCase, setWorryWorstCase] = useState('');
  const [worryRealisticOutcome, setWorryRealisticOutcome] = useState('');
  const [worryControlAction, setWorryControlAction] = useState('');
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [vaultTimerHours, setVaultTimerHours] = useState(24);

  const handleLockVault = async () => {
    if (!worryThought.trim()) {
      triggerToast('Please write down the catastrophic or looping thought to contain it.');
      return;
    }

    setIsVaultLocked(true);
    await saveActivityLogToDb(userId, {
      activitySlug: 'cbt-decatastrophizing-vault',
      activityTitle: 'CBT Worry Containerization & Decatastrophizing',
      durationSeconds: 240,
      userRating: 5,
      userReflection: `Contained worry: "${worryThought}". Reframed realistic outcome: "${worryRealisticOutcome}".`
    });

    triggerToast('Worry sealed in the vault! Your mind has permission to rest from this thought.');
  };

  const handleUnlockVault = () => {
    setIsVaultLocked(false);
  };

  // =========================================================================
  // 4. SOMATIC RESET & VAGUS NERVE ACTIVATION
  // =========================================================================
  const [somaticMode, setSomaticMode] = useState<'sigh' | 'shake' | 'ear' | 'butterfly'>('sigh');
  const [sighRound, setSighRound] = useState(1);
  const [sighPhase, setSighPhase] = useState<'inhale1' | 'inhale2' | 'exhale'>('inhale1');
  const [isSighRunning, setIsSighRunning] = useState(false);

  // Shake timer
  const [shakeSecondsLeft, setShakeSecondsLeft] = useState(45);
  const [isShakeRunning, setIsShakeRunning] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (isShakeRunning && shakeSecondsLeft > 0) {
      timer = setInterval(() => {
        setShakeSecondsLeft(s => {
          if (s <= 1) {
            setIsShakeRunning(false);
            triggerToast('45-second adrenaline release complete! Notice the light warmth in your limbs.');
            return 45;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isShakeRunning, shakeSecondsLeft]);

  // Physiological sigh animation timer
  useEffect(() => {
    let t: any = null;
    if (isSighRunning) {
      if (sighPhase === 'inhale1') {
        t = setTimeout(() => setSighPhase('inhale2'), 3000);
      } else if (sighPhase === 'inhale2') {
        t = setTimeout(() => setSighPhase('exhale'), 1500);
      } else if (sighPhase === 'exhale') {
        t = setTimeout(() => {
          if (sighRound >= 5) {
            setIsSighRunning(false);
            setSighRound(1);
            setSighPhase('inhale1');
            saveActivityLogToDb(userId, {
              activitySlug: 'physiological-sigh-vagus-reset',
              activityTitle: 'Physiological Sigh Vagus Nerve Reset (5 Rounds)',
              durationSeconds: 120,
              userRating: 5,
              userReflection: 'Completed 5 rounds of physiological sighs to balance autonomic tone.'
            });
            triggerToast('Physiological sigh complete! Heart rate slowed and autonomic balance restored.');
          } else {
            setSighRound(r => r + 1);
            setSighPhase('inhale1');
          }
        }, 6000);
      }
    }
    return () => clearTimeout(t);
  }, [isSighRunning, sighPhase, sighRound, userId]);

  // =========================================================================
  // 5. SHINRIN-YOKU / MINDFUL WALKING JOURNEY
  // =========================================================================
  const natureSteps = [
    {
      num: 1,
      title: 'Ground & Heel Rhythm',
      cue: 'Notice the texture beneath your feet with every gentle step. Feel gravity safely tethering your body to the earth.',
      durationSec: 60
    },
    {
      num: 2,
      title: 'Peripheral Visual Softening',
      cue: 'Soften your gaze. Expand your vision to notice leaf patterns, tree shadows, the movement of light, and the sky above.',
      durationSec: 60
    },
    {
      num: 3,
      title: 'Acoustic Attunement',
      cue: 'Listen closely to distant birdsong, the rustling of wind through branches, or ambient air flow without judging the sounds.',
      durationSec: 60
    },
    {
      num: 4,
      title: 'Phytoncide Deep Inhalation',
      cue: 'Take 4 slow breaths through your nose. Inhale the fresh organic scent of greenery, damp earth, or ambient open breeze.',
      durationSec: 60
    }
  ];

  const [activeNatureStep, setActiveNatureStep] = useState(0);
  const [isNatureWalkActive, setIsNatureWalkActive] = useState(false);
  const [natureStepSeconds, setNatureStepSeconds] = useState(60);

  useEffect(() => {
    let interval: any = null;
    if (isNatureWalkActive && natureStepSeconds > 0) {
      interval = setInterval(() => {
        setNatureStepSeconds(sec => {
          if (sec <= 1) {
            if (activeNatureStep < natureSteps.length - 1) {
              setActiveNatureStep(s => s + 1);
              return 60;
            } else {
              setIsNatureWalkActive(false);
              saveActivityLogToDb(userId, {
                activitySlug: 'shinrin-yoku-forest-walk',
                activityTitle: 'Shinrin-Yoku Sensory Nature Walk Protocol',
                durationSeconds: 240,
                userRating: 5,
                userReflection: 'Completed 4-phase sensory nature connection exercise.'
              });
              triggerToast('Shinrin-Yoku nature walk complete! Mind cleansed and sensory grounding integrated.');
              return 60;
            }
          }
          return sec - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isNatureWalkActive, natureStepSeconds, activeNatureStep, userId, natureSteps.length]);

  // =========================================================================
  // 6. EMPOWERING COGNITIVE MANTRAS & AFFIRMATION MOSAIC
  // =========================================================================
  const mantrasList = [
    {
      category: 'Anxiety & Panic',
      mantra: 'This sensation is uncomfortable, but it is not dangerous. My body knows how to return to calm.',
      groundingCue: 'Rest one hand over your heart and exhale slowly.',
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
    },
    {
      category: 'Burnout & Overwhelm',
      mantra: 'I do not have to solve everything today. Resting is not quitting; it is an essential part of my vitality.',
      groundingCue: 'Drop your shoulders down 2 inches right now.',
      color: 'border-teal-200 bg-teal-50/50 text-teal-900'
    },
    {
      category: 'Self-Doubt & Critic',
      mantra: 'I speak to myself with the gentle patience I would offer a dear friend in distress.',
      groundingCue: 'Unclench your teeth and soften your forehead.',
      color: 'border-purple-200 bg-purple-50/50 text-purple-900'
    },
    {
      category: 'Courage & Boundaries',
      mantra: 'My peace of mind is worth protecting. Saying no to overwhelm is saying yes to my well-being.',
      groundingCue: 'Feel your feet firmly pressed against the floor.',
      color: 'border-amber-200 bg-amber-50/50 text-amber-900'
    }
  ];

  const [pinnedMantra, setPinnedMantra] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn bg-[#1B4332] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500/40 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#eaf4eb] via-[#f4f7f4] to-[#faeee7] p-6 sm:p-8 rounded-3xl border border-[#d8e8dc] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Therapeutic Mental Wellness Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B4332] tracking-tight">
            Evidence-Based Mental Health Activities
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Clinically supported somatic, neuro-acoustic, and cognitive exercises designed to calm your sympathetic nervous system, rewire negative emotional loops, and restore inner equilibrium.
          </p>
        </div>

        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="self-start md:self-center px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-[#2D6A4F]" />
            <span>Dashboard</span>
          </button>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex bg-[#f4f7f5] p-1.5 rounded-2xl border border-slate-200 overflow-x-auto gap-1">
        {[
          { id: 'soundscapes', label: 'Binaural Audio Sanctuary', icon: Headphones },
          { id: 'gratitude', label: 'Gratitude & Savoring', icon: HeartHandshake },
          { id: 'worry-vault', label: 'CBT Worry Vault', icon: Lock },
          { id: 'somatic', label: 'Somatic & Vagus Reset', icon: Activity },
          { id: 'nature', label: 'Shinrin-Yoku Nature Walk', icon: Leaf },
          { id: 'mantras', label: 'Affirmation Mosaic', icon: Sun },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActivityTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2D6A4F] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: BINAURAL BEATS & SOUND FREQUENCY SANCTUARY                     */}
      {/* ==================================================================== */}
      {activeTab === 'soundscapes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D6A4F] uppercase tracking-wide">
                <Headphones className="w-4 h-4 text-[#2D6A4F]" />
                <span>Neuro-Acoustic Frequency Synthesizer</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mt-1">
                Binaural & Solfeggio Sound Therapy
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Headphones recommended. Generates exact target brainwave rhythms in real time right in your browser.
              </p>
            </div>

            {/* Play/Pause Main Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSound}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                  isPlayingSound
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20'
                    : 'bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-emerald-900/20'
                }`}
              >
                {isPlayingSound ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Soundscape</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Frequency Playback</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Preset Visualizer Strip */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#f4f9f5] via-[#faf8f4] to-[#f7f5fa] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[#2D6A4F]">
                Active Track: {selectedSound.tag}
              </span>
              <h3 className="text-base font-extrabold text-slate-800">
                {selectedSound.title}
              </h3>
              <p className="text-xs text-slate-500 max-w-lg">
                {selectedSound.description}
              </p>
            </div>

            {/* Live Animated Frequency Visualizer Bars */}
            <div className="flex items-end gap-1.5 h-10 px-4 py-2 bg-white rounded-2xl border border-slate-200">
              {[40, 75, 55, 90, 60, 80, 45, 95, 70, 50, 85, 65].map((height, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    isPlayingSound ? 'bg-[#2D6A4F] animate-pulse' : 'bg-slate-300'
                  }`}
                  style={{
                    height: isPlayingSound ? `${height}%` : '20%',
                    animationDelay: `${i * 80}ms`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Sound Preset Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SOUND_PRESETS.map((preset) => {
              const isSelected = selectedSound.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectSound(preset)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#2D6A4F] bg-[#E8F5E9] shadow-xs'
                      : 'border-slate-200 bg-[#fafcfb] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-100">
                      {preset.noiseType ? 'Nature Noise' : `${preset.beatFreq} Hz Beat`}
                    </span>
                    {isSelected && isPlayingSound && (
                      <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-ping" />
                    )}
                  </div>
                  <h4 className="text-xs font-black text-slate-800 mt-2">
                    {preset.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {preset.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Volume & Session Duration Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div className="p-4 rounded-2xl bg-[#f8faf8] border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                {soundVolume === 0 ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#2D6A4F]" />}
                <span>Volume: {Math.round(soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-32 accent-[#2D6A4F] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#f8faf8] border border-slate-200 flex items-center justify-between gap-3">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2D6A4F]" />
                Timer: {Math.floor(soundTimeLeft / 60)}:{(soundTimeLeft % 60).toString().padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1">
                {[3, 5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setSoundDurationMin(mins);
                      setSoundTimeLeft(mins * 60);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                      soundDurationMin === mins
                        ? 'bg-[#2D6A4F] text-white'
                        : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: GRATITUDE & THREE GOOD THINGS (Positive Neuroplasticity)       */}
      {/* ==================================================================== */}
      {activeTab === 'gratitude' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D6A4F] uppercase tracking-wide">
                <HeartHandshake className="w-4 h-4 text-[#2D6A4F]" />
                <span>Dr. Martin Seligman Positive Psychology Protocol</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mt-1">
                Three Good Things & Daily Savoring Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reflecting on 3 specific positive moments physically shifts cognitive attention away from threat monitoring.
              </p>
            </div>

            <button
              onClick={() => setPromptIndex((prev) => (prev + 1) % gratitudePrompts.length)}
              className="px-3.5 py-2 rounded-xl bg-[#E8F5E9] hover:bg-[#d8edd9] text-[#2D6A4F] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Shuffle Idea</span>
            </button>
          </div>

          {/* Inspiration Prompt Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/40 to-yellow-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="space-y-0.5">
              <strong className="block font-black text-amber-950">Inspiration Cue for Today:</strong>
              <p>{gratitudePrompts[promptIndex]}</p>
            </div>
          </div>

          <form onSubmit={handleSaveGratitude} className="space-y-4">
            <div className="space-y-3">
              {/* Item 1 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-[10px] font-black">1</span>
                  <span>A positive event or kindness you noticed:</span>
                </label>
                <input
                  type="text"
                  value={gratitude1}
                  onChange={(e) => setGratitude1(e.target.value)}
                  placeholder="e.g. My coworker offered helpful advice on my task without being asked..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F] transition-all"
                />
              </div>

              {/* Item 2 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-[10px] font-black">2</span>
                  <span>A small comfort or sensory pleasure:</span>
                </label>
                <input
                  type="text"
                  value={gratitude2}
                  onChange={(e) => setGratitude2(e.target.value)}
                  placeholder="e.g. Feeling the warm morning sun and sipping fresh green tea..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F] transition-all"
                />
              </div>

              {/* Item 3 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-[10px] font-black">3</span>
                  <span>Something difficult that you handled with patience:</span>
                </label>
                <input
                  type="text"
                  value={gratitude3}
                  onChange={(e) => setGratitude3(e.target.value)}
                  placeholder="e.g. Even though my commute was delayed, I stayed calm and practiced slow breathing..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F] transition-all"
                />
              </div>
            </div>

            {/* Emotion Tone Selector */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Emotional Resonance:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Peace & Calm', 'Heartfelt Joy', 'Deep Relief', 'Connection', 'Quiet Strength'].map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                        selectedTag === tag
                          ? 'bg-[#2D6A4F] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Reflections to Sanctuary</span>
              </button>
            </div>
          </form>

          {gratitudeSaved && (
            <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#1B4332] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
              <span>Three Good Things successfully recorded in your Sanctuary Logs!</span>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: CBT WORRY RELEASE VAULT                                        */}
      {/* ==================================================================== */}
      {activeTab === 'worry-vault' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#7B1FA2] uppercase tracking-wide">
                <Lock className="w-4 h-4 text-[#7B1FA2]" />
                <span>CBT Cognitive Decatastrophizing Container</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mt-1">
                The Worry Release Vault
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compartmentalize repetitive what-if rumination. Lock looping thoughts away so your executive brain can disengage.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-purple-50 text-[#7B1FA2] text-xs font-extrabold border border-purple-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Private & Encrypted
            </span>
          </div>

          {!isVaultLocked ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  1. What catastrophic or looping thought is bothering you right now?
                </label>
                <textarea
                  rows={2}
                  value={worryThought}
                  onChange={(e) => setWorryThought(e.target.value)}
                  placeholder="e.g. I am worried I will completely fail my upcoming presentation and ruin my reputation..."
                  className="w-full p-3.5 rounded-2xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7B1FA2] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    2. Worst-case scenario & survival:
                  </label>
                  <textarea
                    rows={2}
                    value={worryWorstCase}
                    onChange={(e) => setWorryWorstCase(e.target.value)}
                    placeholder="e.g. Someone asks a hard question. Even if I say I will check, life goes on."
                    className="w-full p-3 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7B1FA2] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    3. Most realistic & balanced outcome:
                  </label>
                  <textarea
                    rows={2}
                    value={worryRealisticOutcome}
                    onChange={(e) => setWorryRealisticOutcome(e.target.value)}
                    placeholder="e.g. I may stumble on a word, but the team cares about the content. I have prepared enough."
                    className="w-full p-3 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7B1FA2] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    4. 1 small action you control today:
                  </label>
                  <textarea
                    rows={2}
                    value={worryControlAction}
                    onChange={(e) => setWorryControlAction(e.target.value)}
                    placeholder="e.g. Review slide 3 once, then take a full evening rest to arrive refreshed."
                    className="w-full p-3 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#7B1FA2] transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Vault Lock Duration:</span>
                  <select
                    value={vaultTimerHours}
                    onChange={(e) => setVaultTimerHours(parseInt(e.target.value))}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-800 cursor-pointer text-xs"
                  >
                    <option value={12}>12 Hours (Until Tonight)</option>
                    <option value={24}>24 Hours (Full Tomorrow Cycle)</option>
                    <option value={48}>48 Hours (Weekend Release)</option>
                  </select>
                </div>

                <button
                  onClick={handleLockVault}
                  className="px-6 py-2.5 rounded-2xl bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Lock Worry in the Vault</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-50/50 to-slate-50 border border-purple-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#7B1FA2] text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-900/20 animate-bounce">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-800">
                  Worry Contained & Sealed
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your worry has been safely filed into the vault for the next {vaultTimerHours} hours. You do not need to keep actively thinking about it right now.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 max-w-md mx-auto text-left text-xs space-y-1">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Contained Narrative:</span>
                <p className="italic text-slate-700">"{worryThought}"</p>
                {worryRealisticOutcome && (
                  <p className="text-[#2D6A4F] font-semibold pt-1 border-t border-slate-100 mt-2">
                    Anchor: {worryRealisticOutcome}
                  </p>
                )}
              </div>

              <button
                onClick={handleUnlockVault}
                className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Open Vault to Edit</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: SOMATIC RESET & VAGUS NERVE ACTIVATION                         */}
      {/* ==================================================================== */}
      {activeTab === 'somatic' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#E65100] uppercase tracking-wide">
                <Activity className="w-4 h-4 text-[#E65100]" />
                <span>Polyvagal & Autonomic Nervous System Regulation</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mt-1">
                Somatic Vagus Nerve De-escalation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical biological actions that instantly send safety signals to your brainstem and heart.
              </p>
            </div>

            {/* Sub-modes */}
            <div className="flex bg-[#fafcfb] p-1 rounded-xl border border-slate-200 text-xs">
              {[
                { id: 'sigh', label: 'Physiological Sigh' },
                { id: 'shake', label: 'Tension Shaking' },
                { id: 'ear', label: 'Vagus Ear Massage' },
                { id: 'butterfly', label: 'Butterfly Hug' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setSomaticMode(m.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    somaticMode === m.id
                      ? 'bg-[#E65100] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode 1: Physiological Sigh */}
          {somaticMode === 'sigh' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-orange-50/50 to-white border border-orange-200 text-center space-y-6">
              <div className="space-y-1 max-w-lg mx-auto">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#E65100] border border-orange-200">
                  Stanford Neurobiology Protocol
                </span>
                <h3 className="text-lg font-black text-slate-800">
                  Double Inhale + Extended Sigh
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Two quick inhales pop open collapsed alveoli in the lungs, followed by an extended sigh that removes trapped CO2 and rapidly slows heart rate.
                </p>
              </div>

              {/* Animated Pacer Circle */}
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                    sighPhase === 'inhale1'
                      ? 'scale-90 bg-orange-200/60'
                      : sighPhase === 'inhale2'
                      ? 'scale-105 bg-orange-300/80 shadow-lg'
                      : 'scale-75 bg-emerald-200/70'
                  }`}
                />
                <div className="relative z-10 text-center space-y-1">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    {sighPhase === 'inhale1'
                      ? 'Inhale Nose (Deep)'
                      : sighPhase === 'inhale2'
                      ? 'Top-Off Inhale'
                      : 'Slow Long Sigh'}
                  </span>
                  <span className="text-2xl font-black text-[#E65100] block">
                    Round {sighRound} / 5
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsSighRunning(!isSighRunning)}
                  className="px-6 py-2.5 rounded-2xl bg-[#E65100] hover:bg-[#D84315] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSighRunning ? 'Stop Guided Sigh' : 'Start 5-Round Sigh Session'}
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Tension Shaking */}
          {somaticMode === 'shake' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-50/50 to-white border border-amber-200 text-center space-y-6">
              <div className="space-y-1 max-w-lg mx-auto">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white text-amber-800 border border-amber-200">
                  Neurogenic Adrenaline Discharge
                </span>
                <h3 className="text-lg font-black text-slate-800">
                  45-Second Tension Release Shake
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Animals instinctively shake after high-stress encounters to metabolize adrenaline. Stand softly, drop your jaw, and gently shake out your hands, shoulders, and legs.
                </p>
              </div>

              <div className="w-28 h-28 rounded-full bg-amber-500/10 border-4 border-amber-400 flex items-center justify-center mx-auto text-3xl font-black text-amber-900">
                {shakeSecondsLeft}s
              </div>

              <div>
                <button
                  onClick={() => setIsShakeRunning(!isShakeRunning)}
                  className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isShakeRunning ? 'Pause Shake' : 'Start 45s Shaking Timer'}
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Vagus Ear Massage */}
          {somaticMode === 'ear' && (
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-800">
                Auricular Vagus Nerve Stimulation Guide
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                The ear is the only place on the human body surface where the Vagus Nerve has sensory skin branches (the Cymba Conchae).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <span className="font-extrabold text-[#2D6A4F]">1. Inner Ear Hollow</span>
                  <p className="text-slate-600">Use your index fingertip to gently trace small circles in the hollow right above your ear canal for 30s.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <span className="font-extrabold text-[#2D6A4F]">2. Ear Lobe Traction</span>
                  <p className="text-slate-600">Gently pinch both earlobes and pull them softly down and outward while taking a slow, deep exhale.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <span className="font-extrabold text-[#2D6A4F]">3. Tragus Warmth</span>
                  <p className="text-slate-600">Gently rub the small cartilage flap in front of your ear. Notice the soothing warmth spread to your neck.</p>
                </div>
              </div>
            </div>
          )}

          {/* Mode 4: Butterfly Hug */}
          {somaticMode === 'butterfly' && (
            <div className="p-6 rounded-3xl bg-purple-50/50 border border-purple-200 space-y-4">
              <h3 className="text-base font-bold text-purple-950">
                EMDR Bilateral Stimulation Butterfly Hug
              </h3>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Cross your arms over your chest so your hands rest on your opposite collarbones. Alternately tap your left and right hand softly like butterfly wings.
              </p>
              <div className="p-4 rounded-2xl bg-white border border-purple-100 flex items-center justify-between gap-4 text-xs">
                <span className="font-medium text-slate-700">Rhythm: Left... Right... Left... Right (at a resting heartbeat pace)</span>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                  Recommended: 2 Minutes
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: SHINRIN-YOKU NATURE WALK                                       */}
      {/* ==================================================================== */}
      {activeTab === 'nature' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D6A4F] uppercase tracking-wide">
                <Leaf className="w-4 h-4 text-[#2D6A4F]" />
                <span>Japanese Forest Bathing Therapy (Shinrin-Yoku)</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mt-1">
                Mindful Sensory Walking Journey
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Step outside or sit near an open window. Follow these 4 sensory phases to lower cortisol and renew mental focus.
              </p>
            </div>

            <button
              onClick={() => setIsNatureWalkActive(!isNatureWalkActive)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                isNatureWalkActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-[#2D6A4F] hover:bg-[#1B4332] text-white'
              }`}
            >
              {isNatureWalkActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isNatureWalkActive ? 'Pause Walk Pacer' : 'Begin 4-Phase Nature Journey'}</span>
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {natureSteps.map((step, idx) => {
              const isCurrent = activeNatureStep === idx;
              const isDone = activeNatureStep > idx;
              return (
                <div
                  key={step.num}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-[#2D6A4F] bg-[#E8F5E9] shadow-xs'
                      : isDone
                      ? 'border-emerald-200 bg-emerald-50/40 opacity-70'
                      : 'border-slate-200 bg-[#fafcfb]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-[10px] font-black">
                      {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                    </span>
                    {isCurrent && isNatureWalkActive && (
                      <span className="text-[11px] font-black text-[#2D6A4F]">
                        {natureStepSeconds}s
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-slate-800 mt-2">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-3">
                    {step.cue}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-5 rounded-2xl bg-[#f4f9f5] border border-emerald-200/60 text-xs text-slate-700 flex items-center gap-3">
            <Compass className="w-5 h-5 text-[#2D6A4F] shrink-0" />
            <p>
              <strong>Science Note:</strong> Studies show that inhaling natural tree phytoncides increases human Natural Killer (NK) immune cell activity and significantly reduces sympathetic stress markers.
            </p>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: AFFIRMATION MOSAIC & RESILIENCE MANTRAS                        */}
      {/* ==================================================================== */}
      {activeTab === 'mantras' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wide">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Cognitive Reframing & Self-Compassion</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1">
              Affirmation Mosaic & Grounding Mantras
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Science-backed internal scripts to interrupt negative self-talk and anchor your self-worth.
            </p>
          </div>

          {pinnedMantra && (
            <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#2D6A4F]/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                <span className="font-bold text-[#1B4332]">Today's Pinned Sanctuary Anchor:</span>
                <span className="italic text-slate-800">"{pinnedMantra}"</span>
              </div>
              <button
                onClick={() => setPinnedMantra(null)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mantrasList.map((item, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${item.color} flex flex-col justify-between gap-3`}
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {item.category}
                  </span>
                  <p className="text-sm font-extrabold leading-snug">
                    "{item.mantra}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 italic flex items-center gap-1">
                    <Feather className="w-3.5 h-3.5 text-slate-400" />
                    {item.groundingCue}
                  </span>
                  <button
                    onClick={() => {
                      setPinnedMantra(item.mantra);
                      triggerToast('Pinned as your daily sanctuary anchor mantra!');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 font-bold text-[10px] shadow-2xs border border-slate-200 transition-colors cursor-pointer"
                  >
                    Pin Anchor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default WellnessActivitiesSection;
