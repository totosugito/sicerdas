import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../types/response.ts";

const CategoryBaseFields = {
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

const CategorySimpleFields = {
  value: Type.String({ format: "uuid" }),
  label: Type.String(),
  key: Type.String(),
};

const CategorySchema = Type.Object(CategoryBaseFields);
const CategorySimpleSchema = Type.Object(CategorySimpleFields);

export const CategoryListBody = Type.Object({
  search: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
  sortBy: Type.Optional(Type.String({ default: "updatedAt" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 1000 })),
});

export const CategorySimpleBody = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

export const CreateCategoryBody = Type.Object({
  name: Type.String({ minLength: 1 }),
  key: Type.Optional(Type.String({ minLength: 1 })),
  description: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean({ default: true })),
});

export const UpdateCategoryBody = Type.Object({
  name: Type.String({ minLength: 1 }),
  key: Type.Optional(Type.String({ minLength: 1 })),
  description: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
});

export const CategoryResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(CategorySchema),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const CategorySimpleResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(CategorySimpleSchema),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const CreateCategoryResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: CategorySchema }),
]);

export const UpdateCategoryResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: CategorySchema }),
]);

export type CategoryData = Static<typeof CategorySchema>;
export type CategorySimpleData = Static<typeof CategorySimpleSchema>;
export type CategoryListParams = Static<typeof CategoryListBody>;
export type CreateCategoryParams = Static<typeof CreateCategoryBody>;
export type UpdateCategoryParams = Static<typeof UpdateCategoryBody>;
