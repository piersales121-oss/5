import React from 'react';
import { Moon, Sun, Settings, UserCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenAuth,
  onOpenProfile,
}) => {
  return (
    <header className="w-full bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800/80">
      {/* Top EduZoon Blue Header Bar */}
      <div className="w-full bg-blue-700 py-2.5 px-4 text-center shadow-md">
        <h1 className="text-2xl font-bold text-white tracking-wide font-['Plus_Jakarta_Sans'] flex items-center justify-center gap-2">
          <span>EduZoon</span>
        </h1>
      </div>

      {/* App Action Bar matching the exact screenshot */}
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: App Brand Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl">🎓</span>
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-blue-400 leading-tight">শিক্ষা</h2>
            <p className="text-sm font-semibold text-slate-200 leading-none">সহায়ক</p>
          </div>
        </div>

        {/* Right: Actions (Status, Theme, Settings, Profile) */}
        <div className="flex items-center gap-2">
          {/* User Status Pill */}
          <div 
            onClick={onOpenProfile}
            className="cursor-pointer bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-full px-3 py-1 flex items-center gap-1.5 transition-all text-xs text-slate-300 shadow-inner"
          >
            <span className="font-bold tracking-wider text-slate-200 uppercase">
              {user?.username || 'GUEST'}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-amber-400 transition-transform active:scale-95 shadow-md"
            title="Theme Toggle"
          >
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-blue-400 transition-transform active:scale-95 shadow-md"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={user?.isLoggedIn ? onOpenProfile : onOpenAuth}
            className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-blue-500/80 hover:border-blue-400 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            title={user?.fullName || 'Profile'}
          >
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                {user?.fullName?.slice(0, 1) || 'R'}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
