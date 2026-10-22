export interface TestSubmissionAttributes {
  id?: string;
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
  topicWiseBreakdown: Record<string, any>;
  userAnswers: Record<string, number>;
  createdAt?: Date;
  updatedAt?: Date;
}
