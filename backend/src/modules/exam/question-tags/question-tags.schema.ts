import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../../types/response.ts";

const TagItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
});

const QuestionTagItem = Type.Object({
  questionId: Type.String({ format: "uuid" }),
  tagId: Type.String({ format: "uuid" }),
  tag: Type.Optional(TagItem),
});

// --- Request Bodies ---

export const AssignQuestionTagsBody = Type.Object({
  questionId: Type.String({ format: "uuid" }),
  tagIds: Type.Array(Type.String({ format: "uuid" }), { minItems: 1 }),
});

export const AssignQuestionTagsByNameBody = Type.Object({
  questionId: Type.String({ format: "uuid" }),
  tags: Type.Array(Type.String(), { minItems: 1 }),
});

export const UnassignQuestionTagsBody = Type.Object({
  questionId: Type.String({ format: "uuid" }),
  tagIds: Type.Array(Type.String({ format: "uuid" }), { minItems: 1 }),
});

export const QuestionTagListBody = Type.Object({
  questionId: Type.Optional(Type.String({ format: "uuid" })),
  tagId: Type.Optional(Type.String({ format: "uuid" })),
});

// --- Response Schemas ---

export const QuestionTagListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Array(QuestionTagItem) }),
]);

// --- Static Types ---

export type AssignQuestionTagsParams = Static<typeof AssignQuestionTagsBody>;
export type AssignQuestionTagsByNameParams = Static<typeof AssignQuestionTagsByNameBody>;
export type UnassignQuestionTagsParams = Static<typeof UnassignQuestionTagsBody>;
export type QuestionTagListParams = Static<typeof QuestionTagListBody>;
export type QuestionTagItemT = Static<typeof QuestionTagItem>;
