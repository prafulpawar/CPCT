import React from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Award,
  Zap,
  Target,
  Delete,
} from 'lucide-react';
import { TypingSessionResult } from '../../types/index.ts';

interface TypingResultModalProps {
  result: TypingSessionResult;
  targetWpm: number;
  theme?: 'dark' | 'light';
  onClose: () => void;
  onRestart: () => void;
  onViewHistory: () => void;
}

export const TypingResultModal: React.FC<TypingResultModalProps> = ({
  result,
  targetWpm,
  theme = 'dark',
  onClose,
  onRestart,
  onViewHistory,
}) => {
  const isDark = theme === 'dark';
  const isQualified = result.netWpm >= targetWpm && result.accuracy >= 80;
  const backspacePenalty = Math.round((result.backspaceCount / Math.max(1, result.totalKeystrokes)) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
    >
      <div
        className={`w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#0a101f] border-[#162544] text-slate-100 shadow-blue-950/30'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between ${
            isDark ? 'border-[#162544] bg-[#060a14]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                isQualified
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isQualified ? <Trophy className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-blue-400">
                Evaluation Scorecard · {result.language.toUpperCase()}
              </div>
              <h2 id="result-modal-title" className="text-lg font-bold">
                {isQualified
                  ? `Qualified for CPCT ${result.language.toUpperCase()} Benchmark`
                  : `Speed Cutoff of ${targetWpm} WPM Not Reached`}
              </h2>
            </div>
          </div>

          <div
            className={`text-xs font-bold px-2.5 py-1 rounded border ${
              isQualified
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                : 'bg-amber-950/40 text-amber-300 border-amber-800'
            }`}
          >
            {isQualified ? 'Eligible' : 'Needs Practice'}
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="p-6 space-y-5">
          <div
            className={`rounded-xl border grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 ${
              isDark
                ? 'bg-[#060a14] border-[#162544] divide-[#162544]'
                : 'bg-slate-50 border-slate-200 divide-slate-200'
            }`}
          >
            <div className="p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Net Speed</span>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-0.5">
                {result.netWpm}
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">Cutoff: {targetWpm} WPM</span>
            </div>

            <div className="p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Accuracy</span>
              <div
                className={`text-2xl font-bold font-mono mt-0.5 ${
                  result.accuracy >= 90
                    ? 'text-emerald-400'
                    : result.accuracy >= 80
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {result.accuracy}%
              </div>
              <span className="text-[10px] text-slate-400 block">Min 80% req.</span>
            </div>

            <div className="p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gross Speed</span>
              <div className="text-2xl font-bold font-mono mt-0.5 text-slate-200">{result.grossWpm}</div>
              <span className="text-[10px] text-slate-400 font-mono block">{result.cpm} CPM</span>
            </div>

            <div className="p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Backspaces</span>
              <div className="text-2xl font-bold font-mono mt-0.5 text-slate-200">{result.backspaceCount}</div>
              <span className="text-[10px] text-slate-400 block">{backspacePenalty}% of keys</span>
            </div>
          </div>

          {/* Breakdown items */}
          <div
            className={`p-4 rounded-xl border space-y-3 text-xs ${
              isDark ? 'bg-[#060a14] border-[#162544]' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Keystroke Analysis
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
              <div>
                <span className="text-slate-400 block">Correct Words</span>
                <span className="font-bold text-sm text-slate-100">{result.correctWords}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Error Words</span>
                <span className="font-bold text-sm text-slate-100">{result.incorrectWords}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Correct Chars</span>
                <span className="font-bold text-sm text-slate-100">{result.correctCharacters}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Keystrokes</span>
                <span className="font-bold text-sm text-slate-100">{result.totalKeystrokes}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#162544] text-[11px] text-slate-400 leading-relaxed">
              {result.backspaceCount > 15
                ? `Advisory: Frequent backspaces (${result.backspaceCount}) slowed down your net speed by roughly ${Math.round(result.backspaceCount / 10)} WPM. Focus on steady rhythm without correcting minor errors in real-time.`
                : `Excellent rhythm control! Minimal backspace reliance enabled peak velocity maintenance throughout the duration.`}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDark ? 'border-[#162544] bg-[#060a14]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <button
            type="button"
            onClick={onViewHistory}
            className={`px-3 py-2 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
              isDark
                ? 'border-[#162544] bg-[#0a101f] text-slate-300 hover:text-white hover:border-blue-500/40'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            Progression Graph
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                isDark
                  ? 'border-[#162544] text-slate-400 hover:text-slate-200 hover:bg-[#0a101f]'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Close
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Practice Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
