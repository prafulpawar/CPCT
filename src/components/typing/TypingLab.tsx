import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  RotateCcw,
  Keyboard as KeyboardIcon,
  Check,
  X,
  TrendingUp,
  Volume2,
  VolumeX,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import { Passage, TypingSessionResult } from '../../types/index.ts';
import { calculateTypingMetrics } from '../../utils/typingLogic.ts';
import { VirtualKeyboard } from './VirtualKeyboard.tsx';
import { TypingResultModal } from './TypingResultModal.tsx';
import { TypingHistoryView } from './TypingHistoryView.tsx';

interface TypingLabProps {
  userId: string;
  theme?: 'dark' | 'light';
}

export const TypingLab: React.FC<TypingLabProps> = ({ userId, theme = 'dark' }) => {
  // Config state
  const [language, setLanguage] = useState<'hindi' | 'english'>('english');
  const [script, setScript] = useState<'remington_gail' | 'inscript' | 'english'>('english');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'typing' | 'history'>('typing');

  // Typing session state
  const [typedText, setTypedText] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(durationMinutes * 60);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [activeKey, setActiveKey] = useState<string>('');
  const [resultModalData, setResultModalData] = useState<TypingSessionResult | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFinishedRef = useRef<boolean>(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadPassages(language);
    if (language === 'hindi') {
      if (script === 'english') setScript('remington_gail');
    } else {
      setScript('english');
    }
  }, [language]);

  useEffect(() => {
    if (!isRunning) {
      setTimeRemaining(durationMinutes * 60);
    }
  }, [durationMinutes]);

  const loadPassages = async (lang: 'hindi' | 'english') => {
    try {
      const list = await api.getPassages(lang);
      setPassages(list);
      if (list.length > 0) {
        setSelectedPassage(list[0]);
      }
    } catch (err) {
      console.error('Failed to load passages:', err);
    }
  };

  const totalElapsedSeconds = Math.max(1, durationMinutes * 60 - timeRemaining);
  const targetText = selectedPassage?.content || '';
  const liveMetrics = calculateTypingMetrics(
    targetText,
    typedText,
    totalElapsedSeconds,
    backspaceCount
  );

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeRemaining]);

  const startSession = () => {
    setTypedText('');
    setBackspaceCount(0);
    setTimeRemaining(durationMinutes * 60);
    setIsRunning(true);
    isFinishedRef.current = false;
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const resetSession = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTypedText('');
    setBackspaceCount(0);
    setTimeRemaining(durationMinutes * 60);
    isFinishedRef.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setActiveKey(e.key);

    if (e.key === 'Backspace') {
      setBackspaceCount((prev) => prev + 1);
    }

    if (soundEnabled && e.key.length === 1) {
      playClickSound();
    }

    if (!isRunning && !isFinishedRef.current) {
      setIsRunning(true);
    }
  };

  const handleKeyUp = () => {
    setTimeout(() => setActiveKey(''), 150);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinishedRef.current) return;
    const value = e.target.value;
    setTypedText(value);

    if (targetText.length > 0 && value.length >= targetText.length) {
      handleCompleteSession();
    }
  };

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch {}
  };

  const handleCompleteSession = async () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = Math.max(1, durationMinutes * 60 - timeRemaining);
    const finalMetrics = calculateTypingMetrics(targetText, typedText, timeSpent, backspaceCount);

    try {
      const savedResult = await api.submitTypingResult({
        userId,
        passageId: selectedPassage?.id,
        passageTitle: selectedPassage?.title || 'Practice Session',
        language,
        script,
        durationMinutes,
        timeSpentSeconds: timeSpent,
        grossWpm: finalMetrics.grossWpm,
        netWpm: finalMetrics.netWpm,
        cpm: finalMetrics.cpm,
        accuracy: finalMetrics.accuracy,
        correctWords: finalMetrics.correctWords,
        incorrectWords: finalMetrics.incorrectWords,
        correctCharacters: finalMetrics.correctCharacters,
        incorrectCharacters: finalMetrics.incorrectCharacters,
        backspaceCount,
        totalKeystrokes: finalMetrics.totalKeystrokes,
      });

      setResultModalData(savedResult);
    } catch (err) {
      console.error('Failed to submit typing result:', err);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (viewMode === 'history') {
    return (
      <TypingHistoryView
        userId={userId}
        theme={theme}
        onBackToPractice={() => setViewMode('typing')}
      />
    );
  }

  const targetWpm = language === 'hindi' ? 20 : 30;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* 1. Executive Setup Deck */}
      <div
        className={`rounded-xl border p-4 transition-colors ${
          isDark
            ? 'bg-[#0a101f] border-[#162544] text-slate-100 shadow-lg'
            : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Segmented Controls for Language & Timer */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Segmented Control */}
            <div
              className={`flex items-center p-1 rounded-lg border text-xs font-semibold ${
                isDark ? 'bg-[#060a14] border-[#162544]' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setLanguage('english');
                  resetSession();
                }}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  language === 'english'
                    ? isDark
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-900 shadow-xs font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English <span className="opacity-70 font-normal">· 30 WPM</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('hindi');
                  resetSession();
                }}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  language === 'hindi'
                    ? isDark
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-900 shadow-xs font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी <span className="opacity-70 font-normal">· 20 WPM</span>
              </button>
            </div>

            {/* Script selector for Hindi */}
            {language === 'hindi' && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
                  isDark ? 'bg-[#060a14] border-[#162544]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Keyboard:</span>
                <select
                  aria-label="Hindi Keyboard Layout"
                  value={script}
                  onChange={(e) => setScript(e.target.value as any)}
                  className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="remington_gail" className={isDark ? 'bg-[#0a101f] text-slate-100' : 'bg-white text-slate-900'}>
                    Remington Gail (Mangal)
                  </option>
                  <option value="inscript" className={isDark ? 'bg-[#0a101f] text-slate-100' : 'bg-white text-slate-900'}>
                    Inscript Layout
                  </option>
                </select>
              </div>
            )}

            {/* Timer Segmented Control */}
            <div
              className={`flex items-center p-1 rounded-lg border text-xs font-mono font-medium ${
                isDark ? 'bg-[#060a14] border-[#162544]' : 'bg-slate-100 border-slate-200'
              }`}
            >
              {[1, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setDurationMinutes(mins);
                    resetSession();
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    durationMinutes === mins
                      ? isDark
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-white text-slate-900 font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Right: Functional Action Toggles */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                showKeyboard
                  ? isDark
                    ? 'border-blue-500/40 bg-blue-950/40 text-blue-300'
                    : 'border-blue-300 bg-blue-50 text-blue-700'
                  : isDark
                  ? 'border-[#162544] text-slate-400 hover:bg-[#0c1427]'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <KeyboardIcon className="w-3.5 h-3.5" />
              <span>Keyboard Layout</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label={soundEnabled ? 'Disable Key Audio' : 'Enable Key Audio'}
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? 'border-[#162544] text-slate-400 hover:text-white hover:bg-[#0c1427]'
                  : 'border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setViewMode('history')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isDark
                  ? 'border-[#1b2b4c] bg-[#0c1427] hover:bg-[#121f3d] text-slate-200'
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800 shadow-xs'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Speed History</span>
            </button>
          </div>
        </div>

        {/* Passage Selector Bar */}
        <div className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark ? 'border-[#162544] text-slate-400' : 'border-slate-100 text-slate-500'
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="shrink-0 font-medium">Test Passage:</span>
            <select
              aria-label="Select typing passage"
              value={selectedPassage?.id || ''}
              onChange={(e) => {
                const found = passages.find((p) => p.id === e.target.value);
                if (found) {
                  setSelectedPassage(found);
                  resetSession();
                }
              }}
              className={`border rounded-md px-2.5 py-1 font-medium w-full max-w-md focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-[#060a14] border-[#162544] text-slate-200 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-blue-600'
              }`}
            >
              {passages.map((p) => (
                <option key={p.id} value={p.id} className={isDark ? 'bg-[#0a101f] text-slate-100' : 'bg-white text-slate-900'}>
                  {language === 'hindi' ? p.titleHindi : p.title} ({p.difficulty} · {p.wordCount} words)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>CPCT Benchmark:</span>
            <span
              className={`font-semibold font-mono px-2 py-0.5 rounded text-xs ${
                isDark ? 'bg-blue-950/60 border border-blue-500/30 text-blue-300' : 'bg-slate-100 text-emerald-700'
              }`}
            >
              {language === 'hindi' ? '20 WPM (Hindi)' : '30 WPM (English)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Cohesive Executive Metrics HUD Strip (Tabular numerals, subtle hairline dividers) */}
      <div
        className={`rounded-xl border grid grid-cols-2 sm:grid-cols-6 divide-x divide-y sm:divide-y-0 transition-colors ${
          isDark
            ? 'bg-[#0a101f] border-[#162544] divide-[#162544] shadow-md'
            : 'bg-white border-slate-200 divide-slate-200 shadow-xs'
        }`}
      >
        {/* Time Left */}
        <div className="p-3.5 text-center">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase block">Time Remaining</span>
          <div
            className={`text-2xl font-bold font-mono tabular-nums mt-0.5 ${
              timeRemaining <= 60 && isRunning ? 'text-rose-500 animate-pulse' : isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            {durationMinutes} min session
          </span>
        </div>

        {/* Net WPM */}
        <div className="p-3.5 text-center">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase block">Net Speed</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-500 dark:text-blue-400 mt-0.5">
            {liveMetrics.netWpm} <span className="text-xs font-normal opacity-70">WPM</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            Cutoff: {targetWpm} WPM
          </span>
        </div>

        {/* Gross Speed */}
        <div className="p-3.5 text-center">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase block">Gross Speed</span>
          <div className={`text-2xl font-bold font-mono tabular-nums mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {liveMetrics.grossWpm} <span className="text-xs font-normal opacity-70">WPM</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            {liveMetrics.cpm} CPM
          </span>
        </div>

        {/* Accuracy */}
        <div className="p-3.5 text-center">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase block">Accuracy</span>
          <div
            className={`text-2xl font-bold font-mono tabular-nums mt-0.5 ${
              liveMetrics.accuracy >= 90
                ? 'text-emerald-600 dark:text-emerald-400'
                : liveMetrics.accuracy >= 80
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {liveMetrics.accuracy}%
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Min 80% req.</span>
        </div>

        {/* Words Status */}
        <div className="p-3.5 text-center">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase block">Words Analyzed</span>
          <div className="text-lg font-bold font-mono tabular-nums mt-1 flex items-center justify-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
              {liveMetrics.correctWords}<Check className="w-3.5 h-3.5" />
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-rose-600 dark:text-rose-400 inline-flex items-center gap-0.5">
              {liveMetrics.incorrectWords}<X className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Correct · Error</span>
        </div>

        {/* Backspace Count & Impact */}
        <div className="p-3.5 text-center">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase block">Backspaces</span>
          <div className={`text-2xl font-bold font-mono tabular-nums mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {backspaceCount}
          </div>
          <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
            Impact: {liveMetrics.backspaceImpact}
          </span>
        </div>
      </div>

      {/* 3. Main Typing Laboratory Stage */}
      <div
        className={`rounded-xl border overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#0a101f] border-[#162544] shadow-xl'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {/* Target Passage Presentation Area */}
        <div
          className={`p-6 border-b text-base sm:text-lg leading-relaxed font-mono select-none max-h-56 overflow-y-auto ${
            isDark
              ? 'bg-[#060a14] border-[#162544] text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          {targetText.split('').map((char, index) => {
            const isTyped = index < typedText.length;
            const isCurrent = index === typedText.length;
            const isCorrect = isTyped && typedText[index] === char;

            let charClass = isDark ? 'text-slate-500' : 'text-slate-400';
            if (isTyped) {
              charClass = isCorrect
                ? isDark
                  ? 'text-emerald-400'
                  : 'text-emerald-700 font-medium'
                : isDark
                ? 'text-rose-400 bg-rose-950/60 underline decoration-rose-500'
                : 'text-rose-600 bg-rose-100 underline decoration-rose-400';
            }
            if (isCurrent) {
              charClass += isDark
                ? ' bg-blue-500 text-white font-bold rounded-xs shadow-xs shadow-blue-500/50'
                : ' bg-blue-600 text-white font-bold rounded-xs';
            }

            return (
              <span key={index} className={`${charClass} transition-colors`}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Real-time Typing Input Area */}
        <div className="p-4 sm:p-5">
          <div className="relative">
            <textarea
              ref={inputRef}
              rows={4}
              value={typedText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              placeholder={
                language === 'hindi'
                  ? 'टंकण प्रारंभ करने के लिए यहाँ टाइप करना शुरू करें...'
                  : 'Click here or press Start Typing to begin session...'
              }
              className={`w-full border rounded-xl p-4 font-mono text-base focus:outline-none transition-all resize-none ${
                isDark
                  ? 'bg-[#060a14] border-[#162544] text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-inner'
              }`}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              onPaste={(e) => e.preventDefault()}
            />

            {!isRunning && typedText.length === 0 && (
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-xs pointer-events-none ${
                  isDark ? 'bg-[#060a14]/75 text-slate-300' : 'bg-white/70 text-slate-700'
                }`}
              >
                <div
                  className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border shadow-xs ${
                    isDark
                      ? 'bg-[#0c1427] border-blue-500/40 text-blue-300'
                      : 'bg-white border-slate-200 text-blue-700'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Press any key or click Start Practice to begin timed session
                </div>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={startSession}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/30"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Start Practice
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteSession}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Finish & Evaluate
                </button>
              )}

              <button
                type="button"
                onClick={resetSession}
                className={`px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isDark
                    ? 'border-[#162544] text-slate-300 hover:bg-[#0c1427]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <ShieldAlert className="w-3.5 h-3.5 opacity-70" />
              <span>Copy-Paste strictly locked to simulate CPCT examination conditions</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. On-Screen Physical Keyboard */}
      {showKeyboard && (
        <VirtualKeyboard
          language={language}
          script={script}
          activeKey={activeKey}
          theme={theme}
        />
      )}

      {/* 5. Result Certificate Modal */}
      {resultModalData && (
        <TypingResultModal
          result={resultModalData}
          targetWpm={targetWpm}
          theme={theme}
          onClose={() => setResultModalData(null)}
          onRestart={() => {
            setResultModalData(null);
            resetSession();
            startSession();
          }}
          onViewHistory={() => {
            setResultModalData(null);
            setViewMode('history');
          }}
        />
      )}
    </div>
  );
};
