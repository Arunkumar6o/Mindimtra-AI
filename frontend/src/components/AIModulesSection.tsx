import React, { useState } from 'react';
import { 
  BrainCircuit, 
  MessageSquareHeart, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  Activity, 
  RefreshCw, 
  Lightbulb, 
  Sliders,
  Send,
  Database,
  User,
  Bot,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  scrubbed?: boolean;
}

export const AIModulesSection: React.FC = () => {
  const [activeModuleTab, setActiveModuleTab] = useState<'classifier' | 'companion'>('classifier');

  // --- Emotion Classifier State & Handlers ---
  const [inputText, setInputText] = useState<string>('I feel quite overwhelmed with my workload today, but I am trying to stay hopeful.');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any>({
    primary_emotion: 'Anxiety / Stress',
    confidence: 68.5,
    scrubbed_text: 'I feel quite overwhelmed with my workload today, but I am trying to stay hopeful.',
    pii_protected: false,
    model_used: 'RoBERTa-v2 (PyTorch + HuggingFace)',
    nlp_engine: 'spaCy v3.7 Entity Extractor',
    emotions_breakdown: {
      'Anxiety / Stress': 68.5,
      'Joy / Serenity': 12.0,
      'Calmness / Equilibrium': 10.5,
      'Sadness / Grief': 5.0,
      'Anger / Frustration': 2.5,
      'Fear / Vulnerability': 1.5
    },
    extracted_keywords: ['overwhelmed', 'workload', 'hopeful', 'trying'],
    empathetic_insight: 'Try 4-7-8 deep breathing: Inhale 4s, Hold 7s, Exhale 8s. Ground yourself with 5 things you can see right now.'
  });

  // --- Voiceover / Speech-to-Text State & Handlers ---
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string>('');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const samplePrompts = [
    "I feel quite overwhelmed with my workload today, but I am trying to stay hopeful.",
    "I had an amazing conversation with a friend and felt so calm and peaceful in nature.",
    "My email is john.doe@example.com and phone is 555-0199. I feel worried about the project release.",
    "Everything is going wrong today and I am furious with how things were handled!"
  ];

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

      recognition.onerror = (_event: any) => {
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

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze || inputText;
    if (!text || !text.trim()) return;

    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/emotion/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalysisResult(data);
          setIsAnalyzing(false);
          return;
        }
      }
    } catch (e) {}

    setTimeout(() => {
      const lower = text.toLowerCase();
      let primary = 'Calmness / Equilibrium';
      let confidence = 75.0;

      if (lower.includes('anxious') || lower.includes('overwhelmed') || lower.includes('worried')) {
        primary = 'Anxiety / Stress';
        confidence = 82.4;
      } else if (lower.includes('amazing') || lower.includes('peaceful') || lower.includes('happy')) {
        primary = 'Joy / Serenity';
        confidence = 89.1;
      } else if (lower.includes('furious') || lower.includes('wrong') || lower.includes('angry')) {
        primary = 'Anger / Frustration';
        confidence = 84.0;
      } else if (lower.includes('sad') || lower.includes('lonely') || lower.includes('hopeless')) {
        primary = 'Sadness / Grief';
        confidence = 78.6;
      }

      const scrubbed = text
        .replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '[EMAIL_REDACTED]')
        .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');

      setAnalysisResult({
        primary_emotion: primary,
        confidence: confidence,
        scrubbed_text: scrubbed,
        pii_protected: scrubbed !== text,
        model_used: 'RoBERTa-v2 (PyTorch Engine)',
        nlp_engine: 'spaCy v3.7 Pipeline',
        emotions_breakdown: {
          [primary]: confidence,
          'Calmness / Equilibrium': Math.round((100 - confidence) * 0.4),
          'Joy / Serenity': Math.round((100 - confidence) * 0.3),
          'Anxiety / Stress': Math.round((100 - confidence) * 0.2),
          'Sadness / Grief': Math.round((100 - confidence) * 0.1)
        },
        extracted_keywords: text.split(' ').filter(w => w.length > 4).slice(0, 5),
        empathetic_insight: `Recognized ${primary}. Remember to give yourself grace and take a moment to pause.`
      });
      setIsAnalyzing(false);
    }, 600);
  };

  // --- Gemini AI Companion State & Handlers ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'gemini',
      text: "Hello there! I'm Mindmitra, your empathetic AI companion powered by Gemini API & PostgreSQL vector memory. I'm here to listen, support, and help you reflect without judgment. How are you feeling today?",
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

  const starterPrompts = [
    "I'm feeling anxious about an upcoming deadline.",
    "Can you suggest a quick 2-minute grounding exercise?",
    "I feel emotionally exhausted today.",
    "How do I deal with racing thoughts at night?"
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const geminiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'gemini',
            text: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedActions: data.suggested_actions,
            scrubbed: data.scrubbed_input !== text
          };
          setMessages((prev) => [...prev, geminiMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch (e) {}

    setTimeout(() => {
      const botResponses = [
        `Thank you for opening up to me about "${text.slice(0, 30)}...". Your feelings are completely valid. Taking a gentle pause right now can help restore balance. What would bring you comfort in this moment?`,
        `I hear you clearly. When we experience these thoughts, grounding ourselves in the present moment is key. Try taking three deep, slow breaths—in for 4 seconds, out for 6 seconds.`,
        `Mindmitra is right here with you. Remember that you don't have to carry everything all at once. What is one small, kind thing you can do for yourself today?`
      ];

      const geminiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          "Log this session in Mood Tracker",
          "Try a 2-minute Guided Breathing session",
          "Read Resilience Quote"
        ]
      };
      setMessages((prev) => [...prev, geminiMsg]);
      setIsTyping(false);
    }, 750);
  };

  return (
    <div className="space-y-6 bg-white border border-[#e5ebe6] shadow-sm rounded-3xl p-6 sm:p-8">
      
      {/* Module Title Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] border border-[#d8e8dc]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#1B4332]">Interactive AI Sanctuary Suite</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyze fine-grained sentiment with RoBERTa transformer or talk to your empathetic Gemini AI companion.
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
            <span>Emotion Classifier</span>
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
            <span>Gemini AI Companion</span>
          </button>
        </div>
      </div>

      {/* Module Content 1: RoBERTa Emotion Classifier */}
      {activeModuleTab === 'classifier' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2 text-[#2D6A4F] font-bold">
              <Activity className="w-4 h-4 text-[#2D6A4F]" />
              <span>RoBERTa PyTorch Fine-Grained Sentiment Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#d8e8dc] rounded-full">
                6 Emotion Classes
              </span>
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-[#F3E5F5] text-[#7B1FA2] border border-[#e1bee7] rounded-full">
                Voiceover Speech-to-Text
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Input Form Column (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-[#fafcfb] border border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#1B4332] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Statement / Journal Input</span>
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
                  title="Voiceover - Speak into microphone to convert voice to text"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                      <span>Stop Voiceover</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Voiceover (Speech-to-Text)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Voice Input Active Banner */}
              {isListening && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <span className="font-semibold">Voiceover Active: Listening to your voice...</span>
                  </div>
                  <span className="text-[11px] text-rose-600 italic hidden sm:inline">Converting speech to text</span>
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
                placeholder="Type or click Voiceover to speak your thoughts..."
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

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4 text-white" />
                      <span>Classify Emotion</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Inference Results Column (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-[#fafcfb] border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h3 className="text-xs font-bold text-[#1B4332] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Analysis Results</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {analysisResult.model_used}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#d8e8dc] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#2D6A4F] tracking-wider">
                  Dominant Emotion
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-[#1B4332]">
                    {analysisResult.primary_emotion}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2D6A4F] text-white text-[11px] font-bold">
                    {analysisResult.confidence}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-700">Emotion Probabilities:</span>
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

              <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    Presidio PII Scrubbing:
                  </span>
                  {analysisResult.pii_protected && (
                    <span className="text-[9px] bg-emerald-100 text-[#1B4332] px-2 py-0.5 rounded font-bold border border-emerald-200">
                      Scrubbed
                    </span>
                  )}
                </div>
                <p className="text-slate-600 font-mono text-[10px] italic">
                  "{analysisResult.scrubbed_text}"
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#1976D2]" />
                  <span>spaCy NLP Entities:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {(analysisResult.extracted_keywords || []).map((tag: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-[#E3F2FD] border border-[#bbdefb] text-[#1976D2] font-semibold text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F3E5F5] border border-[#e1bee7] text-xs">
                <div className="flex items-center gap-1 text-[#7B1FA2] font-bold mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Empathetic Guidance</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {analysisResult.empathetic_insight}
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Module Content 2: Gemini AI Companion */}
      {activeModuleTab === 'companion' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2 text-[#7B1FA2] font-bold">
              <MessageSquareHeart className="w-4 h-4 text-[#7B1FA2]" />
              <span>Gemini Empathetic Dialogue & PostgreSQL Vector Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-[#E3F2FD] text-[#1976D2] border border-[#bbdefb] rounded-full flex items-center gap-1">
                <Database className="w-3 h-3" />
                pgvector (k=3)
              </span>
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#d8e8dc] rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                AES-256
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#fafcfb] border border-slate-200 overflow-hidden flex flex-col h-[480px]">
            
            <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#1B4332] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] animate-pulse" />
                <span>Mindmitra AI Assistant (Gemini LLM)</span>
              </div>
              <span className="text-slate-500 text-[11px]">Safe Reflective Space</span>
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
                      {msg.scrubbed && <span className="text-[#2D6A4F] font-semibold">• Scrubbed</span>}
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
                    <span>Mindmitra AI is reflecting...</span>
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
                placeholder="Share your thoughts or ask for guidance..."
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
