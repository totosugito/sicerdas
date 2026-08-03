import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../../types/response.ts";

// --- Params Schemas ---

export const UserCourseIdParams = Type.Object({
  courseId: Type.String({ format: "uuid" }),
});
export type UserCourseIdParamsType = Static<typeof UserCourseIdParams>;

export const UserLectureIdParams = Type.Object({
  lectureId: Type.String({ format: "uuid" }),
});
export type UserLectureIdParamsType = Static<typeof UserLectureIdParams>;

// --- Item Schemas ---

export const LectureProgressItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.Union([Type.String(), Type.Null()]),
  description: Type.Union([Type.String(), Type.Null()]),
  chapterId: Type.String({ format: "uuid" }),
  type: Type.String(),
  referenceUrl: Type.Union([Type.String(), Type.Null()]),
  extra: Type.Any(),
  packageId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  position: Type.String(),
  isCompleted: Type.Boolean(),
  watchTimeSeconds: Type.Number(),
  completedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
});
export type LectureProgressItem = Static<typeof LectureProgressItemSchema>;

export const ChapterProgressItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  chapterName: Type.Union([Type.String(), Type.Null()]),
  courseId: Type.String({ format: "uuid" }),
  position: Type.String(),
  lectures: Type.Array(LectureProgressItemSchema),
});
export type ChapterProgressItem = Static<typeof ChapterProgressItemSchema>;

export const SyllabusDataSchema = Type.Object({
  courseId: Type.String({ format: "uuid" }),
  totalLectures: Type.Number(),
  completedLectures: Type.Number(),
  progressPercentage: Type.Number(),
  chapters: Type.Array(ChapterProgressItemSchema),
});
export type SyllabusData = Static<typeof SyllabusDataSchema>;

// --- Response Schemas ---

export const SyllabusResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: SyllabusDataSchema,
});

export const CompleteLectureDataSchema = Type.Object({
  lectureId: Type.String({ format: "uuid" }),
  courseId: Type.String({ format: "uuid" }),
  isCompleted: Type.Boolean(),
  completedAt: Type.String({ format: "date-time" }),
  score: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  passed: Type.Optional(Type.Boolean()),
});

export const CompleteLectureResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: CompleteLectureDataSchema,
});
export type CompleteLectureData = Static<typeof CompleteLectureDataSchema>;
