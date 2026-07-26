import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Globe, 
  Type, 
  Database, 
  Trash2, 
  Download, 
  Upload, 
  Check,
  Bell,
  RefreshCw
} from 'lucide-react';
import { getGoogleSheetsUrl, setGoogleSheetsUrl } from '../services/authService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
}) => {
  if (!isOpen) return null;

  const [sheetsUrl, setSheetsUrl] = useState(getGoogleSheetsUrl());
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [notifications, setNotifications] = useState(true);
  const [savedUrlMsg, setSavedUrlMsg] = useState(false);

  const handleSaveSheetsUrl = () => {
    setGoogleSheetsUrl(sheetsUrl);
    setSavedUrlMsg(true);
    setTimeout(() => setSavedUrlMsg(false), 2000);
  };

  const handleClearCache = () => {
    if (confirm('আপনি কি অ্যাপের ক্যাশ মেমরি ও স্থানীয় ডাটা ক্লিয়ার করতে চান?')) {
      localStorage.removeItem('eduzoon_chat_history');
      alert('ক্যাশ মেমরি সফলভাবে পরিষ্কার করা হয়েছে!');
    }
  };

  const handleBackupData = () => {
    const data = {
      users: localStorage.getItem('eduzoon_users_db'),
      chat: localStorage.getItem('eduzoon_chat_history'),
      sheetsUrl: getGoogleSheetsUrl(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduzoon_backup_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>⚙️ অ্যাপ সেটিংস</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2.5">
            {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <div>
              <h4 className="text-xs font-bold text-slate-200">Dark / Light Mode</h4>
              <p className="text-[10px] text-slate-400">চোখের সুরক্ষার জন্য মোড পরিবর্তন করুন</p>
            </div>
          </div>

          <button
            onClick={onToggleDarkMode}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              darkMode ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Language Switch */}
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-cyan-400" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">ভাষা (Language)</h4>
              <p className="text-[10px] text-slate-400">অ্যাপের ডিসপ্লে ভাষা নির্বাচন করুন</p>
            </div>
          </div>

          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                language === 'bn' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Database Status Info */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
            <Database className="w-4 h-4 text-emerald-400" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">ক্লাউড ডাটাবেস স্ট্যাটাস</h4>
              <p className="text-[10px] text-emerald-400 font-medium">কানেক্টেড ও অ্যাক্টিভ (গুগল শিটস)</p>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Cache & Backup Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleClearCache}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-rose-400 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cache</span>
          </button>

          <button
            onClick={handleBackupData}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-cyan-400 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
