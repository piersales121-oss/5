import React from 'react';
import { 
  Edit3, 
  Volume2, 
  Camera, 
  FileText, 
  Lightbulb, 
  Clock 
} from 'lucide-react';
import { AITool } from '../types';

interface QuickAccessGridProps {
  onSelectTool: (toolId: string) => void;
  onOpenTimer: () => void;
  tools: AITool[];
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  onSelectTool,
  onOpenTimer,
  tools,
}) => {
  const quickItems = [
    {
      id: 'paragraph-writer',
      title: 'লেখালেখি',
      desc: 'AI দিয়ে লেখা',
      icon: <Edit3 className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'pronounce-guide',
      title: 'উচ্চারণ',
      desc: 'শব্দের অর্থ',
      icon: <Volume2 className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'img-q-gen',
      title: 'ছবি প্রশ্ন',
      desc: 'ছবি থেকে তৈরি',
      icon: <Camera className="w-5 h-5 text-cyan-400" />,
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      id: 'q-to-ans',
      title: 'টেক্সট প্রশ্ন',
      desc: 'লেখা থেকে তৈরি',
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'ans-explain',
      title: 'প্রশ্নের উত্তর',
      desc: 'AI উত্তর দেবে',
      icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
      bg: 'bg-yellow-500/10 border-yellow-500/20',
    },
    {
      id: 'timer-tool',
      title: 'টাইমার',
      desc: 'পড়ার সময়',
      icon: <Clock className="w-5 h-5 text-indigo-400" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      isTimer: true,
    },
  ];

  return (
    <div className="mb-6">
      {/* Section Title matching image: "দ্রুত অ্যাক্সেস" */}
      <h3 className="text-sm font-bold text-slate-400 mb-3 tracking-wider flex items-center gap-1.5 uppercase">
        <span>দ্রুত অ্যাক্সেস</span>
      </h3>

      {/* Grid of 2 columns matching screenshot */}
      <div className="grid grid-cols-2 gap-3">
        {quickItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.isTimer) {
                onOpenTimer();
              } else {
                onSelectTool(item.id);
              }
            }}
            className="group flex items-center gap-3 p-3.5 bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-md border border-slate-800/90 hover:border-blue-600/50 rounded-2xl text-left transition-all duration-200 active:scale-98 shadow-md"
          >
            {/* Icon Box */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.bg} group-hover:scale-105 transition-transform`}
            >
              {item.icon}
            </div>

            {/* Title & Desc */}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-snug truncate">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
