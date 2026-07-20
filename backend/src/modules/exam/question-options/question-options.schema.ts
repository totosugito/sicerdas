import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

// --- Shared Field Definitions ---

const QuestionOptionBaseFields = {
  id: Type.String({ format: "uuid" }),
  questionId: Type.String({ format: "uuid" }),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  isCorrect: Type.Boolean(),
  score: Type.Number(),
  order: Type.Number(),
};

const QuestionOptionBodyFields = {
  questionId: Type.String({ format: "uuid" }),
  content: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
  isCorrect: Type.Optional(Type.Boolean()),
  score: Type.Optional(Type.Number()),
  order: Type.Optional(Type.Number()),
};

const FilterFields = {
  questionId: Type.Optional(Type.String({ format: "uuid" })),
  isCorrect: Type.Optional(Type.Boolean()),
  sortBy: Type.Optional(Type.String({ default: "order" })),
  sortOrder: Type.Optional(Type.String({ default: "asc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
};

// --- Response Data Items ---

export const QuestionOptionResponseItem = Type.Object(QuestionOptionBaseFields);

// --- Request Bodies ---

export const CreateQuestionOptionBody = Type.Object(QuestionOptionBodyFields);

export const UpdateQuestionOptionBody = Type.Partial(
  Type.Object({
    questionId: Type.String({ format: "uuid" }),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    isCorrect: Type.Boolean(),
    score: Type.Number(),
    order: Type.Number(),
  }),
);

export const QuestionOptionListBody = Type.Object(FilterFields);

export const QuestionOptionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export const DeleteMultipleQuestionOptionsBody = Type.Object({
  ids: Type.Array(Type.String({ format: "uuid" }), { minItems: 1 }),
});

// --- Response Schemas ---

export const CreateQuestionOptionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: QuestionOptionResponseItem }),
]);

export const ListQuestionOptionsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(QuestionOptionResponseItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const UpdateQuestionOptionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: QuestionOptionResponseItem }),
]);

// --- Static Types ---

export type QuestionOptionResponseItemT = Static<typeof QuestionOptionResponseItem>;

export type CreateQuestionOptionParams = Static<typeof CreateQuestionOptionBody>;
export type UpdateQuestionOptionParams = Static<typeof UpdateQuestionOptionBody>;
export type QuestionOptionListParams = Static<typeof QuestionOptionListBody>;
