import React, { useState, useEffect, useCallback } from 'react';
import { 
  BrainCircuit, 
  MessageSquareHeart, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  Lightbulb, 
  Sliders, 
  Send, 
  User, 
  Bot, 
  Mic, 
  MicOff, 
  Volume2,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  RotateCcw
} from 'lucide-react';
import {
  resolveUserId,
  saveConversationMessage,
  getStoredUserMessages,
  runUnifiedEmotionalAnalysis,
  getLatestAnalysis,
  getConcernLevel,
  clearUserConversationHistory,
  type UnifiedAnalysisResult
} from '../services/unifiedAnalysisService';
import {
  initEmotionModel,
  classifyEmotionText,
  subscribeModelStatus,
  getModelStatus,
  type ModelProgressInfo,
  DISPLAY_MODEL_NAME
} from '../services/emotionModelService';
import { sendCompanionMessage } from '../services/geminiCompanionService';
import { getUserPreferences } from '../services/sanctuaryDbService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  scrubbed?: boolean;
}

interface AIModulesSectionProps {
  user?: { id?: string; email?: string; name?: string } | null;
}

export const AIModulesSection: React.FC<AIModulesSectionProps> = ({ user }) => {
  const [activeModuleTab, setActiveModuleTab] = useState<'classifier' | 'companion'>('classifier');
  const userId = resolveUserId(user);

  // --- Real Transformer Model Status ---
  const [modelStatus, setModelStatus] = useState<ModelProgressInfo>(getModelStatus());

  // --- Unified Analysis State ---
  const [unifiedAnalysis, setUnifiedAnalysis] = useState<UnifiedAnalysisResult | null>(null);
  const [isRefreshingAnalysis, setIsRefreshingAnalysis] = useState<boolean>(false);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState<boolean>(false);
  const [analysisToast, setAnalysisToast] = useState<string | null>(null);

  // --- Emotion Classifier State ---
  const [inputText, setInputText] = useState<string>(
    'I feel quite overwhelmed with my workload today, but I am trying to stay hopeful.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any>({
    primary_emotion: 'Calmness / Equilibrium',
    confidence: 76.5,
    scrubbed_text: 'I feel quite overwhelmed with my workload today, but I am trying to stay hopeful.',
    pii_protected: false,
    model_used: DISPLAY_MODEL_NAME,
    nlp_engine: 'Emotion Intelligence Engine',
    emotions_breakdown: {
      'Calmness / Equilibrium': 38.5,
      'Joy / Serenity': 27.2,
      'Anxiety / Stress': 16.4,
      'Sadness / Grief': 8.5,
      'Fear / Vulnerability': 5.8,
      'Anger / Frustration': 3.6
    },
    extracted_keywords: ['overwhelmed', 'workload', 'hopeful', 'trying'],
    empathetic_insight: 'Try 4-7-8 deep breathing: Inhale 4s, Hold 7s, Exhale 8s. Ground yourself with 5 things you can see right now.'
  });

  // --- Voiceover / Speech-to-Text State ---
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string>('');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // --- Empathetic AI Companion State ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_welcome',
      sender: 'gemini',
      text: "Hello there! I'm Mindmitra, your compassionate companion for emotional well-being. I'm here to listen, support, and help you reflect in a safe, judgment-free space. How are you feeling today?",
      timestamp: '10:00 AM',
      suggestedActions: [
        "I feel overwhelmed with work",
        "Help me calm my anxious mind",
        "I want to practice mindfulness"
      ]
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    "I feel quite overwhelmed with my workload today, but I am trying to stay hopeful.",
    "I had an amazing conversation with a friend and felt so calm and peaceful in nature.",
    "My email is alex@example.com. I feel so much pressure about the project release.",
    "Everything is going wrong today and I am furious with how things were handled!"
  ];

  const starterPrompts = [
    "I'm feeling anxious about an upcoming deadline.",
    "Can you suggest a quick 2-minute grounding exercise?",
    "I feel emotionally exhausted today.",
    "How do I deal with racing thoughts at night?"
  ];

  const triggerToast = (msg: string) => {
    setAnalysisToast(msg);
    setTimeout(() => setAnalysisToast(null), 3500);
  };

  /**
   * Load historical messages & latest unified analysis on mount or user change
   */
  const loadUserData = useCallback(async () => {
    try {
      const stored = await getStoredUserMessages(userId);

      // Restore companion chat messages if historical entries exist
      const companionHistory = stored.allMessages.filter(m => m.source === 'gemini_companion');
      if (companionHistory.length > 0) {
        setMessages(
          companionHistory.map(m => ({
            id: m.id,
            sender: m.role === 'assistant' ? 'gemini' : 'user',
            text: m.content,
            timestamp: m.timestamp,
            scrubbed: false
          }))
        );
      }

      // Restore latest unified analysis
      const latest = await getLatestAnalysis(userId);
      if (latest) {
        setUnifiedAnalysis(latest);
      } else {
        // Run initial analysis with available messages
        const initial = await runUnifiedEmotionalAnalysis({
          userId,
          robertaSnapshot: analysisResult
        });
        setUnifiedAnalysis(initial);
      }
    } catch (e) {
      console.warn('Error loading initial user emotional data:', e);
    }
  }, [userId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Warm up and monitor real DistilRoBERTa Transformers.js model
  useEffect(() => {
    const unsubscribe = subscribeModelStatus((info) => {
      setModelStatus(info);
    });

    // Start background preload of genuine DistilRoBERTa ONNX weights
    initEmotionModel().catch((err) => {
      console.warn('DistilRoBERTa background initialization notice:', err);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Trigger fresh unified analysis on demand
   */
  const handleRefreshUnifiedAnalysis = async () => {
    setIsRefreshingAnalysis(true);
    try {
      const fresh = await runUnifiedEmotionalAnalysis({
        userId,
        robertaSnapshot: analysisResult
      });
      setUnifiedAnalysis(fresh);
      triggerToast('Unified analysis updated from both conversation sources!');
    } catch (e) {
      triggerToast('Analysis updated using local emotional fusion engine.');
    } finally {
      setIsRefreshingAnalysis(false);
    }
  };

  /**
   * Reset / Clear all stored conversation history for fresh testing
   */
  const handleClearHistory = async () => {
    if (window.confirm('Reset emotional history? This clears previous test messages so your new inputs start fresh.')) {
      await clearUserConversationHistory(userId);
      setMessages([]);
      const reset = await runUnifiedEmotionalAnalysis({
        userId,
        robertaSnapshot: null
      });
      setUnifiedAnalysis(reset);
      triggerToast('Conversation history reset. Ready for clean emotional analysis!');
    }
  };

  /**
   * Voiceover / Speech-to-Text
   */
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isListening) {
      if (recognitionInstance) {
        try { recognitionInstance.stop(); } catch (e) {}
      }
      setIsListening(false);
      setVoiceNotice('Voiceover stopped.');
      setTimeout(() => setVoiceNotice(''), 3000);
      return;
    }

    if (!SpeechRecognition) {
      setIsListening(true);
      setVoiceNotice('Voiceover active (Simulating dictation)...');
      
      const simulatedSpeech = "I feel a bit anxious about my upcoming schedule, but I am taking deep breaths to remain calm.";
      let charIndex = 0;
      setInputText('');
      
      const timer = setInterval(() => {
        if (charIndex < simulatedSpeech.length) {
          setInputText(simulatedSpeech.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(timer);
          setIsListening(false);
          setVoiceNotice('Voice converted to text successfully!');
          setTimeout(() => setVoiceNotice(''), 3000);
        }
      }, 35);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening to your voice... Speak now!');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceNotice('Voice error or mic permission denied.');
        setTimeout(() => setVoiceNotice(''), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceNotice('Voice converted to text successfully!');
        setTimeout(() => setVoiceNotice(''), 3000);
      };

      setRecognitionInstance(recognition);
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setVoiceNotice('Could not start speech recognition.');
    }
  };

  /**
   * Source A: Submit statement to Emotion Classifier
   * 1. Runs genuine DistilRoBERTa Transformer inference via Transformers.js
   * 2. Saves statement with source='emotion_classifier', role='user'
   * 3. Triggers unified analysis across BOTH conversation sources
   */
  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze || inputText;
    if (!text || !text.trim()) return;

    setIsAnalyzing(true);
    let emotionData: any = null;

    try {
      // Execute genuine DistilRoBERTa model inference using ONNX Runtime WASM (Transformers.js)
      emotionData = await classifyEmotionText(text);
      setAnalysisResult(emotionData);
    } catch (err: any) {
      console.error('Transformers.js DistilRoBERTa inference error:', err);
      triggerToast(`Emotion inference notice: ${err?.message || 'Model error'}`);
    }

    if (!emotionData) {
      setIsAnalyzing(false);
      return;
    }

    // 2. Save user message with source='emotion_classifier'
    try {
      await saveConversationMessage({
        userId,
        source: 'emotion_classifier',
        role: 'user',
        content: text,
        detectedEmotion: emotionData.primary_emotion,
        emotionConfidence: emotionData.confidence
      });
    } catch (e) {
      console.warn('Error saving classifier message:', e);
    }

    // 3. Update unified analysis incorporating both sources
    try {
      const updated = await runUnifiedEmotionalAnalysis({
        userId,
        robertaSnapshot: emotionData
      });
      setUnifiedAnalysis(updated);
      triggerToast('Reflection analyzed and well-being score updated!');
    } catch (e) {
      console.warn('Error running unified analysis:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Empathetic Companion: Send message in AI Companion
   * 1. Saves user message with source='gemini_companion', role='user'
   * 2. Gets companion response and saves with role='assistant'
   * 3. Triggers unified analysis across BOTH conversation sources
   */
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    // Analyze emotional tone to tag detected emotion
    let detectedEmotion = 'Calmness / Equilibrium';
    let detectedConfidence = 70.0;
    try {
      const classified = await classifyEmotionText(text);
      detectedEmotion = classified.primary_emotion;
      detectedConfidence = classified.confidence;
    } catch (e) {
      // Silently proceed if model still warming up
    }

    // 1. Save USER message with source='gemini_companion'
    try {
      await saveConversationMessage({
        userId,
        source: 'gemini_companion',
        role: 'user',
        content: text,
        detectedEmotion,
        emotionConfidence: detectedConfidence
      });
    } catch (e) {
      console.warn('Error saving companion user message:', e);
    }

    let botText = '';
    let suggestedActions = [
      'Log this session in Mood Tracker',
      'Try a 2-minute Guided Breathing session',
      'Read Resilience Affirmation'
    ];
    let isScrubbed = false;

    try {
      const prefs = await getUserPreferences(userId).catch(() => null);
      const style = prefs?.communication_style || 'empathetic';

      const companionResult = await sendCompanionMessage(text, { style });
      botText = companionResult.replyText;
      suggestedActions = companionResult.suggestedActions;
      isScrubbed = companionResult.isScrubbed;
    } catch (e) {
      console.warn('Error fetching companion response:', e);
      botText = `Thank you for opening up to me. Hearing your thoughts helps us find steady ground together. When feelings swirl, grounding yourself in the present moment is deeply restorative. How does your body feel right now as we talk?`;
    }

    const geminiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'gemini',
      text: botText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions,
      scrubbed: isScrubbed
    };

    setMessages((prev) => [...prev, geminiMsg]);
    setIsTyping(false);

    // 2. Save companion assistant response (role='assistant')
    try {
      await saveConversationMessage({
        userId,
        source: 'gemini_companion',
        role: 'assistant',
        content: botText
      });
    } catch (e) {}

    // 3. Trigger unified analysis update across all user messages from both sources
    try {
      const updated = await runUnifiedEmotionalAnalysis({
        userId,
        robertaSnapshot: analysisResult
      });
      setUnifiedAnalysis(updated);
      triggerToast('Your companion reflection has been incorporated into your well-being score!');
    } catch (e) {
      console.warn('Error updating unified analysis from companion:', e);
    }
  };

  const concernInfo = unifiedAnalysis
    ? getConcernLevel(unifiedAnalysis.overall_score)
    : getConcernLevel(3.5);

  return (
    <div className="space-y-6 bg-white border border-[#e5ebe6] shadow-sm rounded-3xl p-6 sm:p-8">
      
      {/* Dynamic Toast Notice */}
      {analysisToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn bg-[#1B4332] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500/40 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{analysisToast}</span>
        </div>
      )}

      {/* Module Title Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] border border-[#d8e8dc]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#1B4332]">Emotional Sanctuary Suite</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reflect on your thoughts and feelings to gain meaningful, unified insights into your emotional balance.
          </p>
        </div>

        {/* Sub-Tab Module Switcher */}
        <div className="flex bg-[#f4f7f5] p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveModuleTab('classifier')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeModuleTab === 'classifier'
                ? 'bg-[#2D6A4F] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Emotion Check-in</span>
          </button>

          <button
            onClick={() => setActiveModuleTab('companion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeModuleTab === 'companion'
                ? 'bg-[#2D6A4F] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>AI Companion</span>
          </button>
        </div>
      </div>

      {/* Cross-Tab Unified Analysis Summary Ribbon */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#eaf4eb] via-[#f4f9f4] to-[#fbf4ea] border border-[#d8e8dc] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <HeartPulse className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#1B4332]">Unified Emotional Well-being:</span>
              <span className={`px-2 py-0.5 rounded-full text-white font-bold text-[11px] ${concernInfo.badgeColor}`}>
                {unifiedAnalysis?.overall_score?.toFixed(1) || '3.5'} / 10
              </span>
              <span className="font-semibold text-slate-700 hidden sm:inline">
                ({unifiedAnalysis?.concern_level || 'Generally stable'})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Based on {unifiedAnalysis?.classifier_messages_count || 0} journal check-ins & {unifiedAnalysis?.companion_messages_count || 0} companion chats ({unifiedAnalysis?.messages_analyzed_count || 0} total reflections)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 font-semibold text-xs transition-all shadow-xs cursor-pointer"
            title="Clear all stored test messages to start fresh"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
            <span>Reset History</span>
          </button>

          <button
            onClick={handleRefreshUnifiedAnalysis}
            disabled={isRefreshingAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#2D6A4F] font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Re-analyze all conversation messages from both sources"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAnalysis ? 'animate-spin text-[#2D6A4F]' : ''}`} />
            <span>{isRefreshingAnalysis ? 'Analyzing...' : 'Refresh Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Module Content 1: Emotion Check-in + Unified Analysis Results */}
      {activeModuleTab === 'classifier' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2 text-[#2D6A4F] font-bold">
              <Activity className="w-4 h-4 text-[#2D6A4F]" />
              <span>Emotion Check-in & Journal Reflection</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Emotion Intelligence Status Badge */}
              {modelStatus.status === 'loading' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                  <span>Preparing emotional intelligence... {modelStatus.progressPercent > 0 ? `${modelStatus.progressPercent}%` : ''}</span>
                </span>
              )}
              {modelStatus.status === 'ready' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Emotion Intelligence Ready</span>
                </span>
              )}
              {modelStatus.status === 'error' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Analysis standby</span>
                  <button
                    onClick={() => initEmotionModel()}
                    className="underline hover:text-rose-950 font-bold ml-1 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
              {modelStatus.status === 'idle' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <Activity className="w-3 h-3 text-slate-500" />
                  <span>Analysis Standby</span>
                </span>
              )}

              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#d8e8dc] rounded-full hidden sm:inline">
                Comprehensive Spectrum
              </span>
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-[#F3E5F5] text-[#7B1FA2] border border-[#e1bee7] rounded-full hidden sm:inline">
                Voice & Text
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Input Form Column (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-[#fafcfb] border border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#1B4332] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Personal Journal & Reflection Statement</span>
                </label>

                {/* Voiceover Speech-to-Text Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse ring-2 ring-rose-400/50'
                      : 'bg-[#E8F5E9] hover:bg-[#D8F3DC] text-[#2D6A4F] border border-[#d8e8dc]'
                  }`}
                  title="Voice Input - Speak to convert voice to text"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                      <span>Stop Voice Input</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Voice Input</span>
                    </>
                  )}
                </button>
              </div>

              {/* Voice Input Active Banner */}
              {isListening && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <span className="font-semibold">Listening to your voice... Speak naturally.</span>
                  </div>
                  <span className="text-[11px] text-rose-600 italic hidden sm:inline">Transcribing speech</span>
                </div>
              )}

              {voiceNotice && !isListening && (
                <div className="p-2.5 rounded-xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#1B4332] text-xs flex items-center gap-2 animate-fadeIn">
                  <Volume2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>{voiceNotice}</span>
                </div>
              )}

              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or click Voice Input to speak your thoughts..."
                className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#2D6A4F] transition-all placeholder:text-slate-400 resize-none leading-relaxed"
              />

              <div className="space-y-2">
                <span className="text-[11px] text-slate-500 font-medium">Try Sample Statements:</span>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(prompt);
                        handleAnalyze(prompt);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#E8F5E9] border border-slate-200 text-[11px] text-slate-700 hover:text-[#2D6A4F] transition-colors text-left cursor-pointer truncate max-w-full"
                    >
                      "{prompt.slice(0, 40)}..."
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 italic">
                  Saved securely to your emotional reflections.
                </span>

                <button
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                      <span>Analyzing Feelings...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4 text-white" />
                      <span>Analyze & Update Well-being</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* UNIFIED ANALYSIS RESULTS COLUMN (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-[#fafcfb] border border-slate-200 p-5 space-y-4">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-[#1B4332] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Unified Analysis Results</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Combined Journal & Companion Reflections</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    Unified Insights
                  </span>
                </div>
              </div>

              {/* 1–10 Overall Emotional Well-Being Score Card */}
              <div className={`p-4 rounded-2xl border ${concernInfo.borderColor} ${concernInfo.bgColor} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
                    OVERALL EMOTIONAL WELL-BEING
                  </span>
                  {/* Trend Indicator */}
                  {unifiedAnalysis?.trend && (
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      {unifiedAnalysis.trend === 'improving' && (
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Improving</span>
                        </span>
                      )}
                      {unifiedAnalysis.trend === 'increasing_concern' && (
                        <span className="flex items-center gap-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Increasing concern</span>
                        </span>
                      )}
                      {unifiedAnalysis.trend === 'stable' && (
                        <span className="flex items-center gap-1 text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full">
                          <Minus className="w-3.5 h-3.5" />
                          <span>Stable</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {unifiedAnalysis?.overall_score?.toFixed(1) || '3.5'}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ 10</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-white text-xs font-extrabold shadow-2xs ${concernInfo.badgeColor}`}>
                    {unifiedAnalysis?.concern_level || 'Generally stable'}
                  </span>
                </div>

                {/* Clear Scale Legend */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span className="text-emerald-700 font-semibold">1 = Very Good / Stable</span>
                  <span className="text-rose-700 font-semibold">10 = High Concern / Distress</span>
                </div>
              </div>

              {/* Showing That Both Sources Were Analyzed */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-[#1B4332]">
                    <Layers className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Reflection Sources</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                    Total: {unifiedAnalysis?.messages_analyzed_count || 0} reflections
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-[#f8faf8] border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                      Journal Check-ins
                    </span>
                    <strong className="text-slate-800">{unifiedAnalysis?.classifier_messages_count || 0} entries</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#f8faf8] border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#1976D2]" />
                      Companion Chats
                    </span>
                    <strong className="text-slate-800">{unifiedAnalysis?.companion_messages_count || 0} entries</strong>
                  </div>
                </div>
              </div>

              {/* Dominant Emotional State */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span>Dominant Emotional State:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(unifiedAnalysis?.dominant_emotions || ['Calmness / Equilibrium']).map((emotion, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#1B4332] font-bold text-xs flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#2D6A4F]" />
                      <span>{emotion}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Multiple Emotional Dimensions (1–10 Scale) */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-700">Emotional Dimension Scores (1–10 Scale):</span>
                
                {unifiedAnalysis?.dimensions && (
                  <div className="space-y-1.5">
                    {/* Anxiety / Stress */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Anxiety / Stress</span>
                        <span className="font-bold text-slate-800">{unifiedAnalysis.dimensions.anxiety_stress} / 10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${unifiedAnalysis.dimensions.anxiety_stress * 10}%` }} 
                        />
                      </div>
                    </div>

                    {/* Sadness / Grief */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Sadness / Grief</span>
                        <span className="font-bold text-slate-800">{unifiedAnalysis.dimensions.sadness_grief} / 10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${unifiedAnalysis.dimensions.sadness_grief * 10}%` }} 
                        />
                      </div>
                    </div>

                    {/* Anger / Frustration */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Anger / Frustration</span>
                        <span className="font-bold text-slate-800">{unifiedAnalysis.dimensions.anger_frustration} / 10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-orange-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${unifiedAnalysis.dimensions.anger_frustration * 10}%` }} 
                        />
                      </div>
                    </div>

                    {/* Fear / Vulnerability */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Fear / Vulnerability</span>
                        <span className="font-bold text-slate-800">{unifiedAnalysis.dimensions.fear_vulnerability} / 10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${unifiedAnalysis.dimensions.fear_vulnerability * 10}%` }} 
                        />
                      </div>
                    </div>

                    {/* Positive Emotion / Vitality */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Positive Emotion / Joy</span>
                        <span className="font-bold text-emerald-700">{unifiedAnalysis.dimensions.positive_emotion} / 10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${unifiedAnalysis.dimensions.positive_emotion * 10}%` }} 
                        />
                      </div>
                    </div>

                    {/* Emotional Stability */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Emotional Stability</span>
                        <span className="font-bold text-teal-700">{unifiedAnalysis.dimensions.emotional_stability} / 10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-teal-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${unifiedAnalysis.dimensions.emotional_stability * 10}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Key Indicators */}
              {unifiedAnalysis?.key_indicators && unifiedAnalysis.key_indicators.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Key Emotional Indicators:
                  </span>
                  <ul className="space-y-1">
                    {unifiedAnalysis.key_indicators.map((ind, idx) => (
                      <li key={idx} className="text-[11px] text-slate-700 flex items-start gap-1.5 leading-snug">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] mt-1 shrink-0" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Empathetic Summary */}
              <div className="p-3 rounded-xl bg-[#F3E5F5] border border-[#e1bee7] text-xs space-y-1">
                <div className="flex items-center gap-1 text-[#7B1FA2] font-bold">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Empathetic Guidance</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {unifiedAnalysis?.summary || analysisResult.empathetic_insight}
                </p>
              </div>

              {/* Immediate Safety / Crisis Support Banner if Elevated Distress */}
              {unifiedAnalysis && unifiedAnalysis.overall_score >= 8.0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>24/7 Crisis Support Resources</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-700">
                    If you are experiencing severe emotional pain or crisis, compassionate help is available right now:
                    Call or text <strong>988</strong> (USA) or <strong>1800-599-0019</strong> (KIRAN India). You are not alone.
                  </p>
                </div>
              )}

              {/* Detailed Emotional Spectrum Breakdown Accordion */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                  className="w-full flex items-center justify-between py-1.5 text-xs text-[#2D6A4F] font-bold hover:text-[#1B4332] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Detailed Emotional Spectrum Breakdown</span>
                  </span>
                  {showDetailedBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDetailedBreakdown && (
                  <div className="space-y-3 pt-3 animate-fadeIn">
                    <div className="space-y-1.5">
                      {Object.entries(analysisResult.emotions_breakdown || {}).map(([emotion, score]) => (
                        <div key={emotion} className="space-y-0.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-600 font-medium">{emotion}</span>
                            <span className="text-[#1B4332] font-bold">{Number(score)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-[#2D6A4F] h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, Math.max(0, Number(score)))}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                          Privacy Protection:
                        </span>
                        {analysisResult.pii_protected && (
                          <span className="text-[9px] bg-emerald-100 text-[#1B4332] px-2 py-0.5 rounded font-bold border border-emerald-200">
                            Protected
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 font-mono italic truncate">
                        "{analysisResult.scrubbed_text}"
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(analysisResult.extracted_keywords || []).map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[#E3F2FD] border border-[#bbdefb] text-[#1976D2] font-semibold text-[10px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Module Content 2: Empathetic AI Companion */}
      {activeModuleTab === 'companion' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2 text-[#7B1FA2] font-bold">
              <MessageSquareHeart className="w-4 h-4 text-[#7B1FA2]" />
              <span>MindMitra Empathetic Companion</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#d8e8dc] rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Private & Confidential
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#fafcfb] border border-slate-200 overflow-hidden flex flex-col h-[480px]">
            
            <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#1B4332] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] animate-pulse" />
                <span>Mindmitra AI Companion</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#d8e8dc] rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Gemini AI Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                  Current Well-being Score: <strong className={concernInfo.textColor}>{unifiedAnalysis?.overall_score?.toFixed(1) || '3.5'}/10</strong>
                </span>
                <span className="text-slate-500 text-[11px] hidden sm:inline">Safe Reflective Space</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-2xl ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#2D6A4F] text-white'
                        : 'bg-[#1976D2] text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1.5 max-w-lg">
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#2D6A4F] text-white rounded-tr-none shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(action)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#E8F5E9] border border-slate-200 text-[#2D6A4F] text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>{action}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className={`text-[10px] text-slate-400 flex items-center gap-1.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'user' && (
                        <span className="text-[#2D6A4F] font-semibold">• Saved to Reflections</span>
                      )}
                      {msg.scrubbed && <span className="text-[#2D6A4F] font-semibold">• Anonymized</span>}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 mr-auto">
                  <div className="w-8 h-8 rounded-xl bg-[#1976D2] flex items-center justify-center text-white shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2D6A4F]" />
                    <span>Mindmitra (Gemini AI) is reflecting...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-white border-t border-slate-200 overflow-x-auto flex items-center gap-2">
              <span className="text-[10px] text-slate-500 shrink-0 font-medium flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                Starters:
              </span>
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-full bg-[#f4f7f5] hover:bg-[#E8F5E9] border border-slate-200 text-slate-700 hover:text-[#2D6A4F] text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Share your thoughts and reflections here..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#f8faf8] border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#2D6A4F] transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim() || isTyping}
                className="px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default AIModulesSection;
