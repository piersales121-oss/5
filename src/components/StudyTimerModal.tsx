import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Clock, Award, Sparkles } from 'lucide-react';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [preset, setPreset] = useState<number>(25);
  const [completedSessions, setCompletedSessions] = useState(1);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setCompletedSessions((prev) => prev + 1);
      alert('🎉 অভিনন্দন! পড়াশোনার সেশনটি সফলভাবে শেষ হয়েছে। এবার ৫ মিনিটের ব্রেক নিন।');
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setPreset(mins);
    setSecondsLeft(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(preset * 60);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2 text-indigo-400">
          <Clock className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white">স্টাডি টাইমার</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">মনোযোগ ধরে রাখতে পোমোডোরো সেশন ব্যবহার করুন</p>

        {/* Timer Circle */}
        <div className="w-44 h-44 rounded-full border-4 border-indigo-500/40 bg-slate-950 flex flex-col items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 relative">
          <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-xs text-indigo-400 font-semibold mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {isRunning ? 'পড়া চলছে...' : 'প্রস্তুত'}
          </span>
        </div>

        {/* Presets */}
        <div className="flex justify-center gap-2 mb-6">
          {[15, 25, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => handleSelectPreset(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                preset === m
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {m} মিনিট
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
          >
            {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-transform active:scale-95"
            title="রিসেট"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-center gap-1.5 text-xs text-amber-400 font-medium">
          <Award className="w-4 h-4" />
          <span>আজকে সম্পন্ন সেশন: {completedSessions} টি</span>
        </div>
      </div>
    </div>
  );
};
