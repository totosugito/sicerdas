import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

const TagBaseFields = {
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
  totalQuestions: Type.Number(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

const TagSimpleFields = {
  value: Type.String(),
  label: Type.String(),
};

const TagBodyFields = {
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean({ default: true })),
};

const TagSchema = Type.Object(TagBaseFields);
const TagSimpleSchema = Type.Object(TagSimpleFields);

const PaginatedResponse = (itemSchema: Parameters<typeof Type.Array>[0]) =>
  Type.Intersect([
    BaseResponseSchema,
    Type.Object({
      data: Type.Object({
        items: Type.Array(itemSchema),
        meta: PaginationMetaSchema,
      }),
    }),
  ]);

export const TagListBody = Type.Object({
  search: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
  sortBy: Type.Optional(Type.String({ default: "updatedAt" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

export const TagSimpleBody = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

export const CreateTagBody = Type.Object(TagBodyFields);
export const UpdateTagBody = Type.Partial(Type.Object(TagBodyFields));

export const TagListResponse = PaginatedResponse(TagSchema);
export const TagSimpleResponse = PaginatedResponse(TagSimpleSchema);
export const TagDetailResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: TagSchema }),
]);

export type TagData = Static<typeof TagSchema>;
export type TagSimpleData = Static<typeof TagSimpleSchema>;
export type TagListParams = Static<typeof TagListBody>;
export type CreateTagParams = Static<typeof CreateTagBody>;
export type UpdateTagParams = Static<typeof UpdateTagBody>;
