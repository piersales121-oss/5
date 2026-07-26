import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX,
  History,
  Plus,
  Clock,
  MessageSquare,
  X
} from 'lucide-react';
import { ChatMessage, AIChatSession } from '../types';
import { generateAIResponse, speakText, stopSpeaking } from '../services/geminiService';

const SESSIONS_STORAGE_KEY = 'eduzoon_ai_chat_sessions';

const INITIAL_WELCOME_MSG: ChatMessage = {
  id: 'welcome-1',
  sender: 'ai',
  text: 'নমস্কার / হ্যালো! আমি EduZoon AI শিক্ষা সহায়ক। নতুন প্রশ্ন করুন, বা আগের হিস্ট্রি দেখতে "History" অপশনে ক্লিক করুন। কীভাবে সাহায্য করতে পারি?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const ChatView: React.FC = () => {
  // Saved sessions in localStorage
  const [sessions, setSessions] = useState<AIChatSession[]>(() => {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse AI chat sessions:', e);
    }
    return [];
  });

  // Active current session ID (null means starting fresh empty page)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Active session messages
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MSG]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Save sessions to localStorage
  const saveSessionsToStorage = (updatedSessions: AIChatSession[]) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (e) {
      console.error('Failed to save AI sessions:', e);
    }
  };

  // Start fresh empty chat
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([INITIAL_WELCOME_MSG]);
    setInputPrompt('');
    setImageBase64(null);
    setShowHistoryModal(false);
  };

  // Open a previous session from History
  const handleSelectSession = (session: AIChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setShowHistoryModal(false);
  };

  // Delete a specific session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('আপনি কি এই চ্যাট সেশনটি মুছে ফেলতে চান?')) {
      const filtered = sessions.filter((s) => s.id !== sessionId);
      saveSessionsToStorage(filtered);
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    }
  };

  // Delete all sessions
  const handleClearAllHistory = () => {
    if (confirm('আপনি কি সব চ্যাট হিস্ট্রি একসাথে মুছে ফেলতে চান?')) {
      saveSessionsToStorage([]);
      handleNewChat();
      setShowHistoryModal(false);
    }
  };

  const handleSend = async (customText?: string) => {
    const queryText = customText || inputPrompt;
    if (!queryText.trim() && !imageBase64) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      imageUrl: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
      timestamp,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputPrompt('');
    const currentImg = imageBase64;
    setImageBase64(null);
    setLoading(true);

    const response = await generateAIResponse({
      prompt: queryText,
      systemPrompt: 'আপনি EduZoon AI - একটি অত্যন্ত বন্ধুত্বপূর্ণ এবং দক্ষ বাংলা ও ইংরেজি শিক্ষামূলক চ্যাটবট। শিক্ষার্থীদের সকল প্রশ্নের সাবলীল, প্রাঞ্জল ও নিখুঁত সমাধান প্রদান করুন। কোড থাকলে তা সুন্দর ফরম্যাটে দিন।',
      imageBase64: currentImg || undefined,
    });

    setLoading(false);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: response.text,
      imageUrl: response.imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const finalMessages = [...updatedMessages, aiMsg];
    setMessages(finalMessages);

    // Save or update session in storage
    let activeId = currentSessionId;
    let title = queryText.slice(0, 35) + (queryText.length > 35 ? '...' : '');

    if (!activeId) {
      activeId = 'session-' + Date.now();
      setCurrentSessionId(activeId);

      const newSession: AIChatSession = {
        id: activeId,
        title: title || 'নতুন আলোচনা',
        createdAt: new Date().toLocaleDateString('bn-BD', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        updatedAt: new Date().toISOString(),
        messages: finalMessages,
      };

      saveSessionsToStorage([newSession, ...sessions]);
    } else {
      const updatedSessions = sessions.map((s) => {
        if (s.id === activeId) {
          return {
            ...s,
            messages: finalMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      });
      saveSessionsToStorage(updatedSessions);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageBase64(base64.split(',')[1] || base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('ভয়েস ইনপুট সমর্থিত নয়।');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (id: string, text: string) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(id);
      speakText(text);
    }
  };

  const promptChips = [
    'HSC ICT লজিক গেইট বুঝিয়ে দাও',
    'English Tense Rules with Examples',
    'ক্যালকুলাস ডেরিভেটিভ ফর্মুলা',
    'বাংলা ২য় পত্র কারক ও বিভক্তি',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-md mx-auto px-4 pt-2 pb-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 mb-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>EduZoon AI Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-400">
              {currentSessionId ? 'সেশন সক্রিয়' : 'নতুন ফাঁকা পেজ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95"
            title="নতুন ফাঁকা চ্যাট"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন চ্যাট</span>
          </button>

          {/* History Button */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            title="চ্যাট হিস্ট্রি"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isUser
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] rounded-2xl p-3 shadow-md relative group ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="attachment"
                    className="w-full max-h-48 object-cover rounded-xl mb-2 border border-slate-700"
                  />
                )}

                <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Footer timestamp & Actions */}
                <div
                  className={`flex items-center justify-between pt-1.5 mt-1 border-t text-[10px] ${
                    isUser ? 'border-blue-500/40 text-blue-200' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-1.5 opacity-90">
                      <button
                        onClick={() => handleSpeakText(msg.id, msg.text)}
                        className="p-1 hover:text-blue-400"
                        title="শুনুন"
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-1 hover:text-emerald-400"
                        title="কপি"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400 p-2">
            <Bot className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>EduZoon AI উত্তর প্রসেস করছে...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl text-[11px] text-slate-300 whitespace-nowrap transition-colors"
            >
              💡 {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex items-center gap-1.5 shadow-xl">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 rounded-xl transition-colors ${
            imageBase64 ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="ছবি আপলোড"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          onClick={handleVoiceInput}
          className={`p-2 rounded-xl transition-colors ${
            isRecording ? 'bg-red-600 text-white animate-pulse' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="ভয়েস ইনপুট"
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="যেকোনো প্রশ্ন লিখুন..."
          className="flex-1 bg-transparent px-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || (!inputPrompt.trim() && !imageBase64)}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* HISTORY MODAL / DRAWER */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[80vh] flex flex-col">
            
            {/* Modal Top */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI চ্যাট হিস্ট্রি</h3>
                  <p className="text-[10px] text-slate-400">ডিভাইসে সংরক্ষিত সেশন সমূহ</p>
                </div>
              </div>

              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
              {sessions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">এখনও কোনো চ্যাট সেশন সেভ করা হয়নি</p>
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectSession(sess)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      currentSessionId === sess.id
                        ? 'bg-blue-600/20 border-blue-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate group-hover:text-cyan-300">
                        {sess.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {sess.createdAt}
                        </span>
                        <span>• {sess.messages.length} টি মেসেজ</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Bottom Actions */}
            {sessions.length > 0 && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={handleClearAllHistory}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 py-1 px-2.5 rounded-xl hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>সব মুছে ফেলুন</span>
                </button>

                <button
                  onClick={handleNewChat}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন ফাঁকা চ্যাট</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
