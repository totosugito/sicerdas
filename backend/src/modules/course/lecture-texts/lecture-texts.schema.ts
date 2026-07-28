import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../../types/response.ts";

// --- Shared Lecture Text Field Definitions ---

export const LectureTextBaseFields = {
  id: Type.String({ format: "uuid" }),
  title: Type.Union([Type.String(), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Any())),
  createdByUserId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

export const LectureTextItemSchema = Type.Object(LectureTextBaseFields);

export type LectureTextItem = Static<typeof LectureTextItemSchema>;

// --- Admin Request Schemas ---

export const AdminCreateLectureTextBody = Type.Object({
  title: Type.Optional(Type.String({ maxLength: 255 })),
  content: Type.Array(Type.Record(Type.String(), Type.Any()), { default: [] }),
});

export type AdminCreateLectureTextInput = Static<typeof AdminCreateLectureTextBody>;

export const AdminUpdateLectureTextBody = Type.Object({
  title: Type.Optional(Type.String({ maxLength: 255 })),
  content: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Any()))),
});

export type AdminUpdateLectureTextInput = Static<typeof AdminUpdateLectureTextBody>;

export const LectureTextListQuery = Type.Object({
  search: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
});

export type LectureTextListQueryInput = Static<typeof LectureTextListQuery>;

// --- Params Schemas ---

export const LectureTextIdParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export type LectureTextIdParamsInput = Static<typeof LectureTextIdParams>;

// --- Response Schemas ---

export const LectureTextDetailResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: LectureTextItemSchema,
});

export const LectureTextListResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: Type.Object({
    items: Type.Array(LectureTextItemSchema),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  }),
});
