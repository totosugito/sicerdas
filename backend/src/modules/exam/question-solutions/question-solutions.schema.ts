import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

// --- Shared Field Definitions ---

const QuestionSolutionBaseFields = {
  id: Type.String({ format: "uuid" }),
  questionId: Type.String({ format: "uuid" }),
  title: Type.String(),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  solutionType: Type.String(),
  order: Type.Number(),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

const QuestionSolutionBodyFields = {
  questionId: Type.String({ format: "uuid" }),
  title: Type.String(),
  content: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
  solutionType: Type.String(),
  order: Type.Optional(Type.Number()),
  requiredTier: Type.Optional(Type.String()),
};

const FilterFields = {
  questionId: Type.Optional(Type.String({ format: "uuid" })),
  solutionType: Type.Optional(Type.String()),
  requiredTier: Type.Optional(Type.String()),
  sortBy: Type.Optional(Type.String({ default: "order" })),
  sortOrder: Type.Optional(Type.String({ default: "asc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
};

// --- Response Data Items ---

export const QuestionSolutionResponseItem = Type.Object(QuestionSolutionBaseFields);

// --- Request Bodies ---

export const CreateQuestionSolutionBody = Type.Object(QuestionSolutionBodyFields);

export const UpdateQuestionSolutionBody = Type.Partial(
  Type.Object({
    questionId: Type.String({ format: "uuid" }),
    title: Type.String(),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    solutionType: Type.String(),
    order: Type.Number(),
    requiredTier: Type.String(),
  }),
);

export const QuestionSolutionListBody = Type.Object(FilterFields);

export const QuestionSolutionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export const DeleteMultipleQuestionSolutionsBody = Type.Object({
  ids: Type.Array(Type.String({ format: "uuid" }), { minItems: 1 }),
});

// --- Response Schemas ---

export const CreateQuestionSolutionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: QuestionSolutionResponseItem }),
]);

export const ListQuestionSolutionsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(QuestionSolutionResponseItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const UpdateQuestionSolutionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: QuestionSolutionResponseItem }),
]);

// --- Static Types ---

export type QuestionSolutionResponseItemT = Static<typeof QuestionSolutionResponseItem>;

export type CreateQuestionSolutionParams = Static<typeof CreateQuestionSolutionBody>;
export type UpdateQuestionSolutionParams = Static<typeof UpdateQuestionSolutionBody>;
export type QuestionSolutionListParams = Static<typeof QuestionSolutionListBody>;
