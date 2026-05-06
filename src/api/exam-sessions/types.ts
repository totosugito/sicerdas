import { EnumExamSessionStatus, EnumExamSessionMode } from "backend/src/db/schema/exam/enums";
export { EnumExamSessionStatus, EnumExamSessionMode };

export type ExamSessionStatus = (typeof EnumExamSessionStatus)[keyof typeof EnumExamSessionStatus];
export type ExamSessionMode = (typeof EnumExamSessionMode)[keyof typeof EnumExamSessionMode];


export interface ExamSession {
  id: string;
  userId: string;
  packageId: string;
  sectionId: string;
  mode: ExamSessionMode;
  status: ExamSessionStatus;
  startTime: string;
  endTime: string | null;
  score: number | null;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  earnedPoints: number | null;
  maxPoints: number | null;
  currentQuestionId: string | null;
  questionOrder: string[]; // Array of question IDs
}

export interface QuestionData {
  id: string;
  type: string;
  htmlContent: string;
}

export interface PassageData {
  id: string;
  title: string | null;
  htmlContent: string;
}

export interface OptionData {
  id: string;
  htmlContent: string;
}

export interface EvaluationData {
  isCorrect: boolean | null;
  correctOptionId: string | null;
  solutions: {
    id: string;
    title: string;
    solutionType: string;
    htmlContent: string;
  }[];
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

export interface ExamSessionGridItem {
  questionId: string;
  order: number;
  isAnswered: boolean;
  isDoubtful: boolean;
  isCorrect: boolean | null;
  questionContent: Record<string, any>[] | null;
}

export interface ExamSessionDetails {
  session: ExamSession & { elapsedSeconds: number; isTimerActive: boolean };
  grid: ExamSessionGridItem[];
  package?: { 
    id: string;
    title: string;
    grade?: { name: string | null };
  };
  section?: { title: string };
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
  score: number | null;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  earnedPoints: number | null;
  maxPoints: number | null;
}
