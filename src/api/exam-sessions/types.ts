export type ExamSessionStatus = "in_progress" | "completed" | "abandoned";
export type ExamSessionMode = "study" | "tryout";

export interface ExamSession {
  id: string;
  userId: string;
  packageId: string;
  sectionId: string;
  mode: ExamSessionMode;
  status: ExamSessionStatus;
  startTime: string;
  endTime: string | null;
  score: string | null;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  currentQuestionId: string | null;
  questionOrder: string[]; // Array of question IDs
}

export interface ExamSessionQuestion {
  id: string;
  passageId: string | null;
  content: string;
  questionType: string;
  options: ExamSessionOption[];
  userAnswer?: {
    selectedOptionId?: string;
    textAnswer?: string;
    isDoubtful: boolean;
  };
}

export interface ExamSessionOption {
  id: string;
  content: string;
  order: number;
}

export interface ExamSessionDetails {
  session: ExamSession;
  questions: ExamSessionQuestion[];
}

export interface StartSessionRequest {
  packageId: string;
  sectionId: string;
  mode: ExamSessionMode;
}

export interface SaveAnswerRequest {
  sessionId: string;
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  isDoubtful?: boolean;
  elapsedSeconds?: number;
}

export interface ExamHistoryItem {
  id: string;
  startTime: string;
  endTime: string | null;
  status: ExamSessionStatus;
  mode: ExamSessionMode;
  score: string | null;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
}
