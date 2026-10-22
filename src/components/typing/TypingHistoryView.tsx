import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  History,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import { TypingSessionResult, TypingAnalyticsData } from '../../types/index.ts';

interface TypingHistoryViewProps {
  userId: string;
  theme?: 'dark' | 'light';
  onBackToPractice: () => void;
}

export const TypingHistoryView: React.FC<TypingHistoryViewProps> = ({
  userId,
  theme = 'dark',
  onBackToPractice,
}) => {
  const [history, setHistory] = useState<TypingSessionResult[]>([]);
  const [analytics, setAnalytics] = useState<TypingAnalyticsData | null>(null);
  const [filterLang, setFilterLang] = useState<'all' | 'hindi' | 'english'>('all');
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadData();
  }, [userId, filterLang]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [histData, analData] = await Promise.all([
        api.getTypingHistory(userId, filterLang),
        api.getTypingAnalytics(userId),
      ]);
      setHistory(histData);
      setAnalytics(analData);
    } catch (err) {
      console.error('Failed to load typing history:', err);
    } finally {
      setLoading(false);
    }
  };

  const points = (analytics?.speedProgression || [])
    .filter((p) => filterLang === 'all' || p.language === filterLang)
    .slice(-15);

  const rawMax = Math.max(50, ...points.map((p) => p.netWpm));
  const maxWpm = Math.ceil((rawMax + 5) / 10) * 10;
  const graphWidth = 700;
  const graphHeight = 220;
  const paddingX = 52;
  const paddingY = 36;

  // Dynamically generate 4 evenly-spaced readable grid tiers
  const step = Math.max(10, Math.ceil(maxWpm / 4 / 10) * 10);
  const gridLevels = [1, 2, 3, 4]
    .map((i) => i * step)
    .filter((v) => v <= maxWpm);

  const getCoordinates = (index: number, val: number) => {
    const totalPoints = Math.max(points.length - 1, 1);
    const x = paddingX + (index / totalPoints) * (graphWidth - paddingX * 2);
    const y = graphHeight - paddingY - (val / maxWpm) * (graphHeight - paddingY * 2);
    return { x, y };
  };

  const linePoints = points.map((p, idx) => getCoordinates(idx, p.netWpm));
  const svgPathD = linePoints.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Header Card */}
      <div
        className={`rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
          isDark
            ? 'bg-[#0a101f] border-[#162544] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-400 block">
            Practice Audit Trail
          </span>
          <h2 className="text-xl font-bold mt-0.5">Typing Speed Graph & Records</h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Track Net WPM trajectory, accuracy consistency, and backspace error mitigation across sessions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Segmented Filter */}
          <div
            className={`flex items-center p-1 rounded-lg border text-xs font-medium ${
              isDark ? 'bg-[#060a14] border-[#162544]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setFilterLang('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterLang === 'all'
                  ? isDark
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Tests
            </button>
            <button
              type="button"
              onClick={() => setFilterLang('hindi')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterLang === 'hindi'
                  ? isDark
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hindi
            </button>
            <button
              type="button"
              onClick={() => setFilterLang('english')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterLang === 'english'
                  ? isDark
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToPractice}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Resume Practice
          </button>
        </div>
      </div>

      {/* Speed Graph Card */}
      <div
        className={`rounded-xl border p-5 transition-colors ${
          isDark
            ? 'bg-[#0a101f] border-[#162544] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm">Net Speed Progression (WPM)</h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Net Speed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t border-dashed border-amber-500 inline-block" />
              English Cutoff (30)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t border-dashed border-rose-500 inline-block" />
              Hindi Cutoff (20)
            </span>
          </div>
        </div>

        {points.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              className="w-full h-56 select-none font-mono"
            >
              {/* Baseline (0 WPM) */}
              <line
                x1={paddingX}
                y1={graphHeight - paddingY}
                x2={graphWidth - paddingX}
                y2={graphHeight - paddingY}
                stroke={isDark ? '#162544' : '#e2e8f0'}
                strokeWidth={1}
              />
              <text
                x={paddingX - 8}
                y={graphHeight - paddingY + 3.5}
                fill={isDark ? '#64748b' : '#94a3b8'}
                fontSize="10"
                textAnchor="end"
              >
                0
              </text>

              {/* Dynamic Grid Levels */}
              {gridLevels.map((level) => {
                const y = graphHeight - paddingY - (level / maxWpm) * (graphHeight - paddingY * 2);
                return (
                  <g key={level}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={graphWidth - paddingX}
                      y2={y}
                      stroke={isDark ? '#162544' : '#e2e8f0'}
                      strokeDasharray="2 2"
                      strokeWidth={0.8}
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3.5}
                      fill={isDark ? '#64748b' : '#94a3b8'}
                      fontSize="10"
                      textAnchor="end"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Target Cutoff Indicators */}
              {[
                { cutoff: 30, color: '#f59e0b' },
                { cutoff: 20, color: '#f43f5e' },
              ].map(({ cutoff, color }) => {
                if (cutoff > maxWpm) return null;
                const y = graphHeight - paddingY - (cutoff / maxWpm) * (graphHeight - paddingY * 2);
                return (
                  <line
                    key={cutoff}
                    x1={paddingX}
                    y1={y}
                    x2={graphWidth - paddingX}
                    y2={y}
                    stroke={color}
                    strokeDasharray="4 4"
                    strokeWidth={1.2}
                    opacity={0.85}
                  />
                );
              })}

              <defs>
                <linearGradient id="proSpeedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {linePoints.length > 1 && (
                <path
                  d={`${svgPathD} L ${linePoints[linePoints.length - 1].x} ${
                    graphHeight - paddingY
                  } L ${linePoints[0].x} ${graphHeight - paddingY} Z`}
                  fill="url(#proSpeedGrad)"
                />
              )}

              {linePoints.length > 1 && (
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {linePoints.map((pt, i) => {
                const data = points[i];
                return (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill={data.language === 'hindi' ? '#f59e0b' : '#3b82f6'}
                      stroke={isDark ? '#060a14' : '#ffffff'}
                      strokeWidth="2"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 8}
                      fill={isDark ? '#93c5fd' : '#1e293b'}
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {data.netWpm}
                    </text>
                    <text
                      x={pt.x}
                      y={graphHeight - padding + 16}
                      fill={isDark ? '#64748b' : '#94a3b8'}
                      fontSize="9"
                      textAnchor="middle"
                    >
                      #{data.index}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            No typing attempts logged for this filter yet. Complete a practice session to see the trend!
          </div>
        )}
      </div>

      {/* History Table */}
      <div
        className={`rounded-xl border overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#0a101f] border-[#162544]'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
          isDark ? 'border-[#162544]' : 'border-slate-100'
        }`}>
          <h3 className="font-bold text-sm">Attempt Logs ({history.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase tracking-wider text-[10px] font-semibold border-b ${
              isDark
                ? 'bg-[#060a14] text-slate-400 border-[#162544]'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              <tr>
                <th className="py-3 px-4">Passage & Language</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Net Speed</th>
                <th className="py-3 px-4">Gross Speed</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Backspaces</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#162544] text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
              {history.map((session) => {
                const target = session.language === 'hindi' ? 20 : 30;
                const qualified = session.netWpm >= target && session.accuracy >= 80;

                return (
                  <tr key={session.id} className={isDark ? 'hover:bg-[#0c1427]' : 'hover:bg-slate-50'}>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100">{session.passageTitle}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {session.language.toUpperCase()} · {session.script}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {Math.round(session.timeSpentSeconds / 60)} min
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {session.netWpm} WPM
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {session.grossWpm} WPM · {session.cpm} CPM
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                      {session.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {session.backspaceCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          qualified
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {qualified ? 'Qualified' : 'Below Cutoff'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {new Date(session.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}

              {history.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No past sessions found. Start typing practice to create your history!
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
