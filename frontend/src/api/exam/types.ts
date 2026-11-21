// Self-contained exam enums (matching backend-rust PostgreSQL enums)

export const EnumExamType = {
  OFFICIAL: "official",
  CUSTOM_PRACTICE: "custom_practice",
  COURSE_EXAM: "course_exam",
} as const;
export type EnumExamType = (typeof EnumExamType)[keyof typeof EnumExamType];

export const EnumDifficultyLevel = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;
export type EnumDifficultyLevel = (typeof EnumDifficultyLevel)[keyof typeof EnumDifficultyLevel];

export const EnumQuestionType = {
  MULTIPLE_CHOICE: "multiple_choice",
  MULTIPLE_SELECT: "multiple_select",
  ESSAY: "essay",
  STATEMENT_REASONING: "statement_reasoning",
} as const;
export type EnumQuestionType = (typeof EnumQuestionType)[keyof typeof EnumQuestionType];

export const EnumScoringStrategy = {
  ALL_OR_NOTHING: "all_or_nothing",
  PARTIAL: "partial",
  PARTIAL_WITH_PENALTY: "partial_with_penalty",
} as const;
export type EnumScoringStrategy = (typeof EnumScoringStrategy)[keyof typeof EnumScoringStrategy];

export const EnumSolutionType = {
  GENERAL: "general",
  FAST_METHOD: "fast_method",
  VIDEO_LINK: "video_link",
  TIPS: "tips",
} as const;
export type EnumSolutionType = (typeof EnumSolutionType)[keyof typeof EnumSolutionType];

export const EnumExamSessionStatus = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
} as const;
export type EnumExamSessionStatus =
  (typeof EnumExamSessionStatus)[keyof typeof EnumExamSessionStatus];

export const EnumExamSessionMode = {
  TRYOUT: "tryout",
  STUDY: "study",
} as const;
export type EnumExamSessionMode = (typeof EnumExamSessionMode)[keyof typeof EnumExamSessionMode];

export const EnumExamPackageUserStatus = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;
export type EnumExamPackageUserStatus =
  (typeof EnumExamPackageUserStatus)[keyof typeof EnumExamPackageUserStatus];
