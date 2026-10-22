import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  BookOpen,
  Keyboard,
  Clock,
  Sparkles,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import { StudentDashboardData } from '../../types/index.ts';

interface AnalyticsDashboardProps {
  userId: string;
  onNavigateToTyping: () => void;
  onNavigateToMockTest: () => void;
  theme?: 'dark' | 'light';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  onNavigateToTyping,
  onNavigateToMockTest,
  theme = 'dark',
}) => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentDashboard(userId);
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div
        className={`text-center py-20 rounded-xl border transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-500 shadow-xs'
        }`}
      >
        <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-3 animate-pulse" />
        <div className="font-semibold text-sm">Synthesizing candidate diagnostic analytics...</div>
        <div className="text-xs opacity-75 mt-1 font-mono">Evaluating 3-Pillar CPCT criteria, weak topics & speed trends</div>
      </div>
    );
  }

  const { summary, weakTopics, submissionsHistory, typingTimeline, user } = data;
  const status = summary.cpctCertificationStatus;

  return (
    <div className="space-y-6">
      {/* 1. CPCT Certification Readiness & Qualification Meter */}
      <div
        className={`rounded-xl border transition-all overflow-hidden ${
          isDark
            ? 'bg-[#0a101f] border-[#162544] shadow-xl'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  Official MP CPCT Certification Readiness
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {user.name} ({user.rollNumber})
                </span>
              </div>

              <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {status.fullyQualified
                  ? 'Candidate Certified Ready: All 3 Qualification Pillars Cleared!'
                  : 'Diagnostic Status: Complete Required Benchmarks to Qualify'}
              </h2>

              <p className={`text-xs leading-relaxed max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                MP CPCT qualification requires passing three mandatory independent evaluations:
                Computer Proficiency MCQ (≥ 50%), English Typing (≥ 30 Net WPM), and Hindi Typing (≥ 20 Net WPM).
              </p>
            </div>

            {/* Performance Grade Card */}
            <div
              className={`rounded-xl border p-4 text-center shrink-0 min-w-[150px] ${
                isDark
                  ? 'bg-[#060a14] border-[#162544]'
                  : 'bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wider block ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Proficiency Grade
              </span>
              <span className={`text-2xl font-black block mt-0.5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {status.scoreGrade}
              </span>
              <span className={`text-xs font-mono block mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Avg Mock: {summary.avgMockPercentage}%
              </span>
            </div>
          </div>

          {/* 3 Pillars Status Cards */}
          <div
            className={`mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4 ${
              isDark ? 'border-[#162544]' : 'border-slate-200'
            }`}
          >
            {/* Pillar 1: Computer Proficiency */}
            <div
              className={`p-4 rounded-lg border transition-colors ${
                status.computerPassed
                  ? isDark
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-emerald-50/60 border-emerald-200'
                  : isDark
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Pillar 1: Computer MCQ
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                    status.computerPassed
                      ? isDark
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-800'
                      : isDark
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {status.computerPassed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {status.computerPassed ? 'Qualified' : 'Pending'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-bold font-mono tabular-nums ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {summary.avgMockPercentage}%
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Required: ≥ 50%
                </span>
              </div>
            </div>

            {/* Pillar 2: English Typing */}
            <div
              className={`p-4 rounded-lg border transition-colors ${
                status.englishTypingQualified
                  ? isDark
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-emerald-50/60 border-emerald-200'
                  : isDark
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Pillar 2: English Typing
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                    status.englishTypingQualified
                      ? isDark
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-800'
                      : isDark
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {status.englishTypingQualified ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {status.englishTypingQualified ? 'Qualified' : 'Pending'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-bold font-mono tabular-nums ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {summary.english.maxNetWpm} <span className="text-xs font-normal opacity-75">WPM</span>
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Cutoff: 30 WPM
                </span>
              </div>
            </div>

            {/* Pillar 3: Hindi Typing */}
            <div
              className={`p-4 rounded-lg border transition-colors ${
                status.hindiTypingQualified
                  ? isDark
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-emerald-50/60 border-emerald-200'
                  : isDark
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Pillar 3: Hindi Typing
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                    status.hindiTypingQualified
                      ? isDark
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-800'
                      : isDark
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {status.hindiTypingQualified ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {status.hindiTypingQualified ? 'Qualified' : 'Pending'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-bold font-mono tabular-nums ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {summary.hindi.maxNetWpm} <span className="text-xs font-normal opacity-75">WPM</span>
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Cutoff: 20 WPM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Analytics: Weak Topics vs Typing Speed Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Identified Weak Topics & Targeted Action Plan */}
        <div
          className={`rounded-xl border p-5 space-y-4 transition-colors ${
            isDark ? 'bg-[#0a101f] border-[#162544] shadow-md' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Weak Topics Identification
              </h3>
            </div>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Accuracy &lt; 60%
            </span>
          </div>

          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            These sections exhibited lower accuracy across your mock tests. Focus on these targeted
            suggestions before appearing in the final exam:
          </p>

          <div className="space-y-3">
            {weakTopics.map((wt, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-[#060a14] border-[#162544]'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {wt.topic}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      wt.severity === 'High'
                        ? isDark
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-rose-100 text-rose-800'
                        : isDark
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {wt.severity} Priority ({wt.accuracy}%)
                  </span>
                </div>
                <p className={`text-xs mt-1.5 flex items-start gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{wt.recommendation}</span>
                </p>
              </div>
            ))}

            {weakTopics.length === 0 && (
              <div className={`text-center py-6 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No weak topics found! You are performing above 60% across all evaluated subjects.
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onNavigateToMockTest}
              className={`w-full py-2.5 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                isDark
                  ? 'bg-[#060a14] hover:bg-[#0c1427] text-slate-200 border-[#162544]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Practice Topic-Wise MCQs
            </button>
          </div>
        </div>

        {/* Right: Hindi & English Typing Speed Comparison */}
        <div
          className={`rounded-xl border p-5 space-y-4 transition-colors ${
            isDark ? 'bg-[#0a101f] border-[#162544] shadow-md' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-blue-400" />
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Typing Progress Matrix
              </h3>
            </div>
            <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {typingTimeline.length} sessions logged
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* English Speed Card */}
            <div
              className={`p-4 rounded-lg border space-y-2 ${
                isDark ? 'bg-[#060a14] border-[#162544]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  English Typing
                </span>
                <span className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {summary.english.avgAccuracy}% Acc
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {summary.english.maxNetWpm}
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Max WPM</span>
              </div>
              <div
                className={`text-[11px] flex justify-between pt-2 border-t ${
                  isDark ? 'border-[#162544] text-slate-400' : 'border-slate-200 text-slate-500'
                }`}
              >
                <span>Target: 30 WPM</span>
                <span className={`font-semibold ${summary.english.qualified ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : 'text-amber-500'}`}>
                  {summary.english.qualified ? 'Qualified' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Hindi Speed Card */}
            <div
              className={`p-4 rounded-lg border space-y-2 ${
                isDark ? 'bg-[#060a14] border-[#162544]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  Hindi Typing
                </span>
                <span className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {summary.hindi.avgAccuracy}% Acc
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {summary.hindi.maxNetWpm}
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Max WPM</span>
              </div>
              <div
                className={`text-[11px] flex justify-between pt-2 border-t ${
                  isDark ? 'border-[#162544] text-slate-400' : 'border-slate-200 text-slate-500'
                }`}
              >
                <span>Target: 20 WPM</span>
                <span className={`font-semibold ${summary.hindi.qualified ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : 'text-amber-500'}`}>
                  {summary.hindi.qualified ? 'Qualified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Typing Sessions Mini Timeline */}
          <div className="space-y-2 pt-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Recent Practice Runs
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {typingTimeline.slice(-4).reverse().map((t) => (
                <div
                  key={t.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                    isDark
                      ? 'bg-[#060a14] border-[#162544]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        t.language === 'hindi'
                          ? isDark
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-amber-100 text-amber-800'
                          : isDark
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t.language}
                    </span>
                    <span className={`font-mono text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono tabular-nums text-xs">
                    <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {t.netWpm} WPM
                    </span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                      {t.accuracy}% Acc
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t.backspaceCount} bs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToTyping}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm shadow-blue-600/30 flex items-center justify-center gap-1.5"
          >
            <Keyboard className="w-3.5 h-3.5" />
            Launch Typing Lab
          </button>
        </div>
      </div>

      {/* 3. Mock Test Score History Table */}
      <div
        className={`rounded-xl border overflow-hidden transition-colors ${
          isDark ? 'bg-[#0a101f] border-[#162544]' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-[#162544]' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Mock-Test Score History & Progression ({submissionsHistory.length} attempts)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`uppercase tracking-wider text-[11px] border-b ${
                isDark
                  ? 'bg-[#060a14] text-slate-400 border-[#162544]'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              <tr>
                <th className="py-3 px-4 font-semibold">Test Title</th>
                <th className="py-3 px-4 font-semibold">Score / Total</th>
                <th className="py-3 px-4 font-semibold">Percentage</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">CPCT Status</th>
                <th className="py-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#162544] text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
              {submissionsHistory.map((s) => (
                <tr
                  key={s.id}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-[#0c1427]' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className={`py-3 px-4 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {s.testTitle}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums">
                    {s.score} / {s.totalQuestions}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums">
                    <span
                      className={
                        s.percentage >= 50
                          ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                          : isDark ? 'text-rose-400' : 'text-rose-700'
                      }
                    >
                      {s.percentage}%
                    </span>
                  </td>
                  <td className={`py-3 px-4 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {Math.round(s.timeSpentSeconds / 60)} mins
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        s.passed
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-emerald-100 text-emerald-800'
                          : isDark
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {s.passed ? 'Qualified' : 'Below 50%'}
                    </span>
                  </td>
                  <td className={`py-3 px-4 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {s.date}
                  </td>
                </tr>
              ))}

              {submissionsHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className={`py-8 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No mock test attempts recorded yet. Launch a mock test to track performance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
