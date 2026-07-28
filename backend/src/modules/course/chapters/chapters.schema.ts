import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../../types/response.ts";

// --- Shared Chapter Field Definitions ---

export const ChapterBaseFields = {
  id: Type.String({ format: "uuid" }),
  chapterName: Type.Union([Type.String(), Type.Null()]),
  courseId: Type.String({ format: "uuid" }),
  createdByUserId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  extra: Type.Any(),
  isActive: Type.Boolean(),
  position: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

export const ChapterItemSchema = Type.Object({
  ...ChapterBaseFields,
  totalLectures: Type.Optional(Type.Number()),
});

export type ChapterItem = Static<typeof ChapterItemSchema>;

// --- Admin Request Schemas ---

export const AdminCreateChapterBody = Type.Object({
  courseId: Type.String({ format: "uuid" }),
  chapterName: Type.String({ minLength: 1, maxLength: 255 }),
  position: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean({ default: true })),
});

export type AdminCreateChapterInput = Static<typeof AdminCreateChapterBody>;

export const AdminUpdateChapterBody = Type.Object({
  chapterName: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  position: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
});

export type AdminUpdateChapterInput = Static<typeof AdminUpdateChapterBody>;

export const ReorderChapterItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  position: Type.String(),
});

export const AdminReorderChapterBody = Type.Object({
  items: Type.Array(ReorderChapterItemSchema, { minItems: 1 }),
});

export type AdminReorderChapterInput = Static<typeof AdminReorderChapterBody>;

// --- Params Schemas ---

export const ChapterIdParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export const CourseIdParams = Type.Object({
  courseId: Type.String({ format: "uuid" }),
});

// --- Response Schemas ---

export const ChapterDetailResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: ChapterItemSchema,
});

export const ChapterListResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: Type.Array(ChapterItemSchema),
});
