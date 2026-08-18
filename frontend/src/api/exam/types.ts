// Re-export backend exam enums for frontend use (plain objects only, no Drizzle dependencies)

export {
  EnumExamType,
  EnumDifficultyLevel,
  EnumQuestionType,
  EnumScoringStrategy,
  EnumSolutionType,
  EnumExamSessionStatus,
  EnumExamSessionMode,
  EnumExamPackageUserStatus,
} from "backend/src/db/schema/exam/enums";
