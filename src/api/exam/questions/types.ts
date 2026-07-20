import type {
  QuestionResponseItemT,
  QuestionListItemT,
  QuestionDetailDataT,
  QuestionListParams,
  QuestionListSimpleParams,
  CreateQuestionParams,
  UpdateQuestionParams,
} from "backend/src/modules/exam/questions/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";
import { EnumDifficultyLevel, EnumQuestionType, EnumScoringStrategy, EnumSolutionType } from "backend/src/db/schema/exam/enums.ts";

export { EnumDifficultyLevel, EnumQuestionType, EnumScoringStrategy, EnumSolutionType };

export type {
  QuestionResponseItemT,
  QuestionListItemT,
  QuestionDetailDataT,
  QuestionListParams,
  QuestionListSimpleParams,
  CreateQuestionParams,
  UpdateQuestionParams,
};

export type DifficultyLevel = (typeof EnumDifficultyLevel)[keyof typeof EnumDifficultyLevel];
export type QuestionType = (typeof EnumQuestionType)[keyof typeof EnumQuestionType];
export type ScoringStrategy = (typeof EnumScoringStrategy)[keyof typeof EnumScoringStrategy];
export type SolutionType = (typeof EnumSolutionType)[keyof typeof EnumSolutionType];

export interface VariableFormulas {
  variables: Record<string, string | number>[];
  solutions?: Record<string, string>;
}

export type ExamQuestion = Omit<QuestionListItemT, "educationGradeName" | "totalOptions"> & {
  educationGradeName?: string | null;
  totalOptions?: number;
  reasonContent?: Record<string, unknown>[];
  options?: QuestionDetailDataT["options"];
  solutions?: QuestionDetailDataT["solutions"];
  passage?: QuestionDetailDataT["passage"];
};

export interface QuestionFormValues extends CreateQuestionParams {
  maxScore?: number;
}

export interface QuestionResponse<T> extends BaseResponse {
  data: T;
}

export interface ListQuestionsResponse extends QuestionResponse<{
  items: QuestionListItemT[];
  meta: PaginationMeta;
}> {}

export interface ListSimpleQuestionsResponse extends QuestionResponse<{
  items: QuestionListItemT[];
  meta: PaginationMeta;
}> {}

export interface ExamQuestionDetailResponse extends QuestionResponse<QuestionDetailDataT> {}

export interface CreateQuestionResponse extends QuestionResponse<QuestionResponseItemT> {}

export interface UpdateQuestionResponse extends QuestionResponse<QuestionResponseItemT> {}

export interface DeleteQuestionResponse extends BaseResponse {}

export interface JsonQuestionImport {
  id: string;
  passageId?: string | null;
  content: Record<string, unknown>[];
  reasonContent?: Record<string, unknown>[];
  difficulty: DifficultyLevel;
  type: QuestionType;
  maxScore: number;
  scoringStrategy: ScoringStrategy;
  requiredTier: string;
  isActive: boolean;
  educationGradeId?: number | null;
  options: {
    id: string;
    content: Record<string, unknown>[];
    isCorrect: boolean;
    score: number;
    order: number;
  }[];
  solutions: {
    id: string;
    title: string;
    content: Record<string, unknown>[];
    solutionType: SolutionType;
    order: number;
    requiredTier: string | null;
  }[];
  tags?: string[];
  variableFormulas?: VariableFormulas | null;
}
