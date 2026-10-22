export interface MockTestAttributes {
  id?: string;
  title: string;
  titleHindi: string;
  description: string;
  category: 'full_length' | 'topic_wise';
  topic: string;
  totalQuestions: number;
  durationMinutes: number;
  passingMarks: number;
  totalMarks: number;
  createdAt?: Date;
  updatedAt?: Date;
}
