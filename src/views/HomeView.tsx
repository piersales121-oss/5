import React from 'react';
import { WelcomeCard } from '../components/WelcomeCard';
import { StatsGrid } from '../components/StatsGrid';
import { QuickAccessGrid } from '../components/QuickAccessGrid';
import { AITool, UserProfile } from '../types';
import { Sparkles, Flame, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

interface HomeViewProps {
  user: UserProfile | null;
  tools: AITool[];
  onSelectTool: (toolId: string) => void;
  onOpenTimer: () => void;
  onNavigateTools: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  tools,
  onSelectTool,
  onOpenTimer,
  onNavigateTools,
}) => {
  const featuredTools = tools.slice(0, 4);

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Welcome Card matching UI screenshot */}
      <WelcomeCard onQuickStart={onNavigateTools} />

      {/* Stats Grid matching screenshot (৫০+ টুলস | AI পাওয়ার্ড | ∞ প্রশ্ন) */}
      <StatsGrid toolCount={tools.length} />

      {/* Quick Access Grid matching screenshot */}
      <QuickAccessGrid
        onSelectTool={onSelectTool}
        onOpenTimer={onOpenTimer}
        tools={tools}
      />

      {/* Daily Motivation & Study Streak Card */}
      <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/40 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">স্টাডি স্ট্রিক</h4>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                ৭ দিন 🔥
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              "জ্ঞান অর্জন করো, কারণ জ্ঞান কখনোই পুরানো হয় না।"
            </p>
          </div>
        </div>
      </div>

      {/* Popular AI Tools Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>জনপ্রিয় AI টুলস</span>
          </h3>
          <button
            onClick={onNavigateTools}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>সব দেখুন (৫০+)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {featuredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/90 hover:border-blue-500/50 rounded-2xl p-3.5 cursor-pointer transition-all duration-200 active:scale-98 shadow-lg flex flex-col justify-between h-28"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">✨</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 border border-blue-700/40">
                  AI
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 truncate">
                  {tool.nameBn}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {tool.nameEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
