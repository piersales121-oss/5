import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Globe, 
  Github, 
  Youtube, 
  Send, 
  Facebook, 
  ShieldCheck, 
  FileText, 
  Star, 
  Share2, 
  Bug, 
  Database,
  Code,
  Copy,
  Check,
  Info
} from 'lucide-react';

export const DeveloperView: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [bugText, setBugText] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [rating, setRating] = useState(5);

  const googleAppsScriptCode = `// Google Apps Script Code for EduZoon App Database
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var request = JSON.parse(e.postData.contents);
  var action = request.action;
  var data = request.data;
  
  if (action === "REGISTER") {
    sheet.appendRow([new Date(), data.fullName, data.username, data.email, data.mobile, data.password]);
    return ContentService.createTextOutput(JSON.stringify({ status: "SUCCESS", message: "Registered in Sheets!" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "OK" }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'EduZoon – AI শিক্ষা সহায়ক অ্যাপ',
        text: 'EduZoon অ্যাপ দিয়ে আপনার পড়াশোনাকে সহজ ও দারুণ করুন! ৫০+ AI টুলস ও সেরা টিউটর।',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('অ্যাপ লিংক ক্লিপবোর্ডে কপি হয়েছে!');
    }
  };

  return (
    <div className="pb-24 max-w-md mx-auto px-4 pt-3 space-y-4">
      {/* Developer Profile Header Card */}
      <div className="bg-gradient-to-b from-blue-950/80 via-slate-900 to-slate-900 border border-blue-800/40 rounded-3xl p-5 text-center shadow-2xl relative overflow-hidden">
        <div className="w-20 h-20 rounded-full border-4 border-blue-500/80 p-1 mx-auto mb-3 shadow-xl shadow-blue-500/20 relative">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
            alt="Developer"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">RAFID</h2>
        <p className="text-xs font-semibold text-blue-400 mt-0.5">
          Founder & Lead Developer, EduZoon
        </p>
        <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
          "প্রযুক্তির উদ্ভাবন দিয়ে শিক্ষা ব্যবস্থাকে আরও সহজ ও সমৃদ্ধ করার প্রত্যয়ে নির্মিত EduZoon।"
        </p>

        {/* Social Links Row */}
        <div className="flex items-center justify-center gap-2.5 mt-4">
          {[
            { name: 'Facebook', icon: <Facebook className="w-4 h-4 text-blue-400" />, href: 'https://facebook.com' },
            { name: 'GitHub', icon: <Github className="w-4 h-4 text-slate-200" />, href: 'https://github.com' },
            { name: 'YouTube', icon: <Youtube className="w-4 h-4 text-red-500" />, href: 'https://youtube.com' },
            { name: 'Telegram', icon: <Send className="w-4 h-4 text-sky-400" />, href: 'https://telegram.org' },
            { name: 'Website', icon: <Globe className="w-4 h-4 text-emerald-400" />, href: 'https://eduzoon.app' },
          ].map((soc, idx) => (
            <a
              key={idx}
              href={soc.href}
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-all hover:scale-110 shadow-md"
              title={soc.name}
            >
              {soc.icon}
            </a>
          ))}
        </div>
      </div>

      {/* App & Developer Actions Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setActiveModal('about')}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-2.5 text-left transition-colors"
        >
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-200">About App</span>
        </button>

        <button
          onClick={() => setActiveModal('privacy')}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-2.5 text-left transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">Privacy Policy</span>
        </button>

        <button
          onClick={() => setActiveModal('terms')}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-2.5 text-left transition-colors"
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">Terms & Conditions</span>
        </button>

        <button
          onClick={() => setActiveModal('rate')}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-2.5 text-left transition-colors"
        >
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-slate-200">Rate App</span>
        </button>

        <button
          onClick={handleShare}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-2.5 text-left transition-colors"
        >
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">Share App</span>
        </button>

        <button
          onClick={() => setActiveModal('bug')}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-2.5 text-left transition-colors"
        >
          <Bug className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold text-slate-200">Report Bug</span>
        </button>
      </div>

      {/* Modals for Action Items */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-xs text-slate-400 hover:text-white"
            >
              বন্ধ করুন
            </button>

            {activeModal === 'about' && (
              <div>
                <h3 className="text-base font-bold text-white mb-2">EduZoon সম্পর্কে</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  EduZoon হলো একটি আধুনিক AI-Powered শিক্ষা সহায়ক অ্যাপ্লিকেশান। এতে রয়েছে ৫০+ এডুকেশনাল টুলস, ভয়েস সাপোর্ট, OCR প্রযুক্তি ও গুগল শিটস ব্যাকএন্ড সুবিধা।
                </p>
                <p className="text-xs text-blue-400 font-bold mt-2">ভার্সন: v2.4.0 Pro</p>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div>
                <h3 className="text-base font-bold text-white mb-2">প্রাইভেসি পলিসি</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  আমরা আপনার তথ্যের গোপনীয়তা রক্ষায় অঙ্গীকারবদ্ধ। আপনার প্রশ্ন বা পার্সোনাল ডাটা থার্ড পার্টি কারো কাছে শেয়ার করা হয় না।
                </p>
              </div>
            )}

            {activeModal === 'terms' && (
              <div>
                <h3 className="text-base font-bold text-white mb-2">শর্তাবলী</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  EduZoon অ্যাপটি কেবল শিক্ষা এবং শেখার উদ্দেশ্যে ব্যবহারের জন্য তৈরি করা হয়েছে।
                </p>
              </div>
            )}

            {activeModal === 'rate' && (
              <div className="text-center space-y-3 py-2">
                <h3 className="text-base font-bold text-white">অ্যাপটিকে রেটিং দিন</h3>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    alert('ধন্যবাদ আপনার চমৎকার রেটিংয়ের জন্য! ❤️');
                    setActiveModal(null);
                  }}
                  className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  সাবমিট করুন
                </button>
              </div>
            )}

            {activeModal === 'bug' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">বাগ বা সমস্যা রিপোর্ট করুন</h3>
                <textarea
                  value={bugText}
                  onChange={(e) => setBugText(e.target.value)}
                  placeholder="কী সমস্যা হচ্ছে তা বিস্তারিত লিখুন..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    alert('আপনার রিপোর্টটি ডেভেলপারের কাছে পাঠানো হয়েছে। ধন্যবাদ!');
                    setBugText('');
                    setActiveModal(null);
                  }}
                  className="w-full py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
                >
                  রিপোর্ট পাঠান
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
