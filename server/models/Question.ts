export interface QuestionAttributes {
  id?: string;
  mockTestId?: string;
  questionTextEnglish: string;
  questionTextHindi: string;
  optionsEnglish: string[];
  optionsHindi: string[];
  correctAnswerIndex: number;
  explanationEnglish: string;
  explanationHindi: string;
  topic: string;
  subtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt?: Date;
  updatedAt?: Date;
}
