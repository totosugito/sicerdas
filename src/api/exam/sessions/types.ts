import type {
  StartSessionData,
  SessionDetailsDataT,
  QuestionSessionData,
  SaveAnswerData,
  SubmitResultDataT,
  AbandonSessionData,
  SessionHistoryItemT,
  AllSessionHistoryItemT,
  StartSessionBodyType,
  SaveAnswerBodyType,
  QuestionDataT,
  PassageDataT,
  OptionDataT,
  EvaluationDataT,
} from "backend/src/modules/exam/sessions/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "backend/src/db/schema/exam/enums.ts";

export { EnumExamSessionStatus, EnumExamSessionMode };

export type {
  StartSessionData,
  SessionDetailsDataT,
  QuestionSessionData,
  SaveAnswerData,
  SubmitResultDataT,
  AbandonSessionData,
  SessionHistoryItemT,
  AllSessionHistoryItemT,
  StartSessionBodyType,
  SaveAnswerBodyType,
  QuestionDataT,
  PassageDataT,
  OptionDataT,
  EvaluationDataT,
};

export type QuestionData = QuestionDataT;
export type PassageData = PassageDataT;
export type OptionData = OptionDataT;
export type EvaluationData = EvaluationDataT;

export type ExamSessionStatus = (typeof EnumExamSessionStatus)[keyof typeof EnumExamSessionStatus];
export type ExamSessionMode = (typeof EnumExamSessionMode)[keyof typeof EnumExamSessionMode];

export interface SessionResponse<T> extends BaseResponse {
  data: T;
}

export interface StartSessionResponse extends SessionResponse<StartSessionData> {}

export interface DetailsSessionResponse extends SessionResponse<SessionDetailsDataT> {}

export interface QuestionSessionResponse extends SessionResponse<QuestionSessionData> {}

export interface SaveAnswerResponse extends SessionResponse<SaveAnswerData> {}

export interface SubmitSessionResponse extends SessionResponse<SubmitResultDataT> {}

export interface AbandonSessionResponse extends SessionResponse<AbandonSessionData> {}

export interface SessionHistoryResponse extends SessionResponse<{
  items: SessionHistoryItemT[];
  meta: PaginationMeta;
}> {}

export interface AllSessionHistoryResponse extends SessionResponse<{
  items: AllSessionHistoryItemT[];
  meta: PaginationMeta;
}> {}
