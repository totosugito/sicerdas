import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

const GradeBaseFields = {
  id: Type.Number(),
  grade: Type.String(),
  name: Type.String(),
  desc: Type.Union([Type.String(), Type.Null()]),
  extra: Type.Any(),
  isDefault: Type.Boolean(),
  createdAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  updatedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
};

const GradeSimpleFields = {
  value: Type.String(),
  label: Type.String(),
};

const GradeSchema = Type.Object(GradeBaseFields);
const GradeSimpleSchema = Type.Object(GradeSimpleFields);

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

export const GradeListBody = Type.Object({
  search: Type.Optional(Type.String()),
  sortBy: Type.Optional(Type.String({ default: "updatedAt" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 1000 })),
});

export const GradeSimpleBody = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
  isDefault: Type.Optional(Type.Boolean({ default: true })),
});

export const CreateGradeBody = Type.Object({
  grade: Type.String({ minLength: 1, maxLength: 32 }),
  name: Type.String({ minLength: 1, maxLength: 128 }),
  desc: Type.Optional(Type.String()),
  extra: Type.Optional(Type.Any()),
  isDefault: Type.Optional(Type.Boolean({ default: true })),
});

export const UpdateGradeBody = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 128 })),
  desc: Type.Optional(Type.String()),
  extra: Type.Optional(Type.Any()),
  isDefault: Type.Optional(Type.Boolean()),
});

export const GradeResponse = PaginatedResponse(GradeSchema);
export const GradeSimpleResponse = PaginatedResponse(GradeSimpleSchema);
export const GradeDetailResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: GradeSchema }),
]);

export type GradeData = Static<typeof GradeSchema>;
export type GradeSimpleData = Static<typeof GradeSimpleSchema>;
export type GradeListParams = Static<typeof GradeListBody>;
export type CreateGradeParams = Static<typeof CreateGradeBody>;
export type UpdateGradeParams = Static<typeof UpdateGradeBody>;
