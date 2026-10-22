import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { TypingLab } from './components/typing/TypingLab.tsx';
import { MockTestCatalog } from './components/mockTest/MockTestCatalog.tsx';
import { CpctExamInterface } from './components/mockTest/CpctExamInterface.tsx';
import { TestResultView } from './components/mockTest/TestResultView.tsx';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard.tsx';
import { LeaderboardView } from './components/analytics/LeaderboardView.tsx';
import { api } from './lib/api.ts';
import { UserProfile, MockTestItem, ExamQuestion } from './types/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'typing' | 'mock-tests' | 'analytics' | 'leaderboard'>('typing');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Theme state with localStorage persistence (default to executive black & blue dark theme)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('cpct_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('cpct_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Mock test sub-navigation
  const [activeExamData, setActiveExamData] = useState<(MockTestItem & { questions: ExamQuestion[] }) | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialUserData();
  }, []);

  const loadInitialUserData = async () => {
    try {
      const [user, users] = await Promise.all([
        api.getCurrentUser(),
        api.getAllUsers(),
      ]);
      setCurrentUser(user);
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to load user info:', err);
      // Fallback
      const fallbackUser: UserProfile = {
        id: 'user-primary-1',
        name: 'Rahul Sharma',
        rollNumber: 'CPCT-2026-8492',
        email: 'rahul.cpct@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        targetExam: 'MP CPCT 2026',
      };
      setCurrentUser(fallbackUser);
      setAllUsers([fallbackUser]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (testId: string, shuffle: boolean) => {
    try {
      const exam = await api.getMockTestById(testId, shuffle);
      setActiveExamData(exam);
      setActiveReviewId(null);
    } catch (err) {
      console.error('Failed to launch exam:', err);
      alert('Failed to load exam questions. Please try again.');
    }
  };

  const handleFinishExam = (submissionId: string) => {
    setActiveExamData(null);
    setActiveReviewId(submissionId);
  };

  const handleCancelExam = () => {
    setActiveExamData(null);
  };

  const isDark = theme === 'dark';

  if (loading || !currentUser) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center font-sans ${
          isDark ? 'bg-[#060913] text-slate-300' : 'bg-slate-50 text-slate-700'
        }`}
      >
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Loading CPCT Examination & Assessment Portal...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
        isDark ? 'bg-[#060913] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // If switching tab, leave exam mode if candidate wasn't in active exam
          if (!activeExamData) {
            setActiveReviewId(null);
          }
        }}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={(u) => setCurrentUser(u)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If Active Exam is Running, render Exam Interface full-screen */}
        {activeExamData ? (
          <CpctExamInterface
            test={activeExamData}
            user={currentUser}
            theme={theme}
            onFinishTest={handleFinishExam}
            onCancel={handleCancelExam}
          />
        ) : activeReviewId ? (
          <TestResultView
            submissionId={activeReviewId}
            theme={theme}
            onBackToCatalog={() => setActiveReviewId(null)}
            onRetakeTest={(testId) => handleStartExam(testId, true)}
          />
        ) : (
          <>
            {activeTab === 'typing' && (
              <TypingLab userId={currentUser.id} theme={theme} />
            )}

            {activeTab === 'mock-tests' && (
              <MockTestCatalog
                userId={currentUser.id}
                theme={theme}
                onStartTest={handleStartExam}
                onViewReview={(subId) => setActiveReviewId(subId)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard
                userId={currentUser.id}
                theme={theme}
                onNavigateToTyping={() => setActiveTab('typing')}
                onNavigateToMockTest={() => setActiveTab('mock-tests')}
              />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardView currentUserId={currentUser.id} theme={theme} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-4 text-xs transition-colors ${
          isDark
            ? 'bg-[#090f1d] border-[#13223f] text-slate-400'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            MP CPCT Examination Portal · Typing Lab & Mock Test Engine
          </span>
          <span className="font-mono text-[11px] opacity-80">
            Remington Gail & Inscript · Live WPM & Accuracy · Official 2026 Edition
          </span>
        </div>
      </footer>
    </div>
  );
}
