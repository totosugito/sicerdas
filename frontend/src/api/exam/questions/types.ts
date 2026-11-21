import type { BaseResponse, PaginationMeta } from "@/api/types";
import {
  EnumDifficultyLevel,
  EnumQuestionType,
  EnumScoringStrategy,
  EnumSolutionType,
} from "@/api/exam/types";

export { EnumDifficultyLevel, EnumQuestionType, EnumScoringStrategy, EnumSolutionType };

export type DifficultyLevel = (typeof EnumDifficultyLevel)[keyof typeof EnumDifficultyLevel];
export type QuestionType = (typeof EnumQuestionType)[keyof typeof EnumQuestionType];
export type ScoringStrategy = (typeof EnumScoringStrategy)[keyof typeof EnumScoringStrategy];
export type SolutionType = (typeof EnumSolutionType)[keyof typeof EnumSolutionType];

export interface VariableFormulas {
  variables: Record<string, string | number>[];
  solutions?: Record<string, string>;
}

export interface QuestionTagRef {
  id: string;
  name: string;
}

export interface QuestionResponseItemT {
  id: string;
  subjectId: string;
  passageId: string | null;
  content: Record<string, unknown>[];
  reasonContent: Record<string, unknown>[] | null;
  difficulty: DifficultyLevel;
  type: QuestionType;
  maxScore: number;
  scoringStrategy: ScoringStrategy;
  requiredTier: string;
  isActive: boolean;
  educationGradeId: number | null;
  variableFormulas: VariableFormulas | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionListItemT extends QuestionResponseItemT {
  subjectName: string;
  passageTitle: string | null;
  educationGradeName: string | null;
  totalOptions: number;
  tags: QuestionTagRef[];
}

export interface QuestionDetailOptionT {
  id: string;
  questionId?: string;
  content: Record<string, unknown>[];
  isCorrect: boolean;
  score: number;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionDetailSolutionT {
  id: string;
  questionId?: string;
  title: string;
  content: Record<string, unknown>[];
  solutionType: SolutionType;
  order: number;
  requiredTier: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionDetailDataT extends QuestionListItemT {
  passage: {
    id: string;
    title: string | null;
    content: Record<string, unknown>[];
  } | null;
  options: QuestionDetailOptionT[];
  solutions: QuestionDetailSolutionT[];
}

export interface QuestionListParams {
  search?: string;
  subjectId?: string;
  passageId?: string;
  difficulty?: DifficultyLevel;
  type?: QuestionType;
  scoringStrategy?: ScoringStrategy;
  educationGradeId?: number;
  isActive?: boolean;
  tagIds?: string[];
  sortBy?: "createdAt" | "updatedAt" | "difficulty" | "type" | "isActive";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface QuestionListSimpleParams {
  search?: string;
  subjectId?: string;
  passageId?: string;
  educationGradeId?: number;
  requiredTier?: string;
  difficulty?: DifficultyLevel;
  excludePackageId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateQuestionParams {
  subjectId: string;
  passageId?: string | null;
  content: Record<string, unknown>[];
  reasonContent?: Record<string, unknown>[] | null;
  difficulty?: DifficultyLevel;
  type?: QuestionType;
  maxScore?: number;
  scoringStrategy?: ScoringStrategy;
  requiredTier?: string;
  isActive?: boolean;
  educationGradeId?: number | null;
  variableFormulas?: VariableFormulas | null;
}

export interface UpdateQuestionParams extends Partial<CreateQuestionParams> {}

export type ExamQuestion = Omit<QuestionListItemT, "educationGradeName" | "totalOptions"> & {
  educationGradeName?: string | null;
  totalOptions?: number;
  reasonContent?: Record<string, unknown>[] | null;
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

export interface ListQuestionsResponse
  extends QuestionResponse<{
    items: QuestionListItemT[];
    meta: PaginationMeta;
  }> {}

export interface ListSimpleQuestionsResponse
  extends QuestionResponse<{
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
