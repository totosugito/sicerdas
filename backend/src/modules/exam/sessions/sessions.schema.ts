import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../db/schema/exam/enums.ts";

// --- Request Bodies ---

export const StartSessionBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.String({ format: "uuid" }),
  mode: Type.Enum(EnumExamSessionMode),
});

export const SaveAnswerBody = Type.Object({
  sessionId: Type.String({ format: "uuid" }),
  questionId: Type.String({ format: "uuid" }),
  selectedOptionId: Type.Optional(Type.Union([Type.String({ format: "uuid" }), Type.Null()])),
  textAnswer: Type.Optional(
    Type.Union([Type.Array(Type.Record(Type.String(), Type.Unknown())), Type.Null()]),
  ),
  isDoubtful: Type.Optional(Type.Boolean()),
  elapsedSeconds: Type.Number({ minimum: 0 }),
});

export const HistoryBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.String({ format: "uuid" }),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 5, minimum: 1, maximum: 50 })),
});

export const AllHistoryBody = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
  status: Type.Optional(Type.Enum(EnumExamSessionStatus)),
});

// --- Response Data Items ---

export const SessionGridItem = Type.Object({
  questionId: Type.String({ format: "uuid" }),
  order: Type.Number(),
  isAnswered: Type.Boolean(),
  isDoubtful: Type.Boolean(),
  isCorrect: Type.Union([Type.Boolean(), Type.Null()]),
  questionContent: Type.Union([Type.Array(Type.Any()), Type.Null()]),
});

export const SessionDetailsData = Type.Object({
  session: Type.Object({
    id: Type.String({ format: "uuid" }),
    packageId: Type.String({ format: "uuid" }),
    status: Type.Enum(EnumExamSessionStatus),
    mode: Type.Enum(EnumExamSessionMode),
    elapsedSeconds: Type.Number(),
    isTimerActive: Type.Boolean(),
    score: Type.Union([Type.Number(), Type.Null()]),
    earnedPoints: Type.Union([Type.Number(), Type.Null()]),
    maxPoints: Type.Union([Type.Number(), Type.Null()]),
  }),
  package: Type.Object({
    id: Type.String({ format: "uuid" }),
    title: Type.String(),
    grade: Type.Optional(
      Type.Object({
        name: Type.Union([Type.String(), Type.Null()]),
      }),
    ),
  }),
  section: Type.Object({ title: Type.String() }),
  grid: Type.Array(SessionGridItem),
});

export const QuestionData = Type.Object({
  id: Type.String(),
  type: Type.String(),
  htmlContent: Type.String(),
});

export const PassageData = Type.Object({
  id: Type.String(),
  title: Type.Union([Type.String(), Type.Null()]),
  htmlContent: Type.String(),
});

export const OptionData = Type.Object({
  id: Type.String(),
  htmlContent: Type.String(),
});

export const EvaluationData = Type.Object({
  isCorrect: Type.Union([Type.Boolean(), Type.Null()]),
  correctOptionId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  solutions: Type.Array(
    Type.Object({
      id: Type.String(),
      title: Type.String(),
      htmlContent: Type.String(),
      solutionType: Type.String(),
    }),
  ),
});

export const SessionHistoryItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  startTime: Type.String({ format: "date-time" }),
  endTime: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  status: Type.String(),
  mode: Type.String(),
  score: Type.Union([Type.Number(), Type.Null()]),
  totalCorrect: Type.Number(),
  totalWrong: Type.Number(),
  totalSkipped: Type.Number(),
  earnedPoints: Type.Union([Type.Number(), Type.Null()]),
  maxPoints: Type.Union([Type.Number(), Type.Null()]),
});

export const AllSessionHistoryItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  startTime: Type.String({ format: "date-time" }),
  endTime: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  status: Type.String(),
  mode: Type.String(),
  score: Type.Union([Type.Number(), Type.Null()]),
  totalCorrect: Type.Number(),
  totalWrong: Type.Number(),
  totalSkipped: Type.Number(),
  packageTitle: Type.String(),
  sectionTitle: Type.String(),
  packageId: Type.String({ format: "uuid" }),
  earnedPoints: Type.Union([Type.Number(), Type.Null()]),
  maxPoints: Type.Union([Type.Number(), Type.Null()]),
});

export const SubmitResultData = Type.Object({
  score: Type.Number(),
  earnedPoints: Type.Number(),
  maxPoints: Type.Number(),
  totalCorrect: Type.Number(),
  totalWrong: Type.Number(),
  totalSkipped: Type.Number(),
  totalQuestions: Type.Number(),
});

// --- Response Schemas ---

export const StartSessionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      sessionId: Type.String({ format: "uuid" }),
      isResumed: Type.Boolean(),
    }),
  }),
]);

export const DetailsSessionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: SessionDetailsData }),
]);

export const QuestionSessionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      question: QuestionData,
      passage: Type.Union([PassageData, Type.Null()]),
      options: Type.Array(OptionData),
      evaluation: Type.Union([EvaluationData, Type.Null()]),
      selectedOptionId: Type.Union([Type.String(), Type.Null()]),
      textAnswer: Type.Union([Type.String(), Type.Null()]),
    }),
  }),
]);

export const SaveAnswerResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      sessionId: Type.String({ format: "uuid" }),
      questionId: Type.String({ format: "uuid" }),
    }),
  }),
]);

export const SubmitSessionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: SubmitResultData }),
]);

export const AbandonSessionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      id: Type.String({ format: "uuid" }),
    }),
  }),
]);

export const HistorySessionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(SessionHistoryItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const AllSessionHistoryResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(AllSessionHistoryItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

// --- Static Types for Services ---

export type StartSessionBodyType = Static<typeof StartSessionBody>;
export type SaveAnswerBodyType = Static<typeof SaveAnswerBody>;
export type HistoryBodyType = Static<typeof HistoryBody>;
export type AllHistoryBodyType = Static<typeof AllHistoryBody>;

export type StartSessionData = Static<
  typeof StartSessionResponse
>["data"];

export type SessionDetailsDataT = Static<typeof SessionDetailsData>;

export type QuestionSessionData = Static<
  typeof QuestionSessionResponse
>["data"];

export type SaveAnswerData = Static<typeof SaveAnswerResponse>["data"];
export type SubmitResultDataT = Static<typeof SubmitResultData>;
export type AbandonSessionData = Static<typeof AbandonSessionResponse>["data"];
export type SessionHistoryItemT = Static<typeof SessionHistoryItem>;
export type AllSessionHistoryItemT = Static<typeof AllSessionHistoryItem>;
