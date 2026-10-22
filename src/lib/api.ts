import {
  UserProfile,
  Passage,
  TypingSessionResult,
  TypingAnalyticsData,
  MockTestItem,
  ExamQuestion,
  TestSubmissionResult,
  StudentDashboardData,
  LeaderboardStudent,
  ReviewQuestion,
} from '../types/index.ts';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // User
  async getCurrentUser(userId?: string): Promise<UserProfile> {
    const url = userId ? `${BASE_URL}/users/current?userId=${userId}` : `${BASE_URL}/users/current`;
    const res = await fetch(url);
    return handleResponse<UserProfile>(res);
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const res = await fetch(`${BASE_URL}/users/all`);
    return handleResponse<UserProfile[]>(res);
  },

  // Typing
  async getPassages(language?: string, difficulty?: string): Promise<Passage[]> {
    const params = new URLSearchParams();
    if (language && language !== 'all') params.set('language', language);
    if (difficulty && difficulty !== 'all') params.set('difficulty', difficulty);
    const res = await fetch(`${BASE_URL}/typing/passages?${params.toString()}`);
    return handleResponse<Passage[]>(res);
  },

  async submitTypingResult(data: any): Promise<TypingSessionResult> {
    const res = await fetch(`${BASE_URL}/typing/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<TypingSessionResult>(res);
  },

  async getTypingHistory(userId?: string, language?: string): Promise<TypingSessionResult[]> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (language && language !== 'all') params.set('language', language);
    const res = await fetch(`${BASE_URL}/typing/history?${params.toString()}`);
    return handleResponse<TypingSessionResult[]>(res);
  },

  async getTypingAnalytics(userId?: string): Promise<TypingAnalyticsData> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    const res = await fetch(`${BASE_URL}/typing/analytics?${params.toString()}`);
    return handleResponse<TypingAnalyticsData>(res);
  },

  // Mock Tests
  async getMockTests(category?: string, topic?: string): Promise<MockTestItem[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (topic && topic !== 'all') params.set('topic', topic);
    const res = await fetch(`${BASE_URL}/mock-tests?${params.toString()}`);
    return handleResponse<MockTestItem[]>(res);
  },

  async getMockTestById(id: string, shuffle: boolean = false): Promise<MockTestItem & { questions: ExamQuestion[] }> {
    const res = await fetch(`${BASE_URL}/mock-tests/${id}?shuffle=${shuffle}`);
    return handleResponse<MockTestItem & { questions: ExamQuestion[] }>(res);
  },

  async submitMockTest(
    id: string,
    data: { userId?: string; userAnswers: Record<string, number>; timeSpentSeconds: number }
  ): Promise<{ submission: TestSubmissionResult; weakTopics: string[]; passingMarks: number }> {
    const res = await fetch(`${BASE_URL}/mock-tests/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ submission: TestSubmissionResult; weakTopics: string[]; passingMarks: number }>(res);
  },

  async getTestSubmissions(userId?: string): Promise<TestSubmissionResult[]> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    const res = await fetch(`${BASE_URL}/mock-tests/user/submissions?${params.toString()}`);
    return handleResponse<TestSubmissionResult[]>(res);
  },

  async getSubmissionReview(submissionId: string): Promise<{
    submission: TestSubmissionResult;
    reviewQuestions: ReviewQuestion[];
    test: MockTestItem;
  }> {
    const res = await fetch(`${BASE_URL}/mock-tests/submission/${submissionId}/review`);
    return handleResponse<{
      submission: TestSubmissionResult;
      reviewQuestions: ReviewQuestion[];
      test: MockTestItem;
    }>(res);
  },

  // Analytics
  async getStudentDashboard(userId?: string): Promise<StudentDashboardData> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    const res = await fetch(`${BASE_URL}/analytics/dashboard?${params.toString()}`);
    return handleResponse<StudentDashboardData>(res);
  },

  async getLeaderboard(): Promise<LeaderboardStudent[]> {
    const res = await fetch(`${BASE_URL}/analytics/leaderboard`);
    return handleResponse<LeaderboardStudent[]>(res);
  },
};
