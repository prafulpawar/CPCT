export interface UserProfile {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  avatar: string;
  targetExam: string;
}

export interface Passage {
  id: string;
  title: string;
  titleHindi: string;
  language: 'hindi' | 'english';
  script: 'remington_gail' | 'inscript' | 'english';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  content: string;
  wordCount: number;
}

export interface TypingSessionResult {
  id: string;
  userId: string;
  passageTitle: string;
  language: 'hindi' | 'english';
  script: string;
  durationMinutes: number;
  timeSpentSeconds: number;
  grossWpm: number;
  netWpm: number;
  cpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  correctCharacters: number;
  incorrectCharacters: number;
  backspaceCount: number;
  totalKeystrokes: number;
  createdAt: string;
}

export interface TypingAnalyticsData {
  hindiStats: {
    totalTests: number;
    avgNetWpm: number;
    maxNetWpm: number;
    avgAccuracy: number;
    avgGrossWpm: number;
    avgCpm: number;
    avgBackspace: number;
    cpctQualified: boolean;
    targetWpm: number;
  };
  englishStats: {
    totalTests: number;
    avgNetWpm: number;
    maxNetWpm: number;
    avgAccuracy: number;
    avgGrossWpm: number;
    avgCpm: number;
    avgBackspace: number;
    cpctQualified: boolean;
    targetWpm: number;
  };
  totalPractices: number;
  speedProgression: Array<{
    index: number;
    id: string;
    date: string;
    language: 'hindi' | 'english';
    script: string;
    netWpm: number;
    grossWpm: number;
    accuracy: number;
    cpm: number;
    backspaces: number;
    passageTitle: string;
  }>;
}

export interface MockTestItem {
  id: string;
  title: string;
  titleHindi: string;
  description: string;
  category: 'full_length' | 'topic_wise';
  topic: string;
  totalQuestions: number;
  durationMinutes: number;
  passingMarks: number;
  totalMarks: number;
}

export interface ExamQuestion {
  id: string;
  questionTextEnglish: string;
  questionTextHindi: string;
  optionsEnglish: string[];
  optionsHindi: string[];
  topic: string;
  subtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  _shuffledMap?: number[];
}

export interface ReviewQuestion extends ExamQuestion {
  correctAnswerIndex: number;
  userAnswerIndex: number;
  isCorrect: boolean;
  isAttempted: boolean;
  explanationEnglish: string;
  explanationHindi: string;
}

export interface TestSubmissionResult {
  id: string;
  userId: string;
  mockTestId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  timeSpentSeconds: number;
  passed: boolean;
  topicWiseBreakdown: Record<string, {
    topic: string;
    total: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    percentage: number;
    isWeakArea: boolean;
  }>;
  userAnswers: Record<string, number>;
  createdAt: string;
}

export interface StudentDashboardData {
  user: UserProfile;
  summary: {
    totalTestsTaken: number;
    passedTestsCount: number;
    avgMockPercentage: number;
    highestMockScore: number;
    hindi: {
      maxNetWpm: number;
      avgNetWpm: number;
      avgAccuracy: number;
      qualified: boolean;
      targetWpm: number;
    };
    english: {
      maxNetWpm: number;
      avgNetWpm: number;
      avgAccuracy: number;
      qualified: boolean;
      targetWpm: number;
    };
    cpctCertificationStatus: {
      fullyQualified: boolean;
      computerPassed: boolean;
      englishTypingQualified: boolean;
      hindiTypingQualified: boolean;
      scoreGrade: string;
    };
  };
  weakTopics: Array<{
    topic: string;
    accuracy: number;
    recommendation: string;
    severity: 'High' | 'Medium';
  }>;
  strongTopics: Array<{
    topic: string;
    accuracy: number;
  }>;
  submissionsHistory: Array<{
    id: string;
    testTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    timeSpentSeconds: number;
    date: string;
  }>;
  typingTimeline: Array<{
    id: string;
    language: 'hindi' | 'english';
    script: string;
    netWpm: number;
    grossWpm: number;
    accuracy: number;
    backspaceCount: number;
    date: string;
  }>;
}

export interface LeaderboardStudent {
  userId: string;
  name: string;
  rollNumber: string;
  avatar: string;
  avgMockScore: number;
  maxEnglishWpm: number;
  maxHindiWpm: number;
  totalTypingTests: number;
  totalMockTests: number;
  compositeScore: number;
  isQualified: boolean;
  rank: number;
  badge: string;
}
