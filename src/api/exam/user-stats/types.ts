export interface GlobalStats {
  userId: string;
  totalExamsTaken: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
  averageScore: string;
  accuracyRate: string;
  lastActiveAt: string | null;
  updatedAt: string;
}

export interface SubjectStats {
  id: string;
  subjectId: string;
  subjectName: string;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyRate: string;
  updatedAt: string;
}

export interface TagStats {
  id: string;
  tagId: string;
  tagName: string;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyRate: string;
  updatedAt: string;
}

export interface ActivityStats {
  date: string;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  totalSessions: number;
}
