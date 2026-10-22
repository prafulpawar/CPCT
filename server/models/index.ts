import { BaseModel } from '../config/database.ts';
import type { UserAttributes } from './User.ts';
import type { PassageAttributes } from './Passage.ts';
import type { TypingPracticeAttributes } from './TypingPractice.ts';
import type { MockTestAttributes } from './MockTest.ts';
import type { QuestionAttributes } from './Question.ts';
import type { TestSubmissionAttributes } from './TestSubmission.ts';

export const User = new BaseModel<UserAttributes & { toJSON?: () => any; save?: () => Promise<any> }>('users');
export const Passage = new BaseModel<PassageAttributes & { toJSON?: () => any; save?: () => Promise<any> }>('passages');
export const TypingPractice = new BaseModel<TypingPracticeAttributes & { toJSON?: () => any; save?: () => Promise<any> }>('typing_practices');
export const MockTest = new BaseModel<MockTestAttributes & { toJSON?: () => any; save?: () => Promise<any>; questions?: any[] }>('mock_tests');
export const Question = new BaseModel<QuestionAttributes & { toJSON?: () => any; save?: () => Promise<any> }>('questions', ['optionsEnglish', 'optionsHindi']);
export const TestSubmission = new BaseModel<TestSubmissionAttributes & { toJSON?: () => any; save?: () => Promise<any> }>('test_submissions', ['topicWiseBreakdown', 'userAnswers']);

export type {
  UserAttributes,
  PassageAttributes,
  TypingPracticeAttributes,
  MockTestAttributes,
  QuestionAttributes,
  TestSubmissionAttributes,
};
