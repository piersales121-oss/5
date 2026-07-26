import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Upload, 
  Mic, 
  MicOff, 
  RefreshCw,
  FileText,
  Bookmark
} from 'lucide-react';
import { AITool } from '../types';
import { generateAIResponse, speakText, stopSpeaking } from '../services/geminiService';

interface ToolExecutionModalProps {
  tool: AITool | null;
  onClose: () => void;
  onSaveNote?: (title: string, content: string) => void;
}

export const ToolExecutionModal: React.FC<ToolExecutionModalProps> = ({
  tool,
  onClose,
  onSaveNote,
}) => {
  if (!tool) return null;

  const [inputPrompt, setInputPrompt] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Strip data prefix if sending raw base64 or keep format
        setImageBase64(base64.split(',')[1] || base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeechToText = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('আপনার ব্রাউজার ভয়েস রিকগনিশন সাপোর্ট করে না।');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const handleGenerate = async () => {
    if (!inputPrompt.trim() && !imageBase64) {
      alert('দয়া করে কিছু টাইপ করুন অথবা ছবি আপলোড করুন।');
      return;
    }

    setLoading(true);
    setResultText('');
    setResultImage(null);

    const response = await generateAIResponse({
      prompt: inputPrompt || 'কন্টেন্ট তৈরি করুন',
      systemPrompt: tool.systemPrompt,
      imageBase64: imageBase64 || undefined,
    });

    setLoading(false);
    setResultText(response.text);
    if (response.imageUrl) {
      setResultImage(response.imageUrl);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(resultText);
    }
  };

  const handleSaveToNotes = () => {
    if (onSaveNote && resultText) {
      onSaveNote(tool.nameBn, resultText);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 leading-tight">
                {tool.nameBn}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {tool.nameEn}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Tool Description */}
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/30 text-xs text-blue-200">
            💡 {tool.descBn}
          </div>

          {/* Input Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              আপনার প্রশ্ন বা ইনপুট লিখুন:
            </label>
            <div className="relative">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={tool.placeholderBn}
                rows={4}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 resize-none"
              />

              {/* Voice Recording Button */}
              <button
                type="button"
                onClick={handleSpeechToText}
                className={`absolute bottom-3 right-3 p-2 rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="ভয়েস ইনপুট"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Image Upload Input (if applicable or requested) */}
          {(tool.requiresImage || tool.category === 'ocr' || true) && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-colors"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{imageBase64 ? 'ছবি আপলোড করা হয়েছে ✅' : 'ছবি যোগ করুন (OCR/চিত্র)'}</span>
                </button>

                {imageBase64 && (
                  <button
                    onClick={() => setImageBase64(null)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    ছবি সরান
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
                <span>AI চিন্তা করছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>AI উত্তর জেনারেট করুন</span>
              </>
            )}
          </button>

          {/* AI Output Display Area */}
          {resultText && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI ফলাফল:
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSpeak}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-blue-400 text-xs transition-colors"
                    title="পড়ে শোনান"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 text-xs transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {onSaveNote && (
                    <button
                      onClick={handleSaveToNotes}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs transition-colors flex items-center gap-1"
                      title="নোটে সেভ করুন"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${saved ? 'text-cyan-400 fill-cyan-400' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Text Output Render */}
              <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {resultText}
              </div>

              {resultImage && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
                  <img src={resultImage} alt="Generated visual" className="w-full h-auto" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
