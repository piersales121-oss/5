import React from 'react';
import { Smartphone, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';

interface InstalledAndroidViewProps {
  onReturnToWeb?: () => void;
}

export const InstalledAndroidView: React.FC<InstalledAndroidViewProps> = ({ onReturnToWeb }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Installed Screen Card */}
      <div className="relative z-10 max-w-sm w-full text-center space-y-6 flex flex-col items-center">
        {/* Android Green Icon Badge */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/30 flex items-center justify-center animate-bounce duration-1000">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Smartphone className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-slate-950 shadow-md">
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          </div>
        </div>

        {/* Hello Android Display Typography */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Installed App Mode</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] leading-tight">
            Hello Android
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xs mx-auto">
            EduZoon is running in native standalone installed view.
          </p>
        </div>

        {/* Optional Return to Web App Toggle for Browser Testing */}
        {onReturnToWeb && (
          <div className="pt-4">
            <button
              onClick={onReturnToWeb}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Switch to Full Web Version</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer minimal tag */}
      <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono tracking-widest uppercase">
        EduZoon Android • Native App Standalone
      </div>
    </div>
  );
};
