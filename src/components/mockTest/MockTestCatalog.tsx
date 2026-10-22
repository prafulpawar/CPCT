import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  Award,
  Shuffle,
  Play,
  CheckCircle2,
  ListFilter,
  History,
  FileCheck,
  Check,
  X,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import { MockTestItem, TestSubmissionResult } from '../../types/index.ts';

interface MockTestCatalogProps {
  onStartTest: (testId: string, shuffle: boolean) => void;
  onViewReview: (submissionId: string) => void;
  userId: string;
  theme?: 'dark' | 'light';
}

export const MockTestCatalog: React.FC<MockTestCatalogProps> = ({
  onStartTest,
  onViewReview,
  userId,
  theme = 'dark',
}) => {
  const [tests, setTests] = useState<MockTestItem[]>([]);
  const [submissions, setSubmissions] = useState<TestSubmissionResult[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'submissions'>('available');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'full_length' | 'topic_wise'>('all');
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [testList, subList] = await Promise.all([
        api.getMockTests(),
        api.getTestSubmissions(userId),
      ]);
      setTests(testList);
      setSubmissions(subList);
    } catch (err) {
      console.error('Failed to load mock tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Overview Card */}
      <div
        className={`rounded-xl border p-6 transition-colors ${
          isDark
            ? 'bg-[#0a101f] border-[#162544] text-slate-100 shadow-xl'
            : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">
              Official Examination Protocol
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              CPCT Mock Test Engine & Question Bank
            </h2>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Full-length and specialized topic evaluations modeled directly after the official Madhya Pradesh
              Computer Proficiency Certification Test syllabus.
            </p>
          </div>

          {/* Quick Passing Spec Box */}
          <div
            className={`p-4 rounded-xl border text-xs shrink-0 md:w-64 space-y-2 ${
              isDark ? 'bg-[#060a14] border-[#162544]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Exam Benchmark:</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-bold font-mono">50% Pass</span>
            </div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Total Marks:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">75 Questions</span>
              </div>
              <div className="flex justify-between">
                <span>Marking Scheme:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">+1.00 · No Negative</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Switcher & Shuffling Toggle */}
        <div className={`mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-4 ${
          isDark ? 'border-[#162544]' : 'border-slate-100'
        }`}>
          {/* Segmented Tab Control */}
          <div
            className={`flex items-center p-1 rounded-lg border text-xs font-semibold ${
              isDark ? 'bg-[#060a14] border-[#162544]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('available')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'available'
                  ? isDark
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Available Tests ({tests.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'submissions'
                  ? isDark
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions & Review ({submissions.length})</span>
            </button>
          </div>

          {activeTab === 'available' && (
            <label className={`flex items-center gap-2 cursor-pointer text-xs select-none px-3 py-1.5 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#060a14] border-[#162544] text-slate-300 hover:bg-[#0c1427]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="rounded border-[#162544] text-blue-600 focus:ring-0 cursor-pointer"
              />
              <Shuffle className="w-3.5 h-3.5 opacity-70" />
              <span>Randomize Questions & Shuffled Options</span>
            </label>
          )}
        </div>
      </div>

      {activeTab === 'available' && (
        <div className="space-y-4">
          {/* Segmented Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Filter:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedCategory === 'all'
                  ? isDark
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Tests
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('full_length')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedCategory === 'full_length'
                  ? isDark
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Full-Length Mock
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('topic_wise')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedCategory === 'topic_wise'
                  ? isDark
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Topic-Wise MCQs
            </button>
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                  isDark
                    ? 'bg-[#0a101f] border-[#162544] hover:border-blue-500/40 text-slate-100 shadow-lg hover:shadow-blue-950/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-blue-500 dark:text-blue-400">
                      {test.category === 'full_length' ? 'Full Mock Exam' : 'Topic Test'}
                    </span>
                    <span className="font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {test.durationMinutes} Mins
                    </span>
                  </div>

                  <h3 className="font-bold text-base leading-snug">
                    {test.title}
                  </h3>
                  <div className="text-xs text-blue-400/90 font-hindi mt-1">
                    {test.titleHindi}
                  </div>

                  <p className={`text-xs mt-2.5 line-clamp-2 leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {test.description}
                  </p>

                  <div className={`mt-4 pt-3 border-t grid grid-cols-3 gap-2 text-center text-xs ${
                    isDark ? 'border-[#162544]' : 'border-slate-100'
                  }`}>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-[#060a14]' : 'bg-slate-50'}`}>
                      <div className="font-bold font-mono">{test.totalQuestions}</div>
                      <div className="text-[10px] text-slate-500">Questions</div>
                    </div>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-[#060a14]' : 'bg-slate-50'}`}>
                      <div className="font-bold font-mono">{test.totalMarks}</div>
                      <div className="text-[10px] text-slate-500">Marks</div>
                    </div>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-[#060a14]' : 'bg-slate-50'}`}>
                      <div className="font-bold font-mono text-emerald-500 dark:text-emerald-400">{test.passingMarks}</div>
                      <div className="text-[10px] text-slate-500">Pass Cutoff</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => onStartTest(test.id, shuffleOptions)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-600/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Enter Exam Console
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div
          className={`rounded-xl border overflow-hidden transition-colors ${
            isDark
              ? 'bg-[#0a101f] border-[#162544] text-slate-100 shadow-xl'
              : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}
        >
          <div className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-[#162544]' : 'border-slate-100'
          }`}>
            <h3 className="font-bold text-sm">Attempt Records ({submissions.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase tracking-wider text-[10px] font-semibold border-b ${
                isDark
                  ? 'bg-[#060a14] text-slate-400 border-[#162544]'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                <tr>
                  <th className="py-3 px-4">Test Title</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Breakdown (Correct / Error / Left)</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#162544] text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
                {submissions.map((sub) => (
                  <tr key={sub.id} className={isDark ? 'hover:bg-[#0c1427]' : 'hover:bg-slate-50'}>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {sub.testTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {sub.score} / {sub.totalQuestions}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={sub.percentage >= 50 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                        {sub.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5">
                        {sub.correctCount}<Check className="w-3 h-3" />
                      </span>
                      {' · '}
                      <span className="text-rose-500 dark:text-rose-400 font-bold inline-flex items-center gap-0.5">
                        {sub.incorrectCount}<X className="w-3 h-3" />
                      </span>
                      {' · '}
                      <span>{sub.unattemptedCount}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={sub.passed ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                        {sub.passed ? 'Passed (≥50%)' : 'Failed (<50%)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewReview(sub.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold text-xs transition-colors shadow-sm shadow-blue-600/30"
                      >
                        Review Explanations
                      </button>
                    </td>
                  </tr>
                ))}

                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No test submissions yet. Start your first mock test above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
