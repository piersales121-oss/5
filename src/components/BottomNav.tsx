import React from 'react';
import { Home, Wrench, Bot, User, MessageSquare } from 'lucide-react';

export type TabType = 'home' | 'tools' | 'aichat' | 'userchat' | 'developer';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenNotes?: () => void;
  onOpenTimer?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems = [
    {
      id: 'home' as TabType,
      labelBn: 'হোম',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'tools' as TabType,
      labelBn: 'টুলস',
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      id: 'aichat' as TabType,
      labelBn: 'AI Chat',
      icon: <Bot className="w-5 h-5" />,
    },
    {
      id: 'userchat' as TabType,
      labelBn: 'Messages',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: 'developer' as TabType,
      labelBn: 'ডেভেলপার',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 py-1.5 px-2 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active Tab Indicator Pill */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></span>
              )}

              {/* Icon */}
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-blue-600/20 text-blue-400' : 'bg-transparent'
                }`}
              >
                {item.icon}
              </div>

              {/* Label */}
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.labelBn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
