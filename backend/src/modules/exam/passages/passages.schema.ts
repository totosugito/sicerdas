import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

// --- Shared Field Definitions ---

const PassageBaseFields = {
  id: Type.String({ format: "uuid" }),
  title: Type.Union([Type.String(), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  subjectId: Type.String({ format: "uuid" }),
  totalQuestions: Type.Number(),
  activeQuestions: Type.Number(),
  subjectName: Type.String(),
};

const PassageBodyFields = {
  title: Type.Optional(Type.String()),
  content: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
  isActive: Type.Optional(Type.Boolean()),
  subjectId: Type.String({ format: "uuid" }),
};

const FilterFields = {
  search: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
  subjectId: Type.Optional(Type.String({ format: "uuid" })),
  sortBy: Type.Optional(Type.String({ default: "updatedAt" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
};

// --- Response Data Items ---

export const PassageResponseItem = Type.Object(PassageBaseFields);

export const PassageSimpleItem = Type.Object({
  value: Type.String({ format: "uuid" }),
  label: Type.String(),
});

// --- Request Bodies ---

export const CreatePassageBody = Type.Object(PassageBodyFields);

export const UpdatePassageBody = Type.Partial(Type.Object({
  ...PassageBodyFields,
  subjectId: Type.String({ format: "uuid" }),
}));

export const PassageListBody = Type.Object(FilterFields);

export const PassageSimpleListBody = Type.Object({
  subjectId: Type.Optional(Type.String({ format: "uuid" })),
  search: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

export const PassageParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

// --- Response Schemas ---

export const PassageDetailResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: PassageResponseItem }),
]);

export const ListPassagesResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(PassageResponseItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const ListPassagesSimpleResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(PassageSimpleItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

// --- Static Types ---

export type PassageResponseItemT = Static<typeof PassageResponseItem>;

export type CreatePassageParams = Static<typeof CreatePassageBody>;
export type UpdatePassageParams = Static<typeof UpdatePassageBody>;
export type PassageListParams = Static<typeof PassageListBody>;
export type PassageSimpleListParams = Static<typeof PassageSimpleListBody>;
