export interface PassageAttributes {
  id?: string;
  title: string;
  titleHindi: string;
  language: 'hindi' | 'english';
  script: 'remington_gail' | 'inscript' | 'english';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  content: string;
  wordCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
