import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Sparkles, User, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api.ts';
import { LeaderboardStudent } from '../../types/index.ts';

interface LeaderboardViewProps {
  currentUserId: string;
  theme?: 'dark' | 'light';
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUserId, theme = 'dark' }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`text-center py-20 rounded-xl border transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-500 shadow-xs'
        }`}
      >
        <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-pulse" />
        <div className="font-semibold text-sm">Compiling CPCT state merit leaderboard...</div>
        <div className="text-xs opacity-75 mt-1 font-mono">Computing composite indexes across Mock MCQ & Typing tests</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className={`rounded-xl border p-6 transition-all ${
          isDark
            ? 'bg-[#0a101f] border-[#162544] shadow-xl'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-400" />
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                State-Level CPCT Aspirant Merit Standings
              </span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Candidate Ranking & Performance Index
            </h2>
            <p className={`text-xs mt-1.5 max-w-xl leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Rankings are calculated dynamically via the CPCT Composite Index: weighted across Mock Test marks (50%),
              English Typing Net WPM (30%), and Hindi Typing Net WPM (20%).
            </p>
          </div>

          <div
            className={`px-4 py-3 rounded-lg border text-xs space-y-1 shrink-0 ${
              isDark
                ? 'bg-[#060a14] border-[#162544] text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <div className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              <Award className="w-4 h-4" />
              Composite Weighted Formula
            </div>
            <div className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              (MCQ % × 0.5) + (Eng WPM × 0.3) + (Hindi WPM × 0.2)
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((student, idx) => {
          const isCurrentUser = student.userId === currentUserId;

          let rankBadgeBg = '';
          let rankBorder = '';
          if (idx === 0) {
            rankBadgeBg = isDark ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-800 border border-amber-200';
            rankBorder = isDark ? 'border-amber-500/40' : 'border-amber-300';
          } else if (idx === 1) {
            rankBadgeBg = isDark ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200';
            rankBorder = isDark ? 'border-blue-500/40' : 'border-blue-300';
          } else {
            rankBadgeBg = isDark ? 'bg-slate-700/30 text-slate-300 border border-slate-600/30' : 'bg-slate-100 text-slate-700 border border-slate-200';
            rankBorder = isDark ? 'border-slate-700' : 'border-slate-300';
          }

          return (
            <div
              key={student.userId}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                isDark ? 'bg-[#0a101f]' : 'bg-white shadow-xs'
              } ${rankBorder} ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}
            >
              {isCurrentUser && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  You
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative shrink-0">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-12 h-12 rounded-full border border-blue-900/50 object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0a101f] border border-[#162544] flex items-center justify-center font-bold text-[11px]">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${rankBadgeBg} px-1.5 py-0.5 rounded`}>
                        Rank #{student.rank}
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {student.badge}
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {student.name}
                    </h3>
                    <span className={`text-[11px] font-mono ${isDark ? 'text-blue-400/80' : 'text-slate-500'}`}>
                      {student.rollNumber}
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-lg p-3 border space-y-1.5 text-xs ${
                    isDark
                      ? 'bg-[#060a14] border-[#162544]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Mock Score Avg:</span>
                    <span className={`font-bold font-mono tabular-nums ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {student.avgMockScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>English Typing:</span>
                    <span className={`font-bold font-mono tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      {student.maxEnglishWpm} WPM
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Hindi Typing:</span>
                    <span className={`font-bold font-mono tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      {student.maxHindiWpm} WPM
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                  isDark ? 'border-[#162544]' : 'border-slate-200'
                }`}
              >
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Composite Index:</span>
                <span className={`text-base font-bold font-mono tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {student.compositeScore} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Rankings Table */}
      <div
        className={`rounded-xl border overflow-hidden transition-colors ${
          isDark ? 'bg-[#0a101f] border-[#162544] shadow-xl' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-[#162544]' : 'border-slate-200'
          }`}
        >
          <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Comprehensive State Aspirants Standing
          </h3>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Candidates: {leaderboard.length}
          </span>
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
                <th className="py-3 px-4 font-semibold">Rank</th>
                <th className="py-3 px-4 font-semibold">Candidate</th>
                <th className="py-3 px-4 font-semibold">Roll Number</th>
                <th className="py-3 px-4 font-semibold">Mock Avg</th>
                <th className="py-3 px-4 font-semibold">English WPM</th>
                <th className="py-3 px-4 font-semibold">Hindi WPM</th>
                <th className="py-3 px-4 font-semibold">Composite Score</th>
                <th className="py-3 px-4 font-semibold">CPCT Standing</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#162544] text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
              {leaderboard.map((student) => {
                const isCurrentUser = student.userId === currentUserId;

                return (
                  <tr
                    key={student.userId}
                    className={`transition-colors ${
                      isCurrentUser
                        ? isDark
                          ? 'bg-blue-950/30 font-semibold'
                          : 'bg-blue-50/70 font-semibold'
                        : isDark
                        ? 'hover:bg-[#0c1427]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                          student.rank === 1
                            ? 'bg-amber-400 text-slate-950'
                            : student.rank === 2
                            ? 'bg-blue-400 text-slate-950'
                            : student.rank === 3
                            ? 'bg-blue-700 text-white'
                            : isDark
                            ? 'bg-[#060a14] text-slate-300 border border-[#162544]'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {student.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-7 h-7 rounded-full border border-blue-900/40 object-cover"
                        />
                        <div>
                          <div className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {student.name}
                            {isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {student.totalMockTests} tests · {student.totalTypingTests} typing
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 px-4 font-mono ${isDark ? 'text-blue-400/80' : 'text-slate-500'}`}>
                      {student.rollNumber}
                    </td>
                    <td className={`py-3 px-4 font-mono font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {student.avgMockScore}%
                    </td>
                    <td className={`py-3 px-4 font-mono font-bold tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      {student.maxEnglishWpm} WPM
                    </td>
                    <td className={`py-3 px-4 font-mono font-bold tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      {student.maxHindiWpm} WPM
                    </td>
                    <td className={`py-3 px-4 font-mono font-bold tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {student.compositeScore} pts
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          student.isQualified
                            ? isDark
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-emerald-100 text-emerald-800'
                            : isDark
                            ? 'bg-[#060a14] text-slate-400 border border-[#162544]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {student.badge}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
