import React from 'react';

interface StatsGridProps {
  toolCount?: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ toolCount = 50 }) => {
  return (
    <div className="grid grid-cols-3 gap-2.5 mb-5">
      {/* Stat 1: Total Tools */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 text-center shadow-lg hover:border-blue-700/50 transition-colors">
        <h3 className="text-xl font-extrabold text-blue-400 font-['Plus_Jakarta_Sans'] tracking-tight">
          {toolCount}+
        </h3>
        <p className="text-xs font-medium text-slate-400 mt-0.5">টুলস</p>
      </div>

      {/* Stat 2: AI Powered */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 text-center shadow-lg hover:border-blue-700/50 transition-colors">
        <h3 className="text-xl font-extrabold text-blue-400 font-['Plus_Jakarta_Sans'] tracking-tight">
          AI
        </h3>
        <p className="text-xs font-medium text-slate-400 mt-0.5">পাওয়ার্ড</p>
      </div>

      {/* Stat 3: Unlimited Questions */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 text-center shadow-lg hover:border-blue-700/50 transition-colors">
        <h3 className="text-xl font-extrabold text-cyan-400 font-['Plus_Jakarta_Sans'] tracking-tight">
          ∞
        </h3>
        <p className="text-xs font-medium text-slate-400 mt-0.5">প্রশ্ন</p>
      </div>
    </div>
  );
};
