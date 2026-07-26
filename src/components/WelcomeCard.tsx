import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface WelcomeCardProps {
  onQuickStart: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ onQuickStart }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/90 to-slate-900 border border-blue-800/40 p-5 shadow-2xl shadow-blue-950/50 mb-5">
      {/* Background Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="max-w-[70%]">
          {/* Welcome Pill Tag */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs font-semibold tracking-wide mb-2">
            <Sparkles className="w-3 h-3 text-blue-400" />
            স্বাগতম
          </span>

          {/* Main Title */}
          <h2 className="text-2xl font-bold text-white mb-1.5 leading-snug tracking-tight">
            আজকে কী শিখবেন?
          </h2>

          {/* Bengali Subtitle */}
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            AI দিয়ে পড়াশোনা আরও সহজ করুন। প্রশ্ন তৈরি করুন, লেখা লিখুন, শব্দ শিখুন।
          </p>
        </div>

        {/* 3D Stack of Books Vector Illustration */}
        <div className="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg"></div>
          {/* Custom SVG 3D Book Stack */}
          <svg className="w-16 h-16 drop-shadow-lg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Bottom Red Book */}
            <path d="M15 70L50 85L85 70L50 55L15 70Z" fill="#DC2626" />
            <path d="M15 70V76L50 91V85L15 70Z" fill="#991B1B" />
            <path d="M85 70V76L50 91V85L85 70Z" fill="#EF4444" />
            {/* Middle Green Book */}
            <path d="M18 55L50 68L82 55L50 42L18 55Z" fill="#059669" />
            <path d="M18 55V61L50 74V68L18 55Z" fill="#065F46" />
            <path d="M82 55V61L50 74V68L82 55Z" fill="#10B981" />
            {/* Top Blue Book */}
            <path d="M22 40L50 51L78 40L50 29L22 40Z" fill="#2563EB" />
            <path d="M22 40V45L50 56V51L22 40Z" fill="#1E40AF" />
            <path d="M78 40V45L50 56V51L78 40Z" fill="#3B82F6" />
            {/* Pages & Bookmark Accent */}
            <path d="M50 29L65 35" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};
