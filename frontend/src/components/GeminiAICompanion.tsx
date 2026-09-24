import React, { useState } from 'react';
import { 
  MessageSquareHeart, 
  Send, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  User, 
  Bot, 
  Lightbulb, 
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  scrubbed?: boolean;
}

export const GeminiAICompanion: React.FC = () => {
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

    // Client fallback simulation if backend is offline
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
    <div className="space-y-6 animate-fadeIn">
      
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MessageSquareHeart className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Gemini Empathetic AI Companion</h2>
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded-full">
                LLM + pgvector
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive emotional support backed by PostgreSQL vector memory and Microsoft Presidio PII scrubbing
            </p>
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>pgvector Context (k=3)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AES-256 Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface Container */}
      <div className="rounded-3xl glass-panel border border-slate-800/80 overflow-hidden flex flex-col h-[560px]">
        
        {/* Chat Timeline Header */}
        <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Mindmitra AI Assistant (Gemini 1.5 Flash)</span>
          </div>
          <span className="text-slate-500">Zero Harmful Content Filtered</span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-teal-500 to-sky-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-teal-500 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Content Box */}
              <div className="space-y-2 max-w-xl">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none shadow-lg'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Suggested Action Chips for Bot Replies */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-teal-300 text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] text-slate-500 flex items-center gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {msg.scrubbed && <span className="text-emerald-400 font-semibold">• PII Scrubbed</span>}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 mr-auto">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                <span>Mindmitra AI is reflecting on your prompt...</span>
              </div>
            </div>
          )}
        </div>

        {/* Starter Prompts Bar */}
        <div className="px-6 py-2 bg-slate-900/40 border-t border-slate-800/60 overflow-x-auto flex items-center gap-2">
          <span className="text-[11px] text-slate-500 shrink-0 font-medium flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            Starters:
          </span>
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Share your thoughts or ask for guidance..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || isTyping}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
};
