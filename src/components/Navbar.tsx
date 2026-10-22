import React, { useState } from 'react';
import {
  Keyboard,
  BookOpen,
  TrendingUp,
  Trophy,
  ChevronDown,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';

interface NavbarProps {
  activeTab: 'typing' | 'mock-tests' | 'analytics' | 'leaderboard';
  setActiveTab: (tab: 'typing' | 'mock-tests' | 'analytics' | 'leaderboard') => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSelectUser,
  theme,
  onToggleTheme,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isDark = theme === 'dark';

  return (
    <header
      className={`border-b sticky top-0 z-40 transition-colors ${
        isDark
          ? 'bg-[#060913]/95 border-[#14233f] text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
      } backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Wordmark (Single text element wordmark, no badge sandwich) */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm tracking-wider ${
                isDark
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-400/30'
                  : 'bg-slate-900 text-white'
              }`}
            >
              CPCT
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none whitespace-nowrap">
                CPCT Exam Portal
              </span>
              <span
                className={`text-[11px] font-medium leading-tight mt-0.5 ${
                  isDark ? 'text-blue-400/80' : 'text-slate-500'
                }`}
              >
                Typing & Assessment Suite
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Clean single-line text links with subtle active state) */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('typing')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'typing'
                  ? isDark
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-900 font-semibold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1427]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Keyboard className="w-4 h-4 shrink-0" />
              <span>Typing Lab</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mock-tests')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'mock-tests'
                  ? isDark
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-900 font-semibold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1427]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Mock Tests</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? isDark
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-900 font-semibold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1427]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'leaderboard'
                  ? isDark
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-900 font-semibold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1427]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span>Leaderboard</span>
            </button>
          </nav>

          {/* Zone 3: Candidate & Theme Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? 'border-[#1b2b4c] bg-[#0c1427] text-blue-300 hover:text-white hover:border-blue-500/40'
                  : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Black & Blue Theme'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Candidate Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-colors ${
                  isDark
                    ? 'border-[#1b2b4c] bg-[#0c1427] hover:bg-[#101c38] text-slate-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold leading-tight">{currentUser.name}</div>
                  <div className={`text-[10px] font-mono leading-tight ${isDark ? 'text-blue-400/80' : 'text-slate-500'}`}>
                    {currentUser.rollNumber}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {showUserDropdown && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-xl border shadow-2xl py-2 z-50 text-xs transition-colors ${
                    isDark
                      ? 'bg-[#0b1222] border-[#1b2b4c] text-slate-200 shadow-black/80'
                      : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                  }`}
                >
                  <div className={`px-3 py-2 border-b ${isDark ? 'border-[#162442] text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider block text-blue-400">Active Aspirant</span>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">{currentUser.name}</div>
                    <div className="text-[11px] font-mono text-blue-500 dark:text-blue-400">{currentUser.rollNumber}</div>
                  </div>

                  <div className={`px-3 py-1.5 text-[10px] font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Switch Profile
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          onSelectUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
                          u.id === currentUser.id
                            ? isDark
                              ? 'bg-blue-950/60 font-semibold text-blue-300'
                              : 'bg-blue-50 font-semibold text-blue-700'
                            : isDark
                            ? 'hover:bg-[#121e3a] text-slate-300'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name.charAt(0)
                          )}
                        </div>
                        <div className="truncate">
                          <div className="text-xs truncate">{u.name}</div>
                          <div className="text-[10px] font-mono opacity-60 truncate">{u.rollNumber}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
