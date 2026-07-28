import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../../types/response.ts";
import { EnumLectureType } from "../../../db/schema/course/enums.ts";

// --- Shared Lecture Field Definitions ---

export const LectureBaseFields = {
  id: Type.String({ format: "uuid" }),
  title: Type.Union([Type.String(), Type.Null()]),
  description: Type.Union([Type.String(), Type.Null()]),
  chapterId: Type.String({ format: "uuid" }),
  createdByUserId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  type: Type.Enum(EnumLectureType),
  referenceUrl: Type.Union([Type.String(), Type.Null()]),
  extra: Type.Any(),
  isActive: Type.Boolean(),
  position: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

export const LectureItemSchema = Type.Object(LectureBaseFields);

export type LectureItem = Static<typeof LectureItemSchema>;

// --- Admin Request Schemas ---

export const AdminCreateLectureBody = Type.Object({
  chapterId: Type.String({ format: "uuid" }),
  title: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  type: Type.Optional(Type.Enum(EnumLectureType, { default: EnumLectureType.TEXT })),
  referenceUrl: Type.Optional(Type.String({ maxLength: 255 })),
  extra: Type.Optional(Type.Any()),
  position: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean({ default: true })),
});

export type AdminCreateLectureInput = Static<typeof AdminCreateLectureBody>;

export const AdminUpdateLectureBody = Type.Object({
  title: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  description: Type.Optional(Type.String()),
  type: Type.Optional(Type.Enum(EnumLectureType)),
  referenceUrl: Type.Optional(Type.String({ maxLength: 255 })),
  extra: Type.Optional(Type.Any()),
  position: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
});

export type AdminUpdateLectureInput = Static<typeof AdminUpdateLectureBody>;

export const ReorderLectureItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  position: Type.String(),
});

export const AdminReorderLectureBody = Type.Object({
  items: Type.Array(ReorderLectureItemSchema, { minItems: 1 }),
});

export type AdminReorderLectureInput = Static<typeof AdminReorderLectureBody>;

// --- Params Schemas ---

export const LectureIdParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export const ChapterIdParams = Type.Object({
  chapterId: Type.String({ format: "uuid" }),
});

// --- Response Schemas ---

export const LectureDetailResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: LectureItemSchema,
});

export const LectureListResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: Type.Array(LectureItemSchema),
});
