/**
 * Typing Lab Calculation & Evaluation Logic
 * Handles Gross WPM, Net WPM, CPM, Accuracy %, Backspace Analysis, and Error Categorization
 */

export interface TypingMetrics {
  grossWpm: number;
  netWpm: number;
  cpm: number;
  accuracy: number;
  totalKeystrokes: number;
  correctWords: number;
  incorrectWords: number;
  correctCharacters: number;
  incorrectCharacters: number;
  backspaceCount: number;
  backspaceImpact: 'Low' | 'Moderate' | 'High';
  errorRate: number;
  elapsedSeconds: number;
}

export interface DetailedError {
  expected: string;
  actual: string;
  wordIndex: number;
  charIndex: number;
}

export function calculateTypingMetrics(
  originalText: string,
  typedText: string,
  timeElapsedSeconds: number,
  backspaceCount: number
): TypingMetrics {
  const safeTimeInMinutes = Math.max(timeElapsedSeconds / 60, 0.016667); // minimum 1 second equivalent
  const totalKeystrokes = typedText.length;

  if (totalKeystrokes === 0 || timeElapsedSeconds <= 0) {
    return {
      grossWpm: 0,
      netWpm: 0,
      cpm: 0,
      accuracy: 100,
      totalKeystrokes: 0,
      correctWords: 0,
      incorrectWords: 0,
      correctCharacters: 0,
      incorrectCharacters: 0,
      backspaceCount,
      backspaceImpact: 'Low',
      errorRate: 0,
      elapsedSeconds: timeElapsedSeconds,
    };
  }

  // Character-by-character analysis
  let correctCharacters = 0;
  let incorrectCharacters = 0;
  const minLength = Math.min(originalText.length, typedText.length);

  for (let i = 0; i < minLength; i++) {
    if (typedText[i] === originalText[i]) {
      correctCharacters++;
    } else {
      incorrectCharacters++;
    }
  }

  // Extra typed characters beyond original text count as errors
  if (typedText.length > originalText.length) {
    incorrectCharacters += typedText.length - originalText.length;
  }

  // Word-by-word analysis (splitting by whitespace)
  const originalWords = originalText.trim().split(/\s+/);
  const typedWords = typedText.trim().split(/\s+/);

  let correctWords = 0;
  let incorrectWords = 0;

  for (let i = 0; i < typedWords.length; i++) {
    if (i < originalWords.length && typedWords[i] === originalWords[i]) {
      correctWords++;
    } else {
      incorrectWords++;
    }
  }

  // CPCT standard & International formula:
  // CPM (Characters Per Minute) = total typed characters / minutes
  const rawCpm = Math.round(totalKeystrokes / safeTimeInMinutes);
  const cpm = Math.min(rawCpm, 800);

  // Gross WPM = (Total characters typed / 5) / minutes
  const rawGrossWpm = Math.round((totalKeystrokes / 5) / safeTimeInMinutes);
  const grossWpm = Math.min(rawGrossWpm, 160);

  // Net WPM = Math.max(0, (Correct characters - incorrectCharacters) / 5 / minutes)
  const rawNetWpm = Math.max(
    0,
    Math.round(((correctCharacters - incorrectCharacters) / 5) / safeTimeInMinutes)
  );
  const netWpm = Math.min(rawNetWpm, grossWpm);

  // Accuracy %
  const accuracy = Math.max(
    0,
    Math.min(100, Math.round((correctCharacters / totalKeystrokes) * 100))
  );

  // Backspace impact analysis
  const backspaceRatio = backspaceCount / Math.max(1, totalKeystrokes);
  let backspaceImpact: 'Low' | 'Moderate' | 'High' = 'Low';
  if (backspaceRatio > 0.15) {
    backspaceImpact = 'High';
  } else if (backspaceRatio > 0.07) {
    backspaceImpact = 'Moderate';
  }

  const errorRate = Math.round((incorrectCharacters / Math.max(1, totalKeystrokes)) * 100);

  return {
    grossWpm,
    netWpm,
    cpm,
    accuracy,
    totalKeystrokes,
    correctWords,
    incorrectWords,
    correctCharacters,
    incorrectCharacters,
    backspaceCount,
    backspaceImpact,
    errorRate,
    elapsedSeconds: timeElapsedSeconds,
  };
}

export interface TopicPerformance {
  topic: string;
  topicNameHindi?: string;
  total: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  percentage: number;
  isWeakArea: boolean;
}

export interface MockTestEvaluation {
  totalQuestions: number;
  totalMarks: number;
  scoreObtained: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  passed: boolean;
  topicBreakdown: Record<string, TopicPerformance>;
  weakTopics: string[];
}

export function evaluateMockTest(
  questions: Array<{
    id: number | string;
    topic: string;
    correctAnswerIndex: number;
  }>,
  userAnswers: Record<string | number, number>,
  passingPercentage: number = 50
): MockTestEvaluation {
  const totalQuestions = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const topicMap: Record<
    string,
    { total: number; correct: number; incorrect: number; unattempted: number }
  > = {};

  questions.forEach((q) => {
    if (!topicMap[q.topic]) {
      topicMap[q.topic] = { total: 0, correct: 0, incorrect: 0, unattempted: 0 };
    }
    topicMap[q.topic].total++;

    const selectedOption = userAnswers[q.id];
    if (selectedOption === undefined || selectedOption === null || selectedOption === -1) {
      unattemptedCount++;
      topicMap[q.topic].unattempted++;
    } else if (selectedOption === q.correctAnswerIndex) {
      correctCount++;
      topicMap[q.topic].correct++;
    } else {
      incorrectCount++;
      topicMap[q.topic].incorrect++;
    }
  });

  const totalMarks = totalQuestions;
  const scoreObtained = correctCount; // In CPCT, 1 mark per question, typically no negative marking
  const percentage = totalQuestions > 0 ? Math.round((scoreObtained / totalMarks) * 100) : 0;
  const passed = percentage >= passingPercentage;

  const topicBreakdown: Record<string, TopicPerformance> = {};
  const weakTopics: string[] = [];

  Object.entries(topicMap).forEach(([topic, stats]) => {
    const topicPercent = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const isWeakArea = topicPercent < 50;
    if (isWeakArea) {
      weakTopics.push(topic);
    }
    topicBreakdown[topic] = {
      topic,
      total: stats.total,
      correct: stats.correct,
      incorrect: stats.incorrect,
      unattempted: stats.unattempted,
      percentage: topicPercent,
      isWeakArea,
    };
  });

  return {
    totalQuestions,
    totalMarks,
    scoreObtained,
    percentage,
    correctCount,
    incorrectCount,
    unattemptedCount,
    passed,
    topicBreakdown,
    weakTopics,
  };
}
