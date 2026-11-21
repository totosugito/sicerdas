import type { BaseResponse, PaginationMeta } from "@/api/types";
import { EnumExamSessionStatus, EnumExamSessionMode } from "@/api/exam/types";

export { EnumExamSessionStatus, EnumExamSessionMode };

export type ExamSessionStatus = (typeof EnumExamSessionStatus)[keyof typeof EnumExamSessionStatus];
export type ExamSessionMode = (typeof EnumExamSessionMode)[keyof typeof EnumExamSessionMode];

export interface StartSessionBodyType {
  packageId: string;
  sectionId: string;
  mode: ExamSessionMode;
}

export interface SaveAnswerBodyType {
  sessionId: string;
  questionId: string;
  selectedOptionId?: string | null;
  textAnswer?: Record<string, unknown>[] | null;
  isDoubtful?: boolean;
  elapsedSeconds: number;
}

export interface StartSessionData {
  sessionId: string;
  isResumed: boolean;
}

export interface SessionGridItemT {
  questionId: string;
  order: number;
  isAnswered: boolean;
  isDoubtful: boolean;
  isCorrect: boolean | null;
  questionContent: any[] | null;
}

export interface SessionDetailsDataT {
  session: {
    id: string;
    packageId: string;
    status: ExamSessionStatus;
    mode: ExamSessionMode;
    elapsedSeconds: number;
    isTimerActive: boolean;
    score: number | null;
    earnedPoints: number | null;
    maxPoints: number | null;
  };
  package: {
    id: string;
    title: string;
    grade?: {
      name: string | null;
    };
  };
  section: {
    title: string;
  };
  grid: SessionGridItemT[];
}

export interface QuestionDataT {
  id: string;
  type: string;
  htmlContent: string;
}

export interface PassageDataT {
  id: string;
  title: string | null;
  htmlContent: string;
}

export interface OptionDataT {
  id: string;
  htmlContent: string;
}

export interface EvaluationDataT {
  isCorrect: boolean | null;
  correctOptionId: string | null;
  solutions: {
    id: string;
    title: string;
    htmlContent: string;
    solutionType: string;
  }[];
}

export interface QuestionSessionData {
  question: QuestionDataT;
  passage: PassageDataT | null;
  options: OptionDataT[];
  evaluation: EvaluationDataT | null;
  selectedOptionId: string | null;
  textAnswer: Record<string, unknown>[] | null;
}

export interface SaveAnswerData {
  sessionId: string;
  questionId: string;
}

export interface SubmitResultDataT {
  score: number;
  earnedPoints: number;
  maxPoints: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  totalQuestions: number;
}

export interface AbandonSessionData {
  id: string;
}

export interface SessionHistoryItemT {
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

export interface AllSessionHistoryItemT extends SessionHistoryItemT {
  packageTitle: string;
  sectionTitle: string;
  packageId: string;
}


export interface SessionResponse<T> extends BaseResponse {
  data: T;
}

export interface StartSessionResponse extends SessionResponse<StartSessionData> {}
export interface DetailsSessionResponse extends SessionResponse<SessionDetailsDataT> {}
export interface QuestionSessionResponse extends SessionResponse<QuestionSessionData> {}
export interface SaveAnswerResponse extends SessionResponse<SaveAnswerData> {}
export interface SubmitSessionResponse extends SessionResponse<SubmitResultDataT> {}
export interface AbandonSessionResponse extends SessionResponse<AbandonSessionData> {}

export interface SessionHistoryResponse
  extends SessionResponse<{
    items: SessionHistoryItemT[];
    meta: PaginationMeta;
  }> {}

export interface AllSessionHistoryResponse
  extends SessionResponse<{
    items: AllSessionHistoryItemT[];
    meta: PaginationMeta;
  }> {}
