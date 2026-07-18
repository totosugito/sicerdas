import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

export const GlobalStatsItem = Type.Object({
  userId: Type.String({ format: "uuid" }),
  totalExamsTaken: Type.Number(),
  totalQuestionsAnswered: Type.Number(),
  totalCorrectAnswers: Type.Number(),
  totalWrongAnswers: Type.Number(),
  averageScore: Type.String(),
  accuracyRate: Type.String(),
  lastActiveAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  updatedAt: Type.String({ format: "date-time" }),
});

export const SubjectStatsItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  subjectId: Type.String({ format: "uuid" }),
  subjectName: Type.String(),
  totalQuestionsAnswered: Type.Number(),
  totalCorrect: Type.Number(),
  totalWrong: Type.Number(),
  accuracyRate: Type.String(),
  updatedAt: Type.String({ format: "date-time" }),
});

export const TagStatsItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  tagId: Type.String({ format: "uuid" }),
  tagName: Type.String(),
  totalQuestionsAnswered: Type.Number(),
  totalCorrect: Type.Number(),
  totalWrong: Type.Number(),
  accuracyRate: Type.String(),
  updatedAt: Type.String({ format: "date-time" }),
});

export const ActivityItem = Type.Object({
  date: Type.String(),
  totalQuestions: Type.Number(),
  totalCorrect: Type.Number(),
  totalWrong: Type.Number(),
  totalSessions: Type.Number(),
});

export const SubjectStatsBody = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 100 })),
  sortBy: Type.Optional(Type.String({ default: "accuracyRate" })),
  order: Type.Optional(
    Type.Union([Type.Literal("asc"), Type.Literal("desc")], { default: "desc" }),
  )
});

export const ActivityQuery = Type.Object({
  days: Type.Optional(Type.Number({ default: 7 })),
});

export const GlobalStatsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Union([GlobalStatsItem, Type.Null()]) }),
]);

export const SubjectStatsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(SubjectStatsItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const TagStatsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Array(TagStatsItem) }),
]);

export const ActivityResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Array(ActivityItem) }),
]);

export type GlobalStatsData = Static<typeof GlobalStatsItem>;
export type SubjectStatsData = Static<typeof SubjectStatsItem>;
export type TagStatsData = Static<typeof TagStatsItem>;
export type ActivityData = Static<typeof ActivityItem>;
export type SubjectStatsParams = Static<typeof SubjectStatsBody>;
