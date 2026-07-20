import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

// --- Admin Schemas ---

const PackageQuestionItem = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  questionId: Type.String({ format: "uuid" }),
  order: Type.Number(),
  question: Type.Object({
    id: Type.String({ format: "uuid" }),
    content: Type.Array(Type.Any()),
    type: Type.String(),
    difficulty: Type.String(),
    subjectName: Type.Union([Type.String(), Type.Null()]),
  }),
  section: Type.Optional(
    Type.Object({
      id: Type.String({ format: "uuid" }),
      title: Type.String(),
    }),
  ),
});

// --- Request Bodies ---

export const PackageQuestionListBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.Optional(Type.String({ format: "uuid" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

export const AssignPackageQuestionsBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.String({ format: "uuid" }),
  questionIds: Type.Array(Type.String({ format: "uuid" }), { minItems: 1 }),
});

export const UnassignPackageQuestionsBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  questionIds: Type.Array(Type.String({ format: "uuid" }), { minItems: 1 }),
});

export const SyncPackageQuestionsOrderBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.String({ format: "uuid" }),
  updates: Type.Array(
    Type.Object({
      questionId: Type.String({ format: "uuid" }),
      order: Type.Number(),
    }),
    { minItems: 1 },
  ),
});

// --- Response Schemas ---

export const PackageQuestionListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(PackageQuestionItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const AssignPackageQuestionsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Optional(
      Type.Object({
        totalAssigned: Type.Number(),
        totalSkipped: Type.Number(),
      }),
    ),
  }),
]);

// --- Static Types ---

export type PackageQuestionItemT = Static<typeof PackageQuestionItem>;

export type PackageQuestionListParams = Static<typeof PackageQuestionListBody>;
export type AssignPackageQuestionsParams = Static<typeof AssignPackageQuestionsBody>;
export type UnassignPackageQuestionsParams = Static<typeof UnassignPackageQuestionsBody>;
export type SyncPackageQuestionsOrderParams = Static<typeof SyncPackageQuestionsOrderBody>;

export type AssignResult = { totalAssigned: number; totalSkipped: number };
