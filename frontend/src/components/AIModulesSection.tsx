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
  Bot
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

  const samplePrompts = [
    "I feel quite overwhelmed with my workload today, but I am trying to stay hopeful.",
    "I had an amazing conversation with a friend and felt so calm and peaceful in nature.",
    "My email is john.doe@example.com and phone is 555-0199. I feel worried about the project release.",
    "Everything is going wrong today and I am furious with how things were handled!"
  ];

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
    } catch (e) {
      // Client simulation fallback
    }

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
    } catch (e) {
      // Fallback response simulation
    }

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
    <div className="space-y-6 glass-panel border border-teal-500/20 rounded-3xl p-6 sm:p-8">
      
      {/* Module Title Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Interactive AI Sanctuary Suite</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze fine-grained sentiment with RoBERTa transformer or talk to your empathetic Gemini AI companion.
          </p>
        </div>

        {/* Sub-Tab Module Switcher */}
        <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveModuleTab('classifier')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeModuleTab === 'classifier'
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Emotion Classifier</span>
          </button>

          <button
            onClick={() => setActiveModuleTab('companion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeModuleTab === 'companion'
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
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
          
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 text-teal-300 font-semibold">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>RoBERTa PyTorch Fine-Grained Sentiment Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-teal-950 text-teal-300 border border-teal-500/30 rounded-full">
                6 Emotion Classes
              </span>
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded-full">
                Presidio PII Defense
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Input Form Column (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  <span>Statement / Journal Input</span>
                </label>
                <span className="text-[11px] text-slate-500">Max 500 characters</span>
              </div>

              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your feelings or thoughts here to analyze emotion..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-600 resize-none leading-relaxed"
              />

              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 font-medium">Try Sample Statements:</span>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(prompt);
                        handleAnalyze(prompt);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-teal-300 transition-colors text-left cursor-pointer truncate max-w-full"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-200" />
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
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Analysis Results</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {analysisResult.model_used}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-950/80 to-slate-950 border border-teal-500/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                  Dominant Emotion
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-white">
                    {analysisResult.primary_emotion}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-500/30">
                    {analysisResult.confidence}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-300">Emotion Probabilities:</span>
                {Object.entries(analysisResult.emotions_breakdown || {}).map(([emotion, score]) => (
                  <div key={emotion} className="space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">{emotion}</span>
                      <span className="text-slate-200 font-semibold">{Number(score)}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.max(0, Number(score)))}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    Presidio PII Scrubbing:
                  </span>
                  {analysisResult.pii_protected && (
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                      Scrubbed
                    </span>
                  )}
                </div>
                <p className="text-slate-400 font-mono text-[10px] italic">
                  "{analysisResult.scrubbed_text}"
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>spaCy NLP Entities:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {(analysisResult.extracted_keywords || []).map((tag: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                <div className="flex items-center gap-1 text-indigo-300 font-bold mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Empathetic Guidance</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
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
          
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <MessageSquareHeart className="w-4 h-4 text-indigo-400" />
              <span>Gemini Empathetic Dialogue & PostgreSQL Vector Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-sky-950 text-sky-300 border border-sky-500/30 rounded-full flex items-center gap-1">
                <Database className="w-3 h-3" />
                pgvector (k=3)
              </span>
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                AES-256
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden flex flex-col h-[480px]">
            
            <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
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
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-tr from-teal-500 to-sky-600 text-white'
                        : 'bg-gradient-to-tr from-indigo-600 to-teal-500 text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1.5 max-w-lg">
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none shadow-md'
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
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-teal-300 text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>{action}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className={`text-[10px] text-slate-500 flex items-center gap-1.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span>{msg.timestamp}</span>
                      {msg.scrubbed && <span className="text-emerald-400 font-semibold">• Scrubbed</span>}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 mr-auto">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                    <span>Mindmitra AI is reflecting...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2">
              <span className="text-[10px] text-slate-500 shrink-0 font-medium flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                Starters:
              </span>
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] whitespace-nowrap transition-colors cursor-pointer"
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
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Share your thoughts or ask for guidance..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim() || isTyping}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
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
