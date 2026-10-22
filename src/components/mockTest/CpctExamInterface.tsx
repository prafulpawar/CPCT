import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Languages,
  CheckCircle,
  HelpCircle,
  Monitor,
} from 'lucide-react';
import { MockTestItem, ExamQuestion, UserProfile } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface CpctExamInterfaceProps {
  test: MockTestItem & { questions: ExamQuestion[] };
  user: UserProfile;
  theme?: 'dark' | 'light';
  onFinishTest: (submissionId: string) => void;
  onCancel: () => void;
}

type QuestionState = 'not_visited' | 'not_answered' | 'answered' | 'marked_review' | 'answered_marked_review';

export const CpctExamInterface: React.FC<CpctExamInterfaceProps> = ({
  test,
  user,
  theme = 'dark',
  onFinishTest,
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [examLanguage, setExamLanguage] = useState<'hindi' | 'english'>('english');
  const [timeRemaining, setTimeRemaining] = useState<number>(test.durationMinutes * 60);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({
    [test.questions[0]?.id]: true,
  });
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFinishedRef = useRef<boolean>(false);

  const isDark = theme === 'dark';
  const questions = test.questions || [];
  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (currentQ) {
      setVisitedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));
    }
  }, [currentIndex, currentQ]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAutoSubmit = () => {
    if (isFinishedRef.current) return;
    alert('⏰ Time Expired: Your CPCT examination has ended and is being automatically evaluated.');
    finalizeSubmission();
  };

  const finalizeSubmission = async () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = Math.max(1, test.durationMinutes * 60 - timeRemaining);

    try {
      const response = await api.submitMockTest(test.id, {
        userId: user.id,
        userAnswers,
        timeSpentSeconds: timeSpent,
      });

      onFinishTest(response.submission.id);
    } catch (err) {
      console.error('Failed to submit exam:', err);
      alert('Error submitting test. Please try again.');
      setIsSubmitting(false);
      isFinishedRef.current = false;
    }
  };

  const getQuestionState = (qId: string): QuestionState => {
    const isVisited = visitedQuestions[qId];
    const isAnswered = userAnswers[qId] !== undefined && userAnswers[qId] !== -1;
    const isMarked = markedForReview[qId];

    if (!isVisited) return 'not_visited';
    if (isAnswered && isMarked) return 'answered_marked_review';
    if (isMarked) return 'marked_review';
    if (isAnswered) return 'answered';
    return 'not_answered';
  };

  const counts = questions.reduce(
    (acc, q) => {
      const state = getQuestionState(q.id);
      acc[state]++;
      return acc;
    },
    {
      answered: 0,
      not_answered: 0,
      marked_review: 0,
      answered_marked_review: 0,
      not_visited: 0,
    }
  );

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setUserAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQ.id];
      return updated;
    });
  };

  const handleMarkForReviewAndNext = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: true,
    }));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSaveAndNext = () => {
    if (currentQ && markedForReview[currentQ.id]) {
      setMarkedForReview((prev) => {
        const copy = { ...prev };
        delete copy[currentQ.id];
        return copy;
      });
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const formatTimer = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentQ) {
    return <div className="text-center py-12 text-slate-400">Loading questions...</div>;
  }

  const selectedOption = userAnswers[currentQ.id];
  const options = examLanguage === 'hindi' ? currentQ.optionsHindi : currentQ.optionsEnglish;

  return (
    <div
      className={`rounded-xl border shadow-xl flex flex-col min-h-[760px] transition-colors max-w-7xl mx-auto overflow-hidden ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-300 text-slate-900'
      }`}
    >
      {/* 1. Official TCS-iON Style Exam Header */}
      <div
        className={`px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-4 ${
          isDark ? 'bg-[#060a14]/90 border-[#162544]' : 'bg-slate-100 border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
              Computer Proficiency Certification Test
            </span>
            <h2 className="text-base font-bold leading-tight mt-0.5">
              {test.title}
            </h2>
          </div>
        </div>

        {/* Right Header: Candidate metadata + Exam Timer + Language Selector */}
        <div className="flex items-center gap-5">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Languages className="w-4 h-4 opacity-70" />
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>View in:</span>
            <select
              aria-label="Exam question language"
              value={examLanguage}
              onChange={(e) => setExamLanguage(e.target.value as any)}
              className={`border rounded-md px-2 py-1 font-semibold focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-[#0a101f] border-[#162544] text-slate-200'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="english">English</option>
              <option value="hindi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
              timeRemaining <= 300
                ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/50 dark:border-rose-700 dark:text-rose-300 animate-pulse'
                : isDark
                ? 'bg-[#0a101f] border-[#162544] text-blue-400'
                : 'bg-white border-slate-300 text-emerald-700 shadow-2xs'
            }`}
          >
            <Clock className="w-4 h-4 opacity-80" />
            <span>Time Left: {formatTimer(timeRemaining)}</span>
          </div>

          {/* Candidate Badge */}
          <div className={`hidden md:flex items-center gap-2.5 pl-4 border-l ${
            isDark ? 'border-[#162544]' : 'border-slate-300'
          }`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
              {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold leading-tight">{user.name}</div>
              <div className={`text-[10px] font-mono leading-tight ${isDark ? 'text-blue-400/80' : 'text-slate-500'}`}>{user.rollNumber}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Exam Body (Question View vs Palette) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 flex-1">
        {/* Left: Question Work Area (3 cols) */}
        <div className={`lg:col-span-3 border-r flex flex-col justify-between p-6 ${
          isDark ? 'border-[#162544] bg-[#0a101f]' : 'border-slate-200 bg-white'
        }`}>
          <div>
            {/* Question Details Bar */}
            <div className={`flex items-center justify-between pb-3 mb-5 border-b text-xs ${
              isDark ? 'border-[#162544] text-slate-300' : 'border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-slate-500">·</span>
                <span className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  Section: {currentQ.topic}
                </span>
              </div>

              <div className="font-mono flex items-center gap-3">
                <span className="text-emerald-500 dark:text-emerald-400 font-semibold">+1.00 Marks</span>
                <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-500'}>0.00 Neg</span>
              </div>
            </div>

            {/* Question Statement */}
            <div className="mb-6">
              <p
                className={`text-base sm:text-lg font-medium leading-relaxed ${
                  examLanguage === 'hindi' ? 'font-hindi text-base sm:text-lg' : ''
                }`}
              >
                {examLanguage === 'hindi' ? currentQ.questionTextHindi : currentQ.questionTextEnglish}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5 max-w-3xl">
              {options.map((optionText, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? isDark
                          ? 'bg-blue-950/50 border-blue-500 text-white shadow-xs shadow-blue-500/20'
                          : 'bg-blue-50/70 border-blue-600 text-blue-950 shadow-xs'
                        : isDark
                        ? 'bg-[#060a14] border-[#162544] hover:border-blue-500/30 text-slate-200'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : isDark
                          ? 'bg-[#0a101f] border-[#162544] text-slate-400'
                          : 'bg-white border-slate-300 text-slate-600'
                      }`}
                    >
                      {letter}
                    </div>
                    <span
                      className={`text-sm sm:text-base leading-snug pt-0.5 ${
                        examLanguage === 'hindi' ? 'font-hindi' : ''
                      }`}
                    >
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className={`mt-8 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDark ? 'border-[#162544]' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`px-3.5 py-2 rounded-lg border font-semibold transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? 'border-[#162544] text-slate-300 hover:bg-[#060a14]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={handleClearResponse}
                className={`px-3.5 py-2 rounded-lg border font-semibold transition-colors ${
                  isDark
                    ? 'border-[#162544] text-slate-400 hover:text-slate-200 hover:bg-[#060a14]'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                Clear Response
              </button>

              <button
                type="button"
                onClick={handleMarkForReviewAndNext}
                className={`px-3.5 py-2 rounded-lg border font-semibold transition-colors flex items-center gap-1.5 ${
                  isDark
                    ? 'border-amber-500/40 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30'
                    : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Mark for Review & Next
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
              >
                Save & Next
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-xs ml-1"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Palette (1 col) */}
        <div className={`p-5 flex flex-col justify-between ${
          isDark ? 'bg-[#060a14] border-l border-[#162544]' : 'bg-slate-50'
        }`}>
          <div className="space-y-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider pb-2 border-b ${
              isDark ? 'border-[#162544] text-slate-400' : 'border-slate-200 text-slate-600'
            }`}>
              Question Palette
            </h3>

            {/* TCS-iON Standard Legend */}
            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-xs bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] font-mono">
                  {counts.answered}
                </span>
                <span className="text-[11px]">Answered</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-xs bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] font-mono">
                  {counts.not_answered}
                </span>
                <span className="text-[11px]">Not Answered</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] font-mono">
                  {counts.marked_review}
                </span>
                <span className="text-[11px]">Marked Review</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-xs font-bold flex items-center justify-center text-[10px] font-mono ${
                  isDark ? 'bg-[#0a101f] text-slate-400 border border-[#162544]' : 'bg-slate-300 text-slate-800'
                }`}>
                  {counts.not_visited}
                </span>
                <span className="text-[11px]">Not Visited</span>
              </div>

              <div className={`col-span-2 flex items-center gap-2 pt-1 border-t ${isDark ? 'border-[#162544]' : 'border-slate-200'}`}>
                <span className="w-4 h-4 rounded-full bg-amber-500 ring-2 ring-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[8px] font-mono">
                  ●
                </span>
                <span className="text-[11px]">Ans. & Marked for Review</span>
              </div>
            </div>

            {/* Question Numbers Grid */}
            <div className={`pt-3 border-t ${isDark ? 'border-[#162544]' : 'border-slate-200'}`}>
              <span className="text-[11px] font-medium text-slate-500 block mb-2">
                Choose question number:
              </span>

              <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const state = getQuestionState(q.id);
                  const isCurrent = idx === currentIndex;

                  let shapeClass = 'rounded-xs';
                  let bgClass = isDark
                    ? 'bg-[#0a101f] text-slate-400 border border-[#162544]'
                    : 'bg-white text-slate-600 border border-slate-300';

                  if (state === 'answered') {
                    bgClass = 'bg-emerald-600 text-white font-bold border-emerald-600';
                  } else if (state === 'not_answered') {
                    bgClass = 'bg-rose-600 text-white font-bold border-rose-600';
                  } else if (state === 'marked_review') {
                    shapeClass = 'rounded-full';
                    bgClass = 'bg-amber-500 text-slate-950 font-bold border-amber-500';
                  } else if (state === 'answered_marked_review') {
                    shapeClass = 'rounded-full ring-2 ring-emerald-400';
                    bgClass = 'bg-amber-500 text-slate-950 font-bold border-amber-500';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 font-mono text-xs transition-transform flex items-center justify-center ${shapeClass} ${bgClass} ${
                        isCurrent ? 'ring-2 ring-blue-500 font-bold scale-105 shadow-xs' : 'hover:opacity-90'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Abort / Exit to Catalog */}
          <div className={`pt-4 border-t ${isDark ? 'border-[#162544]' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={() => {
                if (confirm('Exit exam session? Progress will not be evaluated.')) {
                  onCancel();
                }
              }}
              className={`w-full py-2 rounded-lg text-xs font-medium transition-colors border ${
                isDark
                  ? 'border-[#162544] text-slate-400 hover:text-slate-200 hover:bg-[#0a101f]'
                  : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Exit to Test Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Final Submission Modal */}
      {showSubmitModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exam-submit-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div
            className={`w-full max-w-md rounded-xl border p-6 shadow-2xl transition-colors ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 id="exam-submit-title" className="font-bold text-lg">
              Confirm Final Submission
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Review your question attempt status before final evaluation:
            </p>

            <div className={`rounded-lg border p-4 my-4 space-y-2 text-xs ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Total Questions:</span>
                <span className="font-bold font-mono">{questions.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Attempted:</span>
                <span className="font-mono">{counts.answered + counts.answered_marked_review}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 font-semibold">
                <span>Unattempted:</span>
                <span className="font-mono">{counts.not_answered + counts.not_visited}</span>
              </div>
              <div className="flex justify-between py-1 text-purple-600 dark:text-purple-400 font-semibold">
                <span>Marked for Review:</span>
                <span className="font-mono">{counts.marked_review}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Back to Exam
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={finalizeSubmission}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
