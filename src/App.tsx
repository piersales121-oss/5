import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { ToolsView } from './views/ToolsView';
import { ChatView } from './views/ChatView';
import { UserChatView } from './views/UserChatView';
import { DeveloperView } from './views/DeveloperView';
import { ToolExecutionModal } from './components/ToolExecutionModal';
import { AuthModal } from './components/AuthModal';
import { StudyTimerModal } from './components/StudyTimerModal';
import { SettingsModal } from './views/SettingsModal';
import { InstalledAndroidView } from './views/InstalledAndroidView';
import { AI_TOOLS_DATA } from './data/toolsData';
import { UserProfile } from './types';
import { getCurrentUser, logoutUser, updateProfile } from './services/authService';
import { LogOut, Mail, Phone, Calendar, Edit2, X, Check, Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(getCurrentUser());

  // Detect if running inside Android WebView or PWA Standalone
  const [isAndroidApp, setIsAndroidApp] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.search.includes('android=true') ||
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        navigator.userAgent.toLowerCase().includes('android')
      );
    }
    return false;
  });

  const [showInstalledModal, setShowInstalledModal] = useState(false);
  const [showAndroidBanner, setShowAndroidBanner] = useState(true);

  // Modals
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Profile Edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.fullName || '');
  const [editMobile, setEditMobile] = useState(user?.mobile || '');

  useEffect(() => {
    if (user) {
      setEditFullName(user.fullName);
      setEditMobile(user.mobile);
    }
  }, [user]);

  const activeTool = AI_TOOLS_DATA.find((t) => t.id === selectedToolId) || null;

  const handleSaveProfile = () => {
    if (!user) return;
    const updated = updateProfile({
      fullName: editFullName,
      mobile: editMobile,
    });
    if (updated) {
      setUser(updated);
    }
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setIsProfileOpen(false);
  };

  // If not logged in, show mandatory login screen overlay
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={(loggedUser) => setUser(loggedUser)}
          isMandatory={true}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} font-['Hind_Siliguri',sans-serif]`}>
      {/* Hello Android Top Welcome Banner */}
      {isAndroidApp && showAndroidBanner && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
            <span>📱 Hello Android! EduZoon অ্যাপ ইনস্টলড মোডে চালু আছে</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstalledModal(true)}
              className="px-2 py-0.5 rounded-lg bg-black/30 hover:bg-black/50 text-[10px] font-extrabold uppercase tracking-wider"
            >
              ভিউ ইনফো
            </button>
            <button
              onClick={() => setShowAndroidBanner(false)}
              className="p-1 rounded-md hover:bg-black/20 text-white/80 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* App Header */}
      <Header
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Tab Content View */}
      <main className="pt-2">
        {activeTab === 'home' && (
          <HomeView
            user={user}
            tools={AI_TOOLS_DATA}
            onSelectTool={(id) => setSelectedToolId(id)}
            onOpenTimer={() => setIsTimerOpen(true)}
            onNavigateTools={() => setActiveTab('tools')}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsView
            tools={AI_TOOLS_DATA}
            onSelectTool={(id) => setSelectedToolId(id)}
          />
        )}

        {activeTab === 'aichat' && <ChatView />}

        {activeTab === 'userchat' && <UserChatView />}

        {activeTab === 'developer' && <DeveloperView />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenTimer={() => setIsTimerOpen(true)}
      />

      {/* Interactive Tool Execution Modal */}
      {activeTool && (
        <ToolExecutionModal
          tool={activeTool}
          onClose={() => setSelectedToolId(null)}
        />
      )}

      {/* Auth Modal (Manual Profile Switching) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      {/* Study Timer Modal */}
      <StudyTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenInstalledView={() => {
          localStorage.setItem('eduzoon_force_installed_view', 'true');
          setIsInstalledView(true);
        }}
      />

      {/* User Profile Drawer Modal */}
      {isProfileOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-blue-500 p-0.5 mx-auto mb-2 overflow-hidden shadow-lg bg-slate-800 flex items-center justify-center text-xl font-bold text-blue-400">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.fullName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{user.fullName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <h3 className="text-base font-bold text-white">{user.fullName}</h3>
              <p className="text-xs font-semibold text-blue-400">@{user.username}</p>
            </div>

            {!isEditingProfile ? (
              <div className="space-y-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{user.mobile || 'নম্বর প্রদান করা হয়নি'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>নিবন্ধিত: {new Date(user.registeredAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[10px] font-bold text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">Mobile</label>
                  <input
                    type="text"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>প্রোফাইল এডিট</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>সেভ করুন</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="py-2 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Installed App Modal Overlay */}
      {showInstalledModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowInstalledModal(false)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <InstalledAndroidView onReturnToWeb={() => setShowInstalledModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
