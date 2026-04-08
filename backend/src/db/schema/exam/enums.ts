import { pgEnum } from "drizzle-orm/pg-core";

export const EnumExamType = {
  OFFICIAL: "official",
  CUSTOM_PRACTICE: "custom_practice",
} as const;
export const PgEnumExamType = pgEnum(
  "exam_type",
  Object.values(EnumExamType) as [string, ...string[]],
);

export const EnumDifficultyLevel = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;
export const PgEnumDifficultyLevel = pgEnum(
  "difficulty_level",
  Object.values(EnumDifficultyLevel) as [string, ...string[]],
);

export const EnumQuestionType = {
  MULTIPLE_CHOICE: "multiple_choice",
  MULTIPLE_SELECT: "multiple_select",
  ESSAY: "essay",
  STATEMENT_REASONING: "statement_reasoning",
} as const;
export const PgEnumQuestionType = pgEnum(
  "question_type",
  Object.values(EnumQuestionType) as [string, ...string[]],
);

export const EnumScoringStrategy = {
  ALL_OR_NOTHING: "all_or_nothing",
  PARTIAL: "partial",
  PARTIAL_WITH_PENALTY: "partial_with_penalty",
} as const;
export const PgEnumScoringStrategy = pgEnum(
  "scoring_strategy",
  Object.values(EnumScoringStrategy) as [string, ...string[]],
);

export const EnumSolutionType = {
  GENERAL: "general",
  FAST_METHOD: "fast_method",
  VIDEO_LINK: "video_link",
  TIPS: "tips",
} as const;
export const PgEnumSolutionType = pgEnum(
  "solution_type",
  Object.values(EnumSolutionType) as [string, ...string[]],
);

export const EnumExamSessionStatus = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
} as const;
export const PgEnumExamSessionStatus = pgEnum(
  "exam_session_status",
  Object.values(EnumExamSessionStatus) as [string, ...string[]],
);
