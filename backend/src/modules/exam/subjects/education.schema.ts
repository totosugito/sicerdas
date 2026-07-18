import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

const SubjectBaseFields = {
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

const SubjectSimpleFields = {
  value: Type.String({ format: "uuid" }),
  label: Type.String(),
};

const SubjectBodyFields = {
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean({ default: true })),
};

const SubjectSchema = Type.Object(SubjectBaseFields);
const SubjectSimpleSchema = Type.Object(SubjectSimpleFields);

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

export const SubjectListBody = Type.Object({
  search: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
  sortBy: Type.Optional(Type.String({ default: "updatedAt" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

export const SubjectSimpleBody = Type.Object({
  search: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

export const CreateSubjectBody = Type.Object(SubjectBodyFields);
export const UpdateSubjectBody = Type.Partial(Type.Object(SubjectBodyFields));

export const SubjectListResponse = PaginatedResponse(SubjectSchema);
export const SubjectSimpleResponse = PaginatedResponse(SubjectSimpleSchema);
export const SubjectDetailResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: SubjectSchema }),
]);

export type SubjectData = Static<typeof SubjectSchema>;
export type SubjectSimpleData = Static<typeof SubjectSimpleSchema>;
export type SubjectListParams = Static<typeof SubjectListBody>;
export type CreateSubjectParams = Static<typeof CreateSubjectBody>;
export type UpdateSubjectParams = Static<typeof UpdateSubjectBody>;
