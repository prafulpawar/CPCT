import React, { useState, useEffect } from 'react';
import {
  Trophy,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Languages,
  Check,
  X,
  Target,
  Sparkles,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import { TestSubmissionResult, ReviewQuestion, MockTestItem } from '../../types/index.ts';

interface TestResultViewProps {
  submissionId: string;
  onBackToCatalog: () => void;
  onRetakeTest: (testId: string) => void;
  theme?: 'dark' | 'light';
}

export const TestResultView: React.FC<TestResultViewProps> = ({
  submissionId,
  onBackToCatalog,
  onRetakeTest,
  theme = 'dark',
}) => {
  const [submission, setSubmission] = useState<TestSubmissionResult | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([]);
  const [test, setTest] = useState<MockTestItem | null>(null);
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [reviewLanguage, setReviewLanguage] = useState<'hindi' | 'english'>('english');
  const [loading, setLoading] = useState<boolean>(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadReview();
  }, [submissionId]);

  const loadReview = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissionReview(submissionId);
      setSubmission(data.submission);
      setReviewQuestions(data.reviewQuestions);
      setTest(data.test);
    } catch (err) {
      console.error('Failed to load test review:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !submission) {
    return (
      <div
        className={`text-center py-20 rounded-xl border transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-500 shadow-xs'
        }`}
      >
        <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-3 animate-pulse" />
        <div className="font-semibold text-sm">Evaluating answers and compiling official CPCT scorecard...</div>
        <div className="text-xs opacity-75 mt-1 font-mono">Generating topic breakdown & answer key analysis</div>
      </div>
    );
  }

  const topicBreakdown =
    typeof submission.topicWiseBreakdown === 'string'
      ? JSON.parse(submission.topicWiseBreakdown)
      : submission.topicWiseBreakdown || {};

  const topicsList = Array.from(new Set(reviewQuestions.map((q) => q.topic))).filter(Boolean);

  const filteredQuestions = reviewQuestions.filter((q) => {
    if (filterTopic !== 'all' && q.topic !== filterTopic) return false;
    if (filterStatus === 'correct' && !q.isCorrect) return false;
    if (filterStatus === 'incorrect' && (q.isCorrect || !q.isAttempted)) return false;
    if (filterStatus === 'unattempted' && q.isAttempted) return false;
    return true;
  });

  const isPassed = submission.passed;

  return (
    <div className="space-y-6">
      {/* 1. Official CPCT Scorecard Banner */}
      <div
        className={`rounded-xl border transition-all overflow-hidden ${
          isDark
            ? isPassed
              ? 'bg-gradient-to-r from-emerald-950/30 via-[#0a101f] to-[#0a101f] border-emerald-500/40'
              : 'bg-gradient-to-r from-rose-950/30 via-[#0a101f] to-[#0a101f] border-rose-500/40'
            : isPassed
            ? 'bg-gradient-to-r from-emerald-50/80 via-white to-white border-emerald-200 shadow-xs'
            : 'bg-gradient-to-r from-rose-50/80 via-white to-white border-rose-200 shadow-xs'
        }`}
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border ${
                  isPassed
                    ? isDark
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : isDark
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-rose-100 border-rose-300 text-rose-700'
                }`}
              >
                {isPassed ? <Trophy className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold tracking-wider uppercase ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Official Examination Scorecard
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span
                    className={`text-xs font-semibold ${
                      isPassed
                        ? isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-700'
                        : isDark
                        ? 'text-rose-400'
                        : 'text-rose-700'
                    }`}
                  >
                    {isPassed ? 'CPCT Qualified' : 'Cutoff Not Cleared'}
                  </span>
                </div>

                <h2
                  className={`text-xl md:text-2xl font-bold tracking-tight mt-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {isPassed ? 'Congratulations! You Cleared the Cutoff' : 'Need Targeted Practice to Clear CPCT Cutoff'}
                </h2>

                <div
                  className={`flex flex-wrap items-center gap-y-1 gap-x-3 text-xs mt-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  <span>Test: <strong className="font-semibold">{submission.testTitle}</strong></span>
                  <span className="opacity-40">·</span>
                  <span>Time Taken: <span className="font-mono">{Math.round(submission.timeSpentSeconds / 60)} mins</span></span>
                  <span className="opacity-40">·</span>
                  <span>Passing Criterion: <span className="font-mono">≥ 50%</span></span>
                </div>
              </div>
            </div>

            {/* Metric Displays */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                className={`rounded-xl border px-5 py-3 text-center min-w-[110px] ${
                  isDark
                    ? 'bg-[#060a14] border-[#162544]'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <span
                  className={`text-[10px] uppercase tracking-wider block font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Marks Obtained
                </span>
                <span
                  className={`text-2xl font-bold font-mono tabular-nums block mt-0.5 ${
                    isPassed
                      ? isDark
                        ? 'text-emerald-400'
                        : 'text-emerald-700'
                      : isDark
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  {submission.score} / {submission.totalQuestions}
                </span>
                <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Net Score
                </span>
              </div>

              <div
                className={`rounded-xl border px-5 py-3 text-center min-w-[110px] ${
                  isDark
                    ? 'bg-[#060a14] border-[#162544]'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <span
                  className={`text-[10px] uppercase tracking-wider block font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Percentage
                </span>
                <span
                  className={`text-2xl font-bold font-mono tabular-nums block mt-0.5 ${
                    submission.percentage >= 60
                      ? isDark
                        ? 'text-emerald-400'
                        : 'text-emerald-700'
                      : submission.percentage >= 50
                      ? isDark
                        ? 'text-amber-400'
                        : 'text-amber-700'
                      : isDark
                      ? 'text-rose-400'
                      : 'text-rose-700'
                  }`}
                >
                  {submission.percentage}%
                </span>
                <span className={`text-[11px] font-semibold block mt-0.5 ${
                  isPassed
                    ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                    : isDark ? 'text-rose-400' : 'text-rose-700'
                }`}>
                  {isPassed ? 'Qualified' : 'Below 50%'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div
            className={`mt-6 pt-5 border-t flex flex-wrap items-center justify-between gap-3 ${
              isDark ? 'border-[#162544]' : 'border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={onBackToCatalog}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                isDark
                  ? 'bg-[#060a14] hover:bg-[#0c1427] text-slate-200 border-[#162544]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </button>

            {test && (
              <button
                type="button"
                onClick={() => onRetakeTest(test.id)}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shadow-blue-600/30"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Assessment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Topic-Wise Performance Matrix */}
      <div
        className={`rounded-xl border p-5 transition-colors ${
          isDark ? 'bg-[#0a101f] border-[#162544]' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Topic-Wise Competency Analysis
            </h3>
          </div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Threshold for Passing: 50% per topic
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(topicBreakdown).map(([topic, stats]: [string, any]) => {
            const isWeak = stats.isWeakArea || stats.percentage < 50;

            return (
              <div
                key={topic}
                className={`p-4 rounded-lg border transition-colors ${
                  isWeak
                    ? isDark
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-rose-50/50 border-rose-200'
                    : isDark
                    ? 'bg-[#060a14] border-[#162544]'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`font-semibold text-xs truncate ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    {topic}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                      isWeak
                        ? isDark
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-rose-100 text-rose-700'
                        : isDark
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isWeak ? 'Weak Area' : 'Strong Area'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <span
                    className={`text-xl font-bold font-mono tabular-nums ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {stats.correct} / {stats.total}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold tabular-nums ${
                      stats.percentage >= 60
                        ? isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-700'
                        : stats.percentage >= 50
                        ? isDark
                          ? 'text-amber-400'
                          : 'text-amber-700'
                        : isDark
                        ? 'text-rose-400'
                        : 'text-rose-700'
                    }`}
                  >
                    {stats.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className={`w-full h-1.5 rounded-full mt-2.5 overflow-hidden ${
                    isDark ? 'bg-[#162544]' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all ${
                      stats.percentage >= 60
                        ? 'bg-emerald-500'
                        : stats.percentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, stats.percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Question-By-Question Detailed Explanations */}
      <div
        className={`rounded-xl border p-5 space-y-4 transition-colors ${
          isDark ? 'bg-[#0a101f] border-[#162544]' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {/* Review Toolbar */}
        <div
          className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
            isDark ? 'border-[#162544]' : 'border-slate-200'
          }`}
        >
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <BookOpen className="w-4 h-4 text-blue-500" />
              Detailed Answer Key & Conceptual Solutions ({filteredQuestions.length} Questions)
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Review correct options and in-depth bilingual explanations in Hindi or English
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Topic Filter */}
            {topicsList.length > 1 && (
              <select
                aria-label="Filter questions by topic"
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className={`text-xs font-medium rounded-lg px-3 py-1.5 border transition-colors focus:outline-none cursor-pointer ${
                  isDark
                    ? 'bg-[#060a14] border-[#162544] text-slate-200'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">All Topics</option>
                {topicsList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              aria-label="Filter questions by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`text-xs font-medium rounded-lg px-3 py-1.5 border transition-colors focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-[#060a14] border-[#162544] text-slate-200'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <option value="all">All Questions</option>
              <option value="correct">Correct Questions</option>
              <option value="incorrect">Incorrect Questions</option>
              <option value="unattempted">Unattempted Only</option>
            </select>

            {/* Bilingual toggle */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${
                isDark
                  ? 'bg-[#060a14] border-[#162544] text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-blue-500" />
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lang:</span>
              <select
                aria-label="Explanation language"
                value={reviewLanguage}
                onChange={(e) => setReviewLanguage(e.target.value as any)}
                className={`bg-transparent font-semibold focus:outline-none cursor-pointer ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}
              >
                <option value="english" className={isDark ? 'bg-[#0a101f] text-slate-100' : 'bg-white text-slate-900'}>
                  English
                </option>
                <option value="hindi" className={isDark ? 'bg-[#0a101f] text-slate-100' : 'bg-white text-slate-900'}>
                  हिन्दी (Hindi)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const options = reviewLanguage === 'hindi' ? q.optionsHindi : q.optionsEnglish;
            const explanation =
              reviewLanguage === 'hindi' ? q.explanationHindi : q.explanationEnglish;
            const questionText =
              reviewLanguage === 'hindi' ? q.questionTextHindi : q.questionTextEnglish;

            return (
              <div
                key={q.id}
                className={`rounded-lg border p-5 space-y-4 text-xs sm:text-sm transition-colors ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                {/* Question Header */}
                <div
                  className={`flex items-center justify-between gap-2 border-b pb-3 ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold font-mono text-xs px-2 py-0.5 rounded ${
                        isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Q.{idx + 1}
                    </span>
                    <span
                      className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {q.topic} {q.subtopic ? `· ${q.subtopic}` : ''}
                    </span>
                  </div>

                  <div>
                    {q.isCorrect ? (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                          isDark
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> Correct (+1.00)
                      </span>
                    ) : q.isAttempted ? (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                          isDark
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" /> Incorrect (0.00)
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 font-medium px-2.5 py-0.5 rounded-full text-xs ${
                          isDark
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Unattempted
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Statement */}
                <p
                  className={`font-medium leading-relaxed ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  } ${reviewLanguage === 'hindi' ? 'font-hindi text-base' : 'text-sm'}`}
                >
                  {questionText}
                </p>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {options.map((opt, oIdx) => {
                    const isCandidateChoice = q.userAnswerIndex === oIdx;
                    const isCorrectAnswer = q.correctAnswerIndex === oIdx;

                    let optClass = isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700';

                    if (isCorrectAnswer) {
                      optClass = isDark
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500/30'
                        : 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-400/40';
                    } else if (isCandidateChoice && !isCorrectAnswer) {
                      optClass = isDark
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/30'
                        : 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400/40';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${optClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px] opacity-75 shrink-0">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span className={reviewLanguage === 'hindi' ? 'font-hindi' : ''}>
                            {opt}
                          </span>
                        </div>

                        {isCorrectAnswer && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider shrink-0 inline-flex items-center gap-1 ${
                              isDark ? 'text-emerald-400' : 'text-emerald-700'
                            }`}
                          >
                            <Check className="w-3 h-3" /> Correct Key
                          </span>
                        )}
                        {isCandidateChoice && !isCorrectAnswer && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider shrink-0 inline-flex items-center gap-1 ${
                              isDark ? 'text-rose-400' : 'text-rose-700'
                            }`}
                          >
                            <X className="w-3 h-3" /> Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Answer Explanation Box */}
                <div
                  className={`rounded-lg border p-3.5 space-y-1.5 ${
                    isDark
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-indigo-400' : 'text-indigo-700'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Conceptual Solution & Key Rationale
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    } ${reviewLanguage === 'hindi' ? 'font-hindi text-sm' : ''}`}
                  >
                    {explanation}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredQuestions.length === 0 && (
            <div
              className={`text-center py-12 rounded-lg border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              No questions matched the selected filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
