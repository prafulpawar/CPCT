export interface TypingPracticeAttributes {
  id?: string;
  userId: string;
  passageId?: string;
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
  errorDetails?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
