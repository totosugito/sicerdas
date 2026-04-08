import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import {
  ExamQuestion,
  DifficultyLevel,
  QuestionType,
  ScoringStrategy,
  VariableFormulas,
} from "../types";

interface UpdateQuestionResponse {
  success: boolean;
  message: string;
  data: ExamQuestion;
}

export interface UpdateQuestionRequest {
  subjectId?: string;
  passageId?: string | null;
  content?: Record<string, unknown>[];
  difficulty?: DifficultyLevel;
  type?: QuestionType;
  maxScore?: number;
  scoringStrategy?: ScoringStrategy;
  requiredTier?: string | null;
  educationGradeId?: number | null;
  isActive?: boolean;
  variableFormulas?: VariableFormulas | null;
}

export const useUpdateQuestion = (id: string) => {
  return useMutation({
    mutationKey: ["admin-exam-questions-update", id],
    mutationFn: async (body: UpdateQuestionRequest | FormData) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.exam.questions.admin.update.replace(":id", id),
        body,
        withCredentials: true,
      });
      return response as UpdateQuestionResponse;
    },
  });
};
