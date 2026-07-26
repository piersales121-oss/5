import React, { useState } from 'react';
import { Search, Sparkles, Filter, Wrench } from 'lucide-react';
import { AITool, ToolCategory } from '../types';

interface ToolsViewProps {
  tools: AITool[];
  onSelectTool: (toolId: string) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ tools, onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  const categories: { id: ToolCategory; labelBn: string; icon: string }[] = [
    { id: 'all', labelBn: 'সব (৫০+)', icon: '⚡' },
    { id: 'ocr', labelBn: 'OCR ও ছবি', icon: '📷' },
    { id: 'writing', labelBn: 'লেখালেখি', icon: '✍️' },
    { id: 'question', labelBn: 'প্রশ্ন ও কুইজ', icon: '❓' },
    { id: 'math_science', labelBn: 'গণিত ও বিজ্ঞান', icon: '📐' },
    { id: 'coding', labelBn: 'প্রোগ্রামিং ও ICT', icon: '💻' },
    { id: 'tutor_voice', labelBn: 'টিউটর ও ভয়েস', icon: '🗣️' },
    { id: 'study_pdf', labelBn: 'স্টাডি ও পিডিএফ', icon: '📅' },
  ];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesQuery =
      tool.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.descBn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="pb-24 max-w-md mx-auto px-4 pt-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            <span>AI এডুকেশনাল টুলস</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            মোট {tools.length} টি সুপার-চার্জড Gemini AI টুলস
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full">
          v2.4 Pro
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="টুলস খুঁজুন (যেমন: Math, Essay, OCR, Quiz)..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
          >
            ক্লিয়ার
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.labelBn}</span>
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="group bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/90 hover:border-blue-500/50 rounded-2xl p-3.5 cursor-pointer transition-all duration-200 active:scale-98 shadow-md flex flex-col justify-between h-32"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base p-1.5 rounded-xl bg-slate-800 border border-slate-700/60 group-hover:scale-110 transition-transform">
                  🎓
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 uppercase">
                  Gemini
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                {tool.nameBn}
              </h4>
              <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                {tool.descBn}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-semibold text-blue-400">
              <span>ব্যবহার করুন</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
          <p className="text-sm font-semibold text-slate-400">
            কোনো টুল খুঁজে পাওয়া যায়নি!
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-2 text-xs text-blue-400 hover:underline font-bold"
          >
            সব ফিল্টার রিসেট করুন
          </button>
        </div>
      )}
    </div>
  );
};
